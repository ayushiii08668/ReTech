import React, { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import {
  ShieldCheck,
  ShieldAlert,
  HardDrive,
  Calendar,
  CheckCircle2,
  XCircle,
  FileText,
  Lock,
  ArrowLeft,
  ExternalLink,
} from "lucide-react"
import { phase4Service } from "@/services/phase4Service"

export default function VerifyCertificatePage() {
  const { verificationId } = useParams<{ verificationId: string }>()
  const [loading, setLoading] = useState(true)
  const [certData, setCertData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!verificationId) {
      setError("No certificate verification identifier provided.")
      setLoading(false)
      return
    }

    const fetchVerification = async () => {
      setLoading(true)
      try {
        const data = await phase4Service.publicVerifyCertificate(verificationId)
        setCertData(data)
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            "Unable to verify certificate. The verification ID may be invalid or does not exist."
        )
      } finally {
        setLoading(false)
      }
    }

    fetchVerification()
  }, [verificationId])

  return (
    <div className="min-h-screen bg-[#F5F0E7] text-[#47372E] selection:bg-[#C66D4E]/20 selection:text-[#C66D4E]">
      {/* Top Brand Bar */}
      <header className="border-b border-[#DDD1C3] bg-[#FFFDF8] px-6 py-4 shadow-warm-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-manrope text-xl font-800 tracking-tight text-[#C66D4E]">
              RETECH
            </span>
            <span className="font-dm-sans text-xs font-600 text-[#75665D]">
              | Public Certificate Audit Registry
            </span>
          </Link>
          <Link
            to="/login"
            className="rounded-xl border border-[#DDD1C3] bg-[#FAF7F2] px-3.5 py-1.5 font-dm-sans text-xs font-700 text-[#47372E] hover:bg-[#EAE1D5] transition-all"
          >
            Portal Login
          </Link>
        </div>
      </header>

      {/* Main Verification Container */}
      <main className="mx-auto max-w-3xl px-4 py-12">
        {loading ? (
          <div className="rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-12 text-center shadow-warm-md">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[#C66D4E] border-t-transparent" />
            <h2 className="font-manrope text-base font-800 text-[#47372E]">
              Querying ReTech Cryptographic Ledger...
            </h2>
            <p className="mt-1 font-dm-sans text-xs text-[#75665D]">
              Validating SHA-256 evidence fingerprint and certificate revocation status.
            </p>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-200 bg-[#FFFDF8] p-10 text-center shadow-warm-md space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-700 border border-rose-200">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <h2 className="font-manrope text-xl font-800 text-rose-950">
              Verification Failed
            </h2>
            <p className="font-dm-sans text-xs text-rose-800 max-w-md mx-auto leading-relaxed">
              {error}
            </p>
            <div className="pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#47372E] px-5 py-2.5 font-dm-sans text-xs font-700 text-white hover:bg-[#362B25] transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                Return to ReTech Home
              </Link>
            </div>
          </div>
        ) : certData ? (
          <div className="rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] shadow-warm-lg overflow-hidden space-y-6">
            {/* Top Status Banner */}
            <div
              className={`p-6 border-b text-center ${
                certData.isValid
                  ? "bg-emerald-50/70 border-emerald-200"
                  : "bg-rose-50/70 border-rose-200"
              }`}
            >
              <div className="inline-flex items-center justify-center rounded-2xl p-3 mb-2 shadow-sm bg-white">
                {certData.isValid ? (
                  <ShieldCheck className="h-8 w-8 text-emerald-700" />
                ) : (
                  <ShieldAlert className="h-8 w-8 text-rose-700" />
                )}
              </div>
              <h1 className="font-manrope text-xl font-800 text-[#47372E]">
                {certData.isValid
                  ? "Authentic Sanitization Certificate"
                  : "Certificate Revoked"}
              </h1>
              <p className="mt-1 font-mono text-xs font-700 text-[#C66D4E]">
                {certData.certificateNumber}
              </p>

              {certData.isRevoked && (
                <div className="mt-3 inline-block rounded-xl bg-rose-100 border border-rose-300 px-4 py-1.5 font-dm-sans text-xs text-rose-900">
                  <span className="font-bold">Revocation Reason:</span>{" "}
                  {certData.revocationReason || "Revoked by ReTech Administrator"}
                </div>
              )}
            </div>

            {/* Certificate Audit Specifications */}
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] p-4">
                  <span className="font-dm-sans text-[11px] font-700 uppercase tracking-wider text-[#75665D]">
                    Hardware Certified
                  </span>
                  <div className="mt-1 font-manrope text-base font-800 text-[#47372E]">
                    {certData.device?.brand} {certData.device?.model}
                  </div>
                  <div className="mt-0.5 font-mono text-xs text-[#75665D]">
                    Category: {certData.device?.category} &bull; Storage:{" "}
                    {certData.device?.storageCapacity || "N/A"}{" "}
                    {certData.device?.storageType || ""}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] p-4">
                  <span className="font-dm-sans text-[11px] font-700 uppercase tracking-wider text-[#75665D]">
                    Standard Applied
                  </span>
                  <div className="mt-1 font-manrope text-base font-800 text-[#47372E]">
                    {certData.sanitizationMethod}
                  </div>
                  <div className="mt-0.5 font-dm-sans text-xs text-[#75665D]">
                    {certData.standardReference}
                  </div>
                </div>
              </div>

              {/* Cryptographic SHA-256 Fingerprint */}
              <div className="rounded-2xl bg-[#2D231E] p-5 text-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    SHA-256 Digital Verification Fingerprint:
                  </span>
                  <span className="font-mono text-[10px] text-stone-400">
                    Entropy: {certData.entropyScore?.toFixed(4) || "0.0000"} / 8.0
                  </span>
                </div>
                <div className="break-all font-mono text-xs text-stone-200 select-all bg-black/30 p-2.5 rounded-xl border border-white/10">
                  {certData.evidenceFingerprint}
                </div>
              </div>

              {/* Timestamp Audit Trail */}
              <div className="border-t border-[#DDD1C3] pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-dm-sans">
                <div>
                  <span className="text-[#75665D] block text-[11px]">
                    Operation Completed:
                  </span>
                  <span className="font-semibold text-[#47372E]">
                    {new Date(certData.operationCompletedAt).toUTCString()}
                  </span>
                </div>
                <div>
                  <span className="text-[#75665D] block text-[11px]">
                    Certificate Issue Date:
                  </span>
                  <span className="font-semibold text-[#47372E]">
                    {new Date(certData.issuedAt).toUTCString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Footer Notice */}
            <div className="border-t border-[#DDD1C3] bg-[#F5F0E7] px-8 py-4 text-center font-dm-sans text-[11px] text-[#75665D]">
              This record is published directly from the ReTech immutable cryptographic ledger. No private customer information is displayed.
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}

