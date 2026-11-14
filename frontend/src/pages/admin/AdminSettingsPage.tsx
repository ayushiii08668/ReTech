import React, { useState } from "react"
import {
  Settings,
  FileCheck2,
  Save,
  CheckCircle2,
} from "lucide-react"

export default function AdminSettingsPage() {
  const [saveSuccess, setSaveSuccess] = useState(false)

  // System governance configuration state
  const [config, setConfig] = useState({
    defaultSanitizationStandard: "NIST_SP_800_88_REV1",
    defaultWipeMethod: "NIST_SP_800_88_CLEAR",
    minSectorEntropyThreshold: "0.005",
    mandatoryDestructionEvidence: true,
    defaultResaleWarrantyMonths: 12,
    marketplaceBuyerEnquiryNotification: true,
    publicVerificationUrl: "https://re-tech2.vercel.app/verify-certificate",
    regulatoryFramework: "CPCB E-Waste (Management) Rules 2022 & R2v3 Standard",
    auditRetentionDays: 365,
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3500)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 font-dm-sans text-[#47372E]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#B78B68] mb-1">
            <Settings className="w-4 h-4 text-[#C66D4E]" />
            <span>Platform Governance &amp; Policy Control</span>
          </div>
          <h1 className="font-manrope text-3xl font-extrabold text-[#47372E] tracking-tight">
            System Settings &amp; Compliance Policy
          </h1>
          <p className="mt-1 text-xs text-[#75665D]">
            Global operational standards, cryptographic policies, and circular economy governance rules.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C66D4E] hover:bg-[#b05d40] text-xs font-bold text-white transition-all shadow-warm-sm self-start sm:self-auto cursor-pointer"
        >
          <Save className="w-4 h-4" />
          Save Global Policies
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          System policies and compliance parameters updated successfully.
        </div>
      )}

      {/* Category Tab Indicator */}
      <div className="flex items-center gap-2 border-b border-[#DDD1C3]">
        <div className="flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 border-[#C66D4E] text-[#C66D4E]">
          <FileCheck2 className="w-4 h-4" />
          NIST &amp; Environmental Compliance
        </div>
      </div>

      {/* NIST & ENVIRONMENTAL COMPLIANCE */}
      <div className="space-y-6">
        <div className="bg-[#FFFDF8] rounded-2xl p-6 border border-[#DDD1C3] shadow-sm space-y-6">
          <div className="border-b border-[#DDD1C3] pb-4">
            <h2 className="font-manrope text-base font-bold text-[#47372E]">
              Data Sanitization &amp; Certificate Standards
            </h2>
            <p className="text-xs text-[#75665D] mt-0.5">
              Configure default parameters applied to sanitization jobs and cryptographic certificates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[#47372E] mb-1.5">
                Default Sanitization Standard
              </label>
              <select
                value={config.defaultSanitizationStandard}
                onChange={(e) => setConfig({ ...config, defaultSanitizationStandard: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F0E7]/60 border border-[#DDD1C3] text-xs font-semibold text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
              >
                <option value="NIST_SP_800_88_REV1">NIST SP 800-88 Rev 1 (Industry Standard)</option>
                <option value="DoD_5220_22_M">DoD 5220.22-M (3-Pass Military Wipe)</option>
                <option value="IEEE_2883_2022">IEEE 2883-2022 (Modern NVMe Standard)</option>
                <option value="BSI_GS">BSI-GS IT-Grundschutz (European Standard)</option>
              </select>
              <p className="text-[11px] text-[#75665D] mt-1">
                Enforces sector-level zero overwrites or secure cryptographic NVMe purge.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#47372E] mb-1.5">
                Default Sanitization Method
              </label>
              <select
                value={config.defaultWipeMethod}
                onChange={(e) => setConfig({ ...config, defaultWipeMethod: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F0E7]/60 border border-[#DDD1C3] text-xs font-semibold text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
              >
                <option value="NIST_SP_800_88_CLEAR">NIST Clear (Single-pass pseudo-random overwrite)</option>
                <option value="NIST_SP_800_88_PURGE">NIST Purge (Firmware-level cryptographic purge)</option>
                <option value="ATA_SECURE_ERASE">ATA Secure Erase (Hardware controller erase)</option>
                <option value="NVME_SANITIZE">NVMe Sanitize (Cryptographic Erase)</option>
              </select>
              <p className="text-[11px] text-[#75665D] mt-1">
                Automatically proposed when creating sanitization jobs.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#47372E] mb-1.5">
                Maximum Allowable Entropy Score
              </label>
              <input
                type="text"
                value={config.minSectorEntropyThreshold}
                onChange={(e) => setConfig({ ...config, minSectorEntropyThreshold: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F0E7]/60 border border-[#DDD1C3] text-xs font-semibold text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
              />
              <p className="text-[11px] text-[#75665D] mt-1">
                Shannon entropy &le; 0.005 guarantees complete zeroes without residual patterns.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#47372E] mb-1.5">
                Public Certificate Verification Base URL
              </label>
              <input
                type="text"
                value={config.publicVerificationUrl}
                onChange={(e) => setConfig({ ...config, publicVerificationUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F0E7]/60 border border-[#DDD1C3] text-xs font-semibold text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
              />
              <p className="text-[11px] text-[#75665D] mt-1">
                Embedded into QR codes rendered on official PDF certificates.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#FFFDF8] rounded-2xl p-6 border border-[#DDD1C3] shadow-sm space-y-6">
          <div className="border-b border-[#DDD1C3] pb-4">
            <h2 className="font-manrope text-base font-bold text-[#47372E]">
              Circular Economy &amp; Marketplace Resale Governance
            </h2>
            <p className="text-xs text-[#75665D] mt-0.5">
              Policy controls for refurbished hardware warranty and recycling compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[#47372E] mb-1.5">
                Statutory Regulatory Framework Reference
              </label>
              <input
                type="text"
                value={config.regulatoryFramework}
                onChange={(e) => setConfig({ ...config, regulatoryFramework: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F0E7]/60 border border-[#DDD1C3] text-xs font-semibold text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
              />
              <p className="text-[11px] text-[#75665D] mt-1">
                Printed on hazardous waste transfer manifests and audit logs.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#47372E] mb-1.5">
                Default Refurbished Resale Warranty (Months)
              </label>
              <input
                type="number"
                value={config.defaultResaleWarrantyMonths}
                onChange={(e) => setConfig({ ...config, defaultResaleWarrantyMonths: parseInt(e.target.value) || 12 })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F0E7]/60 border border-[#DDD1C3] text-xs font-semibold text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
              />
              <p className="text-[11px] text-[#75665D] mt-1">
                Default warranty duration displayed on customer store listings.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.mandatoryDestructionEvidence}
                onChange={(e) => setConfig({ ...config, mandatoryDestructionEvidence: e.target.checked })}
                className="mt-0.5 h-4 w-4 rounded border-[#DDD1C3] text-[#C66D4E] focus:ring-[#C66D4E]"
              />
              <div>
                <div className="text-xs font-bold text-[#47372E]">
                  Mandatory Destruction Evidence Enforcement (Statutory Policy)
                </div>
                <div className="text-[11px] text-[#75665D]">
                  Strictly prevents recycling records from being marked as RECYCLED without an authorized partner certificate reference or smelting manifest ID.
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
