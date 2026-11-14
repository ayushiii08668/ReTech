import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, ArrowRight, LayoutDashboard, LogOut } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import MobileMenu from "./MobileMenu"

const navLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Device Categories", href: "#device-categories" },
  { label: "Data Protection", href: "#data-protection" },
  { label: "About", href: "#about" },
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isAuthenticated, isAdmin, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 16)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white-card/95 backdrop-blur-sm shadow-warm border-b border-taupe/30"
            : "bg-white-card border-b border-taupe/20"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          {/* Logo */}
          <a href="/" className="flex items-center gap-0.5 select-none">
            <span className="font-manrope text-2xl font-800 tracking-tight text-terracotta">
              RE
            </span>
            <span className="font-manrope text-2xl font-800 tracking-tight text-warm-brown">
              TECH
            </span>
            <span className="ml-0.5 inline-block h-1.5 w-1.5 rounded-full bg-copper" />
          </a>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-dm-sans text-sm font-500 text-warm-brown-muted transition-colors duration-200 hover:text-terracotta"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden items-center gap-4 lg:flex">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <a
                  href={isAdmin ? "/admin/dashboard" : "/dashboard"}
                  className="inline-flex items-center gap-1.5 font-dm-sans text-sm font-600 text-warm-brown-body transition-colors duration-200 hover:text-terracotta"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>{isAdmin ? "Admin Portal" : "Dashboard"}</span>
                </a>
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 font-dm-sans text-sm font-500 text-[#75665D] transition-colors duration-200 hover:text-rose-700 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <a
                href="/login"
                className="font-dm-sans text-sm font-500 text-warm-brown-body transition-colors duration-200 hover:text-terracotta"
              >
                Login
              </a>
            )}
            <a
              href="/dashboard/submit"
              className="inline-flex items-center gap-2 rounded-lg bg-terracotta px-5 py-2.5 font-dm-sans text-sm font-600 text-white transition-all duration-200 hover:bg-terracotta-dark hover:-translate-y-0.5 hover:shadow-warm-md"
            >
              Schedule Pickup
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-warm-brown transition-colors hover:bg-taupe-surface lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </nav>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <MobileMenu
            links={navLinks}
            onClose={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
