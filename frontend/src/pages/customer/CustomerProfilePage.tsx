import React, { useState } from "react"
import { motion } from "framer-motion"
import { User, Phone, MapPin, Lock, CheckCircle2, AlertCircle, Shield } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import api from "@/services/api"

export default function CustomerProfilePage() {
  const { user, updateUser } = useAuth()

  // Profile Form
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    street: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    pinCode: user?.address?.pinCode || "",
  })

  // Password Form
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [profileMsg, setProfileMsg] = useState<string | null>(null)
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null)
  const [errorProfile, setErrorProfile] = useState<string | null>(null)
  const [errorPassword, setErrorPassword] = useState<string | null>(null)

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    setErrorProfile(null)
    setProfileMsg(null)

    try {
      const res = await api.put("/customer/profile", {
        fullName: profileData.fullName,
        phone: profileData.phone,
        address: {
          street: profileData.street,
          city: profileData.city,
          state: profileData.state,
          pinCode: profileData.pinCode,
        },
      })
      if (res.data.success) {
        updateUser(res.data.user)
        setProfileMsg("Personal details and address updated successfully.")
      }
    } catch (err: any) {
      setErrorProfile(err.response?.data?.message || "Failed to update profile.")
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorPassword("New passwords do not match.")
      return
    }

    setSavingPassword(true)
    setErrorPassword(null)
    setPasswordMsg(null)

    try {
      const res = await api.put("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      })
      if (res.data.success) {
        setPasswordMsg("Password changed successfully.")
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      }
    } catch (err: any) {
      setErrorPassword(err.response?.data?.message || "Failed to change password.")
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="font-manrope text-2xl font-800 tracking-tight text-[#47372E] sm:text-3xl">
          Account &amp; Profile Settings
        </h1>
        <p className="mt-1 font-dm-sans text-xs text-[#75665D]">
          Manage your personal identity, default pickup address, and login credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Account Info Pill */}
        <div className="rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-6 shadow-warm-sm space-y-4 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#C66D4E] text-2xl font-800 font-manrope text-white shadow-warm-sm">
              {user?.fullName?.slice(0, 2).toUpperCase() || "CU"}
            </div>
            <h3 className="mt-4 font-manrope text-lg font-800 text-[#47372E]">
              {user?.fullName}
            </h3>
            <p className="font-dm-sans text-xs text-[#75665D]">{user?.email}</p>
            <span className="mt-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-0.5 text-[10px] font-700 text-emerald-800">
              Verified Customer Account
            </span>
          </div>

          <div className="border-t border-[#DDD1C3]/60 pt-4 space-y-2 text-xs font-dm-sans text-[#75665D]">
            <div className="flex justify-between">
              <span>Customer Since:</span>
              <span className="font-600 text-[#47372E]">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString([], {
                      month: "short",
                      year: "numeric",
                    })
                  : "2026"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Account Status:</span>
              <span className="font-600 text-emerald-700">Active</span>
            </div>
            <div className="flex justify-between">
              <span>Role:</span>
              <span className="font-mono text-[#C66D4E]">CUSTOMER</span>
            </div>
          </div>
        </div>

        {/* Forms Area */}
        <div className="space-y-6 lg:col-span-2">
          {/* Personal Info Form */}
          <div className="rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-6 shadow-warm-sm sm:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-[#DDD1C3] pb-4">
              <div>
                <h3 className="font-manrope text-base font-800 text-[#47372E]">
                  Personal &amp; Address Information
                </h3>
                <p className="font-dm-sans text-xs text-[#75665D]">
                  Used for prefilling your doorstep collection requests.
                </p>
              </div>
              <User className="h-5 w-5 text-[#B78B68]" />
            </div>

            {profileMsg && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{profileMsg}</span>
              </div>
            )}

            {errorProfile && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorProfile}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profileData.fullName}
                    onChange={(e) =>
                      setProfileData({ ...profileData, fullName: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#DDD1C3] bg-white py-2 px-3 font-dm-sans text-sm text-[#47372E] outline-none focus:border-[#C66D4E]"
                  />
                </div>

                <div>
                  <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                    placeholder="9876543210"
                    className="w-full rounded-xl border border-[#DDD1C3] bg-white py-2 px-3 font-dm-sans text-sm text-[#47372E] outline-none focus:border-[#C66D4E]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1.5">
                  Default Street Address
                </label>
                <input
                  type="text"
                  value={profileData.street}
                  onChange={(e) =>
                    setProfileData({ ...profileData, street: e.target.value })
                  }
                  placeholder="Flat No, Apartment, Street"
                  className="w-full rounded-xl border border-[#DDD1C3] bg-white py-2 px-3 font-dm-sans text-sm text-[#47372E] outline-none focus:border-[#C66D4E]"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    value={profileData.city}
                    onChange={(e) =>
                      setProfileData({ ...profileData, city: e.target.value })
                    }
                    placeholder="Bengaluru"
                    className="w-full rounded-xl border border-[#DDD1C3] bg-white py-2 px-3 font-dm-sans text-sm text-[#47372E] outline-none focus:border-[#C66D4E]"
                  />
                </div>

                <div>
                  <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1.5">
                    State
                  </label>
                  <input
                    type="text"
                    value={profileData.state}
                    onChange={(e) =>
                      setProfileData({ ...profileData, state: e.target.value })
                    }
                    placeholder="Karnataka"
                    className="w-full rounded-xl border border-[#DDD1C3] bg-white py-2 px-3 font-dm-sans text-sm text-[#47372E] outline-none focus:border-[#C66D4E]"
                  />
                </div>

                <div>
                  <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1.5">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    value={profileData.pinCode}
                    onChange={(e) =>
                      setProfileData({ ...profileData, pinCode: e.target.value })
                    }
                    placeholder="560001"
                    className="w-full rounded-xl border border-[#DDD1C3] bg-white py-2 px-3 font-dm-sans text-sm text-[#47372E] outline-none focus:border-[#C66D4E]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="rounded-xl bg-[#C66D4E] px-5 py-2.5 font-dm-sans text-xs font-600 text-white hover:bg-[#B5482A] disabled:opacity-50"
                >
                  {savingProfile ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-6 shadow-warm-sm sm:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-[#DDD1C3] pb-4">
              <div>
                <h3 className="font-manrope text-base font-800 text-[#47372E]">
                  Change Password
                </h3>
                <p className="font-dm-sans text-xs text-[#75665D]">
                  Ensure your account is protected with a strong, distinct password.
                </p>
              </div>
              <Lock className="h-5 w-5 text-[#B78B68]" />
            </div>

            {passwordMsg && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{passwordMsg}</span>
              </div>
            )}

            {errorPassword && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorPassword}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#DDD1C3] bg-white py-2 px-3 font-dm-sans text-sm text-[#47372E] outline-none focus:border-[#C66D4E]"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-[#DDD1C3] bg-white py-2 px-3 font-dm-sans text-sm text-[#47372E] outline-none focus:border-[#C66D4E]"
                  />
                </div>

                <div>
                  <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-[#DDD1C3] bg-white py-2 px-3 font-dm-sans text-sm text-[#47372E] outline-none focus:border-[#C66D4E]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="rounded-xl border border-[#C66D4E] bg-white px-5 py-2.5 font-dm-sans text-xs font-600 text-[#C66D4E] hover:bg-[#C66D4E] hover:text-white transition-colors disabled:opacity-50"
                >
                  {savingPassword ? "Updating…" : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

