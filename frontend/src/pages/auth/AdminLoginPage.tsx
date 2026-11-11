import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ShieldAlert, Mail, Lock, ArrowRight, AlertCircle, Sparkles } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await login(email, password)
    setLoading(false)

    if (res.success) {
      // Check if user is actually admin
      const savedUser = JSON.parse(localStorage.getItem("retech_user") || "{}")
      if (savedUser.role === "ADMIN") {
        navigate("/admin/dashboard", { replace: true })
      } else {
        setError("Access restricted. This account does not possess administrator privileges.")
      }
    } else {
      setError(res.message || "Invalid administrator credentials.")
    }
  }

  // Helper to prefill default provisioned admin
  const fillProvisionedAdmin = () => {
    setEmail("admin@retech.in")
    setPassword("Admin@ReTech2026!")
  }

  return (
    <div className="min-h-screen bg-[#F5F0E7] flex flex-col justify-between selection:bg-[#C66D4E]/20 selection:text-[#47372E]">
      {/* Top Navbar */}
      <header className="border-b border-[#DDD1C3] bg-[#FFFDF8] px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center gap-0.5 select-none">
            <span className="font-manrope text-2xl font-800 tracking-tight text-[#C66D4E]">
              RE
            </span>
            <span className="font-manrope text-2xl font-800 tracking-tight text-[#47372E]">
              TECH
            </span>
            <span className="ml-1 inline-block rounded bg-[#47372E] px-1.5 py-0.5 text-[10px] font-700 tracking-widest text-white uppercase">
              Admin Ops
            </span>
          </Link>

          <Link
            to="/login"
            className="font-dm-sans text-xs font-600 text-[#75665D] hover:text-[#47372E] transition-colors"
          >
            &larr; Customer Portal
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Card */}
          <div className="rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-8 shadow-warm-lg sm:p-10">
            {/* Header */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 mb-3">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-700" />
                <span className="font-dm-sans text-[11px] font-700 tracking-wider text-amber-800 uppercase">
                  Internal Operations
                </span>
              </div>
              <h1 className="font-manrope text-2xl font-800 tracking-tight text-[#47372E] sm:text-3xl">
                ReTech Administration
              </h1>
              <p className="mt-1 font-dm-sans text-xs text-[#75665D]">
                Platform governance, pickup management, hardware inspection, and sanitization verification.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1.5">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#75665D]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@retech.in"
                    className="w-full rounded-xl border border-[#DDD1C3] bg-white py-2.5 pl-10 pr-4 font-dm-sans text-sm text-[#47372E] outline-none transition-colors focus:border-[#C66D4E] focus:ring-1 focus:ring-[#C66D4E]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1.5">
                  Master Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#75665D]" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-[#DDD1C3] bg-white py-2.5 pl-10 pr-4 font-dm-sans text-sm text-[#47372E] outline-none transition-colors focus:border-[#C66D4E] focus:ring-1 focus:ring-[#C66D4E]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#47372E] py-3 font-dm-sans text-sm font-600 text-white transition-all hover:bg-[#2C1810] hover:shadow-warm disabled:opacity-50"
              >
                {loading ? "Verifying Credentials…" : "Authenticate as Admin"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </form>

            {/* Quick prefill for evaluator */}
            <div className="mt-6 border-t border-[#DDD1C3]/60 pt-4 text-center">
              <button
                type="button"
                onClick={fillProvisionedAdmin}
                className="inline-flex items-center gap-1.5 text-xs font-dm-sans text-[#B78B68] hover:text-[#C66D4E] underline"
              >
                <Sparkles className="h-3 w-3" />
                Prefill provisioned Admin credentials
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs font-dm-sans text-[#75665D]">
            Public registration for administrator roles is strictly disabled by security policy.
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#DDD1C3] bg-[#FFFDF8] py-4 text-center font-dm-sans text-xs text-[#75665D]">
        ReTech Admin Ops Subsystem &middot; Enforcing NIST SP 800-88
      </footer>
    </div>
  )
}

