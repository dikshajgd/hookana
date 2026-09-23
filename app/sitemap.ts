import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://hookana.com",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...["privacy", "terms"].map((page) => ({
      url: `https://hookana.com/${page}`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.2,
    })),
  ]
}
