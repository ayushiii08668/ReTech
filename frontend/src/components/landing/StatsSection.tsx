import { motion } from "framer-motion"
import { AlertCircle } from "lucide-react"

const stats = [
  {
    value: "10,000+",
    label: "Devices Collected",
    subtext: "E-waste diverted from municipal landfills",
  },
  {
    value: "8,500+",
    label: "Sanitizations Completed",
    subtext: "NIST SP 800-88 verified data wipes",
  },
  {
    value: "3,200+",
    label: "Devices Reused",
    subtext: "Given a second life in students' hands",
  },
  {
    value: "99.7%",
    label: "Verification Success Rate",
    subtext: "Verified sector-level data erasure audit",
  },
]

export default function StatsSection() {
  return (
    <section className="border-y border-taupe/30 bg-ivory py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-12 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <span className="font-dm-sans text-xs font-600 tracking-wider text-copper uppercase">
              Demonstrated Impact
            </span>
            <h2 className="mt-1 font-manrope text-2xl font-800 text-warm-brown sm:text-3xl">
              Scalable Sustainability Metrics
            </h2>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-lg border border-taupe/40 bg-taupe-surface/60 px-3 py-1.5 text-xs text-warm-brown-muted font-dm-sans">
            <AlertCircle className="h-3.5 w-3.5 text-terracotta" />
            <span>Sample figures for platform demonstration</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="relative rounded-2xl border border-taupe/40 bg-white-card p-6 shadow-warm-sm transition-all duration-300 hover:border-terracotta/40 hover:shadow-warm"
            >
              <div className="font-manrope text-4xl font-800 text-terracotta sm:text-5xl">
                {stat.value}
              </div>
              <div className="mt-2 font-manrope text-base font-700 text-warm-brown">
                {stat.label}
              </div>
              <p className="mt-1 font-dm-sans text-xs text-warm-brown-muted">
                {stat.subtext}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

