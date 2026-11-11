import React from "react"
import { FileSpreadsheet } from "lucide-react"

export default function AdminReportsPlaceholder() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-manrope text-2xl font-800 tracking-tight text-[#47372E] sm:text-3xl">
          Certificates &amp; Audit Reports
        </h1>
        <p className="mt-1 font-dm-sans text-xs text-[#75665D]">
          Cryptographic PDF certificates, EPR environmental compliance filings, and disposal ledgers.
        </p>
      </div>

      <div className="rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-8 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAE1D5]/50 text-[#47372E]">
          <FileSpreadsheet className="h-7 w-7" />
        </div>
        <h3 className="font-manrope text-lg font-800 text-[#47372E]">
          Scheduled for Phase 8 Integration
        </h3>
        <p className="mx-auto max-w-lg font-dm-sans text-xs text-[#75665D] leading-relaxed">
          Tamper-resistant PDF generation powered by PDFKit and digital signatures will be fully bound to verified sanitization logs in Phase 8.
        </p>
      </div>
    </div>
  )
}

