import { motion } from "framer-motion"
import { Sparkles, Recycle, ArrowRight, ShieldCheck, Factory, HeartHandshake } from "lucide-react"

export default function ReuseRecyclingSection() {
  return (
    <section className="bg-ivory-secondary py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-16 max-w-2xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px w-10 bg-terracotta" />
            <span className="font-dm-sans text-xs font-600 tracking-widest text-terracotta uppercase">
              Circular Economy In Action
            </span>
          </div>
          <h2 className="mb-4 font-manrope text-3xl font-800 tracking-tight text-warm-brown sm:text-4xl lg:text-5xl">
            From Waste to Resource: Two Responsible Paths
          </h2>
          <p className="font-dm-sans text-lg text-warm-brown-muted">
            We prioritize extending device longevity first. When a device cannot be revitalized, its valuable materials are recovered with certified partners.
          </p>
        </div>

        {/* Two-Column Asymmetrical Feature Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Column 1: Ethical Reuse & Resale */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-between rounded-2xl border border-taupe/40 bg-white-card p-8 lg:p-10 shadow-warm-sm hover:shadow-warm transition-shadow duration-300"
          >
            <div>
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-terracotta/10 text-terracotta">
                <Sparkles className="h-7 w-7" />
              </div>

              <div className="mb-3 inline-block rounded-full bg-terracotta/10 px-3 py-1 text-xs font-semibold text-terracotta font-dm-sans">
                Path A &middot; Device Life Extension
              </div>

              <h3 className="mb-4 font-manrope text-2xl font-800 text-warm-brown">
                Refurbished Marketplace & Digital Inclusion
              </h3>

              <p className="mb-6 font-dm-sans text-base leading-relaxed text-warm-brown-muted">
                Electronics that pass full diagnostics and data sanitization are given a second life. We never list devices unless sanitization is 100% verified.
              </p>

              <div className="space-y-4 border-t border-taupe/20 pt-6">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-terracotta mt-0.5" />
                  <div>
                    <h4 className="font-manrope text-sm font-700 text-warm-brown">
                      Guaranteed Data-Free
                    </h4>
                    <p className="font-dm-sans text-xs text-warm-brown-muted">
                      No device is resold with prior customer data intact. Verification certificate linked to every unit.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <HeartHandshake className="h-5 w-5 shrink-0 text-copper mt-0.5" />
                  <div>
                    <h4 className="font-manrope text-sm font-700 text-warm-brown">
                      Accessible Technology
                    </h4>
                    <p className="font-dm-sans text-xs text-warm-brown-muted">
                      Certified refurbished laptops and devices made available to students and small organizations.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-taupe/20">
              <a
                href="#marketplace"
                className="inline-flex items-center gap-2 font-dm-sans text-sm font-700 text-terracotta transition-colors hover:text-terracotta-dark"
              >
                Browse verified inventory preview
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </motion.div>

          {/* Column 2: Authorized Material Recycling */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-between rounded-2xl border border-taupe/40 bg-white-card p-8 lg:p-10 shadow-warm-sm hover:shadow-warm transition-shadow duration-300"
          >
            <div>
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-copper/10 text-copper">
                <Recycle className="h-7 w-7" />
              </div>

              <div className="mb-3 inline-block rounded-full bg-copper/10 px-3 py-1 text-xs font-semibold text-copper font-dm-sans">
                Path B &middot; Circular Recycling
              </div>

              <h3 className="mb-4 font-manrope text-2xl font-800 text-warm-brown">
                Certified E-Waste & Precious Metals Recovery
              </h3>

              <p className="mb-6 font-dm-sans text-base leading-relaxed text-warm-brown-muted">
                Broken or obsolete hardware that cannot be safely repurposed is transferred to government-authorized recycling partners adhering to state and national pollution control norms.
              </p>

              <div className="space-y-4 border-t border-taupe/20 pt-6">
                <div className="flex items-start gap-3">
                  <Factory className="h-5 w-5 shrink-0 text-copper mt-0.5" />
                  <div>
                    <h4 className="font-manrope text-sm font-700 text-warm-brown">
                      Zero-Landfill Commitment
                    </h4>
                    <p className="font-dm-sans text-xs text-warm-brown-muted">
                      Precious metals (copper, gold, silver) and rare earth elements are reclaimed through closed-loop smelting.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-terracotta mt-0.5" />
                  <div>
                    <h4 className="font-manrope text-sm font-700 text-warm-brown">
                      Hazardous Substance Safety
                    </h4>
                    <p className="font-dm-sans text-xs text-warm-brown-muted">
                      Toxic materials like lead, cadmium, and battery electrolytes are neutralized in authorized facilities.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-taupe/20">
              <a
                href="#partners"
                className="inline-flex items-center gap-2 font-dm-sans text-sm font-700 text-copper transition-colors hover:text-copper-dark"
              >
                Learn about recycling partner standards
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

