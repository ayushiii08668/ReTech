import React, { useState, useEffect } from "react"
import {
  Recycle,
  Building2,
  Scale,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Search,
  Filter,
  FileText,
  Truck,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  History,
  X,
  Loader2,
  FileCheck,
  Sparkles,
} from "lucide-react"
import {
  phase4Service,
  RecyclingRecord,
  Partner,
} from "@/services/phase4Service"
import api from "@/services/api"
import DeviceLifecycleTimeline from "@/components/dashboard/DeviceLifecycleTimeline"

export default function AdminRecyclingPage() {
  const [activeTab, setActiveTab] = useState<"transfers" | "partners">("transfers")
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState<RecyclingRecord[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [availableDevices, setAvailableDevices] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")

  // Modals
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<RecyclingRecord | null>(null)
  const [lifecycleDeviceId, setLifecycleDeviceId] = useState<string | null>(null)

  // Form states
  const [transferForm, setTransferForm] = useState({
    deviceId: "",
    recyclerId: "",
    approximateWeightKg: "",
    handoverReference: "",
    handoverReceipt: "",
    internalNotes: "",
  })

  const [updateForm, setUpdateForm] = useState({
    processingStatus: "RECEIVED_BY_RECYCLER",
    processingEvidence: "",
    recyclerAcknowledgement: "",
    finalOutcome: "",
    internalNotes: "",
  })

  const [partnerForm, setPartnerForm] = useState({
    partnerName: "",
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pinCode: "",
    authorisationReference: "",
    services: "Electronic waste dismantling, PCB precious metal recovery, Shredding",
    supportedCategories: "Laptop, Desktop, Smartphone, Tablet, Server",
    internalNotes: "",
  })

  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  const fetchData = async () => {
    try {
      setLoading(true)
      const [recordsRes, partnersRes, devicesRes] = await Promise.all([
        phase4Service.getRecyclingRecords({ limit: 100 }),
        phase4Service.getPartners({ partnerType: "RECYCLING", limit: 50 }),
        api.get("/devices?limit=100"),
      ])

      setRecords(recordsRes.records || recordsRes || [])
      setPartners(partnersRes.partners || partnersRes || [])
      const devList = devicesRes.data?.data?.devices || devicesRes.data?.data || []
      // Filter devices eligible or classified for recycling or not yet recycled
      setAvailableDevices(
        devList.filter((d: any) =>
          ["INSPECTED", "DIAGNOSTIC_COMPLETED", "SANITIZED", "REPAIR_REJECTED", "TRANSFERRED_TO_RECYCLER"].includes(
            d.status
          ) || ["GRADE_C", "GRADE_D", "RECYCLE_ONLY"].includes(d.classificationGrade || d.grade)
        )
      )
    } catch (err: any) {
      console.error("Failed to load recycling data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // KPI Calculations
  const totalTransferred = records.length
  const activePartnersCount = partners.filter((p) => p.status === "ACTIVE").length
  const recycledCount = records.filter((r) => r.processingStatus === "RECYCLED").length
  const totalWeightKg = records.reduce((acc, r) => acc + (r.approximateWeightKg || 0), 0)

  // Filtered records
  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.recordId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.retechDeviceId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.recyclerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.handoverReference?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "ALL" || rec.processingStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    setSuccessMsg("")

    if (!transferForm.deviceId || !transferForm.recyclerId || !transferForm.handoverReference) {
      setErrorMsg("Device, Recycler, and Handover Reference are mandatory.")
      return
    }

    try {
      setSubmitting(true)
      await phase4Service.createRecyclingRecord({
        deviceId: transferForm.deviceId,
        recyclerId: transferForm.recyclerId,
        handoverReference: transferForm.handoverReference,
        approximateWeightKg: transferForm.approximateWeightKg ? parseFloat(transferForm.approximateWeightKg) : undefined,
        handoverReceipt: transferForm.handoverReceipt,
        internalNotes: transferForm.internalNotes,
      })

      setSuccessMsg("Recycling transfer manifest created and device status updated.")
      setIsTransferModalOpen(false)
      setTransferForm({
        deviceId: "",
        recyclerId: "",
        approximateWeightKg: "",
        handoverReference: "",
        handoverReceipt: "",
        internalNotes: "",
      })
      await fetchData()
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to create transfer record.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRecord) return
    setErrorMsg("")
    setSuccessMsg("")

    if (updateForm.processingStatus === "RECYCLED" && !updateForm.processingEvidence.trim()) {
      setErrorMsg("Processing evidence (e.g. Destruction Certificate # or Weight Manifest) is strictly required to mark as RECYCLED.")
      return
    }

    try {
      setSubmitting(true)
      await phase4Service.updateRecyclingRecord(selectedRecord._id, {
        processingStatus: updateForm.processingStatus,
        processingEvidence: updateForm.processingEvidence,
        recyclerAcknowledgement: updateForm.recyclerAcknowledgement,
        finalOutcome: updateForm.finalOutcome,
        internalNotes: updateForm.internalNotes,
      })

      setSuccessMsg("Recycling record updated and verified.")
      setIsUpdateModalOpen(false)
      setSelectedRecord(null)
      await fetchData()
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to update record.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    setSuccessMsg("")

    if (!partnerForm.partnerName || !partnerForm.companyName || !partnerForm.authorisationReference || !partnerForm.email) {
      setErrorMsg("Partner name, Company name, Authorisation reference, and Email are required.")
      return
    }

    try {
      setSubmitting(true)
      await phase4Service.createPartner({
        partnerType: "RECYCLING",
        partnerName: partnerForm.partnerName,
        companyName: partnerForm.companyName,
        contactPerson: partnerForm.contactPerson,
        email: partnerForm.email,
        phone: partnerForm.phone,
        address: {
          street: partnerForm.street,
          city: partnerForm.city,
          state: partnerForm.state,
          pinCode: partnerForm.pinCode,
        },
        authorisationReference: partnerForm.authorisationReference,
        services: partnerForm.services.split(",").map((s) => s.trim()).filter(Boolean),
        supportedCategories: partnerForm.supportedCategories.split(",").map((s) => s.trim()).filter(Boolean),
        internalNotes: partnerForm.internalNotes,
      })

      setSuccessMsg("Authorised Recycler registered successfully.")
      setIsPartnerModalOpen(false)
      setPartnerForm({
        partnerName: "",
        companyName: "",
        contactPerson: "",
        email: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        pinCode: "",
        authorisationReference: "",
        services: "Electronic waste dismantling, PCB precious metal recovery, Shredding",
        supportedCategories: "Laptop, Desktop, Smartphone, Tablet, Server",
        internalNotes: "",
      })
      await fetchData()
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to register recycler partner.")
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RECYCLED":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> Certified Recycled</span>
      case "PROCESSING":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200"><Clock className="w-3.5 h-3.5" /> Processing</span>
      case "RECEIVED_BY_RECYCLER":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200"><Building2 className="w-3.5 h-3.5" /> Received at Facility</span>
      case "TRANSFERRED":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200"><Truck className="w-3.5 h-3.5" /> In Transit</span>
      case "READY_FOR_TRANSFER":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200"><Clock className="w-3.5 h-3.5" /> Ready for Transfer</span>
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EAE1D5] text-[#47372E] border border-[#DDD1C3]">{status}</span>
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F0E7] p-6 lg:p-10 font-dm-sans text-[#47372E]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B78B68] mb-1">
            <Recycle className="w-4 h-4 text-[#C66D4E]" />
            <span>Circular Economy & Material Stewardship</span>
          </div>
          <h1 className="font-manrope text-3xl font-extrabold text-[#47372E] tracking-tight">
            Authorised Recycler & Transfer Management
          </h1>
          <p className="text-sm text-[#75665D] mt-1">
            Track hazardous e-waste manifests, authorized processing chains, and certified destruction compliance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPartnerModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#DDD1C3] bg-[#FFFDF8] hover:bg-[#EAE1D5]/40 text-xs font-bold text-[#47372E] transition-all shadow-sm"
          >
            <Building2 className="w-4 h-4 text-[#B78B68]" />
            + Register Recycler
          </button>
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C66D4E] hover:bg-[#b05d40] text-xs font-bold text-white transition-all shadow-warm-sm"
          >
            <Plus className="w-4 h-4" />
            + Initiate Transfer Manifest
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {successMsg}
          </div>
          <button onClick={() => setSuccessMsg("")}><X className="w-4 h-4" /></button>
        </div>
      )}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            {errorMsg}
          </div>
          <button onClick={() => setErrorMsg("")}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#FFFDF8] rounded-2xl p-5 border border-[#DDD1C3] shadow-sm">
          <div className="flex items-center justify-between text-[#75665D] text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Transfers</span>
            <Truck className="w-4 h-4 text-[#B78B68]" />
          </div>
          <div className="font-manrope text-2xl font-black text-[#47372E]">{totalTransferred}</div>
          <div className="text-[11px] text-[#75665D] mt-1">Dispatched to certified yards</div>
        </div>

        <div className="bg-[#FFFDF8] rounded-2xl p-5 border border-[#DDD1C3] shadow-sm">
          <div className="flex items-center justify-between text-[#75665D] text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Authorised Partners</span>
            <Building2 className="w-4 h-4 text-[#C66D4E]" />
          </div>
          <div className="font-manrope text-2xl font-black text-[#47372E]">{activePartnersCount}</div>
          <div className="text-[11px] text-[#75665D] mt-1">CPCB / R2v3 / ISO 14001 compliant</div>
        </div>

        <div className="bg-[#FFFDF8] rounded-2xl p-5 border border-[#DDD1C3] shadow-sm">
          <div className="flex items-center justify-between text-[#75665D] text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Certified Recycled</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-manrope text-2xl font-black text-[#47372E]">{recycledCount}</div>
          <div className="text-[11px] text-[#75665D] mt-1">Verified destruction evidence</div>
        </div>

        <div className="bg-[#FFFDF8] rounded-2xl p-5 border border-[#DDD1C3] shadow-sm">
          <div className="flex items-center justify-between text-[#75665D] text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Recovered Weight</span>
            <Scale className="w-4 h-4 text-[#B78B68]" />
          </div>
          <div className="font-manrope text-2xl font-black text-[#47372E]">{totalWeightKg.toFixed(1)} <span className="text-sm font-semibold">kg</span></div>
          <div className="text-[11px] text-[#75665D] mt-1">Raw material diversion</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#DDD1C3] mb-6">
        <button
          onClick={() => setActiveTab("transfers")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === "transfers"
              ? "border-[#C66D4E] text-[#C66D4E]"
              : "border-transparent text-[#75665D] hover:text-[#47372E]"
          }`}
        >
          <Truck className="w-4 h-4" />
          Transfer Manifests & Jobs ({records.length})
        </button>
        <button
          onClick={() => setActiveTab("partners")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === "partners"
              ? "border-[#C66D4E] text-[#C66D4E]"
              : "border-transparent text-[#75665D] hover:text-[#47372E]"
          }`}
        >
          <Building2 className="w-4 h-4" />
          Authorised Recycler Registry ({partners.length})
        </button>
      </div>

      {/* TAB 1: TRANSFERS LEDGER */}
      {activeTab === "transfers" && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FFFDF8] p-3.5 rounded-2xl border border-[#DDD1C3]">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#75665D] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search manifest, device ID, recycler..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F5F0E7]/50 border border-[#DDD1C3] text-xs text-[#47372E] placeholder-[#75665D]/60 focus:outline-none focus:border-[#C66D4E]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-[#75665D]" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#F5F0E7]/50 border border-[#DDD1C3] text-xs font-semibold text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
              >
                <option value="ALL">All Statuses</option>
                <option value="READY_FOR_TRANSFER">Ready For Transfer</option>
                <option value="TRANSFERRED">Transferred (In Transit)</option>
                <option value="RECEIVED_BY_RECYCLER">Received by Recycler</option>
                <option value="PROCESSING">Processing</option>
                <option value="RECYCLED">Certified Recycled</option>
              </select>
            </div>
          </div>

          {/* Transfers Table */}
          <div className="bg-[#FFFDF8] rounded-2xl border border-[#DDD1C3] shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-20 text-center text-[#75665D]">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#C66D4E] mb-3" />
                <p className="text-xs font-semibold">Loading transfer manifests...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="py-20 text-center text-[#75665D]">
                <Recycle className="w-12 h-12 text-[#DDD1C3] mx-auto mb-3" />
                <h3 className="font-manrope text-base font-bold text-[#47372E]">No transfer records found</h3>
                <p className="text-xs text-[#75665D] mt-1 max-w-sm mx-auto">
                  Devices classified for responsible e-waste recycling can be transferred to licensed partners above.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#DDD1C3] bg-[#F5F0E7]/60 text-[11px] font-bold uppercase tracking-wider text-[#75665D]">
                      <th className="py-3.5 px-4">Manifest ID</th>
                      <th className="py-3.5 px-4">Device</th>
                      <th className="py-3.5 px-4">Recycler Partner</th>
                      <th className="py-3.5 px-4">Weight / Ref</th>
                      <th className="py-3.5 px-4">Handover Date</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDD1C3] text-xs">
                    {filteredRecords.map((rec) => {
                      const dev = rec.deviceId as any
                      const devLabel = dev ? `${dev.brand || ""} ${dev.model || ""}` : rec.retechDeviceId
                      return (
                        <tr key={rec._id} className="hover:bg-[#F5F0E7]/30 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#C66D4E]">
                            {rec.recordId}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-[#47372E]">{devLabel}</div>
                            <div className="text-[11px] text-[#75665D] font-mono">{rec.retechDeviceId}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-[#47372E]">{rec.recyclerName || "Unknown Partner"}</div>
                            <div className="text-[11px] text-[#75665D]">
                              {(rec.recyclerId as any)?.authorisationReference || "Authorised"}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-[#47372E]">
                              {rec.approximateWeightKg ? `${rec.approximateWeightKg} kg` : "N/A"}
                            </div>
                            <div className="text-[11px] text-[#75665D] font-mono truncate max-w-[140px]" title={rec.handoverReference}>
                              Ref: {rec.handoverReference}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-[#75665D]">
                            {new Date(rec.transferDate || rec.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4">
                            {getStatusBadge(rec.processingStatus)}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setLifecycleDeviceId(dev?._id || rec.deviceId as any)}
                                title="View Complete Device Lifecycle"
                                className="p-1.5 rounded-lg border border-[#DDD1C3] hover:bg-[#EAE1D5]/40 text-[#75665D] hover:text-[#47372E] transition-all"
                              >
                                <History className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedRecord(rec)
                                  setUpdateForm({
                                    processingStatus: rec.processingStatus,
                                    processingEvidence: rec.processingEvidence || "",
                                    recyclerAcknowledgement: rec.recyclerAcknowledgement || "",
                                    finalOutcome: rec.finalOutcome || "",
                                    internalNotes: rec.internalNotes || "",
                                  })
                                  setIsUpdateModalOpen(true)
                                }}
                                className="px-3 py-1.5 rounded-lg bg-[#EAE1D5] hover:bg-[#DDD1C3] text-[11px] font-bold text-[#47372E] transition-all"
                              >
                                Update Status
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PARTNERS DIRECTORY */}
      {activeTab === "partners" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {partners.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-[#FFFDF8] rounded-2xl border border-[#DDD1C3]">
                <Building2 className="w-10 h-10 text-[#DDD1C3] mx-auto mb-2" />
                <h3 className="font-manrope text-sm font-bold text-[#47372E]">No registered recycler partners</h3>
                <p className="text-xs text-[#75665D] mt-1">Register authorised recycling facilities using the button above.</p>
              </div>
            ) : (
              partners.map((p) => (
                <div key={p._id} className="bg-[#FFFDF8] rounded-2xl p-5 border border-[#DDD1C3] shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-[#B78B68] uppercase tracking-wider">{p.partnerId}</span>
                        <h3 className="font-manrope text-base font-bold text-[#47372E]">{p.companyName}</h3>
                        <p className="text-xs text-[#75665D]">{p.partnerName}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        p.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-700"
                      }`}>
                        {p.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-[#75665D] mb-4">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#C66D4E]" />
                        <span className="font-mono text-[#47372E] font-semibold">{p.authorisationReference}</span>
                      </div>
                      <div className="text-[11px]">
                        <strong>Contact:</strong> {p.contactPerson} ({p.phone || p.email})
                      </div>
                      {p.address && (
                        <div className="text-[11px]">
                          <strong>Facility:</strong> {[p.address.street, p.address.city, p.address.state].filter(Boolean).join(", ")}
                        </div>
                      )}
                    </div>

                    {/* Services Tags */}
                    {p.services && p.services.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {p.services.map((svc, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-[#F5F0E7] text-[10px] font-medium text-[#47372E] border border-[#DDD1C3]/60">
                            {svc}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#DDD1C3] flex items-center justify-between text-[11px] text-[#75665D]">
                    <span>Registered {new Date(p.createdAt).toLocaleDateString()}</span>
                    <span className="text-[#C66D4E] font-semibold">Authorised Recycler</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: INITIATE RECYCLING TRANSFER */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FFFDF8] rounded-2xl border border-[#DDD1C3] shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#DDD1C3] pb-4 mb-5">
              <div>
                <h3 className="font-manrope text-lg font-bold text-[#47372E]">Initiate Recycling Transfer Manifest</h3>
                <p className="text-xs text-[#75665D] mt-0.5">Transfer non-refurbishable device to licensed recycler.</p>
              </div>
              <button onClick={() => setIsTransferModalOpen(false)} className="text-[#75665D] hover:text-[#47372E]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransfer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#47372E] mb-1">Select Target Device *</label>
                <select
                  required
                  value={transferForm.deviceId}
                  onChange={(e) => setTransferForm({ ...transferForm, deviceId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F5F0E7]/60 border border-[#DDD1C3] text-xs text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                >
                  <option value="">-- Choose Device for Recycling --</option>
                  {availableDevices.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.deviceId || d._id} – {d.brand} {d.model} ({d.category}) [Status: {d.status}]
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[#75665D] mt-1">
                  Must be evaluated or sanitized; non-viable for resale.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#47372E] mb-1">Select Licensed Recycler *</label>
                <select
                  required
                  value={transferForm.recyclerId}
                  onChange={(e) => setTransferForm({ ...transferForm, recyclerId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F5F0E7]/60 border border-[#DDD1C3] text-xs text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                >
                  <option value="">-- Select Partner Facility --</option>
                  {partners.filter(p => p.status === "ACTIVE").map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.companyName} (Auth: {p.authorisationReference})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#47372E] mb-1">Handover Reference / Manifest ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MNF-2026-0891"
                    value={transferForm.handoverReference}
                    onChange={(e) => setTransferForm({ ...transferForm, handoverReference: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F5F0E7]/60 border border-[#DDD1C3] text-xs text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#47372E] mb-1">Approx Weight (Kg)</label>
                  <input
                    type="number"
                    step="0.05"
                    placeholder="e.g. 2.45"
                    value={transferForm.approximateWeightKg}
                    onChange={(e) => setTransferForm({ ...transferForm, approximateWeightKg: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F5F0E7]/60 border border-[#DDD1C3] text-xs text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#47372E] mb-1">Handover Receipt / Gate Pass Ref</label>
                <input
                  type="text"
                  placeholder="e.g. GP-REF-44102-LOGISTICS"
                  value={transferForm.handoverReceipt}
                  onChange={(e) => setTransferForm({ ...transferForm, handoverReceipt: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F5F0E7]/60 border border-[#DDD1C3] text-xs text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#47372E] mb-1">Internal Notes & Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Specific handling requirements or battery disposal flags..."
                  value={transferForm.internalNotes}
                  onChange={(e) => setTransferForm({ ...transferForm, internalNotes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F5F0E7]/60 border border-[#DDD1C3] text-xs text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                />
              </div>

              <div className="pt-4 border-t border-[#DDD1C3] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#DDD1C3] text-xs font-semibold text-[#75665D] hover:bg-[#EAE1D5]/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#C66D4E] hover:bg-[#b05d40] text-xs font-bold text-white transition-all shadow-warm-sm flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Dispatch & Record Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: UPDATE RECYCLING RECORD & EVIDENCE */}
      {isUpdateModalOpen && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FFFDF8] rounded-2xl border border-[#DDD1C3] shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#DDD1C3] pb-4 mb-5">
              <div>
                <h3 className="font-manrope text-lg font-bold text-[#47372E]">Update Manifest Processing Status</h3>
                <p className="text-xs text-[#75665D] mt-0.5">Manifest {selectedRecord.recordId} ({selectedRecord.retechDeviceId})</p>
              </div>
              <button onClick={() => setIsUpdateModalOpen(false)} className="text-[#75665D] hover:text-[#47372E]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateRecord} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#47372E] mb-1">Processing Status *</label>
                <select
                  value={updateForm.processingStatus}
                  onChange={(e) => setUpdateForm({ ...updateForm, processingStatus: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F5F0E7]/60 border border-[#DDD1C3] text-xs font-semibold text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                >
                  <option value="TRANSFERRED">TRANSFERRED (In Transit)</option>
                  <option value="RECEIVED_BY_RECYCLER">RECEIVED_BY_RECYCLER (At Yard)</option>
                  <option value="PROCESSING">PROCESSING (Dismantling / Smelting)</option>
                  <option value="RECYCLED">RECYCLED (Certified Destruction Completed)</option>
                  <option value="REJECTED">REJECTED (Returned to Custody)</option>
                </select>
              </div>

              {updateForm.processingStatus === "RECYCLED" && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    Destruction & Recycling Verification Mandatory
                  </div>
                  <label className="block text-[11px] font-bold text-amber-900">
                    Processing Evidence / Certificate Reference *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. COD-CPCB-2026-99201 or Smelting Batch Yield Ref"
                    value={updateForm.processingEvidence}
                    onChange={(e) => setUpdateForm({ ...updateForm, processingEvidence: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 text-xs text-[#47372E] focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[10px] text-amber-800">
                    Required by environmental audit regulations to legally finalize e-waste disposal.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#47372E] mb-1">Recycler Acknowledgement / Signed Gate Ref</label>
                <input
                  type="text"
                  placeholder="e.g. Signed by Yard Manager Rajesh K. on 10/11/2026"
                  value={updateForm.recyclerAcknowledgement}
                  onChange={(e) => setUpdateForm({ ...updateForm, recyclerAcknowledgement: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F5F0E7]/60 border border-[#DDD1C3] text-xs text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#47372E] mb-1">Final Outcome & Recovery Yield</label>
                <input
                  type="text"
                  placeholder="e.g. Shredded, precious metals recovered, plastic granulated"
                  value={updateForm.finalOutcome}
                  onChange={(e) => setUpdateForm({ ...updateForm, finalOutcome: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F5F0E7]/60 border border-[#DDD1C3] text-xs text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#47372E] mb-1">Audit Notes</label>
                <textarea
                  rows={2}
                  placeholder="Internal audit notes..."
                  value={updateForm.internalNotes}
                  onChange={(e) => setUpdateForm({ ...updateForm, internalNotes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F5F0E7]/60 border border-[#DDD1C3] text-xs text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                />
              </div>

              <div className="pt-4 border-t border-[#DDD1C3] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#DDD1C3] text-xs font-semibold text-[#75665D] hover:bg-[#EAE1D5]/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#C66D4E] hover:bg-[#b05d40] text-xs font-bold text-white transition-all shadow-warm-sm flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Processing Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REGISTER AUTHORISED RECYCLER */}
      {isPartnerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FFFDF8] rounded-2xl border border-[#DDD1C3] shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#DDD1C3] pb-4 mb-5">
              <div>
                <h3 className="font-manrope text-lg font-bold text-[#47372E]">Register Authorised E-Waste Recycler</h3>
                <p className="text-xs text-[#75665D] mt-0.5">Add verified recycling entity to external partner registry.</p>
              </div>
              <button onClick={() => setIsPartnerModalOpen(false)} className="text-[#75665D] hover:text-[#47372E]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePartner} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#47372E] mb-1">Company / Facility Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EcoMatrix Recycling Ltd"
                    value={partnerForm.companyName}
                    onChange={(e) => setPartnerForm({ ...partnerForm, companyName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F5F0E7]/60 border border-[#DDD1C3] text-xs text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#47372E] mb-1">Display Partner Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EcoMatrix Recycling"
                    value={partnerForm.partnerName}
                    onChange={(e) => setPartnerForm({ ...partnerForm, partnerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F5F0E7]/60 border border-[#DDD1C3] text-xs text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#47372E] mb-1">CPCB / State PCB Authorisation Ref *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CPCB/EW/2024/7740 or R2v3-CERT-99801"
                  value={partnerForm.authorisationReference}
                  onChange={(e) => setPartnerForm({ ...partnerForm, authorisationReference: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F5F0E7]/60 border border-[#DDD1C3] text-xs text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#47372E] mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Anil Verma"
                    value={partnerForm.contactPerson}
                    onChange={(e) => setPartnerForm({ ...partnerForm, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F5F0E7]/60 border border-[#DDD1C3] text-xs text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#47372E] mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. compliance@ecomatrix.in"
                    value={partnerForm.email}
                    onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F5F0E7]/60 border border-[#DDD1C3] text-xs text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#47372E] mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98765 43210"
                    value={partnerForm.phone}
                    onChange={(e) => setPartnerForm({ ...partnerForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F5F0E7]/60 border border-[#DDD1C3] text-xs text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-[#47372E] mb-1">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Pune"
                    value={partnerForm.city}
                    onChange={(e) => setPartnerForm({ ...partnerForm, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F5F0E7]/60 border border-[#DDD1C3] text-xs text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#47372E] mb-1">State</label>
                  <input
                    type="text"
                    placeholder="e.g. Maharashtra"
                    value={partnerForm.state}
                    onChange={(e) => setPartnerForm({ ...partnerForm, state: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F5F0E7]/60 border border-[#DDD1C3] text-xs text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#47372E] mb-1">PIN Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 411028"
                    value={partnerForm.pinCode}
                    onChange={(e) => setPartnerForm({ ...partnerForm, pinCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F5F0E7]/60 border border-[#DDD1C3] text-xs text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#47372E] mb-1">Services Offered (comma separated)</label>
                <input
                  type="text"
                  value={partnerForm.services}
                  onChange={(e) => setPartnerForm({ ...partnerForm, services: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F5F0E7]/60 border border-[#DDD1C3] text-xs text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#47372E] mb-1">Internal Notes</label>
                <textarea
                  rows={2}
                  placeholder="Facility capability, annual audit status..."
                  value={partnerForm.internalNotes}
                  onChange={(e) => setPartnerForm({ ...partnerForm, internalNotes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F5F0E7]/60 border border-[#DDD1C3] text-xs text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                />
              </div>

              <div className="pt-4 border-t border-[#DDD1C3] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPartnerModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#DDD1C3] text-xs font-semibold text-[#75665D] hover:bg-[#EAE1D5]/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#C66D4E] hover:bg-[#b05d40] text-xs font-bold text-white transition-all shadow-warm-sm flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Register Recycler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: DEVICE LIFECYCLE TIMELINE DRAWER */}
      {lifecycleDeviceId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FFFDF8] rounded-2xl border border-[#DDD1C3] shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#DDD1C3] pb-4 mb-4">
              <div>
                <h3 className="font-manrope text-lg font-bold text-[#47372E]">Device Chain-of-Custody Timeline</h3>
                <p className="text-xs text-[#75665D]">Audit trail from pickup to certified destruction.</p>
              </div>
              <button onClick={() => setLifecycleDeviceId(null)} className="text-[#75665D] hover:text-[#47372E]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <DeviceLifecycleTimeline deviceId={lifecycleDeviceId} />
          </div>
        </div>
      )}
    </div>
  )
}

