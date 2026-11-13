import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShieldCheck,
  ShieldAlert,
  Download,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Plus,
  Eye,
  KeyRound,
  Layers,
} from "lucide-react"
import {
  phase4Service,
  SanitizationCertificate,
} from "@/services/phase4Service"

export default function AdminCertificatesPage() {
  const [activeTab, setActiveTab] = useState<"ledger" | "eligible">("ledger")
  const [certificates, setCertificates] = useState<SanitizationCertificate[]>([])
  const [eligibleItems, setEligibleItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Certificate Issuance State
  const [issuingDeviceId, setIssuingDeviceId] = useState<string | null>(null)
  const [downloadingCertId, setDownloadingCertId] = useState<string | null>(null)
  const [actionMsg, setActionMsg] = useState<string | null>(null)

  const handleDownloadPdf = async (certificateId: string, certNumber?: string) => {
    try {
      setDownloadingCertId(certificateId)
      await phase4Service.downloadCertificatePdf(certificateId, certNumber)
    } catch (err: any) {
      console.error("Failed to download PDF:", err)
      alert(err?.response?.data?.message || "Failed to download certificate PDF.")
    } finally {
      setDownloadingCertId(null)
    }
  }

  const loadCertificates = async () => {
    setLoading(true)
    try {
      const [certData, eligibleData] = await Promise.all([
        phase4Service.getAdminCertificates({
          search,
          status: statusFilter,
          page,
          limit: 10,
        }),
        phase4Service.getEligibleDevicesForCert(),
      ])
      setCertificates(certData.certificates)
      setTotalPages(certData.pagination.pages || 1)
      setEligibleItems(eligibleData)
    } catch (err) {
      console.error("Failed to load certificates:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCertificates()
  }, [search, statusFilter, page])

  const handleIssueCertificate = async (deviceId: string) => {
    setIssuingDeviceId(deviceId)
    setActionMsg(null)
    try {
      const newCert = await phase4Service.generateCertificate(deviceId)
      setActionMsg(`Certificate ${newCert.certificateNumber} generated and signed successfully!`)
      loadCertificates()
      setActiveTab("ledger")
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to generate certificate.")
    } finally {
      setIssuingDeviceId(null)
    }
  }

  const uncertifiedCount = eligibleItems.filter((i) => !i.hasCertificate).length

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-700 text-[#C66D4E]">
            <ShieldCheck className="h-3.5 w-3.5" />
            NIST SP 800-88 ERASURE AUDIT LEDGER
          </div>
          <h1 className="mt-1 font-manrope text-2xl font-800 tracking-tight text-[#47372E] sm:text-3xl">
            Sanitization Certificates Management
          </h1>
          <p className="mt-1 font-dm-sans text-xs text-[#75665D]">
            Generate, manage, and inspect official media sanitization certificates with cryptographic SHA-256 evidence.
          </p>
        </div>

        <button
          onClick={() => loadCertificates()}
          className="flex items-center gap-2 rounded-2xl border border-[#DDD1C3] bg-[#FFFDF8] px-3.5 py-2 font-dm-sans text-xs font-700 text-[#47372E] shadow-warm-sm hover:bg-[#F5F0E7] transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5 text-[#C66D4E]" />
          Refresh Registry
        </button>
      </div>

      {actionMsg && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 font-dm-sans text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          {actionMsg}
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-6 shadow-warm-sm">
          <span className="font-dm-sans text-xs font-700 uppercase tracking-wider text-[#75665D]">
            Total Certificates Issued
          </span>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-manrope text-3xl font-800 text-[#47372E]">
              {certificates.length}
            </span>
            <span className="font-dm-sans text-xs text-[#75665D]">signed</span>
          </div>
        </div>

        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-6 shadow-warm-sm">
          <span className="font-dm-sans text-xs font-700 uppercase tracking-wider text-emerald-900">
            Active Valid Certificates
          </span>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-manrope text-3xl font-800 text-emerald-950">
              {certificates.filter((c) => c.status === "ACTIVE").length}
            </span>
            <span className="font-dm-sans text-xs text-emerald-800">publicly verifiable</span>
          </div>
        </div>

        <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-6 shadow-warm-sm">
          <span className="font-dm-sans text-xs font-700 uppercase tracking-wider text-amber-900">
            Awaiting Certificate Issuance
          </span>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-manrope text-3xl font-800 text-amber-950">
              {uncertifiedCount}
            </span>
            <span className="font-dm-sans text-xs text-amber-800">verified clean</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#DDD1C3] pb-3">
        <button
          onClick={() => setActiveTab("ledger")}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2 font-dm-sans text-xs font-700 transition-all ${
            activeTab === "ledger"
              ? "bg-[#47372E] text-[#FFFDF8] shadow-warm-sm"
              : "bg-[#FFFDF8] text-[#75665D] hover:bg-[#F5F0E7]"
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          Certificates Ledger ({certificates.length})
        </button>

        <button
          onClick={() => setActiveTab("eligible")}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2 font-dm-sans text-xs font-700 transition-all ${
            activeTab === "eligible"
              ? "bg-[#C66D4E] text-[#FFFDF8] shadow-warm-sm"
              : "bg-[#FFFDF8] text-[#75665D] hover:bg-[#F5F0E7]"
          }`}
        >
          <Plus className="h-3.5 w-3.5" />
          Eligible Devices Awaiting Issue ({uncertifiedCount})
        </button>
      </div>

      {/* TAB 1: CERTIFICATES LEDGER */}
      {activeTab === "ledger" && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-4 shadow-warm-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#75665D]" />
              <input
                type="text"
                placeholder="Search by certificate number, device ID, or SHA-256 fingerprint..."
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
              <option value="ACTIVE">Active (Valid)</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] shadow-warm-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-dm-sans text-xs">
                <thead className="border-b border-[#DDD1C3] bg-[#F5F0E7] text-[#47372E] font-700">
                  <tr>
                    <th className="py-3.5 px-5">Certificate #</th>
                    <th className="py-3.5 px-4">Hardware &amp; Customer</th>
                    <th className="py-3.5 px-4">Standard &amp; Job</th>
                    <th className="py-3.5 px-4">Issue Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDD1C3]/60">
                  {certificates.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#75665D]">
                        No sanitization certificates found.
                      </td>
                    </tr>
                  ) : (
                    certificates.map((cert) => {
                      const isValid = cert.status === "ACTIVE"
                      return (
                        <tr key={cert._id} className="hover:bg-[#FAF7F2] transition-colors">
                          <td className="py-4 px-5">
                            <span className="font-mono font-700 text-[#C66D4E]">
                              {cert.certificateNumber}
                            </span>
                            <div
                              className="text-[10px] font-mono text-[#75665D] truncate max-w-[140px]"
                              title={cert.evidenceReference}
                            >
                              SHA: {cert.evidenceReference.slice(0, 12)}...
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div className="font-semibold text-[#47372E]">
                              {cert.retechDeviceId} &bull; {cert.deviceId?.brand} {cert.deviceId?.model}
                            </div>
                            <div className="text-[11px] text-[#75665D]">
                              Customer: {cert.customerId?.fullName?.replace(/Ayush Sharma(\s*\(Demo Customer\))?/gi, 'Ayushi Singh').replace(/\s*\(Demo Customer\)/gi, '') || "Ayushi Singh"}
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div className="font-semibold text-[#47372E]">{cert.sanitizationMethod}</div>
                            <div className="font-mono text-[10px] text-[#75665D]">
                              Job: {cert.sanitizationJobCode}
                            </div>
                          </td>

                          <td className="py-4 px-4 text-[#75665D]">
                            {new Date(cert.issuedAt).toLocaleDateString()}
                          </td>

                          <td className="py-4 px-4">
                            {isValid ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-700 text-emerald-800 border border-emerald-300">
                                <CheckCircle2 className="h-3 w-3" />
                                ACTIVE
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 font-mono text-[10px] font-700 text-rose-800 border border-rose-300">
                                <XCircle className="h-3 w-3" />
                                REVOKED
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleDownloadPdf(cert._id, cert.certificateNumber)}
                                disabled={downloadingCertId === cert._id}
                                className="rounded-xl border border-[#DDD1C3] bg-[#FFFDF8] p-1.5 text-[#47372E] hover:bg-[#F5F0E7] disabled:opacity-50 cursor-pointer"
                                title="Download Official PDF"
                              >
                                {downloadingCertId === cert._id ? (
                                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#C66D4E] border-t-transparent" />
                                ) : (
                                  <Download className="h-3.5 w-3.5" />
                                )}
                              </button>

                              <a
                                href={`/verify-certificate/${cert.verificationId}`}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-xl border border-[#DDD1C3] bg-[#FFFDF8] p-1.5 text-[#47372E] hover:bg-[#F5F0E7]"
                                title="Open Public Audit URL"
                              >
                                <ExternalLink className="h-3.5 w-3.5 text-[#C66D4E]" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ELIGIBLE DEVICES AWAITING CERTIFICATE */}
      {activeTab === "eligible" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs font-dm-sans text-amber-900">
            <span className="font-bold">Strict NIST SP 800-88 Policy:</span> Only devices whose background sanitization job has concluded with cryptographic verification status <code>VERIFIED_SUCCESSFUL</code> are displayed below.
          </div>

          <div className="overflow-hidden rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] shadow-warm-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-dm-sans text-xs">
                <thead className="border-b border-[#DDD1C3] bg-[#F5F0E7] text-[#47372E] font-700">
                  <tr>
                    <th className="py-3.5 px-5">Device ID &amp; Model</th>
                    <th className="py-3.5 px-4">Sanitization Job</th>
                    <th className="py-3.5 px-4">Standard &amp; Verification</th>
                    <th className="py-3.5 px-4">Current Status</th>
                    <th className="py-3.5 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDD1C3]/60">
                  {eligibleItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-[#75665D]">
                        No verified devices found.
                      </td>
                    </tr>
                  ) : (
                    eligibleItems.map((item) => {
                      const job = item.job
                      const dev = job.deviceId
                      const hasCert = item.hasCertificate

                      return (
                        <tr key={job._id} className="hover:bg-[#FAF7F2] transition-colors">
                          <td className="py-4 px-5">
                            <span className="font-mono font-700 text-[#47372E]">
                              {job.retechDeviceId}
                            </span>
                            <div className="text-[11px] text-[#75665D]">
                              {dev?.brand} {dev?.model} ({dev?.category})
                            </div>
                          </td>

                          <td className="py-4 px-4 font-mono font-semibold text-[#47372E]">
                            {job.jobId}
                          </td>

                          <td className="py-4 px-4">
                            <div className="font-semibold text-[#47372E]">{job.selectedMethod}</div>
                            <span className="text-[10px] text-emerald-700 font-mono">
                              Passed Cryptographic Readback
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            {hasCert ? (
                              <span className="rounded-full bg-stone-100 px-2 py-0.5 font-mono text-[10px] font-bold text-stone-600">
                                Certified ({item.existingCertificate?.certificateNumber})
                              </span>
                            ) : (
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-800">
                                Ready for Certificate Issuance
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-5 text-right">
                            {!hasCert && (
                              <button
                                disabled={issuingDeviceId === dev?._id}
                                onClick={() => handleIssueCertificate(dev?._id)}
                                className="rounded-xl bg-[#C66D4E] px-3.5 py-1.5 font-dm-sans text-xs font-700 text-white hover:bg-[#B55D3E] shadow-warm-sm disabled:opacity-50 transition-all flex items-center gap-1.5 ml-auto"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                {issuingDeviceId === dev?._id ? "Signing..." : "Issue Certificate"}
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
          </div>
        </div>
      )}
    </div>
  )
}

