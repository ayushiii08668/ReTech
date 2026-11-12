import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Calendar,
  MapPin,
  Laptop,
  Ban,
  ArrowRight,
  ShieldCheck,
} from "lucide-react"
import api from "@/services/api"
import { IPickupRequest } from "@/types"

const stages = [
  { id: 1, key: "PENDING", label: "Pickup Requested", desc: "Request received in queue" },
  { id: 2, key: "APPROVED", label: "Request Approved", desc: "Logistics schedule verified" },
  { id: 3, key: "COLLECTION_CONFIRMED", label: "Collection Confirmed", desc: "Agent picked up device" },
  { id: 4, key: "RECEIVED", label: "Device Received", desc: "Arrived at central hub" },
  { id: 5, key: "INSPECTION", label: "Inspection Diagnostics", desc: "Hardware diagnostics & grading" },
  { id: 6, key: "PROCESSING", label: "Sanitization Queue", desc: "Assigned to sanitization rig" },
  { id: 7, key: "SANITIZATION", label: "Data Sanitization", desc: "NIST SP 800-88 data wipe verified" },
  { id: 8, key: "FINAL_DESTINATION", label: "Final Destination", desc: "Repurposed or Recycled" },
]

// Dynamic, process-driven stage calculation (strictly reflects real operational events)
function getCompletedStageIndex(pickupStatus: string, device?: any): number {
  if (pickupStatus === "CANCELLED" || pickupStatus === "REJECTED") return 0

  const deviceStatus = typeof device === "object" ? device?.status : device
  const hasSanitization = typeof device === "object" ? Boolean(device?.certificateId || device?.hasVerifiedSanitization) : false
  const hasListing = typeof device === "object" ? Boolean(device?.marketplaceListingId) : false

  // Stage 8: Repurposed or Recycled (Circular outcome achieved: listed for resale, sold, or recycled)
  if (
    deviceStatus === "RECYCLED" ||
    deviceStatus === "READY_FOR_RESALE" ||
    deviceStatus === "LISTED_FOR_RESALE" ||
    deviceStatus === "SOLD" ||
    hasListing
  ) {
    return 8
  }

  // Stage 7: Sanitization Verified (requires genuine completed NIST SP 800-88 wipe or certificate)
  if (deviceStatus === "SANITIZED" || hasSanitization) {
    return 7
  }

  // Stage 6: Queue / Preparation for sanitization
  if (deviceStatus === "SANITIZATION_PENDING" || deviceStatus === "IN_REFURBISHMENT") {
    return 6
  }

  // Stage 5: Hardware diagnostics / inspection completed
  if (
    deviceStatus === "INSPECTED" ||
    (typeof device === "object" && device?.classification && device.classification !== "PENDING")
  ) {
    return 5
  }

  // Stage 4: Arrived at central warehouse
  if (pickupStatus === "RECEIVED" || deviceStatus === "RECEIVED" || deviceStatus === "INSPECTION_PENDING") {
    return 4
  }

  // Stage 3: Courier confirmed collection
  if (pickupStatus === "COLLECTION_CONFIRMED") {
    return 3
  }

  // Stage 2: Pickup request approved / scheduled
  if (pickupStatus === "APPROVED" || pickupStatus === "SCHEDULED") {
    return 2
  }

  return 1
}

