import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  X,
  Laptop,
  Truck,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react"
import api from "@/services/api"
import { IUser } from "@/types"

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("ALL")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Details Modal
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null)
  const [customerDetailsLoading, setCustomerDetailsLoading] = useState(false)
  const [customerDevices, setCustomerDevices] = useState<any[]>([])
  const [customerPickups, setCustomerPickups] = useState<any[]>([])

  // Toggle Status Modal
  const [statusModalCust, setStatusModalCust] = useState<any | null>(null)
  const [statusActionLoading, setStatusActionLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const res = await api.get("/admin/customers", {
        params: { search, status, page, limit: 10 },
      })
      if (res.data.success) {
        setCustomers(res.data.data.customers)
        setTotalPages(res.data.data.pagination.pages || 1)
        setTotalCount(res.data.data.pagination.total || 0)
      }
    } catch (err) {
      console.error("Failed to load customers:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [search, status, page])

  const handleOpenDetails = async (cust: any) => {
    setSelectedCustomer(cust)
    setCustomerDetailsLoading(true)
    try {
      const res = await api.get(`/admin/customers/${cust._id}`)
      if (res.data.success) {
        setCustomerDevices(res.data.data.devices)
        setCustomerPickups(res.data.data.pickups)
      }
    } catch (err) {
      console.error("Failed to load customer details:", err)
    } finally {
      setCustomerDetailsLoading(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!statusModalCust) return
    setStatusActionLoading(true)
    const newStatus = statusModalCust.accountStatus === "ACTIVE" ? "DEACTIVATED" : "ACTIVE"

    try {
      const res = await api.patch(`/admin/customers/${statusModalCust._id}/status`, {
        accountStatus: newStatus,
      })
      if (res.data.success) {
        setMsg(`Customer account has been ${newStatus.toLowerCase()}.`)
        setStatusModalCust(null)
        fetchCustomers()
      }
    } catch (err) {
      console.error("Failed to update status:", err)
    } finally {
      setStatusActionLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-manrope text-2xl font-800 tracking-tight text-[#47372E] sm:text-3xl">
          Customer Directory &amp; Accounts
        </h1>
        <p className="mt-1 font-dm-sans text-xs text-[#75665D]">
          Manage registered individual and institutional participants ({totalCount} total).
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
            placeholder="Search by name, email, or phone…"
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
            <option value="ALL">All Account Statuses</option>
            <option value="ACTIVE">Active Accounts</option>
            <option value="DEACTIVATED">Deactivated Accounts</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="overflow-hidden rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] shadow-warm-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-dm-sans text-xs">
            <thead className="border-b border-[#DDD1C3] bg-[#F5F0E7]/60 text-[11px] font-700 uppercase tracking-wider text-[#75665D]">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Devices Logged</th>
                <th className="px-6 py-4">Account Status</th>
                <th className="px-6 py-4">Member Since</th>
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
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#75665D]">
                    No customers match your criteria.
                  </td>
                </tr>
              ) : (
                customers.map((cust) => (
                  <tr key={cust._id} className="hover:bg-[#EAE1D5]/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-manrope font-700 text-[#47372E]">
                        {cust.fullName?.replace(/Ayush Sharma(\s*\(Demo Customer\))?/gi, 'Ayushi Singh').replace(/\s*\(Demo Customer\)/gi, '')}
                      </div>
                      <div className="text-[11px] text-[#75665D]">{cust.email}</div>
                    </td>

                    <td className="px-6 py-4">
                      <span>{cust.phone || "No phone recorded"}</span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-manrope font-700 text-[#C66D4E]">
                        {cust.deviceCount || 0}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-700 ${
                          cust.accountStatus === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-red-50 text-red-800 border border-red-200"
                        }`}
                      >
                        {cust.accountStatus}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-[#75665D]">
                      {new Date(cust.createdAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenDetails(cust)}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#DDD1C3] bg-white px-2.5 py-1 text-[11px] font-600 text-[#47372E] hover:border-[#C66D4E]"
                      >
                        <Eye className="h-3 w-3" />
                        <span>Inspect</span>
                      </button>

                      <button
                        onClick={() => setStatusModalCust(cust)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-600 transition-colors ${
                          cust.accountStatus === "ACTIVE"
                            ? "border border-red-200 bg-red-50/50 text-red-700 hover:bg-red-50"
                            : "border border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-50"
                        }`}
                      >
                        {cust.accountStatus === "ACTIVE" ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
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

      {/* CUSTOMER DETAILS MODAL */}
      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-6 shadow-2xl sm:p-8"
            >
              <button
                onClick={() => setSelectedCustomer(null)}
                className="absolute top-5 right-5 rounded-lg p-1.5 text-[#75665D] hover:bg-[#EAE1D5]/50 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-6">
                <span className="font-mono text-xs font-700 text-[#C66D4E]">CUSTOMER PROFILE</span>
                <h2 className="font-manrope text-2xl font-800 text-[#47372E]">
                  {selectedCustomer.fullName?.replace(/Ayush Sharma(\s*\(Demo Customer\))?/gi, 'Ayushi Singh').replace(/\s*\(Demo Customer\)/gi, '')}
                </h2>
                <p className="font-dm-sans text-xs text-[#75665D]">
                  {selectedCustomer.email} &middot; {selectedCustomer.phone || "No phone"}
                </p>
              </div>

              {customerDetailsLoading ? (
                <div className="py-12 text-center">
                  <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[#C66D4E] border-t-transparent" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Submitted Devices */}
                  <div>
                    <h4 className="font-manrope text-xs font-700 uppercase tracking-wider text-[#47372E] mb-2">
                      Registered Devices ({customerDevices.length})
                    </h4>
                    {customerDevices.length === 0 ? (
                      <p className="text-xs font-dm-sans text-[#75665D]">No devices submitted yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {customerDevices.map((d) => (
                          <div
                            key={d._id}
                            className="flex items-center justify-between rounded-xl border border-[#DDD1C3] bg-white p-3 text-xs"
                          >
                            <div>
                              <span className="font-mono font-700 text-[#C66D4E] mr-2">
                                {d.deviceId}
                              </span>
                              <span className="font-manrope font-700 text-[#47372E]">
                                {d.brand} {d.model}
                              </span>
                            </div>
                            <span className="rounded-full bg-[#EAE1D5]/50 px-2 py-0.5 text-[10px] font-600">
                              {d.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pickup History */}
                  <div>
                    <h4 className="font-manrope text-xs font-700 uppercase tracking-wider text-[#47372E] mb-2">
                      Pickup Request History ({customerPickups.length})
                    </h4>
                    {customerPickups.length === 0 ? (
                      <p className="text-xs font-dm-sans text-[#75665D]">No pickup requests yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {customerPickups.map((p) => (
                          <div
                            key={p._id}
                            className="flex items-center justify-between rounded-xl border border-[#DDD1C3] bg-white p-3 text-xs"
                          >
                            <div>
                              <span className="font-mono font-700 text-[#47372E] mr-2">
                                {p.requestId}
                              </span>
                              <span className="text-[#75665D]">
                                {p.preferredDate} ({p.preferredTimeSlot})
                              </span>
                            </div>
                            <span className="rounded-full bg-[#EAE1D5]/50 px-2 py-0.5 text-[10px] font-600">
                              {p.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM STATUS TOGGLE DIALOG */}
      <AnimatePresence>
        {statusModalCust && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-6 shadow-2xl text-center sm:p-8"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 mb-4">
                <Shield className="h-6 w-6" />
              </div>

              <h3 className="font-manrope text-xl font-800 text-[#47372E]">
                {statusModalCust.accountStatus === "ACTIVE"
                  ? "Deactivate Customer Account?"
                  : "Reactivate Customer Account?"}
              </h3>

              <p className="mt-2 font-dm-sans text-xs text-[#75665D] leading-relaxed">
                Are you sure you want to change the status of{" "}
                <span className="font-600 text-[#47372E]">{statusModalCust.fullName}</span>?{" "}
                {statusModalCust.accountStatus === "ACTIVE"
                  ? "They will be immediately blocked from logging in or requesting new pickups."
                  : "They will regain access to their dashboard and devices."}
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStatusModalCust(null)}
                  className="flex-1 rounded-xl border border-[#DDD1C3] py-2.5 font-dm-sans text-xs font-600 text-[#47372E]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={statusActionLoading}
                  onClick={handleToggleStatus}
                  className={`flex-1 rounded-xl py-2.5 font-dm-sans text-xs font-600 text-white ${
                    statusModalCust.accountStatus === "ACTIVE"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  } disabled:opacity-50`}
                >
                  {statusActionLoading ? "Updating…" : "Confirm Change"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

