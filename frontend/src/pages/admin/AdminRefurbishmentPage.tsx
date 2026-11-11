import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Wrench,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Building2,
  Phone,
  Mail,
  RefreshCw,
  AlertTriangle,
  X,
  FileText,
} from "lucide-react"
import {
  phase4Service,
  RefurbishmentJob,
  Partner,
} from "@/services/phase4Service"
import api from "@/services/api"
import { IDevice } from "@/types"

export default function AdminRefurbishmentPage() {
  const [activeTab, setActiveTab] = useState<"jobs" | "assign" | "partners">("jobs")
  const [jobs, setJobs] = useState<RefurbishmentJob[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [candidateDevices, setCandidateDevices] = useState<IDevice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")

  // Assign Form
  const [selectedDeviceId, setSelectedDeviceId] = useState("")
  const [selectedPartnerId, setSelectedPartnerId] = useState("")
  const [expectedDate, setExpectedDate] = useState("")
  const [instructions, setInstructions] = useState("")
  const [assignLoading, setAssignLoading] = useState(false)
  const [assignMsg, setAssignMsg] = useState<string | null>(null)
  const [assignErr, setAssignErr] = useState<string | null>(null)

  // Partner Registration Modal
  const [partnerModalOpen, setPartnerModalOpen] = useState(false)
  const [partnerName, setPartnerName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [contactPerson, setContactPerson] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [authRef, setAuthRef] = useState("")
  const [partnerLoading, setPartnerLoading] = useState(false)

  // Update Job Modal
  const [editingJob, setEditingJob] = useState<RefurbishmentJob | null>(null)
  const [jobStatus, setJobStatus] = useState<string>("IN_PROGRESS")
  const [findings, setFindings] = useState("")
  const [replacedParts, setReplacedParts] = useState("")
  const [cost, setCost] = useState("")
  const [finalOutcome, setFinalOutcome] = useState("")
  const [updateLoading, setUpdateLoading] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [jobsData, partnersData, devRes] = await Promise.all([
        phase4Service.getRefurbishmentJobs({ search, status: statusFilter }),
        phase4Service.getPartners({ partnerType: "REFURBISHMENT" }),
        api.get("/admin/devices", { params: { limit: 50 } }),
      ])
      setJobs(jobsData.jobs)
      setPartners(partnersData.partners)

      if (devRes.data.success) {
        // Candidate devices: not sold, not recycled, inspected
        const candidates = devRes.data.data.devices.filter(
          (d: any) =>
            d.status !== "SOLD" &&
            d.status !== "RECYCLED" &&
            d.status !== "TRANSFERRED_TO_RECYCLER"
        )
        setCandidateDevices(candidates)
      }
    } catch (err) {
      console.error("Failed to load refurbishment data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [search, statusFilter])

  const handleAssignDevice = async (e: React.FormEvent) => {
    e.preventDefault()
    setAssignMsg(null)
    setAssignErr(null)

    if (!selectedDeviceId || !selectedPartnerId) {
      setAssignErr("Device and partner selection are mandatory.")
      return
    }

    setAssignLoading(true)
    try {
      const res = await phase4Service.createRefurbishmentJob({
        deviceId: selectedDeviceId,
        partnerId: selectedPartnerId,
        expectedCompletionDate: expectedDate || undefined,
        instructions,
      })
      setAssignMsg(`Job ${res.jobId} created and assigned to partner!`)
      loadData()
      setTimeout(() => {
        setActiveTab("jobs")
        setSelectedDeviceId("")
        setSelectedPartnerId("")
        setInstructions("")
      }, 1500)
    } catch (err: any) {
      setAssignErr(err?.response?.data?.message || "Failed to assign device.")
    } finally {
      setAssignLoading(false)
    }
  }

  const handleRegisterPartner = async (e: React.FormEvent) => {
    e.preventDefault()
    setPartnerLoading(true)
    try {
      await phase4Service.createPartner({
        partnerType: "REFURBISHMENT",
        partnerName,
        companyName,
        contactPerson,
        email,
        phone,
        authorisationReference: authRef,
        status: "ACTIVE",
      })
      setPartnerModalOpen(false)
      setPartnerName("")
      setCompanyName("")
      setContactPerson("")
      setEmail("")
      setPhone("")
      setAuthRef("")
      loadData()
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to register partner.")
    } finally {
      setPartnerLoading(false)
    }
  }

  const handleUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingJob) return

    setUpdateLoading(true)
    try {
      const partsArray = replacedParts
        ? replacedParts.split(",").map((p) => p.trim()).filter(Boolean)
        : []

      await phase4Service.updateRefurbishmentJob(editingJob.jobId, {
        status: jobStatus,
        inspectionFindings: findings,
        replacedComponents: partsArray,
        refurbishmentCost: cost ? parseFloat(cost) : undefined,
        finalOutcome,
      })
      setEditingJob(null)
      loadData()
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to update refurbishment job.")
    } finally {
      setUpdateLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-700 text-[#C66D4E]">
            <Wrench className="h-3.5 w-3.5" />
            EXTERNAL PARTNER REFURBISHMENT OPERATIONS
          </div>
          <h1 className="mt-1 font-manrope text-2xl font-800 tracking-tight text-[#47372E] sm:text-3xl">
            Refurbishment Partners &amp; Jobs
          </h1>
          <p className="mt-1 font-dm-sans text-xs text-[#75665D]">
            Coordinate external professional hardware repair, component renewal, and quality assurance auditing before resale.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setPartnerModalOpen(true)}
            className="flex items-center gap-2 rounded-2xl border border-[#DDD1C3] bg-[#FFFDF8] px-4 py-2 font-dm-sans text-xs font-700 text-[#47372E] shadow-warm-sm hover:bg-[#F5F0E7]"
          >
            <Building2 className="h-4 w-4 text-[#C66D4E]" />
            Register Partner
          </button>
          <button
            onClick={() => setActiveTab("assign")}
            className="flex items-center gap-2 rounded-2xl bg-[#C66D4E] px-4 py-2 font-dm-sans text-xs font-700 text-white shadow-warm-sm hover:bg-[#B55D3E]"
          >
            <Plus className="h-4 w-4" />
            Assign Device
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-6 shadow-warm-sm">
          <span className="font-dm-sans text-xs font-700 uppercase tracking-wider text-[#75665D]">
            Registered Refurbishers
          </span>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-manrope text-3xl font-800 text-[#47372E]">{partners.length}</span>
            <span className="font-dm-sans text-xs text-[#75665D]">certified partners</span>
          </div>
        </div>

        <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-6 shadow-warm-sm">
          <span className="font-dm-sans text-xs font-700 uppercase tracking-wider text-amber-900">
            Devices In Refurbishment
          </span>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-manrope text-3xl font-800 text-amber-950">
              {jobs.filter((j) => ["ASSIGNED", "IN_PROGRESS", "QUALITY_CHECK"].includes(j.status)).length}
            </span>
            <span className="font-dm-sans text-xs text-amber-800">in workshop</span>
          </div>
        </div>

        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-6 shadow-warm-sm">
          <span className="font-dm-sans text-xs font-700 uppercase tracking-wider text-emerald-900">
            QA Passed &amp; Completed
          </span>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-manrope text-3xl font-800 text-emerald-950">
              {jobs.filter((j) => j.status === "COMPLETED").length}
            </span>
            <span className="font-dm-sans text-xs text-emerald-800">ready for resale</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#DDD1C3] pb-3">
        <button
          onClick={() => setActiveTab("jobs")}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2 font-dm-sans text-xs font-700 transition-all ${
            activeTab === "jobs"
              ? "bg-[#47372E] text-white shadow-warm-sm"
              : "bg-[#FFFDF8] text-[#75665D] hover:bg-[#F5F0E7]"
          }`}
        >
          <Wrench className="h-3.5 w-3.5" />
          Refurbishment Jobs ({jobs.length})
        </button>

        <button
          onClick={() => setActiveTab("assign")}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2 font-dm-sans text-xs font-700 transition-all ${
            activeTab === "assign"
              ? "bg-[#C66D4E] text-white shadow-warm-sm"
              : "bg-[#FFFDF8] text-[#75665D] hover:bg-[#F5F0E7]"
          }`}
        >
          <Plus className="h-3.5 w-3.5" />
          Assign Device for Repair
        </button>

        <button
          onClick={() => setActiveTab("partners")}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2 font-dm-sans text-xs font-700 transition-all ${
            activeTab === "partners"
              ? "bg-[#47372E] text-white shadow-warm-sm"
              : "bg-[#FFFDF8] text-[#75665D] hover:bg-[#F5F0E7]"
          }`}
        >
          <Building2 className="h-3.5 w-3.5" />
          Partners Directory ({partners.length})
        </button>
      </div>

      {/* TAB 1: JOBS TABLE */}
      {activeTab === "jobs" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-4 shadow-warm-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#75665D]" />
              <input
                type="text"
                placeholder="Search by job ID, device ID, or partner..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] py-2 pl-9 pr-4 font-dm-sans text-xs text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] px-3 py-2 font-dm-sans text-xs font-600 text-[#47372E] focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="QUALITY_CHECK">Quality Check</option>
              <option value="COMPLETED">Completed (QA Passed)</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <div className="overflow-hidden rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] shadow-warm-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-dm-sans text-xs">
                <thead className="border-b border-[#DDD1C3] bg-[#F5F0E7] text-[#47372E] font-700">
                  <tr>
                    <th className="py-3.5 px-5">Job ID &amp; Device</th>
                    <th className="py-3.5 px-4">Partner Organization</th>
                    <th className="py-3.5 px-4">Assigned / Expected</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Parts &amp; Findings</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDD1C3]/60">
                  {jobs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#75665D]">
                        No refurbishment jobs found.
                      </td>
                    </tr>
                  ) : (
                    jobs.map((job) => (
                      <tr key={job._id} className="hover:bg-[#FAF7F2] transition-colors">
                        <td className="py-4 px-5">
                          <span className="font-mono font-700 text-[#C66D4E]">{job.jobId}</span>
                          <div className="text-[11px] text-[#75665D]">
                            {job.retechDeviceId} &bull; {job.deviceId?.brand} {job.deviceId?.model}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-semibold text-[#47372E]">{job.partnerName}</div>
                          <div className="text-[10px] text-[#75665D]">
                            Ref: {job.partnerId?.partnerId || "Partner"}
                          </div>
                        </td>

                        <td className="py-4 px-4 text-[#75665D]">
                          <div>{new Date(job.assignmentDate).toLocaleDateString()}</div>
                          {job.expectedCompletionDate && (
                            <div className="text-[10px] text-amber-800">
                              Due: {new Date(job.expectedCompletionDate).toLocaleDateString()}
                            </div>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          {job.status === "COMPLETED" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-700 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="h-3 w-3" /> QA PASSED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 font-mono text-[10px] font-700 text-amber-800 border border-amber-300">
                              <Clock className="h-3 w-3" /> {job.status}
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4 max-w-xs">
                          <div className="text-[#47372E] truncate">
                            {job.inspectionFindings || "Pending initial workshop diagnostic."}
                          </div>
                          {job.replacedComponents && job.replacedComponents.length > 0 && (
                            <div className="font-mono text-[10px] text-[#C66D4E]">
                              Replaced: {job.replacedComponents.join(", ")}
                            </div>
                          )}
                        </td>

                        <td className="py-4 px-5 text-right">
                          <button
                            onClick={() => {
                              setEditingJob(job)
                              setJobStatus(job.status)
                              setFindings(job.inspectionFindings || "")
                              setReplacedParts(job.replacedComponents ? job.replacedComponents.join(", ") : "")
                              setCost(job.refurbishmentCost ? job.refurbishmentCost.toString() : "")
                              setFinalOutcome(job.finalOutcome || "")
                            }}
                            className="rounded-xl border border-[#DDD1C3] bg-[#FFFDF8] px-3 py-1.5 font-dm-sans text-xs font-700 text-[#47372E] hover:bg-[#F5F0E7]"
                          >
                            Update Progress
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ASSIGN WIZARD */}
      {activeTab === "assign" && (
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-8 shadow-warm-sm">
            <h2 className="font-manrope text-xl font-800 text-[#47372E] mb-1">
              Assign Device for Workshop Refurbishment
            </h2>
            <p className="font-dm-sans text-xs text-[#75665D] mb-6">
              Transfer custody of a hardware device needing repair to a certified partner. Physical repairs are executed by partner workshops and tracked via ReTech.
            </p>

            {assignMsg && (
              <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 font-dm-sans text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                {assignMsg}
              </div>
            )}

            {assignErr && (
              <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 font-dm-sans text-xs text-rose-800 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                {assignErr}
              </div>
            )}

            <form onSubmit={handleAssignDevice} className="space-y-4 font-dm-sans text-xs">
              <div>
                <label className="block font-700 text-[#47372E] mb-1">Target Hardware Device *</label>
                <select
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  className="w-full rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] p-3 text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                  required
                >
                  <option value="">-- Select Candidate Device --</option>
                  {candidateDevices.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.deviceId} - {d.brand} {d.model} ({d.category} - {d.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-700 text-[#47372E] mb-1">
                  Assigned Refurbishment Partner *
                </label>
                <select
                  value={selectedPartnerId}
                  onChange={(e) => setSelectedPartnerId(e.target.value)}
                  className="w-full rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] p-3 text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                  required
                >
                  <option value="">-- Select Registered Partner --</option>
                  {partners.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.partnerName} ({p.companyName} - {p.authorisationReference})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-700 text-[#47372E] mb-1">Expected Completion Date</label>
                <input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="w-full rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] p-2.5 text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                />
              </div>

              <div>
                <label className="block font-700 text-[#47372E] mb-1">Workshop Repair Instructions</label>
                <textarea
                  rows={3}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Inspect display backlight flickering, replace thermal paste, test battery cycle retention."
                  className="w-full rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] p-3 text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                />
              </div>

              <button
                type="submit"
                disabled={assignLoading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#C66D4E] py-3.5 font-dm-sans text-xs font-700 text-white shadow-warm-md hover:bg-[#B55D3E] disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                {assignLoading ? "Assigning Device..." : "Confirm Workshop Assignment"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: PARTNERS DIRECTORY */}
      {activeTab === "partners" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {partners.length === 0 ? (
            <div className="col-span-2 rounded-3xl border border-dashed border-[#DDD1C3] bg-[#FFFDF8] p-12 text-center text-xs text-[#75665D]">
              No refurbishment partners registered yet. Click "Register Partner" above to add your first workshop.
            </div>
          ) : (
            partners.map((p) => (
              <div
                key={p._id}
                className="rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-6 shadow-warm-sm space-y-3"
              >
                <div className="flex items-start justify-between border-b border-[#DDD1C3]/60 pb-3">
                  <div>
                    <h3 className="font-manrope text-base font-800 text-[#47372E]">
                      {p.partnerName}
                    </h3>
                    <div className="font-dm-sans text-xs text-[#75665D]">{p.companyName}</div>
                  </div>
                  <span className="rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 font-mono text-[10px] font-bold">
                    {p.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 font-dm-sans text-xs">
                  <div>
                    <span className="text-[#75665D] block text-[10px]">Contact Person:</span>
                    <span className="font-semibold text-[#47372E]">{p.contactPerson}</span>
                  </div>
                  <div>
                    <span className="text-[#75665D] block text-[10px]">Authorisation Ref:</span>
                    <span className="font-mono text-[#C66D4E] font-bold">{p.authorisationReference}</span>
                  </div>
                  <div>
                    <span className="text-[#75665D] block text-[10px]">Email:</span>
                    <span className="text-[#47372E]">{p.email}</span>
                  </div>
                  <div>
                    <span className="text-[#75665D] block text-[10px]">Phone:</span>
                    <span className="text-[#47372E]">{p.phone}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* UPDATE JOB PROGRESS MODAL */}
      <AnimatePresence>
        {editingJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-6 shadow-warm-xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#DDD1C3] pb-3">
                <h3 className="font-manrope text-base font-800 text-[#47372E]">
                  Update Refurbishment Job &bull; {editingJob.jobId}
                </h3>
                <button
                  onClick={() => setEditingJob(null)}
                  className="rounded-xl p-1 text-[#75665D] hover:bg-[#DDD1C3]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateJob} className="space-y-3 font-dm-sans text-xs">
                <div>
                  <label className="block font-700 text-[#47372E] mb-1">Status Transition</label>
                  <select
                    value={jobStatus}
                    onChange={(e) => setJobStatus(e.target.value)}
                    className="w-full rounded-xl border border-[#DDD1C3] bg-[#FAF7F2] p-2.5 text-[#47372E]"
                  >
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="QUALITY_CHECK">Quality Check</option>
                    <option value="COMPLETED">Completed (QA Passed &rarr; Ready for Resale)</option>
                    <option value="FAILED">Failed Inspection</option>
                    <option value="RETURNED">Returned without repair</option>
                  </select>
                </div>

                <div>
                  <label className="block font-700 text-[#47372E] mb-1">Diagnostic Findings</label>
                  <textarea
                    rows={2}
                    value={findings}
                    onChange={(e) => setFindings(e.target.value)}
                    placeholder="e.g. Battery cell 2 degraded, replaced with OEM 56Wh unit."
                    className="w-full rounded-xl border border-[#DDD1C3] bg-[#FAF7F2] p-2.5 text-[#47372E]"
                  />
                </div>

                <div>
                  <label className="block font-700 text-[#47372E] mb-1">
                    Replaced Components (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={replacedParts}
                    onChange={(e) => setReplacedParts(e.target.value)}
                    placeholder="Battery, Thermal Paste, Keyboard Ribbon"
                    className="w-full rounded-xl border border-[#DDD1C3] bg-[#FAF7F2] p-2.5 text-[#47372E]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-700 text-[#47372E] mb-1">Repair Cost (₹ INR)</label>
                    <input
                      type="number"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      placeholder="1800"
                      className="w-full rounded-xl border border-[#DDD1C3] bg-[#FAF7F2] p-2.5 text-[#47372E]"
                    />
                  </div>
                  <div>
                    <label className="block font-700 text-[#47372E] mb-1">Final Outcome</label>
                    <input
                      type="text"
                      value={finalOutcome}
                      onChange={(e) => setFinalOutcome(e.target.value)}
                      placeholder="Full diagnostic burn-in passed"
                      className="w-full rounded-xl border border-[#DDD1C3] bg-[#FAF7F2] p-2.5 text-[#47372E]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingJob(null)}
                    className="rounded-xl border border-[#DDD1C3] bg-white px-4 py-2 font-bold text-[#47372E]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateLoading}
                    className="rounded-xl bg-[#C66D4E] px-4 py-2 font-bold text-white hover:bg-[#B55D3E]"
                  >
                    {updateLoading ? "Saving..." : "Commit Update"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REGISTER PARTNER MODAL */}
      <AnimatePresence>
        {partnerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-6 shadow-warm-xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#DDD1C3] pb-3">
                <h3 className="font-manrope text-base font-800 text-[#47372E]">
                  Register External Refurbishment Partner
                </h3>
                <button
                  onClick={() => setPartnerModalOpen(false)}
                  className="rounded-xl p-1 text-[#75665D] hover:bg-[#DDD1C3]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleRegisterPartner} className="space-y-3 font-dm-sans text-xs">
                <div>
                  <label className="block font-700 text-[#47372E] mb-1">Partner Workshop Name *</label>
                  <input
                    type="text"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    placeholder="TechRenew Engineering Labs"
                    className="w-full rounded-xl border border-[#DDD1C3] bg-[#FAF7F2] p-2.5 text-[#47372E]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-700 text-[#47372E] mb-1">Registered Legal Entity *</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="TechRenew Solutions Pvt Ltd"
                    className="w-full rounded-xl border border-[#DDD1C3] bg-[#FAF7F2] p-2.5 text-[#47372E]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-700 text-[#47372E] mb-1">Contact Person *</label>
                    <input
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="Vikram Mehta"
                      className="w-full rounded-xl border border-[#DDD1C3] bg-[#FAF7F2] p-2.5 text-[#47372E]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-700 text-[#47372E] mb-1">Authorisation Reference *</label>
                    <input
                      type="text"
                      value={authRef}
                      onChange={(e) => setAuthRef(e.target.value)}
                      placeholder="GSTIN/CIN/REG-2026-981"
                      className="w-full rounded-xl border border-[#DDD1C3] bg-[#FAF7F2] p-2.5 text-[#47372E]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-700 text-[#47372E] mb-1">Email *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="support@techrenew.in"
                      className="w-full rounded-xl border border-[#DDD1C3] bg-[#FAF7F2] p-2.5 text-[#47372E]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-700 text-[#47372E] mb-1">Phone *</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-[#DDD1C3] bg-[#FAF7F2] p-2.5 text-[#47372E]"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setPartnerModalOpen(false)}
                    className="rounded-xl border border-[#DDD1C3] bg-white px-4 py-2 font-bold text-[#47372E]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={partnerLoading}
                    className="rounded-xl bg-[#C66D4E] px-4 py-2 font-bold text-white hover:bg-[#B55D3E]"
                  >
                    {partnerLoading ? "Registering..." : "Register Partner"}
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

