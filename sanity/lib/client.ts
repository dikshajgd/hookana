import { createClient } from "next-sanity"

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID

/**
 * We're migrating off Sanity onto Supabase. Pages that still read from Sanity
 * all ship built-in FALLBACK content, so when Sanity isn't configured we hand
 * back a stub whose `fetch()` resolves to null instead of throwing at import
 * time (which previously 500'd every page that touched this client).
 */
export const client = projectId
  ? createClient({
      projectId,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
      apiVersion: "2024-01-01",
      useCdn: true,
    })
  : ({
      fetch: async () => null,
    } as unknown as ReturnType<typeof createClient>)
