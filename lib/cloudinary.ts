const UPLOAD_MARKER = "/upload/"

function insertTransform(url: string, transform: string): string {
  if (!url.includes("res.cloudinary.com")) return url
  const i = url.indexOf(UPLOAD_MARKER)
  if (i === -1) return url
  const head = url.slice(0, i + UPLOAD_MARKER.length)
  const tail = url.slice(i + UPLOAD_MARKER.length)
  if (/^[a-z]_[^/]+\//i.test(tail)) return url
  return `${head}${transform}/${tail}`
}

export function cldImage(url: string, width = 800): string {
  return insertTransform(url, `f_auto,q_auto,c_limit,w_${width}`)
}

export function cldVideo(url: string, width = 720): string {
  return insertTransform(url, `f_auto,q_auto:eco,vc_auto,c_limit,w_${width}`)
}

export function cldPoster(url: string, width = 720): string {
  if (!url.includes("res.cloudinary.com")) return url.replace(/\.mp4$/i, ".jpg")
  const transformed = insertTransform(url, `f_jpg,q_auto,c_limit,w_${width},so_0`)
  return transformed.replace(/\.mp4$/i, ".jpg")
}