export default function TrackRequestsPage() {
  const [pickups, setPickups] = useState<IPickupRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [cancelModalReq, setCancelModalReq] = useState<IPickupRequest | null>(null)
  const [actionMsg, setActionMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const fetchPickups = async () => {
    setLoading(true)
    try {
      const res = await api.get("/customer/pickups")
      if (res.data.success) {
        setPickups(res.data.data.pickups)
      }
    } catch (err) {
      console.error("Failed to load pickups:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPickups()
  }, [])

  const handleCancelRequest = async () => {
    if (!cancelModalReq) return
    setCancellingId(cancelModalReq.requestId)
    setErrorMsg(null)

    try {
      const res = await api.patch(`/customer/pickups/${cancelModalReq.requestId}/cancel`)
      if (res.data.success) {
        setActionMsg(`Pickup request ${cancelModalReq.requestId} has been cancelled.`)
        setCancelModalReq(null)
        fetchPickups()
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Could not cancel request.")
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-manrope text-2xl font-800 tracking-tight text-[#47372E] sm:text-3xl">
          Track Pickup Requests
        </h1>
        <p className="mt-1 font-dm-sans text-xs text-[#75665D]">
          Follow the verified 8-stage custody journey from collection to certified repurposing.
        </p>
      </div>

      {actionMsg && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C66D4E] border-t-transparent" />
        </div>
      ) : pickups.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#DDD1C3] bg-[#FFFDF8] p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C66D4E]/10 text-[#C66D4E] mb-3">
            <Truck className="h-6 w-6" />
          </div>
          <h3 className="font-manrope text-base font-700 text-[#47372E]">
            No active pickup requests
          </h3>
          <p className="mt-1 font-dm-sans text-xs text-[#75665D]">
            When you register a device for collection, tracking updates appear here in real time.
          </p>
          <div className="mt-5">
            <Link
              to="/dashboard/submit"
              className="inline-flex items-center gap-2 rounded-xl bg-[#C66D4E] px-5 py-2.5 font-dm-sans text-xs font-600 text-white hover:bg-[#B5482A]"
            >
              <span>Schedule Pickup</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {pickups.map((pickup) => {
            const dev = pickup.deviceId as any
            const completedStage = (pickup as any).currentStageIndex ?? getCompletedStageIndex(pickup.status, dev)
            const canCancel = ["PENDING", "APPROVED", "SCHEDULED"].includes(pickup.status)

            return (
              <motion.div
                key={pickup._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-6 shadow-warm-sm sm:p-8"
              >
                {/* Header Summary */}
                <div className="flex flex-col justify-between gap-4 border-b border-[#DDD1C3] pb-6 lg:flex-row lg:items-center">
                  <div>
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className="font-mono text-xs font-700 text-[#C66D4E]">
                        {pickup.requestId}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 font-dm-sans text-[10px] font-700 ${
                          pickup.status === "APPROVED" || pickup.status === "COLLECTION_CONFIRMED"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : pickup.status === "PENDING"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : pickup.status === "CANCELLED" || pickup.status === "REJECTED"
                            ? "bg-red-50 text-red-800 border border-red-200"
                            : "bg-[#F5F0E7] text-[#47372E] border border-[#DDD1C3]"
                        }`}
                      >
                        {pickup.status}
                      </span>
                    </div>

                    <h3 className="font-manrope text-lg font-800 text-[#47372E]">
                      {dev ? `${dev.brand} ${dev.model}` : "Registered Device"}
                    </h3>

                    <div className="mt-1 flex flex-wrap gap-4 text-xs font-dm-sans text-[#75665D]">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-[#B78B68]" />
                        {pickup.preferredDate} ({pickup.preferredTimeSlot})
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-[#B78B68]" />
                        {pickup.city}, {pickup.state}
                      </span>
                      {dev?.deviceId && (
                        <span className="flex items-center gap-1.5">
                          <Laptop className="h-3.5 w-3.5 text-[#B78B68]" />
                          Device ID: <span className="font-mono text-[#C66D4E]">{dev.deviceId}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Cancel Action if Eligible */}
                  {canCancel && (
                    <div>
                      <button
                        onClick={() => setCancelModalReq(pickup)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/50 px-3.5 py-2 font-dm-sans text-xs font-600 text-red-700 hover:bg-red-50 transition-colors"
                      >
                        <Ban className="h-3.5 w-3.5" />
                        <span>Cancel Request</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Admin Remarks if present */}
                {pickup.adminRemarks && (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs font-dm-sans text-amber-900">
                    <span className="font-700">ReTech Logistics Remark:</span> {pickup.adminRemarks}
                  </div>
                )}

                {/* 8-STAGE VISUAL PROGRESS TIMELINE */}
                <div className="mt-8">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-dm-sans text-xs font-700 uppercase tracking-wider text-[#75665D]">
                      Chain of Custody Progress
                    </span>
                    <span className="font-dm-sans text-xs font-600 text-[#C66D4E]">
                      Stage {completedStage} of {stages.length}
                    </span>
                  </div>

                  {/* Horizontal on Desktop, Staggered on Mobile */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
                    {stages.map((stg) => {
                      const isComplete = stg.id <= completedStage
                      const isCurrent = stg.id === completedStage
                      return (
                        <div
                          key={stg.id}
                          className={`flex flex-col justify-between rounded-xl border p-3 transition-colors ${
                            isCurrent
                              ? "border-[#C66D4E] bg-[#C66D4E]/5 shadow-sm"
                              : isComplete
                              ? "border-emerald-200 bg-emerald-50/50"
                              : "border-[#DDD1C3]/60 bg-white opacity-60"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-mono text-[10px] font-700 text-[#75665D]">
                                0{stg.id}
                              </span>
                              {isComplete ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <Clock className="h-3.5 w-3.5 text-[#DDD1C3]" />
                              )}
                            </div>
                            <div className="font-manrope text-xs font-700 text-[#47372E] leading-tight">
                              {stg.label}
                            </div>
                          </div>
                          <p className="mt-2 text-[10px] text-[#75665D] leading-tight">
                            {stg.desc}
                          </p>
                        </div>
                      )
                    })}
                  </div>

                  {/* Cryptographic Sanitization Proof & Certificate Link if Verified */}
                  {(dev?.certificateId || (pickup as any).sanitizationCertificateId) && (
                    <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="h-5 w-5 text-emerald-700 shrink-0" />
                        <div>
                          <div className="font-manrope text-xs font-700 text-emerald-950">
                            NIST SP 800-88 Data Sanitization Certified
                          </div>
                          <div className="font-mono text-[11px] text-emerald-800">
                            Certificate ID: {dev?.certificateId || (pickup as any).sanitizationCertificateId}
                          </div>
                        </div>
                      </div>
                      <Link
                        to={`/verify-certificate/${dev?.certificateId || (pickup as any).sanitizationCertificateId}`}
                        className="inline-flex items-center gap-1 rounded-xl bg-emerald-700 px-3 py-1.5 font-dm-sans text-xs font-700 text-white hover:bg-emerald-800 transition-colors shrink-0 shadow-sm"
                      >
                        <span>Verify Certificate</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* CANCEL CONFIRMATION DIALOG */}
      <AnimatePresence>
        {cancelModalReq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-6 shadow-2xl text-center sm:p-8"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-700 mb-4">
                <AlertCircle className="h-6 w-6" />
              </div>

              <h3 className="font-manrope text-xl font-800 text-[#47372E]">
                Cancel Pickup Request?
              </h3>

              <p className="mt-2 font-dm-sans text-xs text-[#75665D] leading-relaxed">
                Are you sure you want to cancel request{" "}
                <span className="font-mono font-700 text-[#C66D4E]">
                  {cancelModalReq.requestId}
                </span>
                ? This action will notify the collection dispatch team and halt pickup.
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setCancelModalReq(null)}
                  className="flex-1 rounded-xl border border-[#DDD1C3] py-2.5 font-dm-sans text-xs font-600 text-[#47372E] hover:bg-[#EAE1D5]/40"
                >
                  Keep Request
                </button>
                <button
                  type="button"
                  disabled={!!cancellingId}
                  onClick={handleCancelRequest}
                  className="flex-1 rounded-xl bg-red-600 py-2.5 font-dm-sans text-xs font-600 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {cancellingId ? "Cancelling…" : "Yes, Cancel"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

