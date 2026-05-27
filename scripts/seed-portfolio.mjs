/**
 * Seeds the Sanity `portfolioPage` singleton with the existing portfolio media.
 *
 * Usage:
 *   1. Add a write token to .env.local:  SANITY_API_WRITE_TOKEN=...
 *   2. node scripts/seed-portfolio.mjs
 *
 * Safe to re-run: it createOrReplace's the single `portfolioPage` document.
 */
import { createClient } from "@sanity/client"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))

// Minimal .env.local loader (avoids adding a dotenv dependency).
function loadEnv() {
  try {
    const raw = readFileSync(join(__dirname, "..", ".env.local"), "utf8")
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
    }
  } catch {
    /* no .env.local — rely on real env */
  }
}
loadEnv()

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production"
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID")
  process.exit(1)
}
if (!token) {
  console.error(
    "Missing SANITY_API_WRITE_TOKEN. Create one at sanity.io/manage " +
      "(project > API > Tokens, Editor permission) and add it to .env.local."
  )
  process.exit(1)
}

const VIDEO_URLS = [
  "https://res.cloudinary.com/ddbynpktj/video/upload/v1779804429/Diabetes_30_days_animated_song_ybsmdj.mp4",
  "https://res.cloudinary.com/ddbynpktj/video/upload/v1779804217/vv416.v6_japans_secret_for_stable_blood_sugar_tqxkae.mp4",
  "https://res.cloudinary.com/ddbynpktj/video/upload/v1779788392/vv555_mfmcti.mp4",
  "https://res.cloudinary.com/ddbynpktj/video/upload/v1779788018/vv530.v1_nutritional_breakdown_animated_cartoon_mj4qv8.mp4",
  "https://res.cloudinary.com/ddbynpktj/video/upload/v1779788010/HOOKANA_V1_1_gdkchi.mp4",
  "https://res.cloudinary.com/ddbynpktj/video/upload/v1779788007/AI_cartoon_animation_vv353_iteration_3_1_smrzph.mp4",
  "https://res.cloudinary.com/ddbynpktj/video/upload/v1779787987/Ad_Variations_1_1_moxzfj.mp4",
  "https://res.cloudinary.com/ddbynpktj/video/upload/v1779787983/1_hedra_svy61g.mp4",
  "https://res.cloudinary.com/ddbynpktj/video/upload/v1779787945/One_nutraceutical_product.Energy_angle._Sleep_angle._Focus_angle._Gut_health_angle._ttezjm.mp4",
  "https://res.cloudinary.com/ddbynpktj/video/upload/v1779787940/3_hedra_odxbpk.mov",
  "https://res.cloudinary.com/ddbynpktj/video/upload/v1779787938/2_hedra_ttpicg.mov",
  "https://res.cloudinary.com/ddbynpktj/video/upload/v1779787936/Same_structure_different_colors_1_ad_the_algorithm_has_seen_before._r4ddoz.mp4",
  "https://res.cloudinary.com/ddbynpktj/video/upload/v1779787931/Their_UGC_creator_went_on_holiday._ikqotg.mp4",
  "https://res.cloudinary.com/ddbynpktj/video/upload/v1779787929/10_creatives_a_week_isn_t_scale._It_s_a_content_calendar._1_julvdw.mp4",
  "https://res.cloudinary.com/ddbynpktj/video/upload/v1779787906/Are_you_afraid_of_someone_asking_this_question__lqkrxx.mp4",
]

