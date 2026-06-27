"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/newsletter/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push("/newsletter-admin")
      router.refresh()
    } else {
      setError("Invalid password")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A1628] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-mono text-white text-2xl font-bold tracking-widest">
            HOOKANA
          </span>
          <p className="text-blue-300/60 font-mono text-xs tracking-wider mt-2 uppercase">
            Newsletter Admin
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 rounded-xl p-8 border border-white/10">
          <label className="block text-xs font-mono text-blue-300/70 uppercase tracking-wider mb-2">
            Admin Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-blue-400 transition-colors"
            placeholder="Enter password"
            autoFocus
          />

          {error && (
            <p className="mt-3 text-red-400 text-xs font-mono">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="mt-5 w-full bg-white text-[#0A1628] font-bold py-3 rounded-lg text-sm tracking-wide hover:bg-blue-50 disabled:opacity-50 transition-colors"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  )
}
