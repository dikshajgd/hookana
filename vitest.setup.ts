/**
 * Test env bootstrap. Provides dummy values for the env vars read at module
 * load (e.g. the Supabase clients call createClient() at import time, which
 * throws on an empty URL). Individual tests mock the actual network layer.
 */
process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://localhost:54321"
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key"
process.env.SUPABASE_SERVICE_ROLE_KEY ??= "test-service-key"
process.env.NEWSLETTER_ADMIN_PASSWORD ??= "test_admin_password"
