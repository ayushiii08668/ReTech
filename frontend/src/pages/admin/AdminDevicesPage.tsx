import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Boxes,
  Search,
  Filter,
  Microscope,
  Eye,
  CheckCircle2,
  X,
  AlertCircle,
  Laptop,
  HardDrive,
  Cpu,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react"
import api from "@/services/api"
import { IDevice, DeviceClassification } from "@/types"

export default function AdminDevicesPage() {
  const [devices, setDevices] = useState<IDevice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("ALL")
  const [status, setStatus] = useState("ALL")
  const [classification, setClassification] = useState("ALL")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Inspection Modal
  const [inspectingDevice, setInspectingDevice] = useState<IDevice | null>(null)
  const [inspectionForm, setInspectionForm] = useState({
    physicalCondition: "Good",
    powersOn: true,
    storageType: "SSD",
    storageCapacity: "512 GB",
    inspectionNotes: "",
    reusePotential: "High - suitable for educational resale",
    classification: "A" as DeviceClassification,
    status: "INSPECTED",
  })
  const [inspectionLoading, setInspectionLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const fetchDevices = async () => {
    setLoading(true)
    try {
      const res = await api.get("/admin/devices", {
        params: { search, category, status, classification, page, limit: 10 },
      })
      if (res.data.success) {
        setDevices(res.data.data.devices)
        setTotalPages(res.data.data.pagination.pages || 1)
        setTotalCount(res.data.data.pagination.total || 0)
      }
    } catch (error) {
      console.error("Failed to load devices:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDevices()
  }, [search, category, status, classification, page])

  const openInspection = (dev: IDevice) => {
    setInspectingDevice(dev)
    setErr(null)
    const validPostInspectionStatuses = [
      'INSPECTED',
      'SANITIZATION_PENDING',
      'SANITIZED',
      'READY_FOR_RESALE',
      'RECYCLED',
    ]
    const targetStatus = validPostInspectionStatuses.includes(dev.status) ? dev.status : 'INSPECTED'

    setInspectionForm({
      physicalCondition: dev.inspection?.physicalCondition || dev.condition || "Good",
      powersOn: dev.inspection?.powersOn !== undefined ? dev.inspection.powersOn : (dev.powersOn ?? true),
      storageType: dev.inspection?.storageType || dev.storageType || "SSD",
      storageCapacity: dev.inspection?.storageCapacity || dev.storageCapacity || "512 GB",
      inspectionNotes: dev.inspection?.inspectionNotes || "",
      reusePotential: dev.inspection?.reusePotential || "High",
      classification: (dev.classification === "PENDING" ? "A" : dev.classification) as DeviceClassification,
      status: targetStatus,
    })
  }

  const handleSaveInspection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inspectingDevice) return
    setInspectionLoading(true)
    setErr(null)

    try {
      const payload = {
        ...inspectionForm,
        status: inspectionForm.status || 'INSPECTED',
      }
      const res = await api.patch(`/admin/devices/${inspectingDevice.deviceId}/inspection`, payload)
      if (res.data.success) {
        setMsg(`Inspection and Classification recorded for ${inspectingDevice.deviceId} (Grade ${inspectionForm.classification}). Device transitioned to ${payload.status}.`)
        setInspectingDevice(null)
        fetchDevices()
      }
    } catch (e: any) {
      setErr(e.response?.data?.message || "Failed to save inspection.")
    } finally {
      setInspectionLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-manrope text-2xl font-800 tracking-tight text-[#47372E] sm:text-3xl">
          Hardware Inventory &amp; Inspection
        </h1>
        <p className="mt-1 font-dm-sans text-xs text-[#75665D]">
          Platform-wide inventory registry, multi-point diagnostics, and ReTech circular classification ({totalCount} items).
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
            placeholder="Search by device ID, brand, model…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-xl border border-[#DDD1C3] bg-white py-2 pl-10 pr-4 font-dm-sans text-xs text-[#47372E] outline-none focus:border-[#C66D4E]"
          />
        </div>

        <div className="flex items-center gap-2">
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

          <select
            value={classification}
            onChange={(e) => {
              setClassification(e.target.value)
              setPage(1)
            }}
            className="rounded-xl border border-[#DDD1C3] bg-white py-2 px-3 font-dm-sans text-xs text-[#47372E] outline-none focus:border-[#C66D4E]"
          >
            <option value="ALL">All Grades</option>
            <option value="PENDING">Pending</option>
            <option value="A">Grade A (Reusable)</option>
            <option value="B">Grade B (Refurbish)</option>
            <option value="C">Grade C (Recycle)</option>
            <option value="D">Grade D (Special)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] shadow-warm-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-dm-sans text-xs">
            <thead className="border-b border-[#DDD1C3] bg-[#F5F0E7]/60 text-[11px] font-700 uppercase tracking-wider text-[#75665D]">
              <tr>
                <th className="px-6 py-4">Device &amp; Brand</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Declared Condition</th>
                <th className="px-6 py-4">Classification</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDD1C3]/60 text-[#47372E]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#75665D]">
                    <div className="flex justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#C66D4E] border-t-transparent" />
                    </div>
                  </td>
                </tr>
              ) : devices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#75665D]">
                    No hardware records found.
                  </td>
                </tr>
              ) : (
                devices.map((dev) => {
                  const cust = dev.customerId as any
                  return (
                    <tr key={dev._id} className="hover:bg-[#EAE1D5]/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-mono font-700 text-[#C66D4E]">{dev.deviceId}</div>
                        <div className="font-manrope font-700 text-[#47372E] mt-0.5">
                          {dev.brand} {dev.model}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-manrope font-600 text-[#47372E]">
                          {cust?.fullName || "Customer"}
                        </div>
                        <div className="text-[11px] text-[#75665D]">{cust?.email}</div>
                      </td>

                      <td className="px-6 py-4">
                        <span>{dev.category}</span>
                      </td>

                      <td className="px-6 py-4">
                        <span>{dev.condition}</span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            dev.classification === "A"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : dev.classification === "B"
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : dev.classification === "C"
                              ? "bg-blue-50 text-blue-800 border border-blue-200"
                              : dev.classification === "D"
                              ? "bg-red-50 text-red-800 border border-red-200"
                              : "bg-[#EAE1D5]/50 text-[#75665D]"
                          }`}
                        >
                          {dev.classification === "PENDING"
                            ? "Pending"
                            : `Grade ${dev.classification}`}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-[#EAE1D5]/50 px-2.5 py-0.5 text-[10px] font-600 text-[#47372E]">
                          {dev.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openInspection(dev)}
                          className="inline-flex items-center gap-1 rounded-xl bg-[#47372E] px-3 py-1.5 font-dm-sans text-xs font-600 text-white hover:bg-[#2C1810]"
                        >
                          <Microscope className="h-3.5 w-3.5" />
                          <span>Inspect</span>
                        </button>
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

      {/* INSPECTION MODAL */}
      <AnimatePresence>
        {inspectingDevice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-6 shadow-2xl sm:p-8"
            >
              <button
                onClick={() => setInspectingDevice(null)}
                className="absolute top-5 right-5 rounded-lg p-1.5 text-[#75665D] hover:bg-[#EAE1D5]/50 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-6">
                <span className="font-mono text-xs font-700 text-[#C66D4E]">
                  HARDWARE INTAKE &amp; CLASSIFICATION
                </span>
                <h2 className="font-manrope text-2xl font-800 text-[#47372E]">
                  Inspect: {inspectingDevice.brand} {inspectingDevice.model}
                </h2>
                <p className="font-dm-sans text-xs text-[#75665D]">
                  Device ID: <span className="font-mono text-[#C66D4E]">{inspectingDevice.deviceId}</span> &middot; Category: {inspectingDevice.category}
                </p>
              </div>

              {err && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{err}</span>
                </div>
              )}

              <form onSubmit={handleSaveInspection} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1.5">
                      Physical Condition Assessment
                    </label>
                    <select
                      value={inspectionForm.physicalCondition}
                      onChange={(e) =>
                        setInspectionForm({ ...inspectionForm, physicalCondition: e.target.value })
                      }
                      className="w-full rounded-xl border border-[#DDD1C3] bg-white p-2.5 font-dm-sans text-xs outline-none focus:border-[#C66D4E]"
                    >
                      <option value="Like new">Like New (Flawless)</option>
                      <option value="Good">Good (Minor scratches)</option>
                      <option value="Fair">Fair (Noticeable chassis wear)</option>
                      <option value="Damaged">Damaged (Screen/casing cracked)</option>
                      <option value="Not working">Not Working / Scrap</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1.5">
                      Power-On Diagnostics
                    </label>
                    <div className="flex gap-4 pt-1.5">
                      <label className="flex items-center gap-2 text-xs font-dm-sans text-[#47372E] cursor-pointer">
                        <input
                          type="radio"
                          name="inspectPower"
                          checked={inspectionForm.powersOn === true}
                          onChange={() => setInspectionForm({ ...inspectionForm, powersOn: true })}
                        />
                        <span>Powers On / Boot verified</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-dm-sans text-[#47372E] cursor-pointer">
                        <input
                          type="radio"
                          name="inspectPower"
                          checked={inspectionForm.powersOn === false}
                          onChange={() => setInspectionForm({ ...inspectionForm, powersOn: false })}
                        />
                        <span>Failed to power on</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1.5">
                      Verified Storage Architecture
                    </label>
                    <input
                      type="text"
                      value={inspectionForm.storageType}
                      onChange={(e) =>
                        setInspectionForm({ ...inspectionForm, storageType: e.target.value })
                      }
                      placeholder="e.g. NVMe PCIe Gen3 SSD"
                      className="w-full rounded-xl border border-[#DDD1C3] bg-white p-2.5 font-dm-sans text-xs outline-none focus:border-[#C66D4E]"
                    />
                  </div>

                  <div>
                    <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1.5">
                      Capacity
                    </label>
                    <input
                      type="text"
                      value={inspectionForm.storageCapacity}
                      onChange={(e) =>
                        setInspectionForm({ ...inspectionForm, storageCapacity: e.target.value })
                      }
                      placeholder="e.g. 512 GB"
                      className="w-full rounded-xl border border-[#DDD1C3] bg-white p-2.5 font-dm-sans text-xs outline-none focus:border-[#C66D4E]"
                    />
                  </div>
                </div>

                {/* Classification Selector */}
                <div>
                  <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-2">
                    ReTech Internal Classification Grade *
                  </label>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {[
                      {
                        grade: "A",
                        title: "Grade A – Reusable",
                        desc: "Eligible for refurbished marketplace & student donation",
                      },
                      {
                        grade: "B",
                        title: "Grade B – Refurbish",
                        desc: "Requires professional repair or component servicing",
                      },
                      {
                        grade: "C",
                        title: "Grade C – Material Recovery",
                        desc: "Obsolete or non-repairable; transfer to certified recyclers",
                      },
                      {
                        grade: "D",
                        title: "Grade D – Special Handling",
                        desc: "Hazardous or swollen battery requiring isolated disposal",
                      },
                    ].map((g) => {
                      const isSelected = inspectionForm.classification === g.grade
                      return (
                        <div
                          key={g.grade}
                          onClick={() =>
                            setInspectionForm({
                              ...inspectionForm,
                              classification: g.grade as DeviceClassification,
                            })
                          }
                          className={`cursor-pointer rounded-xl border p-3 transition-colors ${
                            isSelected
                              ? "border-[#C66D4E] bg-[#C66D4E]/10"
                              : "border-[#DDD1C3] bg-white hover:border-[#B78B68]"
                          }`}
                        >
                          <div className="font-manrope text-xs font-700 text-[#47372E]">
                            {g.title}
                          </div>
                          <p className="mt-0.5 text-[10px] text-[#75665D] leading-tight">
                            {g.desc}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1.5">
                    Technical Inspection Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Document component health, battery cycle counts, port test results, etc."
                    value={inspectionForm.inspectionNotes}
                    onChange={(e) =>
                      setInspectionForm({ ...inspectionForm, inspectionNotes: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#DDD1C3] bg-white p-2.5 font-dm-sans text-xs outline-none focus:border-[#C66D4E]"
                  />
                </div>

                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[#DDD1C3]">
                  <button
                    type="button"
                    onClick={() => setInspectingDevice(null)}
                    className="rounded-xl border border-[#DDD1C3] px-5 py-2.5 font-dm-sans text-xs font-600 text-[#47372E]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inspectionLoading}
                    className="rounded-xl bg-[#C66D4E] px-6 py-2.5 font-dm-sans text-xs font-600 text-white hover:bg-[#B5482A] disabled:opacity-50"
                  >
                    {inspectionLoading ? "Saving…" : "Save Inspection & Notify Customer"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

