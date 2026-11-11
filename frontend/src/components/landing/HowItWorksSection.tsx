import { motion } from "framer-motion"
import { CalendarCheck, ShieldCheck, Search, Recycle } from "lucide-react"

const steps = [
  {
    number: "01",
    title: "Schedule Collection",
    description:
      "Book a convenient pickup for your old electronics. Our team arrives at your doorstep at the time that works for you.",
    icon: CalendarCheck,
  },
  {
    number: "02",
    title: "Secure Data Sanitization",
    description:
      "Your data is thoroughly erased using industry-standard sanitization methods. Every bit, gone. No exceptions.",
    icon: ShieldCheck,
  },
  {
    number: "03",
    title: "Inspect & Classify",
    description:
      "Each device is professionally inspected and classified for its next life — whether that's reuse, refurbishment, or recycling.",
    icon: Search,
  },
  {
    number: "04",
    title: "Reuse or Recycle",
    description:
      "Eligible devices find new owners at affordable prices. Others are responsibly recycled with our certified partners.",
    icon: Recycle,
  },
]

const stepVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
}

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="bg-ivory-secondary py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-20 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="h-px w-10 bg-terracotta" />
            <span className="font-dm-sans text-xs font-600 tracking-widest text-terracotta uppercase">
              Our Process
            </span>
            <div className="h-px w-10 bg-terracotta" />
          </div>
          <h2 className="mb-4 font-manrope text-3xl font-700 tracking-tight text-warm-brown md:text-4xl lg:text-5xl">
            How ReTech Works
          </h2>
          <p className="mx-auto max-w-xl font-dm-sans text-lg leading-relaxed text-warm-brown-muted">
            From collection to new life — a transparent, secure process at every step.
          </p>
        </div>

        {/* Steps — editorial alternating layout */}
        <div className="relative">
          {/* Connecting line (desktop only) */}
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-taupe/40 lg:block" />

          <div className="space-y-16 lg:space-y-24">
            {steps.map((step, index) => {
              const isLeft = index % 2 === 0
              return (
                <motion.div
                  key={step.number}
                  variants={stepVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  className={`relative flex flex-col items-center gap-8 lg:flex-row ${
                    isLeft ? "lg:flex-row" : "lg:flex-row-reverse"
                  }`}
                >
                  {/* Content */}
                  <div
                    className={`flex-1 ${
                      isLeft ? "lg:pr-20 lg:text-right" : "lg:pl-20 lg:text-left"
                    }`}
                  >
                    <span className="mb-2 inline-block font-manrope text-5xl font-800 leading-none text-terracotta/20 lg:text-6xl">
                      {step.number}
                    </span>
                    <h3 className="mb-3 font-manrope text-xl font-700 text-warm-brown md:text-2xl">
                      {step.title}
                    </h3>
                    <p className="font-dm-sans text-base leading-relaxed text-warm-brown-muted">
                      {step.description}
                    </p>
                  </div>

                  {/* Center node (desktop only) */}
                  <div className="relative z-10 hidden lg:flex">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-terracotta/30 bg-white-card shadow-warm">
                      <step.icon className="h-6 w-6 text-terracotta" />
                    </div>
                  </div>

                  {/* Mobile icon */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-terracotta/30 bg-terracotta/5 lg:hidden">
                    <step.icon className="h-5 w-5 text-terracotta" />
                  </div>

                  {/* Spacer for the other side */}
                  <div className="hidden flex-1 lg:block" />
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
