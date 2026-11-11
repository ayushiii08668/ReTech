import React, { useState, useEffect } from "react"
import { Link, useLocation, Outlet } from "react-router-dom"
import {
  LayoutDashboard,
  Laptop,
  PlusCircle,
  Truck,
  FileCheck2,
  User,
  HelpCircle,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronRight,
  CheckCircle2,
  ShoppingBag,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import api from "@/services/api"
import { INotification } from "@/types"

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Devices", href: "/dashboard/devices", icon: Laptop },
  { label: "Request Collection", href: "/dashboard/submit", icon: PlusCircle },
  { label: "Track Requests", href: "/dashboard/track", icon: Truck },
  { label: "Reports & Certificates", href: "/dashboard/reports", icon: FileCheck2, badge: "NIST 800-88" },
  // Refurbished Store hidden as requested
  // { label: "Refurbished Store", href: "/dashboard/marketplace", icon: ShoppingBag, badge: "Certified" },
  { label: "My Profile", href: "/dashboard/profile", icon: User },
  { label: "Help & Support", href: "/dashboard/support", icon: HelpCircle },
]

export default function CustomerLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<INotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/customer/notifications")
      if (res.data.success) {
        setNotifications(res.data.data)
        const unread = res.data.data.filter((n: INotification) => !n.isRead).length
        setUnreadCount(unread)
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const markAllRead = async () => {
    try {
      await api.patch("/customer/notifications/read")
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch {
      // ignore
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F0E7] flex selection:bg-[#C66D4E]/20 selection:text-[#47372E]">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col justify-between border-r border-[#DDD1C3] bg-[#FFFDF8] lg:flex">
        <div>
          {/* Logo */}
          <div className="flex h-18 items-center border-b border-[#DDD1C3] px-6">
            <Link to="/" className="flex items-center gap-0.5 select-none">
              <span className="font-manrope text-2xl font-800 tracking-tight text-[#C66D4E]">
                RE
              </span>
              <span className="font-manrope text-2xl font-800 tracking-tight text-[#47372E]">
                TECH
              </span>
              <span className="ml-0.5 inline-block h-1.5 w-1.5 rounded-full bg-[#B78B68]" />
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 font-dm-sans text-xs font-600 transition-all ${
                    isActive
                      ? "bg-[#C66D4E] text-white shadow-warm-sm"
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
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#C66D4E] text-white font-manrope font-700 text-xs">
              {user?.fullName?.slice(0, 2).toUpperCase() || "CU"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-manrope text-xs font-700 text-[#47372E]">
                {user?.fullName || "Customer"}
              </div>
              <div className="truncate font-dm-sans text-[11px] text-[#75665D]">
                {user?.email}
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
                <Link to="/" className="flex items-center gap-0.5 select-none">
                  <span className="font-manrope text-xl font-800 tracking-tight text-[#C66D4E]">
                    RE
                  </span>
                  <span className="font-manrope text-xl font-800 tracking-tight text-[#47372E]">
                    TECH
                  </span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg p-1.5 text-[#75665D]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="mt-4 space-y-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 font-dm-sans text-xs font-600 ${
                        isActive
                          ? "bg-[#C66D4E] text-white"
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
              <Link to="/dashboard" className="hover:text-[#47372E]">
                Dashboard
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-[#DDD1C3]" />
              <span className="font-600 text-[#47372E]">
                {navItems.find((i) => i.href === location.pathname)?.label || "Overview"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative rounded-xl border border-[#DDD1C3] bg-white p-2 text-[#75665D] hover:border-[#C66D4E] hover:text-[#47372E] transition-colors"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#C66D4E] text-[9px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {notificationsOpen && (
                <div
                  className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[#DDD1C3] bg-[#FFFDF8] p-4 shadow-xl z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-[#DDD1C3] pb-3 mb-3">
                    <h4 className="font-manrope text-xs font-700 text-[#47372E]">
                      Notifications ({unreadCount} unread)
                    </h4>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="font-dm-sans text-[11px] text-[#C66D4E] hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center font-dm-sans text-xs text-[#75665D]">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.slice(0, 8).map((notif) => (
                        <div
                          key={notif._id}
                          className={`rounded-xl p-2.5 text-xs transition-colors ${
                            notif.isRead
                              ? "bg-transparent text-[#75665D]"
                              : "bg-[#EAE1D5]/30 text-[#47372E] font-500"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-manrope font-700 text-xs text-[#47372E]">
                              {notif.title}
                            </span>
                            <span className="text-[10px] text-[#75665D] shrink-0">
                              {new Date(notif.createdAt).toLocaleDateString([], {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-[#75665D]">
                            {notif.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action Button */}
            <Link
              to="/dashboard/submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#C66D4E] px-4 py-2 font-dm-sans text-xs font-600 text-white hover:bg-[#B5482A] transition-all hover:shadow-warm-sm"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Request Collection</span>
            </Link>
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

