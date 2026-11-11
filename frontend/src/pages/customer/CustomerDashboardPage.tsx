import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Laptop,
  Clock,
  Cpu,
  ShieldCheck,
  PlusCircle,
  ArrowRight,
  Truck,
  Sparkles,
  ChevronRight,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import api from "@/services/api"
import { IDevice, IPickupRequest } from "@/types"

export default function CustomerDashboardPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState({
    totalDevices: 0,
    pendingPickups: 0,
    devicesUnderProcessing: 0,
    sanitizationCompleted: 0,
  })
  const [recentDevices, setRecentDevices] = useState<IDevice[]>([])
  const [recentPickups, setRecentPickups] = useState<IPickupRequest[]>([])

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/customer/dashboard")
        if (res.data.success) {
          setMetrics(res.data.data.metrics)
          setRecentDevices(res.data.data.recentDevices)
          setRecentPickups(res.data.data.recentPickups)
        }
      } catch (err) {
        console.error("Failed to load customer dashboard:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C66D4E] border-t-transparent" />
          <p className="font-dm-sans text-xs text-[#75665D]">Loading dashboard data…</p>
        </div>
      </div>
    )
  }

  const isBrandNew = metrics.totalDevices === 0

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-6 shadow-warm-sm sm:flex-row sm:items-center sm:p-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-dm-sans text-xs font-600 tracking-wider text-[#B78B68] uppercase">
              Customer Workspace
            </span>
          </div>
          <h1 className="font-manrope text-2xl font-800 tracking-tight text-[#47372E] sm:text-3xl">
            Welcome back, {user?.fullName?.split(" ")[0] || "Customer"}
          </h1>
          <p className="mt-1 font-dm-sans text-sm text-[#75665D]">
            Manage your devices and follow their journey towards a smarter second life.
          </p>
        </div>

        <Link
          to="/dashboard/submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C66D4E] px-5 py-3 font-dm-sans text-xs font-600 text-white shadow-warm-sm hover:bg-[#B5482A] transition-all hover:-translate-y-0.5"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Submit Device for Pickup</span>
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Devices */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-[#DDD1C3] bg-[#FFFDF8] p-6 shadow-warm-sm"
        >
          <div className="flex items-center justify-between">
            <span className="font-dm-sans text-xs font-600 text-[#75665D]">
              Total Devices Submitted
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C66D4E]/10 text-[#C66D4E]">
              <Laptop className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 font-manrope text-3xl font-800 text-[#47372E]">
            {metrics.totalDevices}
          </div>
          <p className="mt-1 font-dm-sans text-[11px] text-[#75665D]">
            Registered for collection &amp; recycling
          </p>
        </motion.div>

        {/* Pending Pickups */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-[#DDD1C3] bg-[#FFFDF8] p-6 shadow-warm-sm"
        >
          <div className="flex items-center justify-between">
            <span className="font-dm-sans text-xs font-600 text-[#75665D]">
              Pending Pickups
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#B78B68]/15 text-[#B78B68]">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 font-manrope text-3xl font-800 text-[#47372E]">
            {metrics.pendingPickups}
          </div>
          <p className="mt-1 font-dm-sans text-[11px] text-[#75665D]">
            Scheduled or awaiting pickup team
          </p>
        </motion.div>

        {/* Under Processing */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-[#DDD1C3] bg-[#FFFDF8] p-6 shadow-warm-sm"
        >
          <div className="flex items-center justify-between">
            <span className="font-dm-sans text-xs font-600 text-[#75665D]">
              Under Processing
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAE1D5] text-[#47372E]">
              <Cpu className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 font-manrope text-3xl font-800 text-[#47372E]">
            {metrics.devicesUnderProcessing}
          </div>
          <p className="mt-1 font-dm-sans text-[11px] text-[#75665D]">
            In transit or technical inspection
          </p>
        </motion.div>

        {/* Sanitization Completed */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-[#DDD1C3] bg-[#FFFDF8] p-6 shadow-warm-sm"
        >
          <div className="flex items-center justify-between">
            <span className="font-dm-sans text-xs font-600 text-[#75665D]">
              Sanitization Verified
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 font-manrope text-3xl font-800 text-[#47372E]">
            {metrics.sanitizationCompleted}
          </div>
          <p className="mt-1 font-dm-sans text-[11px] text-[#75665D]">
            NIST SP 800-88 certified erasure
          </p>
        </motion.div>
      </div>

      {/* Brand New User Empty State */}
      {isBrandNew ? (
        <div className="rounded-3xl border border-dashed border-[#DDD1C3] bg-[#FFFDF8] p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C66D4E]/10 text-[#C66D4E] mb-4">
            <Sparkles className="h-7 w-7" />
          </div>
          <h3 className="font-manrope text-xl font-800 text-[#47372E]">
            No devices submitted yet
          </h3>
          <p className="mx-auto mt-2 max-w-md font-dm-sans text-xs text-[#75665D] leading-relaxed">
            Ready to give your old laptops, phones, or monitors a responsible second life? Submit your first device and book a convenient doorstep collection.
          </p>
          <div className="mt-6">
            <Link
              to="/dashboard/submit"
              className="inline-flex items-center gap-2 rounded-xl bg-[#C66D4E] px-6 py-3 font-dm-sans text-xs font-600 text-white hover:bg-[#B5482A] transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Schedule Your First Pickup</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Activity Columns */
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Recent Submitted Devices */}
          <div className="rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-6 shadow-warm-sm">
            <div className="flex items-center justify-between border-b border-[#DDD1C3] pb-4 mb-4">
              <div>
                <h3 className="font-manrope text-base font-800 text-[#47372E]">
                  Recent Device Activity
                </h3>
                <p className="font-dm-sans text-xs text-[#75665D]">
                  Latest hardware submitted for processing
                </p>
              </div>
              <Link
                to="/dashboard/devices"
                className="inline-flex items-center gap-1 font-dm-sans text-xs font-600 text-[#C66D4E] hover:underline"
              >
                View all
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-[#DDD1C3]/50 space-y-2">
              {recentDevices.map((dev) => (
                <div key={dev._id} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAE1D5]/40 text-[#47372E]">
                      <Laptop className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-manrope text-xs font-700 text-[#47372E]">
                        {dev.brand} {dev.model}
                      </div>
                      <div className="font-dm-sans text-[11px] text-[#75665D]">
                        ID: <span className="font-mono text-[#C66D4E]">{dev.deviceId}</span> &middot; {dev.category}
                      </div>
                    </div>
                  </div>

                  <span className="rounded-full border border-[#DDD1C3] bg-[#F5F0E7] px-2.5 py-1 font-dm-sans text-[10px] font-600 text-[#47372E]">
                    {dev.status.replace(/_/g, " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Latest Pickup Requests */}
          <div className="rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-6 shadow-warm-sm">
            <div className="flex items-center justify-between border-b border-[#DDD1C3] pb-4 mb-4">
              <div>
                <h3 className="font-manrope text-base font-800 text-[#47372E]">
                  Active Pickup Requests
                </h3>
                <p className="font-dm-sans text-xs text-[#75665D]">
                  Doorstep logistics and tracking status
                </p>
              </div>
              <Link
                to="/dashboard/track"
                className="inline-flex items-center gap-1 font-dm-sans text-xs font-600 text-[#C66D4E] hover:underline"
              >
                Track timeline
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-[#DDD1C3]/50 space-y-2">
              {recentPickups.map((req) => (
                <div key={req._id} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#B78B68]/15 text-[#B78B68]">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-manrope text-xs font-700 text-[#47372E]">
                        {req.requestId}
                      </div>
                      <div className="font-dm-sans text-[11px] text-[#75665D]">
                        Date: {req.preferredDate} ({req.preferredTimeSlot})
                      </div>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 font-dm-sans text-[10px] font-600 ${
                      req.status === "APPROVED"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : req.status === "PENDING"
                        ? "bg-amber-50 text-amber-800 border border-amber-200"
                        : "bg-[#F5F0E7] text-[#47372E] border border-[#DDD1C3]"
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

