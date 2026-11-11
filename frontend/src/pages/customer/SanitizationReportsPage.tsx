import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  FileCheck2,
  ShieldCheck,
  Download,
  AlertCircle,
  ArrowRight,
  HardDrive,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react"
import api from "@/services/api"
import { sanitizationService } from "@/services/sanitizationService"

interface CustomerDeviceItem {
  _id: string
  deviceId: string
  category: string
  brand: string
  model: string
  status: string
  sanitization?: {
    hasSanitizationRecord: boolean
    status?: string
    selectedMethod?: string
    sanitizationStandard?: string
    isSimulation?: boolean
    completedAt?: string
    verification?: {
      verified: boolean
      certificateId?: string
      sha256VerificationHash: string
      verificationTimestamp: string
    }
  }
}

export default function SanitizationReportsPage() {
  const [devices, setDevices] = useState<CustomerDeviceItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true)
      try {
        const res = await api.get("/customer/devices")
        if (res.data.success) {
          const rawDevices = res.data.data
          // Fetch sanitization status for each device
          const enriched = await Promise.all(
            rawDevices.map(async (dev: any) => {
              try {
                const sRes = await sanitizationService.getCustomerDeviceSanitization(dev._id)
                return { ...dev, sanitization: sRes }
              } catch (e) {
                return { ...dev, sanitization: { hasSanitizationRecord: false } }
              }
            })
          )
          setDevices(enriched)
        }
      } catch (err) {
        console.error("Failed to load customer sanitization reports:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [])

  const sanitizedDevices = devices.filter((d) => d.sanitization?.hasSanitizationRecord)

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Link to="/dashboard" className="font-dm-sans text-xs text-[#75665D] hover:underline">
            Dashboard
          </Link>
          <span className="text-xs text-[#DDD1C3]">&gt;</span>
          <span className="font-dm-sans text-xs font-600 text-[#C66D4E]">
            Sanitization Reports
          </span>
        </div>
        <h1 className="font-manrope text-2xl font-800 tracking-tight text-[#47372E] sm:text-3xl">
          NIST SP 800-88 Data Sanitization Certificates
        </h1>
        <p className="mt-1 font-dm-sans text-xs text-[#75665D]">
          Cryptographically verified certificates of media erasure for your completed device sanitizations.
        </p>
      </div>

      {/* Live Sanitized Certificates List */}
      <div className="space-y-4">
        <h2 className="font-manrope text-base font-800 text-[#47372E] flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-700" />
          Issued Media Erasure Certificates ({sanitizedDevices.length})
        </h2>

        {loading ? (
          <div className="rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-8 text-center text-xs text-[#75665D]">
            Loading your verified sanitization records...
          </div>
        ) : sanitizedDevices.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#DDD1C3] bg-[#FFFDF8] p-10 text-center space-y-3">
            <HardDrive className="mx-auto h-8 w-8 text-[#B78B68]" />
            <h3 className="font-manrope text-sm font-800 text-[#47372E]">No Devices Sanitized Yet</h3>
            <p className="font-dm-sans text-xs text-[#75665D] max-w-md mx-auto">
              Once your submitted electronic devices are collected and verified by our NIST SP 800-88 sanitization engine, tamper-proof certificates with cryptographic proof will appear here.
            </p>
            <Link
              to="/dashboard/devices"
              className="inline-flex items-center gap-1.5 font-dm-sans text-xs font-700 text-[#C66D4E] hover:underline"
            >
              <span>View your submitted devices</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {sanitizedDevices.map((d) => {
              const san = d.sanitization!
              const ver = san.verification
              const isVerified = ver?.verified

              return (
                <div
                  key={d._id}
                  className="rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-6 shadow-warm-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#DDD1C3] pb-4 gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <ShieldCheck className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-manrope text-base font-800 text-[#47372E]">
                            {d.brand} {d.model}
                          </h3>
                          <span className="font-mono text-xs font-700 text-[#C66D4E]">
                            ({d.deviceId})
                          </span>
                        </div>
                        <span className="font-dm-sans text-xs text-[#75665D]">
                          Category: {d.category} &bull; Method: {san.selectedMethod}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isVerified ? (
                        <span className="rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 font-mono text-xs font-700 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                          CERTIFIED SANITIZED
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 font-mono text-xs font-700 flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-amber-700" />
                          IN PROGRESS ({san.status})
                        </span>
                      )}
                    </div>
                  </div>

                  {ver && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-dm-sans text-xs">
                        <div className="rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] p-3">
                          <span className="text-[#75665D] block text-[11px]">Certificate Number</span>
                          <span className="font-mono font-700 text-[#47372E]">
                            {ver.certificateId || "CERT-VERIFIED"}
                          </span>
                        </div>

                        <div className="rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] p-3">
                          <span className="text-[#75665D] block text-[11px]">Sanitization Standard</span>
                          <span className="font-manrope font-700 text-[#47372E]">
                            {san.sanitizationStandard || "NIST SP 800-88 Rev. 1"}
                          </span>
                        </div>

                        <div className="rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] p-3">
                          <span className="text-[#75665D] block text-[11px]">Verified Timestamp</span>
                          <span className="font-dm-sans font-600 text-[#47372E]">
                            {new Date(ver.verificationTimestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-[#2D231E] p-3.5 text-white font-mono text-xs space-y-1">
                        <span className="text-emerald-400 text-[11px] block font-semibold">
                          SHA-256 Digital Verification Fingerprint:
                        </span>
                        <span className="break-all text-[11px] text-stone-200">
                          {ver.sha256VerificationHash}
                        </span>
                      </div>
                    </div>
                  )}

                  {san.isSimulation && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-2.5 text-[11px] font-dm-sans text-amber-900">
                      <span className="font-bold">Test Audit Note:</span> This record was performed under ReTech non-destructive simulation protocol.
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* NIST SP 800-88 Technical Specification Reference Card */}
      <div className="rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-8 shadow-warm-sm space-y-6">
        <div className="flex items-center justify-between border-b border-[#DDD1C3] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="font-mono text-[11px] font-700 text-[#C66D4E]">
                TECHNICAL COMPLIANCE
              </span>
              <h3 className="font-manrope text-base font-800 text-[#47372E]">
                NIST SP 800-88 Rev. 1 Guidelines for Media Sanitization
              </h3>
            </div>
          </div>
          <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 font-dm-sans text-xs font-700">
            NIST Standard
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs font-dm-sans">
          <div className="rounded-2xl border border-[#DDD1C3] bg-[#EAE1D5]/20 p-4">
            <span className="text-[#75665D]">Clear Standard</span>
            <div className="mt-1 font-manrope font-700 text-[#47372E]">Logical Overwrite + Readback</div>
            <p className="mt-1 text-[11px] text-[#75665D]">Protects against non-invasive keyboard recovery</p>
          </div>

          <div className="rounded-2xl border border-[#DDD1C3] bg-[#EAE1D5]/20 p-4">
            <span className="text-[#75665D]">Purge Standard</span>
            <div className="mt-1 font-manrope font-700 text-[#47372E]">Cryptographic Key Destruction</div>
            <p className="mt-1 text-[11px] text-[#75665D]">Renders recovery infeasible in forensic labs</p>
          </div>

          <div className="rounded-2xl border border-[#DDD1C3] bg-[#EAE1D5]/20 p-4">
            <span className="text-[#75665D]">Tamper Proof</span>
            <div className="mt-1 font-manrope font-700 text-[#47372E]">SHA-256 Digital Ledger</div>
            <p className="mt-1 text-[11px] text-[#75665D]">Immutable evidence of sector entropy</p>
          </div>
        </div>
      </div>
    </div>
  )
}
