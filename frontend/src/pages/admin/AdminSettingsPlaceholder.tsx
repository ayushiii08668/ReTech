import React from "react"
import { Settings, ShieldCheck, Key } from "lucide-react"

export default function AdminSettingsPlaceholder() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-manrope text-2xl font-800 tracking-tight text-[#47372E] sm:text-3xl">
          Platform Governance &amp; Security Settings
        </h1>
        <p className="mt-1 font-dm-sans text-xs text-[#75665D]">
          Operational parameters, role policies, and system diagnostics.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-6 shadow-warm-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-manrope text-sm font-800 text-[#47372E]">
                Role-Based Access Control
              </h3>
              <p className="font-dm-sans text-[11px] text-[#75665D]">Enforced via backend JWT middleware</p>
            </div>
          </div>
          <p className="font-dm-sans text-xs text-[#75665D] leading-relaxed">
            Strict separation between CUSTOMER and ADMIN privileges. Customers can never access another customer's device or admin management routes.
          </p>
        </div>

        <div className="rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-6 shadow-warm-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAE1D5] text-[#47372E]">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-manrope text-sm font-800 text-[#47372E]">
                Local Agent Pairing Security
              </h3>
              <p className="font-dm-sans text-[11px] text-[#75665D]">Configured for Phase 6</p>
            </div>
          </div>
          <p className="font-dm-sans text-xs text-[#75665D] leading-relaxed">
            Python sanitization agents establish authenticated outbound sessions to the ReTech backend without exposing open public ports.
          </p>
        </div>
      </div>
    </div>
  )
}

