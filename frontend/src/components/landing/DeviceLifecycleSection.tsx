import { motion } from "framer-motion"
import {
  Truck,
  CheckCircle,
  Microscope,
  HardDriveDownload,
  FileCheck2,
  RefreshCw,
  ArrowRight,
} from "lucide-react"

const stages = [
  {
    step: "01",
    title: "Pickup Requested",
    description: "Customer registers hardware with detailed condition, specs, and photos.",
    icon: Truck,
  },
  {
    step: "02",
    title: "Collection Confirmed",
    description: "Secure chain-of-custody pickup executed by verified collection teams.",
    icon: CheckCircle,
  },
  {
    step: "03",
    title: "Technical Inspection",
    description: "Multi-point diagnostic to evaluate component health and operational integrity.",
    icon: Microscope,
  },
  {
    step: "04",
    title: "Data Sanitization",
    description: "Local execution of NIST SP 800-88 compliant storage clearing or purging.",
    icon: HardDriveDownload,
  },
  {
    step: "05",
    title: "Verification & Audit",
    description: "Cryptographic confirmation and digital erasure certificate generation.",
    icon: FileCheck2,
  },
  {
    step: "06",
    title: "Final Destination",
    description: "Classified into Category A (Reuse), B (Refurbish), or C/D (Authorized Recycler).",
    icon: RefreshCw,
  },
]

export default function DeviceLifecycleSection() {
  return (
    <section className="bg-ivory py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2">
            <div className="h-px w-8 bg-copper" />
            <span className="font-dm-sans text-xs font-600 tracking-wider text-copper uppercase">
              End-To-End Traceability
            </span>
            <div className="h-px w-8 bg-copper" />
          </div>

          <h2 className="mb-4 font-manrope text-3xl font-800 tracking-tight text-warm-brown sm:text-4xl lg:text-5xl">
            Device Lifecycle Visualization
          </h2>

          <p className="font-dm-sans text-lg text-warm-brown-muted">
            From doorstep collection to certified repurposing, follow the complete journey every device takes through the ReTech platform.
          </p>
        </div>

        {/* Process Flow Cards */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {stages.map((stage, idx) => (
            <motion.div
              key={stage.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="relative flex flex-col justify-between rounded-xl border border-taupe/40 bg-white-card p-5 shadow-warm-sm transition-all duration-300 hover:-translate-y-1 hover:border-terracotta/40 hover:shadow-warm"
            >
              {/* Top row */}
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-manrope text-xs font-800 text-terracotta/60">
                    STAGE {stage.step}
                  </span>
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-terracotta/10 text-terracotta">
                    <stage.icon className="h-4 w-4" />
                  </div>
                </div>

                <h3 className="mb-2 font-manrope text-base font-700 text-warm-brown">
                  {stage.title}
                </h3>

                <p className="font-dm-sans text-xs leading-relaxed text-warm-brown-muted">
                  {stage.description}
                </p>
              </div>

              {/* Arrow indicator for desktop flow */}
              {idx < stages.length - 1 && (
                <div className="mt-4 hidden xl:flex items-center text-taupe/80">
                  <span className="text-[10px] uppercase font-600 text-taupe mr-1">Next</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Internal Classification Grade Explainer */}
        <div className="mt-16 rounded-2xl border border-taupe/40 bg-ivory-secondary p-8 lg:p-10">
          <h3 className="font-manrope text-xl font-700 text-warm-brown mb-2">
            ReTech Internal Classification Standards
          </h3>
          <p className="font-dm-sans text-sm text-warm-brown-muted mb-6">
            Devices are categorized post-inspection to maximize environmental utility while maintaining strict data safety.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-taupe/30 bg-white-card p-4">
              <div className="inline-block rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-xs font-700 font-manrope mb-2">
                Grade A &middot; Reusable
              </div>
              <p className="font-dm-sans text-xs text-warm-brown-body">
                Fully functional hardware prepared for ethical resale and digital inclusion initiatives.
              </p>
            </div>

            <div className="rounded-xl border border-taupe/30 bg-white-card p-4">
              <div className="inline-block rounded-md bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 text-xs font-700 font-manrope mb-2">
                Grade B &middot; Refurbishment
              </div>
              <p className="font-dm-sans text-xs text-warm-brown-body">
                Requires component servicing or repair by certified professional refurbishing partners.
              </p>
            </div>

            <div className="rounded-xl border border-taupe/30 bg-white-card p-4">
              <div className="inline-block rounded-md bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 text-xs font-700 font-manrope mb-2">
                Grade C &middot; Material Recovery
              </div>
              <p className="font-dm-sans text-xs text-warm-brown-body">
                Non-reusable electronics transferred to authorized R2/e-Stewards recycling partners.
              </p>
            </div>

            <div className="rounded-xl border border-taupe/30 bg-white-card p-4">
              <div className="inline-block rounded-md bg-red-50 text-red-800 border border-red-200 px-2.5 py-0.5 text-xs font-700 font-manrope mb-2">
                Grade D &middot; Special Handling
              </div>
              <p className="font-dm-sans text-xs text-warm-brown-body">
                Damaged batteries or hazardous materials handled under rigorous environmental protocols.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

