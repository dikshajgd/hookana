import { groq } from "next-sanity"

export const LANDING_PAGE_QUERY = groq`
  *[_type == "landingPage" && _id == "landingPage"][0]{
    hero,
    problems,
    diagnostic,
    howItWorks,
    services,
    stats,
    roles,
    pricing,
    faq,
    testimonial,
    cta,
    contact,
    logoTicker {
      logos[] {
        alt,
        "imageUrl": logo.asset->url
      }
    }
  }
`

export const SITE_SETTINGS_QUERY = groq`
  *[_type == "siteSettings" && _id == "siteSettings"][0]{
    navbar,
    footer
  }
`
