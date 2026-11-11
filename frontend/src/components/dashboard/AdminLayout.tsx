import React, { useState } from "react"
import { Link, useLocation, Outlet } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  Truck,
  Boxes,
  Microscope,
  FileSpreadsheet,
  Settings,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
  Wrench,
  Recycle,
  Award,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"

const adminNavItems = [
  { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Pickup Requests", href: "/admin/pickups", icon: Truck },
  { label: "Device Inventory", href: "/admin/devices", icon: Boxes },
  { label: "Sanitization Ops", href: "/admin/sanitization", icon: Microscope, badge: "NIST 800-88" },
  { label: "Certificates Ledger", href: "/admin/certificates", icon: Award, badge: "PDF" },
  // Refurbishment, Recycler Transfers, and dependent Resale Marketplace hidden
  // { label: "Resale Marketplace", href: "/admin/marketplace", icon: ShoppingBag },
  // { label: "Refurbishment Ops", href: "/admin/refurbishment", icon: Wrench },
  // { label: "Recycler Transfers", href: "/admin/recycling", icon: Recycle },
  { label: "System Settings", href: "/admin/settings", icon: Settings },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#F5F0E7] flex selection:bg-[#C66D4E]/20 selection:text-[#47372E]">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col justify-between border-r border-[#DDD1C3] bg-[#FFFDF8] lg:flex">
        <div>
          {/* Logo & Admin Badge */}
          <div className="flex h-18 items-center justify-between border-b border-[#DDD1C3] px-6">
            <Link to="/" className="flex items-center gap-0.5 select-none">
              <span className="font-manrope text-2xl font-800 tracking-tight text-[#C66D4E]">
                RE
              </span>
              <span className="font-manrope text-2xl font-800 tracking-tight text-[#47372E]">
                TECH
              </span>
            </Link>
            <span className="rounded bg-[#47372E] px-2 py-0.5 font-manrope text-[10px] font-700 tracking-wider text-white uppercase">
              Admin
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1">
            {adminNavItems.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 font-dm-sans text-xs font-600 transition-all ${
                    isActive
                      ? "bg-[#47372E] text-white shadow-warm-sm"
                      : "text-[#75665D] hover:bg-[#EAE1D5]/40 hover:text-[#47372E]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`h-4 w-4 ${isActive ? "text-white" : "text-[#75665D]"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-[#B78B68]/15 text-[#B78B68]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="border-t border-[#DDD1C3] p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-[#EAE1D5]/30 p-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#47372E] text-white font-manrope font-700 text-xs">
              AD
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-manrope text-xs font-700 text-[#47372E]">
                {user?.fullName || "Administrator"}
              </div>
              <div className="truncate font-dm-sans text-[11px] text-[#75665D]">
                Platform Governance
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 font-dm-sans text-xs font-600 text-[#75665D] hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="h-full w-72 bg-[#FFFDF8] p-6 shadow-xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between border-b border-[#DDD1C3] pb-4">
                <div className="flex items-center gap-1.5">
                  <span className="font-manrope text-xl font-800 text-[#C66D4E]">RE</span>
                  <span className="font-manrope text-xl font-800 text-[#47372E]">TECH</span>
                  <span className="rounded bg-[#47372E] px-1.5 py-0.5 text-[9px] font-bold text-white uppercase ml-1">
                    Admin
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg p-1.5 text-[#75665D]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="mt-4 space-y-1">
                {adminNavItems.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 font-dm-sans text-xs font-600 ${
                        isActive
                          ? "bg-[#47372E] text-white"
                          : "text-[#75665D] hover:bg-[#EAE1D5]/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  )
                })}
              </nav>
            </div>

            <button
              onClick={logout}
              className="flex w-full items-center gap-2.5 rounded-xl border border-[#DDD1C3] py-2.5 justify-center font-dm-sans text-xs font-600 text-red-700"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-[#DDD1C3] bg-[#FFFDF8]/90 px-6 backdrop-blur-sm lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg p-2 text-[#47372E] hover:bg-[#EAE1D5]/50 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs font-dm-sans text-[#75665D]">
              <span className="font-600 text-[#B78B68]">ReTech Governance</span>
              <ChevronRight className="h-3.5 w-3.5 text-[#DDD1C3]" />
              <span className="font-600 text-[#47372E]">
                {adminNavItems.find((i) => i.href === location.pathname)?.label || "Admin Console"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-xl border border-[#DDD1C3] bg-white px-3 py-1.5 text-xs font-dm-sans text-[#75665D]">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Security Mode: Active</span>
            </div>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

