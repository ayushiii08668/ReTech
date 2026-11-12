import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Laptop,
  Search,
  Filter,
  Eye,
  PlusCircle,
  X,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  HardDrive,
} from "lucide-react"
import api from "@/services/api"
import { IDevice } from "@/types"

export default function MyDevicesPage() {
  const [devices, setDevices] = useState<IDevice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("ALL")
  const [status, setStatus] = useState("ALL")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalDevices, setTotalDevices] = useState(0)

  // Selected device for modal view
  const [selectedDevice, setSelectedDevice] = useState<IDevice | null>(null)

  const fetchDevices = async () => {
    setLoading(true)
    try {
      const res = await api.get("/customer/devices", {
        params: {
          search,
          category,
          status,
          page,
          limit: 8,
        },
      })
      if (res.data.success) {
        setDevices(res.data.data.devices)
        setTotalPages(res.data.data.pagination.pages || 1)
        setTotalDevices(res.data.data.pagination.total || 0)
      }
    } catch (err) {
      console.error("Failed to load devices:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDevices()
  }, [search, category, status, page])

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-manrope text-2xl font-800 tracking-tight text-[#47372E] sm:text-3xl">
            My Registered Devices
          </h1>
          <p className="mt-1 font-dm-sans text-xs text-[#75665D]">
            Track status, review technical specifications, and view sanitization audit trails ({totalDevices} total).
          </p>
        </div>

        <Link
          to="/dashboard/submit"
          className="inline-flex items-center gap-2 rounded-xl bg-[#C66D4E] px-4 py-2.5 font-dm-sans text-xs font-600 text-white shadow-warm-sm hover:bg-[#B5482A] transition-all"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Submit Another Device</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#DDD1C3] bg-[#FFFDF8] p-4 shadow-warm-sm sm:flex-row sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#75665D]" />
          <input
            type="text"
            placeholder="Search by ID, brand, model…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-xl border border-[#DDD1C3] bg-white py-2 pl-10 pr-4 font-dm-sans text-xs text-[#47372E] outline-none focus:border-[#C66D4E]"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#75665D] shrink-0 hidden sm:block" />
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value)
              setPage(1)
            }}
            className="rounded-xl border border-[#DDD1C3] bg-white py-2 px-3 font-dm-sans text-xs text-[#47372E] outline-none focus:border-[#C66D4E]"
          >
            <option value="ALL">All Categories</option>
            <option value="Laptop">Laptops</option>
            <option value="Desktop">Desktop Computers</option>
            <option value="Smartphone">Smartphones</option>
            <option value="Tablet">Tablets</option>
            <option value="Monitor">Monitors</option>
            <option value="Storage">HDD / SSD</option>
            <option value="Server">Servers &amp; NAS</option>
            <option value="Other">Other Data-Bearing Devices</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-xl border border-[#DDD1C3] bg-white py-2 px-3 font-dm-sans text-xs text-[#47372E] outline-none focus:border-[#C66D4E]"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="PICKUP_SCHEDULED">Pickup Scheduled</option>
            <option value="COLLECTION_CONFIRMED">In Transit</option>
            <option value="RECEIVED">Received</option>
            <option value="INSPECTED">Inspected</option>
            <option value="SANITIZED">Sanitized</option>
            <option value="READY_FOR_RESALE">Ready For Resale</option>
            <option value="RECYCLED">Recycled</option>
          </select>
        </div>
      </div>

      {/* Devices Editorial Grid */}
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C66D4E] border-t-transparent" />
        </div>
      ) : devices.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#DDD1C3] bg-[#FFFDF8] p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C66D4E]/10 text-[#C66D4E] mb-3">
            <Laptop className="h-6 w-6" />
          </div>
          <h3 className="font-manrope text-base font-700 text-[#47372E]">
            No matching devices found
          </h3>
          <p className="mt-1 font-dm-sans text-xs text-[#75665D]">
            Try adjusting your search criteria or register a new device for collection.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {devices.map((device) => {
            const hasPhoto = device.images && device.images.length > 0
            return (
              <motion.div
                key={device._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="group flex flex-col justify-between rounded-2xl border border-[#DDD1C3] bg-[#FFFDF8] p-5 shadow-warm-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#C66D4E]/40 hover:shadow-warm"
              >
                <div>
                  {/* Photo or Category Graphic */}
                  <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-xl border border-[#DDD1C3]/60 bg-[#EAE1D5]/30 flex items-center justify-center">
                    {hasPhoto ? (
                      <img
                        src={device.images[0]}
                        alt={device.brand}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-[#75665D]">
                        <Laptop className="h-8 w-8 text-[#B78B68]" />
                        <span className="text-[10px] font-dm-sans uppercase tracking-wider">
                          {device.category}
                        </span>
                      </div>
                    )}

                    <span className="absolute top-2 left-2 rounded-md bg-[#FFFDF8]/90 backdrop-blur-sm px-2 py-0.5 font-mono text-[10px] font-700 text-[#C66D4E] shadow-sm">
                      {device.deviceId}
                    </span>
                  </div>

                  {/* Title & Brand */}
                  <div className="mb-2">
                    <span className="font-dm-sans text-[10px] font-600 text-[#B78B68] uppercase tracking-wider">
                      {device.category}
                    </span>
                    <h3 className="font-manrope text-base font-800 text-[#47372E] truncate">
                      {device.brand} {device.model}
                    </h3>
                  </div>

                  {/* Quick specs */}
                  <div className="space-y-1 text-xs font-dm-sans text-[#75665D] mb-4">
                    <div className="flex justify-between">
                      <span>Condition:</span>
                      <span className="font-500 text-[#47372E]">{device.condition}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Storage:</span>
                      <span className="font-500 text-[#47372E]">
                        {device.storageType} ({device.storageCapacity})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Submitted:</span>
                      <span className="font-500 text-[#47372E]">
                        {new Date(device.createdAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Status & View Action */}
                <div className="border-t border-[#DDD1C3]/60 pt-3 flex items-center justify-between">
                  <span className="inline-block rounded-full bg-[#EAE1D5]/50 px-2.5 py-0.5 font-dm-sans text-[10px] font-600 text-[#47372E]">
                    {device.status.replace(/_/g, " ")}
                  </span>

                  <button
                    onClick={() => setSelectedDevice(device)}
                    className="inline-flex items-center gap-1 font-dm-sans text-xs font-600 text-[#C66D4E] hover:text-[#B5482A]"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Details</span>
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="rounded-xl border border-[#DDD1C3] bg-[#FFFDF8] p-2 text-[#47372E] hover:bg-[#EAE1D5]/40 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-dm-sans text-xs text-[#75665D]">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            className="rounded-xl border border-[#DDD1C3] bg-[#FFFDF8] p-2 text-[#47372E] hover:bg-[#EAE1D5]/40 disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* DEVICE DETAILS MODAL */}
      <AnimatePresence>
        {selectedDevice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-6 shadow-2xl sm:p-8"
            >
              <button
                onClick={() => setSelectedDevice(null)}
                className="absolute top-5 right-5 rounded-lg p-1.5 text-[#75665D] hover:bg-[#EAE1D5]/50 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Modal Header */}
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C66D4E]/10 text-[#C66D4E]">
                  <Laptop className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-700 text-[#C66D4E]">
                      {selectedDevice.deviceId}
                    </span>
                    <span className="rounded-full bg-[#EAE1D5]/60 px-2.5 py-0.5 text-[10px] font-600 text-[#47372E]">
                      {selectedDevice.category}
                    </span>
                  </div>
                  <h2 className="font-manrope text-xl font-800 text-[#47372E]">
                    {selectedDevice.brand} {selectedDevice.model}
                  </h2>
                </div>
              </div>

              {/* Uploaded Images Gallery */}
              {selectedDevice.images && selectedDevice.images.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-manrope text-xs font-700 text-[#47372E] uppercase tracking-wider mb-2">
                    Hardware Photographs ({selectedDevice.images.length})
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedDevice.images.map((img, i) => (
                      <div
                        key={i}
                        className="aspect-[4/3] overflow-hidden rounded-xl border border-[#DDD1C3] bg-white"
                      >
                        <img
                          src={img}
                          alt="Device preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Specs & Condition Breakdown */}
              <div className="mb-6 rounded-2xl border border-[#DDD1C3] bg-[#EAE1D5]/20 p-4 space-y-2 text-xs font-dm-sans">
                <h4 className="font-manrope text-xs font-700 text-[#47372E] uppercase tracking-wider mb-3">
                  Technical Summary
                </h4>
                <div className="grid grid-cols-2 gap-y-2">
                  <span className="text-[#75665D]">Declared Condition:</span>
                  <span className="font-600 text-[#47372E]">{selectedDevice.condition}</span>

                  <span className="text-[#75665D]">Powers On:</span>
                  <span className="font-600 text-[#47372E]">
                    {selectedDevice.powersOn ? "Yes" : "No"}
                  </span>

                  <span className="text-[#75665D]">Storage Media:</span>
                  <span className="font-600 text-[#47372E]">
                    {selectedDevice.storageType} ({selectedDevice.storageCapacity})
                  </span>

                  <span className="text-[#75665D]">Purchase Year:</span>
                  <span className="font-600 text-[#47372E]">
                    {selectedDevice.purchaseYear || "N/A"}
                  </span>

                  <span className="text-[#75665D]">Classification:</span>
                  <span className="font-600 text-[#47372E]">
                    {selectedDevice.classification === "PENDING"
                      ? "Awaiting Technical Inspection"
                      : `Grade ${selectedDevice.classification}`}
                  </span>
                </div>
              </div>

              {/* Inspection notes if available */}
              {selectedDevice.inspection?.inspectionNotes && (
                <div className="mb-6 rounded-2xl border border-[#DDD1C3] bg-white p-4 text-xs font-dm-sans">
                  <h4 className="font-manrope text-xs font-700 text-[#47372E] uppercase tracking-wider mb-2">
                    Inspection Remarks
                  </h4>
                  <p className="text-[#75665D] leading-relaxed">
                    {selectedDevice.inspection.inspectionNotes}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setSelectedDevice(null)}
                  className="rounded-xl border border-[#DDD1C3] px-5 py-2 font-dm-sans text-xs font-600 text-[#47372E]"
                >
                  Close
                </button>
                <Link
                  to="/dashboard/track"
                  className="rounded-xl bg-[#C66D4E] px-5 py-2 font-dm-sans text-xs font-600 text-white hover:bg-[#B5482A]"
                >
                  Track Pickup Timeline
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

