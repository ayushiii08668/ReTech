import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Truck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  Calendar,
  Clock,
  X,
  MapPin,
  Laptop,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Send,
} from "lucide-react"
import api from "@/services/api"
import { IPickupRequest, PickupStatus } from "@/types"

export default function AdminPickupsPage() {
  const [pickups, setPickups] = useState<IPickupRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("ALL")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Details Modal
  const [selectedPickup, setSelectedPickup] = useState<IPickupRequest | null>(null)

  // Status Action Modal (Approve, Reject, Confirm Collection, Received, etc.)
  const [actionModal, setActionModal] = useState<{
    pickup: IPickupRequest
    targetStatus: PickupStatus
    title: string
    promptRemarks?: boolean
  } | null>(null)

  const [adminRemarks, setAdminRemarks] = useState("")
  const [scheduledDate, setScheduledDate] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const fetchPickups = async () => {
    setLoading(true)
    try {
      const res = await api.get("/admin/pickups", {
        params: { search, status, page, limit: 10 },
      })
      if (res.data.success) {
        setPickups(res.data.data.pickups)
        setTotalPages(res.data.data.pagination.pages || 1)
        setTotalCount(res.data.data.pagination.total || 0)
      }
    } catch (error) {
      console.error("Failed to load pickups:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPickups()
  }, [search, status, page])

  const openAction = (
    pickup: IPickupRequest,
    targetStatus: PickupStatus,
    title: string,
    promptRemarks = true
  ) => {
    setAdminRemarks("")
    setScheduledDate(pickup.preferredDate)
    setActionModal({ pickup, targetStatus, title, promptRemarks })
  }

  const handleExecuteStatusUpdate = async () => {
    if (!actionModal) return
    setActionLoading(true)
    setErr(null)

    try {
      const res = await api.patch(`/admin/pickups/${actionModal.pickup.requestId}/status`, {
        status: actionModal.targetStatus,
        adminRemarks,
        scheduledDate: scheduledDate || undefined,
      })

      if (res.data.success) {
        setMsg(`Pickup ${actionModal.pickup.requestId} status updated to ${actionModal.targetStatus}.`)
        setActionModal(null)
        if (selectedPickup?._id === actionModal.pickup._id) {
          setSelectedPickup(res.data.data)
        }
        fetchPickups()
      }
    } catch (e: any) {
      setErr(e.response?.data?.message || "Failed to update pickup status.")
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-manrope text-2xl font-800 tracking-tight text-[#47372E] sm:text-3xl">
          Pickup Requests &amp; Logistics Dispatch
        </h1>
        <p className="mt-1 font-dm-sans text-xs text-[#75665D]">
          Review, approve, and track doorstep collection chain-of-custody ({totalCount} requests).
        </p>
      </div>

      {msg && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#DDD1C3] bg-[#FFFDF8] p-4 shadow-warm-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#75665D]" />
          <input
            type="text"
            placeholder="Search by Request ID, phone, city…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-xl border border-[#DDD1C3] bg-white py-2 pl-10 pr-4 font-dm-sans text-xs text-[#47372E] outline-none focus:border-[#C66D4E]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#75665D] shrink-0" />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            className="rounded-xl border border-[#DDD1C3] bg-white py-2 px-3 font-dm-sans text-xs text-[#47372E] outline-none focus:border-[#C66D4E]"
          >
            <option value="ALL">All Pickup Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="COLLECTION_CONFIRMED">Collection Confirmed</option>
            <option value="RECEIVED">Received at Hub</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] shadow-warm-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-dm-sans text-xs">
            <thead className="border-b border-[#DDD1C3] bg-[#F5F0E7]/60 text-[11px] font-700 uppercase tracking-wider text-[#75665D]">
              <tr>
                <th className="px-6 py-4">Request &amp; Customer</th>
                <th className="px-6 py-4">Target Device</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Requested Slot</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDD1C3]/60 text-[#47372E]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#75665D]">
                    <div className="flex justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#C66D4E] border-t-transparent" />
                    </div>
                  </td>
                </tr>
              ) : pickups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#75665D]">
                    No pickup requests found.
                  </td>
                </tr>
              ) : (
                pickups.map((req) => {
                  const cust = req.customerId as any
                  const dev = req.deviceId as any
                  return (
                    <tr key={req._id} className="hover:bg-[#EAE1D5]/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-mono font-700 text-[#C66D4E]">{req.requestId}</div>
                        <div className="font-manrope font-700 text-[#47372E] mt-0.5">
                          {cust?.fullName?.replace(/Ayush Sharma(\s*\(Demo Customer\))?/gi, 'Ayushi Singh').replace(/\s*\(Demo Customer\)/gi, '') || "Customer"}
                        </div>
                        <div className="text-[11px] text-[#75665D]">{req.contactNumber}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-manrope font-700 text-[#47372E]">
                          {dev ? `${dev.brand} ${dev.model}` : "Hardware"}
                        </div>
                        <div className="text-[11px] text-[#75665D]">
                          ID: <span className="font-mono text-[#C66D4E]">{dev?.deviceId || "N/A"}</span> &middot; {dev?.category}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="truncate max-w-[200px] text-[#47372E]">
                          {req.pickupAddress}
                        </div>
                        <div className="text-[11px] text-[#75665D]">
                          {req.city}, {req.state} – {req.pinCode}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-600 text-[#47372E]">{req.preferredDate}</div>
                        <div className="text-[11px] text-[#75665D]">{req.preferredTimeSlot}</div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-700 ${
                            req.status === "APPROVED" || req.status === "COLLECTION_CONFIRMED" || req.status === "RECEIVED"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : req.status === "PENDING"
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : req.status === "REJECTED" || req.status === "CANCELLED"
                              ? "bg-red-50 text-red-800 border border-red-200"
                              : "bg-[#F5F0E7] text-[#47372E] border border-[#DDD1C3]"
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedPickup(req)}
                          className="rounded-lg border border-[#DDD1C3] bg-white px-2.5 py-1 text-[11px] font-600 text-[#47372E] hover:border-[#C66D4E]"
                        >
                          Details
                        </button>

                        {req.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => openAction(req, "APPROVED", "Approve Collection Request")}
                              className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-600 text-white hover:bg-emerald-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => openAction(req, "REJECTED", "Reject Collection Request")}
                              className="rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-600 text-white hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {req.status === "APPROVED" && (
                          <button
                            onClick={() => openAction(req, "COLLECTION_CONFIRMED", "Confirm Agent Collection")}
                            className="rounded-lg bg-[#B78B68] px-2.5 py-1 text-[11px] font-600 text-white hover:bg-[#A66328]"
                          >
                            Confirm Pickup
                          </button>
                        )}

                        {req.status === "COLLECTION_CONFIRMED" && (
                          <button
                            onClick={() => openAction(req, "RECEIVED", "Mark Device Received at Facility")}
                            className="rounded-lg bg-[#47372E] px-2.5 py-1 text-[11px] font-600 text-white hover:bg-[#2C1810]"
                          >
                            Mark Received
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#DDD1C3] p-4 text-xs font-dm-sans">
            <span className="text-[#75665D]">
              Showing page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="rounded-lg border border-[#DDD1C3] p-1.5 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="rounded-lg border border-[#DDD1C3] p-1.5 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ACTION DIALOG MODAL */}
      <AnimatePresence>
        {actionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-6 shadow-2xl sm:p-8"
            >
              <h3 className="font-manrope text-xl font-800 text-[#47372E]">
                {actionModal.title}
              </h3>

              <p className="mt-1 font-dm-sans text-xs text-[#75665D]">
                Updating status for order{" "}
                <span className="font-mono font-700 text-[#C66D4E]">
                  {actionModal.pickup.requestId}
                </span>{" "}
                to <span className="font-bold">{actionModal.targetStatus}</span>.
              </p>

              {err && (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{err}</span>
                </div>
              )}

              <div className="mt-4 space-y-4">
                {actionModal.targetStatus === "SCHEDULED" && (
                  <div>
                    <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1">
                      Scheduled Date
                    </label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full rounded-xl border border-[#DDD1C3] bg-white p-2 font-dm-sans text-xs outline-none focus:border-[#C66D4E]"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1">
                    Internal Operator Remarks / Customer Note
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter dispatch notes, vehicle assignment, or rejection reason…"
                    value={adminRemarks}
                    onChange={(e) => setAdminRemarks(e.target.value)}
                    className="w-full rounded-xl border border-[#DDD1C3] bg-white p-2.5 font-dm-sans text-xs outline-none focus:border-[#C66D4E]"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="flex-1 rounded-xl border border-[#DDD1C3] py-2.5 font-dm-sans text-xs font-600 text-[#47372E]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleExecuteStatusUpdate}
                  className="flex-1 rounded-xl bg-[#C66D4E] py-2.5 font-dm-sans text-xs font-600 text-white hover:bg-[#B5482A] disabled:opacity-50"
                >
                  {actionLoading ? "Executing…" : "Confirm Update"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETAILS VIEW MODAL */}
      <AnimatePresence>
        {selectedPickup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-6 shadow-2xl sm:p-8"
            >
              <button
                onClick={() => setSelectedPickup(null)}
                className="absolute top-5 right-5 rounded-lg p-1.5 text-[#75665D] hover:bg-[#EAE1D5]/50 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-6">
                <span className="font-mono text-xs font-700 text-[#C66D4E]">
                  ORDER AUDIT RECORD
                </span>
                <h2 className="font-manrope text-2xl font-800 text-[#47372E]">
                  {selectedPickup.requestId}
                </h2>
                <p className="font-dm-sans text-xs text-[#75665D]">
                  Current Status: <span className="font-bold">{selectedPickup.status}</span>
                </p>
              </div>

              {/* Status History Timeline */}
              <div className="mb-6 rounded-2xl border border-[#DDD1C3] bg-[#EAE1D5]/20 p-4">
                <h4 className="font-manrope text-xs font-700 uppercase tracking-wider text-[#47372E] mb-3">
                  Chain-of-Custody History Log
                </h4>
                <div className="space-y-3">
                  {selectedPickup.statusHistory && selectedPickup.statusHistory.length > 0 ? (
                    selectedPickup.statusHistory.map((h, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs font-dm-sans">
                        <CheckCircle2 className="h-4 w-4 text-[#C66D4E] mt-0.5 shrink-0" />
                        <div>
                          <div className="font-600 text-[#47372E]">
                            {h.status}{" "}
                            <span className="text-[10px] font-normal text-[#75665D]">
                              &middot; {new Date(h.timestamp).toLocaleString()}
                            </span>
                          </div>
                          {h.remarks && <p className="text-[#75665D] mt-0.5">{h.remarks}</p>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#75665D]">No status history events logged.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedPickup(null)}
                  className="rounded-xl border border-[#DDD1C3] px-5 py-2 font-dm-sans text-xs font-600 text-[#47372E]"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

