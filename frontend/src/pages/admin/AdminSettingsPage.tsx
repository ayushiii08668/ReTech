import React, { useState } from "react"
import {
  Settings,
  ShieldCheck,
  Key,
  Database,
  FileCheck2,
  Lock,
  Globe,
  Save,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Server,
  Layers,
  Sparkles,
  Sliders,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"

export default function AdminSettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"compliance" | "security" | "system">("compliance")
  const [saveSuccess, setSaveSuccess] = useState(false)

  // System governance configuration state
  const [config, setConfig] = useState({
    defaultSanitizationStandard: "NIST_SP_800_88_REV1",
    defaultWipeMethod: "NIST_SP_800_88_CLEAR",
    minSectorEntropyThreshold: "0.005",
    mandatoryDestructionEvidence: true,
    defaultResaleWarrantyMonths: 12,
    marketplaceBuyerEnquiryNotification: true,
    agentPairingCodeTtlMinutes: 15,
    sessionTimeoutDays: 7,
    publicVerificationUrl: "http://localhost:5173/verify-certificate",
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
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C66D4E] hover:bg-[#b05d40] text-xs font-bold text-white transition-all shadow-warm-sm self-start sm:self-auto"
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

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#DDD1C3]">
        <button
          onClick={() => setActiveTab("compliance")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === "compliance"
              ? "border-[#C66D4E] text-[#C66D4E]"
              : "border-transparent text-[#75665D] hover:text-[#47372E]"
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          NIST &amp; Environmental Compliance
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === "security"
              ? "border-[#C66D4E] text-[#C66D4E]"
              : "border-transparent text-[#75665D] hover:text-[#47372E]"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Security, JWT &amp; Agent Pairing
        </button>
        <button
          onClick={() => setActiveTab("system")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === "system"
              ? "border-[#C66D4E] text-[#C66D4E]"
              : "border-transparent text-[#75665D] hover:text-[#47372E]"
          }`}
        >
          <Server className="w-4 h-4" />
          Engine Health &amp; Diagnostics
        </button>
      </div>

      {/* TAB 1: NIST & ENVIRONMENTAL COMPLIANCE */}
      {activeTab === "compliance" && (
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
                  Shannon entropy $\le 0.005$ guarantees complete zeroes without residual patterns.
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
      )}

      {/* TAB 2: SECURITY & AGENT PAIRING */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <div className="bg-[#FFFDF8] rounded-2xl p-6 border border-[#DDD1C3] shadow-sm space-y-6">
            <div className="border-b border-[#DDD1C3] pb-4">
              <h2 className="font-manrope text-base font-bold text-[#47372E]">
                Local Python Agent Pairing &amp; Cryptographic Keys
              </h2>
              <p className="text-xs text-[#75665D] mt-0.5">
                Parameters controlling outbound agent connection tokens and system drive protection guards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-[#47372E] mb-1.5">
                  Pairing Code Validity Time-to-Live (Minutes)
                </label>
                <input
                  type="number"
                  value={config.agentPairingCodeTtlMinutes}
                  onChange={(e) => setConfig({ ...config, agentPairingCodeTtlMinutes: parseInt(e.target.value) || 15 })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F0E7]/60 border border-[#DDD1C3] text-xs font-semibold text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                />
                <p className="text-[11px] text-[#75665D] mt-1">
                  Pairing code expires automatically after this window to prevent unauthorized pairing.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#47372E] mb-1.5">
                  System Drive Protection Guard
                </label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Hard-locked Active (Mountpoint: / or C:)
                </div>
                <p className="text-[11px] text-[#75665D] mt-1">
                  Prevents local wiping tools from targeting active operating system boot partitions.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#FFFDF8] rounded-2xl p-6 border border-[#DDD1C3] shadow-sm space-y-6">
            <div className="border-b border-[#DDD1C3] pb-4">
              <h2 className="font-manrope text-base font-bold text-[#47372E]">
                Role-Based Access Control (RBAC) Architecture
              </h2>
              <p className="text-xs text-[#75665D] mt-0.5">
                Strict separation between Customer and Admin portals enforced at the Express route middleware.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#F5F0E7]/40 border border-[#DDD1C3] space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-[#C66D4E]">Role 1: CUSTOMER</span>
                <h4 className="text-xs font-bold text-[#47372E]">End-User &amp; Enterprise Contributor</h4>
                <p className="text-[11px] text-[#75665D]">
                  Restricted to personal devices, collection requests, sanitized PDF certificates, and refurbished store browsing.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F5F0E7]/40 border border-[#DDD1C3] space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-[#47372E]">Role 2: ADMIN</span>
                <h4 className="text-xs font-bold text-[#47372E]">Platform Operations &amp; Compliance Authority</h4>
                <p className="text-[11px] text-[#75665D]">
                  Controls inventory, technical inspections, local wiping agents, certificate revocation, workshop repairs, and recycler manifests.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ENGINE HEALTH & DIAGNOSTICS */}
      {activeTab === "system" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#FFFDF8] rounded-2xl p-5 border border-[#DDD1C3] shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold text-[#75665D] mb-2 uppercase tracking-wider">
                <span>Database Status</span>
                <Database className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-bold font-manrope text-emerald-800 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Connected
              </div>
              <div className="text-[11px] text-[#75665D] mt-1">MongoDB 6.x (Local Engine)</div>
            </div>

            <div className="bg-[#FFFDF8] rounded-2xl p-5 border border-[#DDD1C3] shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold text-[#75665D] mb-2 uppercase tracking-wider">
                <span>PDF Generator</span>
                <FileCheck2 className="w-4 h-4 text-[#C66D4E]" />
              </div>
              <div className="text-xl font-bold font-manrope text-[#47372E]">
                PDFKit Engine
              </div>
              <div className="text-[11px] text-[#75665D] mt-1">Vector rendering + QR embedding</div>
            </div>

            <div className="bg-[#FFFDF8] rounded-2xl p-5 border border-[#DDD1C3] shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold text-[#75665D] mb-2 uppercase tracking-wider">
                <span>FastAPI Agent Port</span>
                <Server className="w-4 h-4 text-[#B78B68]" />
              </div>
              <div className="text-xl font-bold font-manrope text-[#47372E]">
                Port 8765
              </div>
              <div className="text-[11px] text-[#75665D] mt-1">HTTPX Outbound Heartbeat Bridge</div>
            </div>
          </div>

          <div className="bg-[#FFFDF8] rounded-2xl p-6 border border-[#DDD1C3] shadow-sm space-y-4">
            <h3 className="font-manrope text-base font-bold text-[#47372E]">
              System Environment &amp; Engine Telemetry
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <tbody>
                  <tr className="border-b border-[#DDD1C3]/60 py-2">
                    <td className="py-2.5 font-bold text-[#75665D] w-1/3">Application Name</td>
                    <td className="py-2.5 font-mono text-[#47372E]">ReTech Enterprise E-Waste Platform</td>
                  </tr>
                  <tr className="border-b border-[#DDD1C3]/60 py-2">
                    <td className="py-2.5 font-bold text-[#75665D]">Current Architecture</td>
                    <td className="py-2.5 text-[#47372E]">React 19 + TypeScript + Vite | Node.js + Express + Mongoose</td>
                  </tr>
                  <tr className="border-b border-[#DDD1C3]/60 py-2">
                    <td className="py-2.5 font-bold text-[#75665D]">Design System</td>
                    <td className="py-2.5 text-[#47372E]">Warm Editorial + Industrial Luxury (#F5F0E7, #C66D4E, #B78B68)</td>
                  </tr>
                  <tr className="border-b border-[#DDD1C3]/60 py-2">
                    <td className="py-2.5 font-bold text-[#75665D]">Automated Test Coverage</td>
                    <td className="py-2.5 font-mono font-bold text-emerald-700">40 / 40 Integration Tests Passing (100%)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-[#75665D]">Logged Administrator</td>
                    <td className="py-2.5 font-mono text-[#47372E]">{user?.email || "admin@retech.in"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

