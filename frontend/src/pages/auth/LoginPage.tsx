import React, { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { Mail, Lock, ArrowRight, AlertCircle, ShieldCheck, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { ForgotPasswordModal } from "./ForgotPasswordModal"

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false)

  const from = (location.state as any)?.from?.pathname || "/dashboard"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await login(email.trim(), password, rememberMe)
    setLoading(false)

    if (res.success) {
      navigate(from, { replace: true })
    } else {
      setError(res.message || "Invalid email or password")
    }
  }

  // Helper to prefill demo customer
  const fillDemoCustomer = () => {
    setError(null)
    setEmail("customer@retech.in")
    setPassword("Customer@2026!")
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
            <span className="ml-0.5 inline-block h-1.5 w-1.5 rounded-full bg-[#B78B68]" />
          </Link>

          <div className="flex items-center gap-4 text-xs font-dm-sans">
            <span className="text-[#75665D]">New to ReTech?</span>
            <Link
              to="/register"
              className="font-600 text-[#C66D4E] hover:text-[#B5482A] transition-colors"
            >
              Create Customer Account
            </Link>
          </div>
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
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#B78B68]/30 bg-[#B78B68]/10 px-3 py-1 mb-3">
                <ShieldCheck className="h-3.5 w-3.5 text-[#B78B68]" />
                <span className="font-dm-sans text-[11px] font-600 tracking-wider text-[#B78B68] uppercase">
                  Customer Portal
                </span>
              </div>
              <h1 className="font-manrope text-2xl font-800 tracking-tight text-[#47372E] sm:text-3xl">
                Welcome back.
              </h1>
              <p className="mt-1 font-dm-sans text-sm text-[#75665D]">
                Sign in to manage your devices, track collections, and view sanitization reports.
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
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#75665D]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-[#DDD1C3] bg-white py-2.5 pl-10 pr-4 font-dm-sans text-sm text-[#47372E] outline-none transition-colors focus:border-[#C66D4E] focus:ring-1 focus:ring-[#C66D4E]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-dm-sans text-xs font-600 text-[#47372E]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    className="font-dm-sans text-xs text-[#C66D4E] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#75665D]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-[#DDD1C3] bg-white py-2.5 pl-10 pr-11 font-dm-sans text-sm text-[#47372E] outline-none transition-colors focus:border-[#C66D4E] focus:ring-1 focus:ring-[#C66D4E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#75665D] hover:text-[#47372E]"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-[#DDD1C3] text-[#C66D4E] focus:ring-[#C66D4E]"
                  />
                  <span className="font-dm-sans text-xs text-[#75665D]">
                    Remember this device
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#C66D4E] py-3 font-dm-sans text-sm font-600 text-white transition-all hover:bg-[#B5482A] hover:shadow-warm disabled:opacity-50"
              >
                {loading ? "Authenticating…" : "Sign In to Dashboard"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </form>

            {/* Quick Demo Fill */}
            <div className="mt-6 border-t border-[#DDD1C3]/60 pt-4 text-center">
              <button
                type="button"
                onClick={fillDemoCustomer}
                className="text-xs font-dm-sans text-[#75665D] hover:text-[#C66D4E] underline"
              >
                Prefill demo customer credentials
              </button>
            </div>
          </div>

          {/* Admin link */}
          <div className="mt-6 text-center">
            <Link
              to="/admin/login"
              className="font-dm-sans text-xs text-[#75665D] hover:text-[#47372E] transition-colors"
            >
              Are you an authorized ReTech operator?{" "}
              <span className="font-600 text-[#47372E] underline">
                Access Admin Portal &rarr;
              </span>
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#DDD1C3] bg-[#FFFDF8] py-4 text-center font-dm-sans text-xs text-[#75665D]">
        &copy; {new Date().getFullYear()} ReTech Technologies India. Secure Data Sanitization Platform.
      </footer>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
      />
    </div>
  )
}

