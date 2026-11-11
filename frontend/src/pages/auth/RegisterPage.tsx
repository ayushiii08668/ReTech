import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { User, Mail, Phone, Lock, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!formData.termsAccepted) {
      setError("Please accept the terms and conditions to proceed")
      return
    }

    setLoading(true)
    const res = await register(formData)
    setLoading(false)

    if (res.success) {
      navigate("/dashboard", { replace: true })
    } else {
      setError(res.message || "Registration failed. Please check your information.")
    }
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
            <span className="text-[#75665D]">Already have an account?</span>
            <Link
              to="/login"
              className="font-600 text-[#C66D4E] hover:text-[#B5482A] transition-colors"
            >
              Sign In
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
          className="w-full max-w-lg"
        >
          {/* Card */}
          <div className="rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-8 shadow-warm-lg sm:p-10">
            {/* Header */}
            <div className="mb-8">
              <span className="font-dm-sans text-xs font-600 tracking-wider text-[#B78B68] uppercase">
                Step Towards A Cleaner Tomorrow
              </span>
              <h1 className="mt-1 font-manrope text-2xl font-800 tracking-tight text-[#47372E] sm:text-3xl">
                Create Customer Account
              </h1>
              <p className="mt-1 font-dm-sans text-sm text-[#75665D]">
                Schedule pickups for your old electronics, monitor data wipe verification, and receive certified disposal reports.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#75665D]" />
                  <input
                    type="text"
                    required
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Ayushi Singh"
                    className="w-full rounded-xl border border-[#DDD1C3] bg-white py-2.5 pl-10 pr-4 font-dm-sans text-sm text-[#47372E] outline-none transition-colors focus:border-[#C66D4E] focus:ring-1 focus:ring-[#C66D4E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#75665D]" />
                    <input
                      type="email"
                      required
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      className="w-full rounded-xl border border-[#DDD1C3] bg-white py-2.5 pl-10 pr-4 font-dm-sans text-sm text-[#47372E] outline-none transition-colors focus:border-[#C66D4E] focus:ring-1 focus:ring-[#C66D4E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#75665D]" />
                    <input
                      type="tel"
                      required
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className="w-full rounded-xl border border-[#DDD1C3] bg-white py-2.5 pl-10 pr-4 font-dm-sans text-sm text-[#47372E] outline-none transition-colors focus:border-[#C66D4E] focus:ring-1 focus:ring-[#C66D4E]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1.5">
                    Password (min. 8 chars)
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#75665D]" />
                    <input
                      type="password"
                      required
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-[#DDD1C3] bg-white py-2.5 pl-10 pr-4 font-dm-sans text-sm text-[#47372E] outline-none transition-colors focus:border-[#C66D4E] focus:ring-1 focus:ring-[#C66D4E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#75665D]" />
                    <input
                      type="password"
                      required
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-[#DDD1C3] bg-white py-2.5 pl-10 pr-4 font-dm-sans text-sm text-[#47372E] outline-none transition-colors focus:border-[#C66D4E] focus:ring-1 focus:ring-[#C66D4E]"
                    />
                  </div>
                </div>
              </div>

              {/* Password Hints */}
              <div className="rounded-xl border border-[#DDD1C3]/60 bg-[#EAE1D5]/20 p-3 text-[11px] font-dm-sans text-[#75665D] space-y-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className={`h-3 w-3 ${formData.password.length >= 8 ? "text-emerald-600" : "text-[#75665D]"}`} />
                  <span>At least 8 characters long</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className={`h-3 w-3 ${/[A-Z]/.test(formData.password) && /[0-9]/.test(formData.password) ? "text-emerald-600" : "text-[#75665D]"}`} />
                  <span>Includes uppercase letter &amp; number</span>
                </div>
              </div>

              {/* Terms checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleChange}
                    className="mt-0.5 h-4 w-4 rounded border-[#DDD1C3] text-[#C66D4E] focus:ring-[#C66D4E]"
                  />
                  <span className="font-dm-sans text-xs text-[#75665D] leading-relaxed">
                    I agree to the{" "}
                    <a href="#terms" className="text-[#C66D4E] underline">
                      Terms of Service
                    </a>{" "}
                    and consent to ReTech's data sanitization and device handling protocols.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#C66D4E] py-3 font-dm-sans text-sm font-600 text-white transition-all hover:bg-[#B5482A] hover:shadow-warm disabled:opacity-50"
              >
                {loading ? "Creating Account…" : "Register & Start Recycling"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </form>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#DDD1C3] bg-[#FFFDF8] py-4 text-center font-dm-sans text-xs text-[#75665D]">
        &copy; {new Date().getFullYear()} ReTech Technologies India. All rights reserved.
      </footer>
    </div>
  )
}

