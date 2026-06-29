import { createClient } from "next-sanity"

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID

/**
 * Mirrors sanity/lib/client.ts: when Sanity isn't configured (e.g. the Supabase
 * migration branch with no Sanity env), hand back a stub instead of throwing at
 * import time — which otherwise fails `next build` while collecting the
 * newsletter API routes. With Sanity env present this is the original client.
 */
export const writeClient = projectId
  ? createClient({
      projectId,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
      apiVersion: "2024-01-01",
      useCdn: false,
      token: process.env.SANITY_API_WRITE_TOKEN,
    })
  : ({
      fetch: async () => null,
      create: async () => {
        throw new Error("Sanity is not configured")
      },
      createOrReplace: async () => {
        throw new Error("Sanity is not configured")
      },
      patch: () => {
        throw new Error("Sanity is not configured")
      },
      delete: async () => {
        throw new Error("Sanity is not configured")
      },
    } as unknown as ReturnType<typeof createClient>)
