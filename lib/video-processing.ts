/**
 * Browser-side video derivation.
 *
 * The admin's browser produces the same assets Cloudinary used to generate on
 * the fly — a poster still and a short muted preview clip — so the server never
 * needs ffmpeg and the whole pipeline deploys anywhere (Vercel included).
 */

const PREVIEW_SECONDS = 6
const POSTER_MAX_WIDTH = 640

/** Load a File into a <video> element and wait until it can render frames. */
function loadVideo(file: File): Promise<{ video: HTMLVideoElement; url: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement("video")
    video.muted = true
    video.playsInline = true
    video.preload = "auto"
    video.src = url
    video.onloadeddata = () => resolve({ video, url })
    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Could not load video for processing"))
    }
  })
}

/** Grab a single frame as a compressed webp poster. */
export async function extractPoster(file: File): Promise<Blob> {
  const { video, url } = await loadVideo(file)
  try {
    // Seek a hair past 0 — some codecs render black at exactly 0.
    await new Promise<void>((resolve, reject) => {
      video.onseeked = () => resolve()
      video.onerror = () => reject(new Error("Seek failed"))
      video.currentTime = Math.min(0.1, video.duration || 0.1)
    })

    const scale = Math.min(1, POSTER_MAX_WIDTH / (video.videoWidth || POSTER_MAX_WIDTH))
    const canvas = document.createElement("canvas")
    canvas.width = Math.round((video.videoWidth || POSTER_MAX_WIDTH) * scale)
    canvas.height = Math.round((video.videoHeight || POSTER_MAX_WIDTH) * scale)
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("No canvas context")
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Poster encode failed"))),
        "image/webp",
        0.8
      )
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}

/** Pick a MediaRecorder mime the browser actually supports. */
function pickPreviewMime(): string {
  const candidates = [
    "video/mp4;codecs=avc1",
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ]
  for (const m of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m)) return m
  }
  return "video/webm"
}

/**
 * Record the first few seconds of the video as a small, muted preview clip by
 * playing it and capturing the element's stream. Returns null if the browser
 * can't capture (caller falls back to poster-only).
 */
export async function recordPreview(file: File): Promise<Blob | null> {
  const { video, url } = await loadVideo(file)
  try {
    const capture = (video as HTMLVideoElement & {
      captureStream?: () => MediaStream
      mozCaptureStream?: () => MediaStream
    })
    const stream = capture.captureStream?.() ?? capture.mozCaptureStream?.()
    if (!stream || typeof MediaRecorder === "undefined") return null

    // Drop audio tracks — previews are silent.
    stream.getAudioTracks().forEach((t) => stream.removeTrack(t))

    const mimeType = pickPreviewMime()
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 1_200_000 })
    const chunks: BlobPart[] = []

    return await new Promise<Blob | null>((resolve) => {
      recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data)
      recorder.onstop = () => {
        video.pause()
        resolve(chunks.length ? new Blob(chunks, { type: mimeType }) : null)
      }

      video.currentTime = 0
      video
        .play()
        .then(() => {
          recorder.start()
          const stopAt = Math.min(PREVIEW_SECONDS, video.duration || PREVIEW_SECONDS)
          const tick = () => {
            if (video.currentTime >= stopAt || video.ended) {
              if (recorder.state !== "inactive") recorder.stop()
            } else {
              requestAnimationFrame(tick)
            }
          }
          requestAnimationFrame(tick)
        })
        .catch(() => resolve(null))
    })
  } catch {
    return null
  } finally {
    URL.revokeObjectURL(url)
  }
}
