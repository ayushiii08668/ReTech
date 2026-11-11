import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Mail, KeyRound, CheckCircle2, AlertCircle } from "lucide-react"
import api from "@/services/api"

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<"request" | "reset">("request")
  const [email, setEmail] = useState("")
  const [token, setToken] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await api.post("/auth/forgot-password", { email })
      if (res.data.success) {
        if (res.data.resetToken) {
          // Dev convenience: auto-populate token
          setToken(res.data.resetToken)
          setSuccessMsg("Reset token generated! We have automatically filled it in below.")
        } else {
          setSuccessMsg("If an account exists, a reset token was sent.")
        }
        setStep("reset")
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to request password reset")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    setLoading(true)

    try {
      const res = await api.post("/auth/reset-password", {
        token,
        password: newPassword,
        confirmPassword,
      })
      if (res.data.success) {
        setSuccessMsg("Password successfully reset! You can now log in.")
        setTimeout(() => {
          onClose()
          setStep("request")
          setSuccessMsg(null)
          setEmail("")
          setToken("")
          setNewPassword("")
          setConfirmPassword("")
        }, 2000)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md rounded-2xl border border-[#DDD1C3] bg-[#FFFDF8] p-6 shadow-xl sm:p-8"
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 rounded-lg p-1.5 text-[#75665D] hover:bg-[#EAE1D5]/50 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#C66D4E]/10 text-[#C66D4E] mb-3">
                <KeyRound className="h-5 w-5" />
              </div>
              <h3 className="font-manrope text-xl font-800 text-[#47372E]">
                {step === "request" ? "Reset your password" : "Enter new password"}
              </h3>
              <p className="mt-1 font-dm-sans text-xs text-[#75665D]">
                {step === "request"
                  ? "Enter the email associated with your ReTech account."
                  : "Enter the reset token and your secure new password."}
              </p>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {step === "request" ? (
              <form onSubmit={handleRequestToken} className="space-y-4">
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

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 rounded-xl border border-[#DDD1C3] py-2.5 font-dm-sans text-sm font-600 text-[#47372E] hover:bg-[#EAE1D5]/40 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-xl bg-[#C66D4E] py-2.5 font-dm-sans text-sm font-600 text-white hover:bg-[#B5482A] transition-colors disabled:opacity-50"
                  >
                    {loading ? "Sending…" : "Send Reset Token"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1.5">
                    Reset Token
                  </label>
                  <input
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Enter reset token"
                    className="w-full rounded-xl border border-[#DDD1C3] bg-white py-2.5 px-3.5 font-mono text-xs text-[#47372E] outline-none focus:border-[#C66D4E]"
                  />
                </div>

                <div>
                  <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1.5">
                    New Password (min. 8 characters, 1 uppercase, 1 number)
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-[#DDD1C3] bg-white py-2.5 px-3.5 font-dm-sans text-sm text-[#47372E] outline-none focus:border-[#C66D4E]"
                  />
                </div>

                <div>
                  <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-[#DDD1C3] bg-white py-2.5 px-3.5 font-dm-sans text-sm text-[#47372E] outline-none focus:border-[#C66D4E]"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep("request")}
                    className="flex-1 rounded-xl border border-[#DDD1C3] py-2.5 font-dm-sans text-sm font-600 text-[#47372E]"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-xl bg-[#C66D4E] py-2.5 font-dm-sans text-sm font-600 text-white hover:bg-[#B5482A] disabled:opacity-50"
                  >
                    {loading ? "Updating…" : "Update Password"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

