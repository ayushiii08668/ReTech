import { motion } from "framer-motion"
import { X, ArrowRight, LayoutDashboard, LogOut } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

interface MobileMenuProps {
  links: { label: string; href: string }[]
  onClose: () => void
}

export default function MobileMenu({ links, onClose }: MobileMenuProps) {
  const { isAuthenticated, isAdmin, logout } = useAuth()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[60] bg-warm-brown/40 backdrop-blur-sm lg:hidden"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white-card shadow-warm-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-taupe/30 px-6 py-5">
          <a href="/" className="flex items-center gap-0.5 select-none">
            <span className="font-manrope text-xl font-800 tracking-tight text-terracotta">
              RE
            </span>
            <span className="font-manrope text-xl font-800 tracking-tight text-warm-brown">
              TECH
            </span>
            <span className="ml-0.5 inline-block h-1.5 w-1.5 rounded-full bg-copper" />
          </a>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-warm-brown-muted transition-colors hover:bg-taupe-surface"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Links */}
        <nav className="flex flex-col px-6 py-6">
          {links.map((link, i) => (
            <motion.a
              key={link.href}
              href={link.href}
              onClick={onClose}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="border-b border-taupe/20 py-4 font-dm-sans text-base font-500 text-warm-brown-body transition-colors hover:text-terracotta"
            >
              {link.label}
            </motion.a>
          ))}
        </nav>

        {/* Actions */}
        <div className="mt-auto px-6 pb-8">
          {isAuthenticated ? (
            <div className="space-y-3 mb-3">
              <a
                href={isAdmin ? "/admin/dashboard" : "/dashboard"}
                onClick={onClose}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-taupe/40 py-2.5 text-center font-dm-sans text-sm font-600 text-warm-brown-body transition-colors hover:border-terracotta hover:text-terracotta"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>{isAdmin ? "Admin Portal" : "Dashboard"}</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  logout()
                  onClose()
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50/50 py-2.5 text-center font-dm-sans text-sm font-500 text-rose-700 transition-colors hover:bg-rose-100/60"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <a
              href="/login"
              onClick={onClose}
              className="mb-3 block w-full rounded-lg border border-taupe/40 py-3 text-center font-dm-sans text-sm font-500 text-warm-brown-body transition-colors hover:border-terracotta hover:text-terracotta"
            >
              Login
            </a>
          )}
          <a
            href="/dashboard/submit"
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-terracotta py-3 font-dm-sans text-sm font-600 text-white transition-all hover:bg-terracotta-dark"
          >
            Schedule Pickup
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </motion.div>
    </motion.div>
  )
}
