import { motion } from "framer-motion"
import {
  Laptop,
  Monitor,
  Smartphone,
  Tablet,
  Printer,
  Router,
  HardDrive,
  Cable,
  CircuitBoard,
  ScreenShare,
} from "lucide-react"

const categories = [
  {
    name: "Laptops",
    description: "All brands and models, working or non-working",
    icon: Laptop,
  },
  {
    name: "Desktops",
    description: "Tower PCs, all-in-ones, and workstations",
    icon: Monitor,
  },
  {
    name: "Smartphones",
    description: "iOS, Android, and feature phones",
    icon: Smartphone,
  },
  {
    name: "Tablets",
    description: "iPads, Android tablets, and e-readers",
    icon: Tablet,
  },
  {
    name: "Monitors",
    description: "LCD, LED, CRT, and display panels",
    icon: ScreenShare,
  },
  {
    name: "Printers",
    description: "Inkjet, laser, and multifunction printers",
    icon: Printer,
  },
  {
    name: "Routers",
    description: "Wi-Fi routers, modems, and network switches",
    icon: Router,
  },
  {
    name: "Storage Devices",
    description: "Hard drives, SSDs, USB drives, and NAS",
    icon: HardDrive,
  },
  {
    name: "Chargers & Cables",
    description: "Power adapters, cables, and peripherals",
    icon: Cable,
  },
  {
    name: "Other Electronics",
    description: "PCBs, components, and miscellaneous devices",
    icon: CircuitBoard,
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
}

export default function DeviceCategoriesSection() {
  return (
    <section id="device-categories" className="bg-ivory py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-16 max-w-2xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px w-10 bg-terracotta" />
            <span className="font-dm-sans text-xs font-600 tracking-widest text-terracotta uppercase">
              Accepted Devices
            </span>
          </div>
          <h2 className="mb-4 font-manrope text-3xl font-700 tracking-tight text-warm-brown md:text-4xl lg:text-5xl">
            What Can You Recycle?
          </h2>
          <p className="font-dm-sans text-lg leading-relaxed text-warm-brown-muted">
            We accept a wide range of electronic devices for responsible
            collection and processing.
          </p>
        </div>

        {/* Category grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-5"
        >
          {categories.map((cat) => (
            <motion.div
              key={cat.name}
              variants={cardVariants}
              className="group cursor-pointer rounded-xl border border-taupe/40 bg-white-card p-6 shadow-warm-sm transition-all duration-300 hover:-translate-y-1 hover:border-terracotta/40 hover:shadow-warm-md"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-terracotta/8">
                <cat.icon className="h-5 w-5 text-terracotta transition-colors duration-200 group-hover:text-terracotta-dark" />
              </div>
              <h3 className="mb-1.5 font-manrope text-base font-700 text-warm-brown">
                {cat.name}
              </h3>
              <p className="font-dm-sans text-sm leading-relaxed text-warm-brown-muted">
                {cat.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
