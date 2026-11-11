import React from "react"
import { Link } from "react-router-dom"
import { HelpCircle, Mail, Phone, MapPin, ShieldCheck, FileQuestion } from "lucide-react"

export default function HelpSupportPage() {
  const faqs = [
    {
      q: "How does ReTech ensure my confidential files are not recoverable?",
      a: "We execute software-based sanitization complying with NIST SP 800-88 standards. Storage drives are overwritten or cryptographically purged, followed by 100% full sector readback verification.",
    },
    {
      q: "What types of electronic devices can I submit for collection?",
      a: "We accept laptops, desktops, tablets, smartphones, monitors, network routers, printers, hard disk drives, SSDs, and bulk peripherals.",
    },
    {
      q: "Can I cancel a pickup request after booking?",
      a: "Yes, you can cancel any pending or scheduled pickup request anytime before collection confirmation directly from your 'Track Requests' page.",
    },
    {
      q: "Is doorstep collection free of charge?",
      a: "Yes, standard residential and enterprise pickups within our serviceable metropolitan areas are completely free as part of our circular sustainability pledge.",
    },
  ]

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Link to="/dashboard" className="font-dm-sans text-xs text-[#75665D] hover:underline">
            Dashboard
          </Link>
          <span className="text-xs text-[#DDD1C3]">&gt;</span>
          <span className="font-dm-sans text-xs font-600 text-[#C66D4E]">
            Help &amp; Support
          </span>
        </div>
        <h1 className="font-manrope text-2xl font-800 tracking-tight text-[#47372E] sm:text-3xl">
          Help &amp; Support Center
        </h1>
        <p className="mt-1 font-dm-sans text-xs text-[#75665D]">
          Frequently asked questions, collection logistics support, and customer service contacts.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#DDD1C3] bg-[#FFFDF8] p-5 shadow-warm-sm flex items-start gap-3">
          <Mail className="h-5 w-5 text-[#C66D4E] shrink-0" />
          <div>
            <div className="font-manrope text-xs font-700 text-[#47372E]">Direct Support Email</div>
            <div className="mt-0.5 font-dm-sans text-xs text-[#75665D]">support@retech.in</div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#DDD1C3] bg-[#FFFDF8] p-5 shadow-warm-sm flex items-start gap-3">
          <Phone className="h-5 w-5 text-[#C66D4E] shrink-0" />
          <div>
            <div className="font-manrope text-xs font-700 text-[#47372E]">Toll-Free Helpline</div>
            <div className="mt-0.5 font-dm-sans text-xs text-[#75665D]">+91 (080) 4120-RETECH</div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#DDD1C3] bg-[#FFFDF8] p-5 shadow-warm-sm flex items-start gap-3">
          <MapPin className="h-5 w-5 text-[#C66D4E] shrink-0" />
          <div>
            <div className="font-manrope text-xs font-700 text-[#47372E]">Operational Hubs</div>
            <div className="mt-0.5 font-dm-sans text-xs text-[#75665D]">Bengaluru, Mumbai, Delhi</div>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-6 shadow-warm-sm sm:p-8 space-y-4">
        <div className="flex items-center gap-2 border-b border-[#DDD1C3] pb-3 mb-2">
          <FileQuestion className="h-4 w-4 text-[#C66D4E]" />
          <h3 className="font-manrope text-base font-800 text-[#47372E]">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-4 divide-y divide-[#DDD1C3]/60">
          {faFAQs}
        </div>
      </div>
    </div>
  )
}

const faFAQs = [
  {
    q: "How does ReTech ensure my confidential files are not recoverable?",
    a: "We execute software-based sanitization complying with NIST SP 800-88 standards. Storage drives are overwritten or cryptographically purged, followed by 100% full sector readback verification.",
  },
  {
    q: "What types of electronic devices can I submit for collection?",
    a: "We accept laptops, desktops, tablets, smartphones, monitors, network routers, printers, hard disk drives, SSDs, and bulk peripherals.",
  },
  {
    q: "Can I cancel a pickup request after booking?",
    a: "Yes, you can cancel any pending or scheduled pickup request anytime before collection confirmation directly from your 'Track Requests' page.",
  },
  {
    q: "Is doorstep collection free of charge?",
    a: "Yes, standard residential and enterprise pickups within our serviceable metropolitan areas are completely free as part of our circular sustainability pledge.",
  },
].map((faq, i) => (
  <div key={i} className={`pt-3 ${i === 0 ? "pt-0" : ""}`}>
    <h4 className="font-manrope text-xs font-700 text-[#47372E] mb-1">{faq.q}</h4>
    <p className="font-dm-sans text-xs text-[#75665D] leading-relaxed">{faq.a}</p>
  </div>
))