const IMAGE_URLS = [
  "https://res.cloudinary.com/ddbynpktj/image/upload/v1779787804/hf_20260519_183135_cef734ac-8c30-4acf-a1cd-25eade89ba30_qzqr6e.png",
  "https://res.cloudinary.com/ddbynpktj/image/upload/v1779787803/hf_20260519_183109_28840a5b-2516-4464-8342-c3b9aa2fe197_hnidvy.png",
  "https://res.cloudinary.com/ddbynpktj/image/upload/v1779787803/hf_20260519_183045_3247b3ce-ae13-4ee5-8048-fe377f407255_zjsl57.png",
  "https://res.cloudinary.com/ddbynpktj/image/upload/v1779787334/hf_20260519_182935_175ee7c3-7b38-42c1-a255-0b66ad96639c_prmag3.png",
  "https://res.cloudinary.com/ddbynpktj/image/upload/v1779787333/hf_20260519_182646_5eac37f1-99fe-47e9-941f-69ac7bf691ec_vwv2kb.png",
  "https://res.cloudinary.com/ddbynpktj/image/upload/v1779787332/hf_20260519_182448_fcc4418c-15a8-44f3-b186-d1b1a1ac28f0_beeswd.png",
  "https://res.cloudinary.com/ddbynpktj/image/upload/v1779787331/hf_20260519_182430_6f432b41-bc1e-46da-83e7-d31c96089e46_obuqih.png",
  "https://res.cloudinary.com/ddbynpktj/image/upload/v1779787330/hf_20260519_180207_145a7e4d-6194-4aa1-96b9-370502cec964_iyuxda.png",
  "https://res.cloudinary.com/ddbynpktj/image/upload/v1779787328/hf_20260519_182901_756b3cd8-cd61-4be9-8fbc-042a2d8b9eaf_ozoaqf.png",
  "https://res.cloudinary.com/ddbynpktj/image/upload/v1779787328/hf_20260519_182555_243818d8-5eb2-46a4-b6a6-01f35bb0cbd0_ynqujf.png",
  "https://res.cloudinary.com/ddbynpktj/image/upload/v1779787328/hf_20260519_182749_cde64979-5f28-4d04-8146-9f0330b4b24f_lp4hw2.png",
  "https://res.cloudinary.com/ddbynpktj/image/upload/v1779787326/hf_20260519_182409_2a5f3c50-edaa-4611-842b-0b6125c7b8b0_etggfk.png",
  "https://res.cloudinary.com/ddbynpktj/image/upload/v1779787323/hf_20260519_182343_91908912-c4ef-4494-9e30-abf79116ac19_fpltxj.png",
  "https://res.cloudinary.com/ddbynpktj/image/upload/v1779787323/hf_20260519_182304_792e7c6d-b33d-4c98-a8f0-5afbd23f2416_vuob6x.png",
  "https://res.cloudinary.com/ddbynpktj/image/upload/v1779787321/hf_20260519_180229_2431782e-6cea-4e78-9f19-4d20166a30bb_cdeaj7.png",
  "https://res.cloudinary.com/ddbynpktj/image/upload/v1779787319/hf_20260519_175830_940f0f59-054d-417a-b8d0-c2061aac159f_kc8bdd.png",
  "https://res.cloudinary.com/ddbynpktj/image/upload/v1779787318/hf_20260519_183325_9a877661-e78e-4d88-adf0-27b552f8f05e_frsv2k.png",
  "https://res.cloudinary.com/ddbynpktj/image/upload/v1779787317/hf_20260519_183023_c5caf212-ff36-4aa0-8013-6570556d7a6f_a57fl8.png",
  "https://res.cloudinary.com/ddbynpktj/image/upload/v1779787312/hf_20260519_182842_906a0331-ff52-4eea-89cc-8e880230c2ac_f49mfi.png",
  "https://res.cloudinary.com/ddbynpktj/image/upload/v1779787308/hf_20260519_182532_f5430b16-0c7d-4c2d-a98e-92c0c31d954b_vdsjgw.png",
  "https://res.cloudinary.com/ddbynpktj/image/upload/v1779787307/hf_20260519_182509_7f436309-7397-4a12-af45-ff08c6bfe0af_lrdz1x.png",
  "https://res.cloudinary.com/ddbynpktj/image/upload/v1779787307/hf_20260519_182322_6a872169-378f-40fc-b28c-f6237d1b7e15_pr9mck.png",
  "https://res.cloudinary.com/ddbynpktj/image/upload/v1779787307/hf_20260519_175909_96726f44-b3c7-46e4-9fe7-50c4ce21c93e_wngpr8.png",
  "https://res.cloudinary.com/ddbynpktj/image/upload/v1779787306/hf_20260519_181859_42d95131-96d5-4bf1-9576-64ba5d853d6d_1_nkh5q5.png",
  "https://res.cloudinary.com/ddbynpktj/image/upload/v1779787276/hf_20260519_182821_aa41ee6c-66f3-4c0c-8e41-794e8f7c1609_qbfmpd.png",
  "https://res.cloudinary.com/ddbynpktj/image/upload/v1779787269/hf_20260519_183212_5ce4084c-da3f-487e-a846-7d7870c50a58_ozk4l3.png",
  "https://res.cloudinary.com/ddbynpktj/image/upload/v1779787269/hf_20260519_183232_7dfe7eb9-145c-4e04-bf65-e1bdedf5b86c_vquod9.png",
  "https://res.cloudinary.com/ddbynpktj/image/upload/v1779787268/hf_20260519_182956_df4a3156-7085-4e3d-9245-0a87bb819cbb_eswamc.png",
  "https://res.cloudinary.com/ddbynpktj/image/upload/v1779787267/hf_20260519_182624_4b7d946f-3e2f-4460-ab53-67dfa613edc2_dpcxal.png",
  "https://res.cloudinary.com/ddbynpktj/image/upload/v1779787267/hf_20260519_181859_42d95131-96d5-4bf1-9576-64ba5d853d6d_s88hk1.png",
  "https://res.cloudinary.com/ddbynpktj/image/upload/v1779787266/hf_20260519_175850_bd6bcdfa-3fc1-4003-bfaa-5dbb091d7d2c_lcvais.png",
  "https://res.cloudinary.com/ddbynpktj/image/upload/v1779787266/hf_20260519_175926_74ed2076-be7b-4136-b8b4-f6bfee890062_bomqe5.png",
  "https://res.cloudinary.com/ddbynpktj/image/upload/v1779787265/hf_20260519_175522_13e17061-1ade-4e49-9a46-cc8f48ed4b98_hjk6dx.png",
]

let n = 0
const key = () => `item_${(++n).toString().padStart(3, "0")}`

const items = [
  ...VIDEO_URLS.map((url) => ({ _key: key(), _type: "portfolioItem", kind: "video", url })),
  ...IMAGE_URLS.map((url) => ({ _key: key(), _type: "portfolioItem", kind: "image", url })),
]

const doc = {
  _id: "portfolioPage",
  _type: "portfolioPage",
  eyebrow: "Portfolio",
  heading: "Creative that converts.",
  description:
    "Video ads and static concepts we've produced for D2C brands. Hover any reel for a preview, or tap to watch it full screen.",
  items,
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
})

const result = await client.createOrReplace(doc)
console.log(
  `Seeded "${result._id}" in dataset "${dataset}" with ${items.length} items ` +
    `(${VIDEO_URLS.length} videos, ${IMAGE_URLS.length} statics).`
)
console.log("Open /studio > Portfolio Page to edit. Remember to keep it Published.")
