import { motion } from "framer-motion"
import { ShieldCheck, FileCheck, Eye, Lock, CheckCircle2 } from "lucide-react"

const features = [
  {
    icon: ShieldCheck,
    title: "NIST SP 800-88 Aligned",
    description:
      "We implement industry-standard media sanitization protocols tailored to target storage media, from HDDs to modern NVMe SSDs.",
    badge: "Standards Compliant",
  },
  {
    icon: FileCheck,
    title: "Cryptographic Verification",
    description:
      "Every sanitization job generates verifiable evidence. Completed operations receive a tamper-evident digital certificate.",
    badge: "Auditable Proof",
  },
  {
    icon: Eye,
    title: "End-to-End Transparency",
    description:
      "Track your hardware through every milestone. Real-time status updates without disclosing confidential hardware diagnostics.",
    badge: "Chain of Custody",
  },
]

const guarantees = [
  "Zero data recovery possibility on verified drives",
  "Hardware-level secure erase for SSDs & flash media",
  "Dedicated local sanitization environment",
  "Immutable audit trail & verification reports",
]

export default function DataProtectionSection() {
  return (
    <section id="data-protection" className="relative bg-dark-brown py-24 text-white lg:py-32">
      {/* Subtle background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-terracotta/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-copper/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-copper/40 bg-copper/10 px-4 py-1.5">
            <Lock className="h-3.5 w-3.5 text-copper-light" />
            <span className="font-dm-sans text-xs font-600 tracking-wider text-copper-light uppercase">
              Data Sovereignty & Security
            </span>
          </div>

          <h2 className="mb-6 font-manrope text-3xl font-800 tracking-tight text-white sm:text-4xl lg:text-5xl">
            Your Confidential Data. <br />
            <span className="text-terracotta-light">Irrecoverably Sanitized.</span>
          </h2>

          <p className="font-dm-sans text-lg leading-relaxed text-taupe/90">
            Before a single device is repurposed or recycled, every storage drive undergoes strict, software-based sanitization adhering to NIST SP 800-88 guidelines.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.6 }}
              className="group relative rounded-2xl border border-taupe/20 bg-dark-surface/60 p-8 backdrop-blur-sm transition-all duration-300 hover:border-terracotta/40 hover:bg-dark-surface/90"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-terracotta/20 text-terracotta-light transition-transform duration-300 group-hover:scale-105">
                  <feature.icon className="h-6 w-6" />
                </div>
                <span className="rounded-full border border-taupe/20 px-3 py-1 font-dm-sans text-xs text-taupe">
                  {feature.badge}
                </span>
              </div>

              <h3 className="mb-3 font-manrope text-xl font-700 text-white">
                {feature.title}
              </h3>

              <p className="font-dm-sans text-sm leading-relaxed text-taupe/80">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Compliance highlight box */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-12 rounded-2xl border border-taupe/20 bg-dark-surface/40 p-8 sm:p-10"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h4 className="font-manrope text-lg font-700 text-white sm:text-xl">
                The ReTech Sanitization Protocol
              </h4>
              <p className="mt-2 font-dm-sans text-sm leading-relaxed text-taupe/80">
                We never simulate data erasure in production. Every drive is matched with its verified hardware architecture and confirmed through automated sector verification before any certificate is issued.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {guarantees.map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-terracotta-light" />
                  <span className="font-dm-sans text-xs text-taupe font-500">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

