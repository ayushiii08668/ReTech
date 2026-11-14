import { motion } from "framer-motion"
import { ArrowRight, ChevronDown } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

const fadeInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.15 * i, duration: 0.7, ease: "easeOut" as const },
  }),
}

const fadeInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { delay: 0.4, duration: 0.8, ease: "easeOut" as const },
  },
}

export default function HeroSection() {
  const { isAuthenticated } = useAuth()
  const pickupUrl = isAuthenticated ? "/dashboard/submit" : "/login?redirect=/dashboard/submit"

  return (
    <section className="relative min-h-[calc(100vh-80px)] bg-ivory pt-24 pb-16 lg:pb-24">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 lg:flex-row lg:gap-16 lg:px-8">
        {/* Left — Content (60%) */}
        <div className="flex flex-1 flex-col items-start lg:max-w-[60%]">
          <motion.div
            custom={0}
            variants={fadeInLeft}
            initial="hidden"
            animate="visible"
            className="mb-6 inline-flex items-center rounded-full border border-copper/30 bg-copper/5 px-4 py-1.5"
          >
            <span className="font-dm-sans text-xs font-600 tracking-wide text-copper uppercase">
              Smart E-Waste Management
            </span>
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeInLeft}
            initial="hidden"
            animate="visible"
            className="mb-6 font-manrope text-4xl leading-[1.1] font-800 tracking-tight text-warm-brown sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Give Your Old Electronics a Smarter{" "}
            <span className="text-terracotta">Second Life.</span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeInLeft}
            initial="hidden"
            animate="visible"
            className="mb-8 max-w-xl font-dm-sans text-lg leading-relaxed text-warm-brown-muted md:text-xl"
          >
            We collect your unused electronics, securely sanitize your data, and
            give devices a responsible second life — through verified reuse or
            certified recycling.
          </motion.p>

          <motion.div
            custom={3}
            variants={fadeInLeft}
            initial="hidden"
            animate="visible"
            className="mb-8 flex flex-wrap gap-4"
          >
            <a
              href={pickupUrl}
              className="group inline-flex items-center gap-2 rounded-lg bg-terracotta px-6 py-3.5 font-dm-sans text-sm font-600 text-white transition-all duration-200 hover:bg-terracotta-dark hover:-translate-y-0.5 hover:shadow-warm-md"
            >
              Schedule a Pickup
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-lg border border-taupe px-6 py-3.5 font-dm-sans text-sm font-600 text-warm-brown-body transition-all duration-200 hover:border-terracotta/50 hover:text-terracotta"
            >
              Explore How It Works
              <ChevronDown className="h-4 w-4" />
            </a>
          </motion.div>

          <motion.p
            custom={4}
            variants={fadeInLeft}
            initial="hidden"
            animate="visible"
            className="font-dm-sans text-xs text-warm-brown-placeholder"
          >
            Trusted by 500+ organizations &middot; NIST SP 800-88 compliant
            processes
          </motion.p>
        </div>

        {/* Right — Editorial Tech Composition (40%) */}
        <motion.div
          variants={fadeInRight}
          initial="hidden"
          animate="visible"
          className="relative flex w-full flex-col items-center justify-center lg:max-w-[44%]"
        >
          {/* Main Editorial Device Card */}
          <div className="relative w-full rounded-3xl border border-taupe/40 bg-white-card p-6 shadow-warm-lg transition-all duration-300 hover:shadow-warm">
            {/* Top Bar with brand manifesto */}
            <div className="mb-4 flex items-center justify-between border-b border-taupe/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-terracotta" />
                <span className="font-dm-sans text-xs font-700 tracking-wider text-warm-brown uppercase">
                  ReTech Manifesto
                </span>
              </div>
              <span className="font-dm-sans text-[11px] font-500 text-copper">
                Collect &middot; Protect &middot; Renew &middot; Reuse
              </span>
            </div>

            {/* Visual showcase frame */}
            <div className="relative overflow-hidden rounded-2xl border border-taupe/30 bg-gradient-to-br from-[#EEDFD0] via-[#E8D4C0] to-[#DFBA98] p-6 sm:p-8">
              {/* Decorative background grid and circles */}
              <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-terracotta/15 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-copper/20 blur-xl pointer-events-none" />

              {/* Minimalist Laptop & Tech Silhouette Layout */}
              <div className="relative z-10 flex flex-col items-center justify-center py-4">
                {/* Device mockup display */}
                <div className="w-full max-w-[280px] rounded-xl border border-warm-brown/20 bg-warm-brown p-3 shadow-warm-md">
                  {/* Laptop screen */}
                  <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-[#140C08] p-3 text-white flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[10px] text-taupe/80">
                      <span className="font-manrope font-600">RETECH OS</span>
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-500">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Sanitized
                      </span>
                    </div>

                    <div className="my-auto text-center">
                      <div className="font-manrope text-sm font-800 tracking-wide text-white">
                        NIST SP 800-88
                      </div>
                      <div className="font-dm-sans text-[10px] text-taupe/90 mt-0.5">
                        Purge &amp; Cryptographic Wipe
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-taupe/60 pt-1 border-t border-taupe/20">
                      <span>Drive: NVMe 512GB</span>
                      <span>Verified: 100%</span>
                    </div>
                  </div>

                  {/* Keyboard hinge & base */}
                  <div className="mt-2 h-1.5 w-full rounded-full bg-taupe-dark/60 mx-auto" />
                </div>

                {/* Floating tags */}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-warm-brown/15 bg-white-card/90 px-3 py-1 font-dm-sans text-[11px] font-600 text-warm-brown shadow-warm-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Zero Data Leakage
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-warm-brown/15 bg-white-card/90 px-3 py-1 font-dm-sans text-[11px] font-600 text-warm-brown shadow-warm-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-copper" />
                    R2 Certified Recycling
                  </span>
                </div>
              </div>
            </div>

            {/* Editorial Palette Chips (as requested in the design spec) */}
            <div className="mt-5 border-t border-taupe/20 pt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-dm-sans text-[11px] font-600 uppercase tracking-wider text-warm-brown-muted">
                  Warm Editorial Identity
                </span>
                <span className="font-dm-sans text-[11px] text-warm-brown-placeholder">
                  Material Palette
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                <div className="group flex flex-col items-center">
                  <div className="h-7 w-full rounded-lg border border-taupe/50 bg-[#FAF7F2] shadow-sm transition-transform group-hover:scale-105" />
                  <span className="mt-1 text-[9px] font-500 text-warm-brown-muted">Ivory</span>
                </div>
                <div className="group flex flex-col items-center">
                  <div className="h-7 w-full rounded-lg bg-[#C75B3A] shadow-sm transition-transform group-hover:scale-105" />
                  <span className="mt-1 text-[9px] font-500 text-warm-brown-muted">Terracotta</span>
                </div>
                <div className="group flex flex-col items-center">
                  <div className="h-7 w-full rounded-lg bg-[#B87333] shadow-sm transition-transform group-hover:scale-105" />
                  <span className="mt-1 text-[9px] font-500 text-warm-brown-muted">Copper</span>
                </div>
                <div className="group flex flex-col items-center">
                  <div className="h-7 w-full rounded-lg bg-[#8A7968] shadow-sm transition-transform group-hover:scale-105" />
                  <span className="mt-1 text-[9px] font-500 text-warm-brown-muted">Taupe</span>
                </div>
                <div className="group flex flex-col items-center">
                  <div className="h-7 w-full rounded-lg bg-[#2C1810] shadow-sm transition-transform group-hover:scale-105" />
                  <span className="mt-1 text-[9px] font-500 text-warm-brown-muted">Charcoal</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
