import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
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
  Layers,
  Truck,
  Microscope,
  ExternalLink,
  X,
  FileText,
} from "lucide-react"
import { phase4Service } from "@/services/phase4Service"
import DeviceLifecycleTimeline from "@/components/dashboard/DeviceLifecycleTimeline"

export default function CustomerReportsPage() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [timelineDeviceId, setTimelineDeviceId] = useState<string | null>(null)

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true)
      try {
        const data = await phase4Service.getCustomerReports()
        setReports(data)
      } catch (err) {
        console.error("Failed to load customer reports:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [])

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Link to="/dashboard" className="font-dm-sans text-xs text-[#75665D] hover:underline">
            Dashboard
          </Link>
          <span className="text-xs text-[#DDD1C3]">&gt;</span>
          <span className="font-dm-sans text-xs font-600 text-[#C66D4E]">
            Device Reports &amp; Certificates
          </span>
        </div>
        <h1 className="font-manrope text-2xl font-800 tracking-tight text-[#47372E] sm:text-3xl">
          Device Journey &amp; Sanitization Certificates
        </h1>
        <p className="mt-1 font-dm-sans text-xs text-[#75665D]">
          Complete chain-of-custody reports, diagnostic inspection audits, and downloadable NIST SP 800-88 erasure certificates.
        </p>
      </div>

      {/* Reports List */}
      <div className="space-y-6">
        {loading ? (
          <div className="rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-12 text-center text-xs text-[#75665D]">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#C66D4E] border-t-transparent" />
            Compiling your device chain-of-custody records...
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#DDD1C3] bg-[#FFFDF8] p-12 text-center space-y-3">
            <HardDrive className="mx-auto h-10 w-10 text-[#B78B68]" />
            <h3 className="font-manrope text-base font-800 text-[#47372E]">No Device Reports Available</h3>
            <p className="font-dm-sans text-xs text-[#75665D] max-w-md mx-auto">
              Once you submit your old electronics for collection, comprehensive inspection reports and cryptographic sanitization certificates will be generated here.
            </p>
            <div className="pt-2">
              <Link
                to="/dashboard/submit"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#C66D4E] px-4 py-2 font-dm-sans text-xs font-700 text-white hover:bg-[#B55D3E]"
              >
                Schedule Device Collection
              </Link>
            </div>
          </div>
        ) : (
          reports.map((item) => {
            const dev = item.device
            const cert = item.certificate
            const san = item.sanitization
            const insp = item.inspection

            return (
              <div
                key={dev._id}
                className="rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-6 shadow-warm-sm space-y-6 hover:border-[#C66D4E]/40 transition-colors"
              >
                {/* Header bar of Device Card */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#DDD1C3] pb-4 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-700 text-[#C66D4E]">
                        {dev.deviceId}
                      </span>
                      <span className="text-[#DDD1C3]">&bull;</span>
                      <h3 className="font-manrope text-base font-800 text-[#47372E]">
                        {dev.brand} {dev.model}
                      </h3>
                      <span className="rounded-full bg-[#EAE1D5] px-2.5 py-0.5 font-mono text-[10px] font-700 text-[#47372E]">
                        {dev.category}
                      </span>
                    </div>
                    <span className="font-dm-sans text-xs text-[#75665D]">
                      Submitted on: {new Date(dev.submittedAt).toLocaleDateString()} &bull; Initial Condition: {dev.condition}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTimelineDeviceId(dev._id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#DDD1C3] bg-[#FAF7F2] px-3 py-1.5 font-dm-sans text-xs font-700 text-[#47372E] hover:bg-[#EAE1D5] transition-all"
                    >
                      <Clock className="h-3.5 w-3.5 text-[#C66D4E]" />
                      View Journey Timeline
                    </button>

                    {cert && (
                      <a
                        href={cert.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#C66D4E] px-3.5 py-1.5 font-dm-sans text-xs font-700 text-white hover:bg-[#B55D3E] shadow-warm-sm transition-all"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download Certificate (PDF)
                      </a>
                    )}
                  </div>
                </div>

                {/* 4-Column Summary Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 font-dm-sans text-xs">
                  {/* Stage 1: Intake & Pickup */}
                  <div className="rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] p-4 space-y-1">
                    <div className="flex items-center gap-1.5 font-700 text-[#47372E] mb-1">
                      <Truck className="h-3.5 w-3.5 text-[#B78B68]" />
                      Intake &amp; Collection
                    </div>
                    <div className="text-[11px] text-[#75665D]">Status:</div>
                    <div className="font-bold text-[#47372E]">
                      {item.pickup ? item.pickup.status : "Intake Recorded"}
                    </div>
                    {item.pickup?.scheduledDate && (
                      <div className="text-[10px] text-[#75665D]">
                        Scheduled: {new Date(item.pickup.scheduledDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* Stage 2: Inspection */}
                  <div className="rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] p-4 space-y-1">
                    <div className="flex items-center gap-1.5 font-700 text-[#47372E] mb-1">
                      <Microscope className="h-3.5 w-3.5 text-amber-700" />
                      Hardware Inspection
                    </div>
                    <div className="text-[11px] text-[#75665D]">Classification:</div>
                    <div className="font-bold text-[#47372E]">
                      {dev.classification ? `Grade ${dev.classification}` : "Pending"}
                    </div>
                    <div className="text-[10px] text-[#75665D]">
                      {insp?.inspectionNotes || "Diagnostic testing logged."}
                    </div>
                  </div>

                  {/* Stage 3: Sanitization & Certificate */}
                  <div className="rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] p-4 space-y-1">
                    <div className="flex items-center gap-1.5 font-700 text-[#47372E] mb-1">
                      <HardDrive className="h-3.5 w-3.5 text-emerald-700" />
                      Data Sanitization
                    </div>
                    <div className="text-[11px] text-[#75665D]">Outcome:</div>
                    <div className="font-bold text-[#47372E]">
                      {san ? (
                        san.isVerified ? (
                          <span className="text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> VERIFIED CLEAN
                          </span>
                        ) : (
                          san.status
                        )
                      ) : (
                        "Pending Assignment"
                      )}
                    </div>
                    {cert && (
                      <div className="text-[10px] font-mono text-[#C66D4E]">
                        Cert: {cert.certificateNumber}
                      </div>
                    )}
                  </div>

                  {/* Stage 4: Final Destination */}
                  <div className="rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] p-4 space-y-1">
                    <div className="flex items-center gap-1.5 font-700 text-[#47372E] mb-1">
                      <Layers className="h-3.5 w-3.5 text-[#C66D4E]" />
                      Final Destination
                    </div>
                    <div className="text-[11px] text-[#75665D]">Lifecycle Stage:</div>
                    <div className="font-bold text-[#47372E] leading-snug">
                      {item.finalDestination}
                    </div>
                  </div>
                </div>

                {/* Certificate Evidence Box (If Issued) */}
                {cert && (
                  <div className="rounded-2xl border border-emerald-300 bg-emerald-50/60 p-4 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-800" />
                        <span className="font-manrope text-xs font-800 text-emerald-950">
                          NIST SP 800-88 Cryptographic Media Sanitization Certificate
                        </span>
                      </div>
                      <Link
                        to={`/verify-certificate/${cert.verificationId}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 font-dm-sans text-xs font-700 text-emerald-800 hover:underline"
                      >
                        <span>Public Audit Registry Link</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>

                    <div className="rounded-xl bg-[#2D231E] p-2.5 text-white font-mono text-[11px] break-all">
                      <span className="text-emerald-400 block mb-0.5">SHA-256 Digital Fingerprint:</span>
                      {cert.evidenceReference}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Lifecycle Timeline Slide-Over Modal */}
      <AnimatePresence>
        {timelineDeviceId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] shadow-warm-xl overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-[#DDD1C3] px-6 py-4 bg-[#F5F0E7]">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#C66D4E]" />
                  <h3 className="font-manrope text-base font-800 text-[#47372E]">
                    Device Chain-of-Custody Timeline
                  </h3>
                </div>
                <button
                  onClick={() => setTimelineDeviceId(null)}
                  className="rounded-xl p-1 text-[#75665D] hover:bg-[#DDD1C3]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <DeviceLifecycleTimeline deviceId={timelineDeviceId} />
              </div>

              <div className="border-t border-[#DDD1C3] bg-[#F5F0E7] px-6 py-3 flex justify-end">
                <button
                  onClick={() => setTimelineDeviceId(null)}
                  className="rounded-xl bg-[#47372E] px-4 py-2 font-dm-sans text-xs font-700 text-white"
                >
                  Close Timeline
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

