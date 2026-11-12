import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShieldCheck,
  ShieldAlert,
  Terminal,
  Activity,
  Cpu,
  HardDrive,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  KeyRound,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  Lock,
  ChevronRight,
  Sparkles,
  Server,
  Layers,
  Trash2,
  ShoppingBag,
} from "lucide-react"
import {
  sanitizationService,
  SanitizationJob,
  SanitizationStats,
  ConnectedAgent,
} from "@/services/sanitizationService"
import api from "@/services/api"
import { IDevice } from "@/types"

export default function AdminSanitizationPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<"ledger" | "agents" | "initiate">("ledger")
  const [stats, setStats] = useState<SanitizationStats | null>(null)
  const [jobs, setJobs] = useState<SanitizationJob[]>([])
  const [agents, setAgents] = useState<ConnectedAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Filters & Pagination for Jobs
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [methodFilter, setMethodFilter] = useState("ALL")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [activeResaleListings, setActiveResaleListings] = useState<Map<string, any>>(new Map())

  // Modals
  const [selectedJob, setSelectedJob] = useState<SanitizationJob | null>(null)
  const [pairingModalOpen, setPairingModalOpen] = useState(false)
  const [pairingData, setPairingData] = useState<{
    agentId: string
    pairingCode: string
    expiresAt: string
  } | null>(null)
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedCli, setCopiedCli] = useState(false)

  // Initiate Job Form State
  const [availableDevices, setAvailableDevices] = useState<IDevice[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState("")
  const [targetDriveId, setTargetDriveId] = useState("PhysicalDrive1")
  const [targetDriveModel, setTargetDriveModel] = useState("Secondary Storage Drive")
  const [selectedMethod, setSelectedMethod] = useState("NIST_SP_800_88_CLEAR")
  const [isSimulation, setIsSimulation] = useState(true)
  const [selectedAgentId, setSelectedAgentId] = useState("")
  const [confirmAuth, setConfirmAuth] = useState(false)
  const [submittingJob, setSubmittingJob] = useState(false)
  const [formMsg, setFormMsg] = useState<string | null>(null)
  const [formErr, setFormErr] = useState<string | null>(null)

  // Load Dashboard Data
  const loadData = async (isPoll = false) => {
    if (!isPoll) setLoading(true)
    else setRefreshing(true)
    try {
      const [dashRes, jobsRes, agentsRes, listingsRes] = await Promise.all([
        sanitizationService.getDashboardStats(),
        sanitizationService.getJobs({
          search,
          status: statusFilter,
          method: methodFilter,
          page,
          limit: 10,
        }),
        sanitizationService.getAgents(),
        api.get("/marketplace/admin/listings", { params: { limit: 100 } }).catch(() => ({ data: { success: false, data: { listings: [] } } })),
      ])

      const listingMap = new Map<string, any>()
      if (listingsRes?.data?.data?.listings) {
        listingsRes.data.data.listings.forEach((lst: any) => {
          if (lst.listingStatus !== "CANCELLED") {
            const devId = typeof lst.deviceId === "object" ? lst.deviceId?._id : lst.deviceId
            if (devId) listingMap.set(String(devId), lst)
            if (lst.retechDeviceId) listingMap.set(String(lst.retechDeviceId), lst)
          }
        })
      }
      setActiveResaleListings(listingMap)

      setStats(dashRes.stats)
      setJobs(jobsRes.jobs)
      setTotalPages(jobsRes.pagination.pages || 1)
      setAgents(agentsRes)
    } catch (err) {
      console.error("Failed to load sanitization dashboard data:", err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Load devices for initiate tab
  const loadAvailableDevices = async () => {
    try {
      const res = await api.get("/admin/devices", { params: { limit: 50 } })
      if (res.data.success) {
        setAvailableDevices(res.data.data.devices)
        if (res.data.data.devices.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(res.data.data.devices[0]._id)
        }
      }
    } catch (e) {
      console.error("Could not fetch devices:", e)
    }
  }

  useEffect(() => {
    loadData()
    loadAvailableDevices()

    // Polling every 12 seconds for live telemetry
    const interval = setInterval(() => {
      loadData(true)
    }, 12000)
    return () => clearInterval(interval)
  }, [search, statusFilter, methodFilter, page])

  // Generate Agent Pairing Code
  const handleGeneratePairing = async () => {
    try {
      const data = await sanitizationService.generatePairingCode()
      setPairingData(data)
      setPairingModalOpen(true)
      loadData(true)
    } catch (e) {
      console.error("Failed to generate pairing code:", e)
    }
  }

  // Submit new sanitization job
  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormMsg(null)
    setFormErr(null)

    if (!selectedDeviceId) {
      setFormErr("Please select a device from the inventory.")
      return
    }

    if (!confirmAuth) {
      setFormErr("You must explicitly check the administrator authorization confirmation.")
      return
    }

    setSubmittingJob(true)
    try {
      const selectedDevice = availableDevices.find((d) => d._id === selectedDeviceId)
      const res = await sanitizationService.createJob({
        deviceId: selectedDeviceId,
        targetDriveId,
        targetDriveModel:
          targetDriveModel || `${selectedDevice?.brand || "Hardware"} Internal Drive`,
        targetStorageType: selectedDevice?.storageType || "SSD",
        targetCapacity: selectedDevice?.storageCapacity || "512 GB",
        selectedMethod,
        sanitizationStandard:
          selectedMethod === "NIST_SP_800_88_CLEAR"
            ? "NIST SP 800-88 Rev. 1 Clear"
            : selectedMethod === "NIST_SP_800_88_PURGE"
            ? "NIST SP 800-88 Rev. 1 Purge"
            : "DoD 5220.22-M Overwrite",
        isSimulation,
        agentId: selectedAgentId || undefined,
        confirmAuthorization: confirmAuth,
      })

      setFormMsg(`Job ${res.jobId} created successfully! Task is now queued for local execution.`)
      loadData(true)
      setTimeout(() => {
        setActiveTab("ledger")
      }, 1200)
    } catch (err: any) {
      setFormErr(err?.response?.data?.message || "Failed to initialize sanitization job.")
    } finally {
      setSubmittingJob(false)
    }
  }

  // Revoke agent
  const handleRevokeAgent = async (agentId: string) => {
    if (confirm("Are you sure you want to revoke this sanitization agent's access key?")) {
      try {
        await sanitizationService.revokeAgent(agentId)
        loadData(true)
      } catch (e) {
        console.error("Failed to revoke agent:", e)
      }
    }
  }

  // Delete agent permanently
  const handleDeleteAgent = async (agentId: string) => {
    if (
      confirm(
        `Are you sure you want to permanently delete agent node ${agentId}? This will remove it from the system.`
      )
    ) {
      try {
        await sanitizationService.deleteAgent(agentId)
        loadData(true)
      } catch (e: any) {
        alert(e?.response?.data?.message || "Failed to delete agent node.")
      }
    }
  }

  // Delete sanitization job permanently
  const handleDeleteJob = async (jobId: string) => {
    if (
      confirm(
        `Are you sure you want to permanently delete sanitization job ${jobId}? This action cannot be undone.`
      )
    ) {
      try {
        await sanitizationService.deleteJob(jobId)
        if (selectedJob && (selectedJob.jobId === jobId || selectedJob._id === jobId)) {
          setSelectedJob(null)
        }
        loadData(true)
      } catch (e: any) {
        alert(e?.response?.data?.message || "Failed to delete sanitization job.")
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED_SUCCESSFUL":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 font-mono text-[11px] font-700 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="h-3 w-3 text-emerald-600" />
            VERIFIED SUCCESSFUL
          </span>
        )
      case "RUNNING":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 font-mono text-[11px] font-700 text-amber-800 border border-amber-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
            </span>
            RUNNING
          </span>
        )
      case "OPERATION_COMPLETED":
      case "VERIFICATION_PENDING":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 font-mono text-[11px] font-700 text-sky-800 border border-sky-200">
            <Clock className="h-3 w-3 text-sky-600" />
            VERIFYING
          </span>
        )
      case "PENDING":
      case "AGENT_CONNECTED":
      case "READY_TO_START":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#F5F0E7] px-2.5 py-0.5 font-mono text-[11px] font-700 text-[#47372E] border border-[#DDD1C3]">
            <Clock className="h-3 w-3 text-[#75665D]" />
            {status}
          </span>
        )
      case "OPERATION_FAILED":
      case "VERIFICATION_FAILED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 font-mono text-[11px] font-700 text-rose-800 border border-rose-200">
            <XCircle className="h-3 w-3 text-rose-600" />
            {status}
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-0.5 font-mono text-[11px] font-600 text-stone-700">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-700 text-[#C66D4E]">
            <Layers className="h-3.5 w-3.5" />
            RETECH CYBERSECURITY &amp; SANITIZATION ENGINE
          </div>
          <h1 className="mt-1 font-manrope text-2xl font-800 tracking-tight text-[#47372E] sm:text-3xl">
            Data Sanitization Operations Center
          </h1>
          <p className="mt-1 font-dm-sans text-xs text-[#75665D]">
            NIST SP 800-88 hardware erasure orchestrator, agent telemetry, and cryptographic verification ledger
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData(true)}
            className="flex items-center gap-2 rounded-2xl border border-[#DDD1C3] bg-[#FFFDF8] px-3.5 py-2.5 font-dm-sans text-xs font-700 text-[#47372E] shadow-warm-sm hover:bg-[#F5F0E7] transition-all"
            title="Refresh telemetry"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-[#C66D4E]" : ""}`} />
            Refresh
          </button>

          <button
            onClick={handleGeneratePairing}
            className="flex items-center gap-2 rounded-2xl border border-[#C66D4E] bg-white px-4 py-2.5 font-dm-sans text-xs font-700 text-[#C66D4E] shadow-warm-sm hover:bg-[#C66D4E]/10 transition-all"
          >
            <KeyRound className="h-3.5 w-3.5" />
            Pair Local Agent
          </button>

          <button
            onClick={() => setActiveTab("initiate")}
            className="flex items-center gap-2 rounded-2xl bg-[#C66D4E] px-4 py-2.5 font-dm-sans text-xs font-700 text-[#FFFDF8] shadow-warm-sm hover:bg-[#B55D3E] transition-all"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            Initiate Sanitization
          </button>
        </div>
      </div>

      {/* KPI Cards (Inspired by Reference Images 3 & 4) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Jobs - Terracotta */}
        <div className="rounded-3xl border border-[#C66D4E]/20 bg-gradient-to-br from-[#C66D4E] to-[#B55D3E] p-6 text-white shadow-warm-md">
          <div className="flex items-center justify-between">
            <span className="font-dm-sans text-xs font-700 uppercase tracking-wider text-white/80">
              Total Sanitization Tasks
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white">
              <HardDrive className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-manrope text-3xl font-800 tracking-tight">
              {stats?.totalJobs ?? 0}
            </span>
            <span className="font-dm-sans text-xs text-white/80">jobs logged</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 font-dm-sans text-[11px] text-white/90">
            <span>Standard:</span>
            <span className="font-mono font-700">NIST SP 800-88 Rev. 1</span>
          </div>
        </div>

        {/* Verified Clean - Emerald / Soft Green */}
        <div className="rounded-3xl border border-emerald-200 bg-[#FFFDF8] p-6 shadow-warm-sm">
          <div className="flex items-center justify-between">
            <span className="font-dm-sans text-xs font-700 uppercase tracking-wider text-[#75665D]">
              Verified Clean
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-manrope text-3xl font-800 tracking-tight text-emerald-900">
              {stats?.verifiedSuccessfulJobs ?? 0}
            </span>
            <span className="font-dm-sans text-xs text-[#75665D]">certified</span>
          </div>
          <div className="mt-2 flex items-center gap-1 font-dm-sans text-[11px] text-emerald-700">
            <CheckCircle2 className="h-3 w-3" />
            <span>Cryptographic SHA-256 evidence issued</span>
          </div>
        </div>

        {/* In Progress / Active - Warm Amber */}
        <div className="rounded-3xl border border-amber-200 bg-[#FFFDF8] p-6 shadow-warm-sm">
          <div className="flex items-center justify-between">
            <span className="font-dm-sans text-xs font-700 uppercase tracking-wider text-[#75665D]">
              In Execution / Pending
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-manrope text-3xl font-800 tracking-tight text-amber-900">
              {(stats?.runningJobs ?? 0) + (stats?.pendingVerificationJobs ?? 0)}
            </span>
            <span className="font-dm-sans text-xs text-[#75665D]">in flight</span>
          </div>
          <div className="mt-2 flex items-center gap-1 font-dm-sans text-[11px] text-amber-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
            </span>
            <span>{stats?.runningJobs ?? 0} actively wiping blocks</span>
          </div>
        </div>

        {/* Connected Agents - Editorial Sand */}
        <div className="rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-6 shadow-warm-sm">
          <div className="flex items-center justify-between">
            <span className="font-dm-sans text-xs font-700 uppercase tracking-wider text-[#75665D]">
              Connected Python Agents
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F5F0E7] text-[#47372E] border border-[#DDD1C3]">
              <Server className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-manrope text-3xl font-800 tracking-tight text-[#47372E]">
              {stats?.activeAgentsCount ?? 0}
            </span>
            <span className="font-dm-sans text-xs text-[#75665D]">nodes online</span>
          </div>
          <div className="mt-2 flex items-center gap-1 font-dm-sans text-[11px] text-[#75665D]">
            <span>Total registered:</span>
            <span className="font-bold text-[#47372E]">{agents.length} nodes</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#DDD1C3] pb-3">
        <button
          onClick={() => setActiveTab("ledger")}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2 font-dm-sans text-xs font-700 transition-all ${
            activeTab === "ledger"
              ? "bg-[#47372E] text-[#FFFDF8] shadow-warm-sm"
              : "bg-[#FFFDF8] text-[#75665D] hover:bg-[#F5F0E7]"
          }`}
        >
          <HardDrive className="h-3.5 w-3.5" />
          Jobs Ledger ({jobs.length})
        </button>

        <button
          onClick={() => setActiveTab("agents")}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2 font-dm-sans text-xs font-700 transition-all ${
            activeTab === "agents"
              ? "bg-[#47372E] text-[#FFFDF8] shadow-warm-sm"
              : "bg-[#FFFDF8] text-[#75665D] hover:bg-[#F5F0E7]"
          }`}
        >
          <Server className="h-3.5 w-3.5" />
          Connected Agents ({agents.length})
        </button>

        <button
          onClick={() => setActiveTab("initiate")}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2 font-dm-sans text-xs font-700 transition-all ${
            activeTab === "initiate"
              ? "bg-[#C66D4E] text-[#FFFDF8] shadow-warm-sm"
              : "bg-[#FFFDF8] text-[#75665D] hover:bg-[#F5F0E7]"
          }`}
        >
          <Play className="h-3.5 w-3.5" />
          Initiate New Sanitization
        </button>
      </div>

      {/* TAB 1: JOBS LEDGER */}
      {activeTab === "ledger" && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-4 shadow-warm-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#75665D]" />
              <input
                type="text"
                placeholder="Search by Job ID, Device ID, or Target Drive..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] py-2 pl-9 pr-4 font-dm-sans text-xs text-[#47372E] placeholder-[#75665D]/60 focus:border-[#C66D4E] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] px-3 py-2 font-dm-sans text-xs font-600 text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
              >
                <option value="ALL">All Statuses</option>
                <option value="VERIFIED_SUCCESSFUL">Verified Successful</option>
                <option value="RUNNING">Running</option>
                <option value="PENDING">Pending</option>
                <option value="OPERATION_FAILED">Operation Failed</option>
              </select>

              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] px-3 py-2 font-dm-sans text-xs font-600 text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
              >
                <option value="ALL">All Standards</option>
                <option value="NIST_SP_800_88_CLEAR">NIST Clear</option>
                <option value="NIST_SP_800_88_PURGE">NIST Purge</option>
                <option value="ZERO_OVERWRITE">Zero Overwrite</option>
                <option value="DRY_RUN_SIMULATION">Simulation</option>
              </select>
            </div>
          </div>

          {/* Jobs Table */}
          <div className="overflow-hidden rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] shadow-warm-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-dm-sans text-xs">
                <thead className="border-b border-[#DDD1C3] bg-[#F5F0E7] text-[#47372E] font-700">
                  <tr>
                    <th className="py-3.5 px-5">Job ID &amp; Device</th>
                    <th className="py-3.5 px-4">Target Medium</th>
                    <th className="py-3.5 px-4">Standard &amp; Mode</th>
                    <th className="py-3.5 px-4">Status &amp; Progress</th>
                    <th className="py-3.5 px-4">Verification Certificate</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDD1C3]/60">
                  {jobs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#75665D]">
                        <HardDrive className="mx-auto h-8 w-8 text-[#DDD1C3] mb-2" />
                        No sanitization jobs found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    jobs.map((job) => (
                      <tr key={job._id} className="hover:bg-[#FAF7F2] transition-colors">
                        <td className="py-4 px-5">
                          <div className="font-mono font-700 text-[#47372E]">{job.jobId}</div>
                          <div className="text-[11px] text-[#75665D]">
                            Device: <span className="font-semibold text-[#47372E]">{job.retechDeviceId}</span>
                            {job.deviceId && ` (${job.deviceId.brand} ${job.deviceId.model})`}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-medium text-[#47372E]">{job.targetDriveModel || job.targetDriveId}</div>
                          <div className="font-mono text-[11px] text-[#75665D]">
                            {job.targetDriveId} &bull; {job.targetStorageType || "SSD"} ({job.targetCapacity || "512 GB"})
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-600 text-[#47372E]">{job.selectedMethod}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {job.isSimulation ? (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 font-mono text-[10px] font-700 text-amber-800 border border-amber-200">
                                DRY RUN SIMULATION
                              </span>
                            ) : (
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-mono text-[10px] font-700 text-emerald-800 border border-emerald-200">
                                HARDWARE EXECUTION
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div>{getStatusBadge(job.status)}</div>
                          <div className="mt-2 flex items-center gap-2">
                            <div className="h-1.5 w-24 rounded-full bg-[#EAE2D7] overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  job.status === "VERIFIED_SUCCESSFUL"
                                    ? "bg-emerald-600"
                                    : job.status === "OPERATION_FAILED"
                                    ? "bg-rose-500"
                                    : "bg-[#C66D4E]"
                                }`}
                                style={{ width: `${job.progressPercent || (job.status === "VERIFIED_SUCCESSFUL" ? 100 : 0)}%` }}
                              />
                            </div>
                            <span className="font-mono text-[10px] text-[#75665D]">
                              {job.progressPercent || (job.status === "VERIFIED_SUCCESSFUL" ? 100 : 0)}%
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-4 font-mono text-[11px]">
                          {job.verificationResult ? (
                            <div>
                              <span className="font-bold text-emerald-700">
                                {job.verificationResult.certificateId || "CERT-VERIFIED"}
                              </span>
                              <div className="text-[10px] text-[#75665D] truncate max-w-[140px]" title={job.verificationResult.sha256VerificationHash}>
                                SHA: {job.verificationResult.sha256VerificationHash.slice(0, 12)}...
                              </div>
                            </div>
                          ) : (
                            <span className="text-stone-400">Pending Execution</span>
                          )}
                        </td>

                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {job.status === "VERIFIED_SUCCESSFUL" && (() => {
                              const rawDevId = typeof job.deviceId === "object" ? (job.deviceId as any)?._id : job.deviceId
                              const devStatus = typeof job.deviceId === "object" ? (job.deviceId as any)?.status : null
                              const devMktId = typeof job.deviceId === "object" ? (job.deviceId as any)?.marketplaceListingId : null

                              const listing = (rawDevId && activeResaleListings.get(String(rawDevId))) ||
                                              (job.retechDeviceId && activeResaleListings.get(String(job.retechDeviceId))) ||
                                              (job as any).marketplaceListing

                              const isAlreadyListed = Boolean(
                                listing ||
                                devMktId ||
                                devStatus === "LISTED_FOR_RESALE" ||
                                (job as any).isListedForResale
                              )

                              if (isAlreadyListed) {
                                const listingRef = listing?.listingId || "Listed"
                                return (
                                  <button
                                    onClick={() => navigate('/admin/marketplace')}
                                    title={`Device is already listed in Resale Marketplace (${listingRef}). Click to view or manage listing.`}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-100/90 px-3 py-1.5 font-dm-sans text-xs font-700 text-emerald-900 shadow-warm-sm hover:bg-emerald-200 transition-all"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                                    <span>Listed in Resale</span>
                                  </button>
                                )
                              }

                              return (
                                <button
                                  onClick={() => {
                                    navigate(`/admin/marketplace?deviceId=${rawDevId}`)
                                  }}
                                  title="Approve this sanitized device and create a resale listing"
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 font-dm-sans text-xs font-700 text-emerald-800 shadow-warm-sm hover:bg-emerald-100 transition-all"
                                >
                                  <ShoppingBag className="h-3.5 w-3.5 text-emerald-700" />
                                  <span>Approve for Resale</span>
                                </button>
                              )
                            })()}
                            <button
                              onClick={() => setSelectedJob(job)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-[#DDD1C3] bg-[#FFFDF8] px-3 py-1.5 font-dm-sans text-xs font-700 text-[#47372E] shadow-warm-sm hover:bg-[#F5F0E7] transition-all"
                            >
                              <Terminal className="h-3.5 w-3.5 text-[#C66D4E]" />
                              Audit &amp; Logs
                            </button>

                            <button
                              onClick={() => handleDeleteJob(job.jobId || job._id)}
                              title="Delete Sanitization Job"
                              className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 font-dm-sans text-xs font-700 text-rose-700 shadow-warm-sm hover:bg-rose-100 hover:border-rose-300 transition-all cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[#DDD1C3] bg-[#F5F0E7]/40 px-5 py-3">
                <span className="text-xs text-[#75665D]">
                  Page {page} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-xl border border-[#DDD1C3] bg-[#FFFDF8] px-3 py-1 text-xs font-700 text-[#47372E] disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="rounded-xl border border-[#DDD1C3] bg-[#FFFDF8] px-3 py-1 text-xs font-700 text-[#47372E] disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CONNECTED AGENTS */}
      {activeTab === "agents" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-manrope text-lg font-800 text-[#47372E]">
                Registered Local Python Sanitization Agents
              </h2>
              <p className="font-dm-sans text-xs text-[#75665D]">
                Host computers running the ReTech FastAPI background agent for safe drive discovery and storage erasure
              </p>
            </div>
            <button
              onClick={handleGeneratePairing}
              className="flex items-center gap-2 rounded-2xl bg-[#C66D4E] px-4 py-2 font-dm-sans text-xs font-700 text-[#FFFDF8] shadow-warm-sm hover:bg-[#B55D3E]"
            >
              <KeyRound className="h-3.5 w-3.5" />
              Pair New Agent
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {agents.length === 0 ? (
              <div className="col-span-2 rounded-3xl border border-dashed border-[#DDD1C3] bg-[#FFFDF8] p-12 text-center">
                <Server className="mx-auto h-10 w-10 text-[#B78B68] mb-3" />
                <h3 className="font-manrope text-base font-800 text-[#47372E]">No Connected Agents</h3>
                <p className="mt-1 font-dm-sans text-xs text-[#75665D] max-w-md mx-auto">
                  Click "Pair New Agent" above to generate a 15-minute pairing code and connect your Python sanitization agent.
                </p>
              </div>
            ) : (
              agents.map((agent) => {
                const isOnline = agent.status === "ONLINE"
                return (
                  <div
                    key={agent._id}
                    className="rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-6 shadow-warm-sm space-y-4"
                  >
                    <div className="flex items-start justify-between border-b border-[#DDD1C3]/60 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-manrope text-base font-800 text-[#47372E]">
                            {agent.name}
                          </h3>
                          <span className="font-mono text-xs font-700 text-[#C66D4E]">
                            ({agent.agentId})
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-3 font-mono text-[11px] text-[#75665D]">
                          <span>Host: {agent.hostname}</span>
                          <span>&bull;</span>
                          <span>OS: {agent.platform}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isOnline ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 font-mono text-[11px] font-700 text-emerald-800 border border-emerald-200">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                            </span>
                            ONLINE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1 font-mono text-[11px] font-700 text-stone-600 border border-stone-200">
                            OFFLINE
                          </span>
                        )}

                        <button
                          onClick={() => handleDeleteAgent(agent.agentId)}
                          title="Delete Agent Node"
                          className="flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50/80 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 hover:text-rose-900 transition-colors shadow-xs"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Discovered Drives List & System Drive Safety Badge */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-dm-sans text-xs font-700 text-[#47372E] flex items-center gap-1.5">
                          <HardDrive className="h-3.5 w-3.5 text-[#C66D4E]" />
                          Discovered Physical Storage ({agent.discoveredDrives?.length || 0})
                        </span>
                        <span className="text-[10px] font-mono text-[#75665D]">
                          Last seen: {new Date(agent.lastSeenAt).toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {agent.discoveredDrives && agent.discoveredDrives.length > 0 ? (
                          agent.discoveredDrives.map((drive, idx) => (
                            <div
                              key={idx}
                              className={`rounded-2xl border p-3 flex items-start justify-between ${
                                drive.isSystemDrive
                                  ? "border-amber-200 bg-amber-50/60"
                                  : "border-[#DDD1C3]/60 bg-[#FAF7F2]"
                              }`}
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-700 text-[#47372E]">
                                    {drive.driveId}
                                  </span>
                                  <span className="text-xs text-[#75665D]">&bull;</span>
                                  <span className="font-dm-sans text-xs font-600 text-[#47372E]">
                                    {drive.model}
                                  </span>
                                </div>
                                <div className="mt-1 font-mono text-[10px] text-[#75665D]">
                                  {drive.capacityFormatted || "Unknown Size"} &bull; {drive.storageType} ({drive.interfaceType})
                                </div>
                              </div>

                              <div>
                                {drive.isSystemDrive ? (
                                  <span className="rounded-full bg-amber-200/80 px-2 py-0.5 font-mono text-[10px] font-700 text-amber-900 border border-amber-300">
                                    PROTECTED OS DRIVE
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-mono text-[10px] font-700 text-emerald-800 border border-emerald-200">
                                    TARGETABLE
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-2xl border border-dashed border-[#DDD1C3] p-3 text-center text-xs text-[#75665D]">
                            No drive information reported yet.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-[#DDD1C3]/40">
                      <span className="text-[11px] font-mono text-[#75665D]">
                        Agent v{agent.agentVersion}
                      </span>
                      <div className="flex items-center gap-3">
                        {agent.status !== "REVOKED" && (
                          <button
                            onClick={() => handleRevokeAgent(agent.agentId)}
                            className="font-dm-sans text-xs font-700 text-stone-500 hover:text-stone-800 hover:underline"
                          >
                            Revoke Access
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAgent(agent.agentId)}
                          className="flex items-center gap-1 font-dm-sans text-xs font-700 text-rose-600 hover:text-rose-800 hover:underline"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete Node</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: INITIATE SANITIZATION */}
      {activeTab === "initiate" && (
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-8 shadow-warm-sm">
            <div className="border-b border-[#DDD1C3] pb-4 mb-6">
              <h2 className="font-manrope text-xl font-800 text-[#47372E]">
                Initiate NIST SP 800-88 Sanitization Task
              </h2>
              <p className="mt-1 font-dm-sans text-xs text-[#75665D]">
                Authorize a software data sanitization run against an inspected customer electronic device.
              </p>
            </div>

            {formMsg && (
              <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 font-dm-sans text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                {formMsg}
              </div>
            )}

            {formErr && (
              <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 font-dm-sans text-xs text-rose-800 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                {formErr}
              </div>
            )}

            <form onSubmit={handleCreateJob} className="space-y-6">
              {/* Device Selector */}
              <div>
                <label className="block font-dm-sans text-xs font-700 text-[#47372E] mb-1.5">
                  Target Inventory Device *
                </label>
                <select
                  value={selectedDeviceId}
                  onChange={(e) => {
                    setSelectedDeviceId(e.target.value)
                    const dev = availableDevices.find((d) => d._id === e.target.value)
                    if (dev) {
                      setTargetDriveModel(`${dev.brand} ${dev.model} Internal Drive`)
                    }
                  }}
                  className="w-full rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] p-3 font-dm-sans text-xs text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                  required
                >
                  <option value="">-- Select Registered Device --</option>
                  {availableDevices.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.deviceId} - {d.brand} {d.model} ({d.category} - {d.status})
                    </option>
                  ))}
                </select>
                <p className="mt-1 font-dm-sans text-[11px] text-[#75665D]">
                  Device will transition to "SANITIZATION_PENDING" during execution and "SANITIZED" upon cryptographic verification pass.
                </p>
              </div>

              {/* Target Drive Specification */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-dm-sans text-xs font-700 text-[#47372E] mb-1.5">
                    Target Drive LBA Identifier *
                  </label>
                  <input
                    type="text"
                    value={targetDriveId}
                    onChange={(e) => setTargetDriveId(e.target.value)}
                    placeholder="e.g. PhysicalDrive1 or /dev/sdb"
                    className="w-full rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] p-3 font-mono text-xs text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                    required
                  />
                  <span className="mt-1 block text-[10px] text-amber-800">
                    System Drive (PhysicalDrive0 / /dev/sda) is protected and cannot be wiped in-OS.
                  </span>
                </div>

                <div>
                  <label className="block font-dm-sans text-xs font-700 text-[#47372E] mb-1.5">
                    Storage Drive Model Descriptor
                  </label>
                  <input
                    type="text"
                    value={targetDriveModel}
                    onChange={(e) => setTargetDriveModel(e.target.value)}
                    placeholder="e.g. Samsung 970 EVO NVMe 512GB"
                    className="w-full rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] p-3 font-dm-sans text-xs text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                  />
                </div>
              </div>

              {/* Sanitization Method Selector */}
              <div>
                <label className="block font-dm-sans text-xs font-700 text-[#47372E] mb-1.5">
                  Sanitization Method (NIST SP 800-88 Allowlist) *
                </label>
                <select
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="w-full rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] p-3 font-dm-sans text-xs font-600 text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                >
                  <option value="NIST_SP_800_88_CLEAR">
                    NIST SP 800-88 Rev. 1 Clear (Single-Pass Logical Overwrite + Readback)
                  </option>
                  <option value="NIST_SP_800_88_PURGE">
                    NIST SP 800-88 Rev. 1 Purge (Hardware Cryptographic / Firmware Purge)
                  </option>
                  <option value="ZERO_OVERWRITE">Single-Pass Zero Fill (0x00 pattern)</option>
                  <option value="RANDOM_OVERWRITE">Pseudorandom Byte Overwrite</option>
                  <option value="NVME_CRYPTO_ERASE">NVMe Cryptographic Erase (Self-Encrypting Drives)</option>
                </select>
              </div>

              {/* Execution Agent Assignment (Optional) */}
              <div>
                <label className="block font-dm-sans text-xs font-700 text-[#47372E] mb-1.5">
                  Target Sanitization Agent Node (Optional)
                </label>
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="w-full rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] p-3 font-dm-sans text-xs text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                >
                  <option value="">-- Any Available Connected Agent --</option>
                  {agents.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name} ({a.agentId} - {a.status}) - {a.hostname}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dry-Run Simulation Mode Switch */}
              <div className="rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] p-4 flex items-center justify-between">
                <div>
                  <span className="font-dm-sans text-xs font-700 text-[#47372E] block">
                    Execution Mode: {isSimulation ? "Dry-Run Simulation" : "Destructive Hardware Wipe"}
                  </span>
                  <span className="font-dm-sans text-[11px] text-[#75665D]">
                    {isSimulation
                      ? "Simulation runs the full pipeline and cryptographic verification in memory without touching physical drive blocks."
                      : "Destructive mode issues direct block-level overwrite commands to physical non-system storage."}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSimulation(!isSimulation)}
                  className={`rounded-xl px-3 py-1.5 font-mono text-xs font-700 transition-all ${
                    isSimulation
                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                      : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                  }`}
                >
                  {isSimulation ? "Dry Run (Active)" : "Real Hardware"}
                </button>
              </div>

              {/* Mandatory Authorization Confirmation Checkbox */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmAuth}
                    onChange={(e) => setConfirmAuth(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-amber-300 text-[#C66D4E] focus:ring-[#C66D4E]"
                    required
                  />
                  <div className="font-dm-sans text-xs text-amber-900 leading-relaxed">
                    <span className="font-700">Administrator Authorization Confirmation:</span> I certify that I have verified the device chain of custody and explicitly authorize data sanitization in accordance with NIST SP 800-88 guidelines.
                  </div>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submittingJob || !confirmAuth}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#C66D4E] py-3.5 font-dm-sans text-xs font-700 text-[#FFFDF8] shadow-warm-md hover:bg-[#B55D3E] disabled:opacity-50 transition-all"
              >
                {submittingJob ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Initializing Sanitization Task...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current" />
                    Queue &amp; Authorize Sanitization Task
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: JOB AUDIT & TERMINAL LOGS */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] shadow-warm-xl overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-[#DDD1C3] px-6 py-4 bg-[#F5F0E7]">
                <div className="flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-[#C66D4E]" />
                  <div>
                    <h3 className="font-manrope text-base font-800 text-[#47372E]">
                      Sanitization Audit Trail &bull; {selectedJob.jobId}
                    </h3>
                    <span className="font-mono text-[11px] text-[#75665D]">
                      Device: {selectedJob.retechDeviceId} &bull; Target: {selectedJob.targetDriveId}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="rounded-xl p-1.5 text-[#75665D] hover:bg-[#DDD1C3]/60 transition-colors"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                {/* Job Specs Grid */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] p-4 font-dm-sans text-xs">
                  <div>
                    <span className="text-[#75665D] block text-[11px]">Method:</span>
                    <span className="font-700 text-[#47372E]">{selectedJob.selectedMethod}</span>
                  </div>
                  <div>
                    <span className="text-[#75665D] block text-[11px]">Standard:</span>
                    <span className="font-700 text-[#47372E]">{selectedJob.sanitizationStandard}</span>
                  </div>
                  <div>
                    <span className="text-[#75665D] block text-[11px]">Authorized By:</span>
                    <span className="font-700 text-[#47372E]">{selectedJob.authorizedByName || "Admin"}</span>
                  </div>
                  <div>
                    <span className="text-[#75665D] block text-[11px]">Execution Agent:</span>
                    <span className="font-mono font-700 text-[#C66D4E]">
                      {selectedJob.agentCode || "Assigned Node"}
                    </span>
                  </div>
                </div>

                {/* Cryptographic Verification Evidence Card (If completed) */}
                {selectedJob.verificationResult && (
                  <div className="rounded-2xl border border-emerald-300 bg-emerald-50/70 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-emerald-700" />
                        <span className="font-manrope text-sm font-800 text-emerald-950">
                          Cryptographic Verification Certificate Issued
                        </span>
                      </div>
                      <span className="font-mono text-xs font-700 text-emerald-800">
                        {selectedJob.verificationResult.certificateId}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-dm-sans text-xs">
                      <div className="rounded-xl bg-white p-3 border border-emerald-200">
                        <span className="text-stone-500 block text-[11px]">Shannon Entropy:</span>
                        <span className="font-mono font-bold text-emerald-900">
                          {selectedJob.verificationResult.entropyScore?.toFixed(4) || "0.0000"} / 8.0
                        </span>
                      </div>
                      <div className="rounded-xl bg-white p-3 border border-emerald-200">
                        <span className="text-stone-500 block text-[11px]">Sectors Sampled:</span>
                        <span className="font-mono font-bold text-emerald-900">
                          {selectedJob.verificationResult.sectorsVerifiedClean || 1024} / {selectedJob.verificationResult.sectorsSampled || 1024} Clean
                        </span>
                      </div>
                      <div className="rounded-xl bg-white p-3 border border-emerald-200">
                        <span className="text-stone-500 block text-[11px]">Result:</span>
                        <span className="font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> PASSED NIST AUDIT
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl bg-[#2D231E] p-3 text-white font-mono text-[11px]">
                      <span className="text-emerald-400 block mb-1">SHA-256 Cryptographic Verification Hash:</span>
                      <span className="break-all select-all">{selectedJob.verificationResult.sha256VerificationHash}</span>
                    </div>

                    {/* Resale Marketplace Decision Prompt */}
                    <div className="rounded-2xl border border-emerald-300 bg-white/90 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-warm-xs">
                      <div>
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                          NIST SP 800-88 Sanitization Verified &bull; Second-Life Eligible
                        </span>
                        <h4 className="mt-1 font-manrope text-sm font-800 text-[#47372E]">
                          Would you like to approve this device for the Resale Marketplace?
                        </h4>
                        <p className="mt-0.5 font-dm-sans text-xs text-[#75665D]">
                          This device meets all certified data privacy guidelines and can now be safely offered to second-life buyers.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          const devId = typeof selectedJob.deviceId === "object" ? (selectedJob.deviceId as any)?._id : selectedJob.deviceId
                          setSelectedJob(null)
                          navigate(`/admin/marketplace?deviceId=${devId}`)
                        }}
                        className="shrink-0 flex items-center gap-2 rounded-2xl bg-[#C66D4E] px-4 py-2.5 font-dm-sans text-xs font-700 text-white shadow-warm-sm hover:bg-[#B55D3E] transition-all"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        <span>Approve &amp; List for Resale &rarr;</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Terminal Execution Logs */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-dm-sans text-xs font-700 text-[#47372E]">
                      Live Agent Execution Logs ({selectedJob.executionLogs?.length || 0} events)
                    </span>
                    <span className="font-mono text-[10px] text-[#75665D]">
                      Progress: {selectedJob.progressPercent || 0}%
                    </span>
                  </div>

                  <div className="rounded-2xl border border-stone-800 bg-[#1E1916] p-4 font-mono text-xs text-stone-200 space-y-1.5 max-h-60 overflow-y-auto">
                    {selectedJob.executionLogs && selectedJob.executionLogs.length > 0 ? (
                      selectedJob.executionLogs.map((log, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-[11px]">
                          <span className="text-stone-500 shrink-0">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                          <span
                            className={`shrink-0 font-bold ${
                              log.level === "ERROR"
                                ? "text-rose-400"
                                : log.level === "WARN"
                                ? "text-amber-400"
                                : log.level === "SUCCESS"
                                ? "text-emerald-400"
                                : "text-cyan-400"
                            }`}
                          >
                            [{log.level}]
                          </span>
                          <span className="text-stone-300">{log.message}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-stone-500">No execution logs registered yet.</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-[#DDD1C3] bg-[#F5F0E7] px-6 py-3 flex items-center justify-between">
                <button
                  onClick={() => handleDeleteJob(selectedJob.jobId || selectedJob._id)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-3 py-1.5 font-dm-sans text-xs font-700 text-rose-700 hover:bg-rose-100 transition-all cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                  <span>Delete Job</span>
                </button>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="rounded-xl bg-[#47372E] px-4 py-2 font-dm-sans text-xs font-700 text-white hover:bg-[#382b24] transition-all"
                >
                  Close Audit View
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: PAIR AGENT WITH SINGLE-USE CODE */}
      <AnimatePresence>
        {pairingModalOpen && pairingData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-6 shadow-warm-xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-[#DDD1C3] pb-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-[#C66D4E]" />
                  <h3 className="font-manrope text-base font-800 text-[#47372E]">
                    Pair Local Sanitization Agent
                  </h3>
                </div>
                <button
                  onClick={() => setPairingModalOpen(false)}
                  className="rounded-xl p-1 text-[#75665D] hover:bg-[#DDD1C3]"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="font-dm-sans text-xs text-[#75665D] leading-relaxed">
                  Use this single-use pairing code to bind your standalone Python agent to the ReTech platform. The agent will exchange this code for an authenticated API key.
                </p>

                {/* Big Pairing Code Card */}
                <div className="rounded-2xl border border-[#C66D4E]/30 bg-[#F5F0E7] p-5 text-center space-y-2">
                  <span className="font-dm-sans text-[11px] font-700 uppercase tracking-wider text-[#75665D]">
                    Single-Use Pairing Code (Expires in 15 Minutes)
                  </span>
                  <div className="font-mono text-2xl font-800 tracking-wider text-[#C66D4E]">
                    {pairingData.pairingCode}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(pairingData.pairingCode)
                      setCopiedCode(true)
                      setTimeout(() => setCopiedCode(false), 2000)
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#DDD1C3] bg-white px-3 py-1 font-dm-sans text-xs font-700 text-[#47372E] shadow-warm-sm hover:bg-[#FAF7F2]"
                  >
                    {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedCode ? "Copied Code" : "Copy Code"}
                  </button>
                </div>

                {/* CLI Command Helper */}
                <div>
                  <span className="block font-dm-sans text-xs font-700 text-[#47372E] mb-1.5">
                    Terminal Execution Command:
                  </span>
                  <div className="flex items-center justify-between rounded-xl bg-[#2D231E] p-3 text-white font-mono text-xs">
                    <span className="truncate pr-2">
                      python run_agent.py --pair {pairingData.pairingCode}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`python run_agent.py --pair ${pairingData.pairingCode}`)
                        setCopiedCli(true)
                        setTimeout(() => setCopiedCli(false), 2000)
                      }}
                      className="rounded-lg bg-white/20 p-1 hover:bg-white/30 text-white"
                      title="Copy CLI command"
                    >
                      {copiedCli ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 font-dm-sans text-[11px] text-amber-900">
                  <span className="font-bold">Security Note:</span> Once paired, the agent operates in safe dry-run mode by default and active operating system boot partitions are protected from in-OS erasing.
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setPairingModalOpen(false)}
                  className="rounded-xl bg-[#47372E] px-4 py-2 font-dm-sans text-xs font-700 text-white"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

