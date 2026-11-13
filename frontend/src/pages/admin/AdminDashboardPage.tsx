import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Users,
  Boxes,
  Clock,
  CheckCircle2,
  Cpu,
  Truck,
  ArrowRight,
  Eye,
  Microscope,
} from "lucide-react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts"
import api from "@/services/api"

const WARM_COLORS = ["#C66D4E", "#B78B68", "#E0A96D", "#75665D", "#47372E", "#A08679"]

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{
    metrics: any
    charts: any
    recentPickups: any[]
    recentDevices: any[]
  } | null>(null)

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      try {
        const res = await api.get("/admin/dashboard")
        if (res.data.success) {
          setData(res.data.data)
        }
      } catch (err) {
        console.error("Failed to load admin dashboard data:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchAdminDashboard()
  }, [])

  if (loading || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#47372E] border-t-transparent" />
          <p className="font-dm-sans text-xs text-[#75665D]">Aggregating platform intelligence…</p>
        </div>
      </div>
    )
  }

  const { metrics, charts, recentPickups, recentDevices } = data

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Title */}
      <div>
        <h1 className="font-manrope text-2xl font-800 tracking-tight text-[#47372E] sm:text-3xl">
          Platform Overview &amp; Intelligence
        </h1>
        <p className="mt-1 font-dm-sans text-xs text-[#75665D]">
          Real-time database metrics across customer accounts, collection logistics, and hardware inventory.
        </p>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-2xl border border-[#DDD1C3] bg-[#FFFDF8] p-4 shadow-warm-sm">
          <div className="flex items-center justify-between text-[#75665D] mb-1">
            <span className="font-dm-sans text-[11px] font-600">Customers</span>
            <Users className="h-3.5 w-3.5" />
          </div>
          <div className="font-manrope text-2xl font-800 text-[#47372E]">{metrics.totalCustomers}</div>
          <span className="text-[10px] text-[#75665D]">Registered users</span>
        </div>

        <div className="rounded-2xl border border-[#DDD1C3] bg-[#FFFDF8] p-4 shadow-warm-sm">
          <div className="flex items-center justify-between text-[#75665D] mb-1">
            <span className="font-dm-sans text-[11px] font-600">Total Hardware</span>
            <Boxes className="h-3.5 w-3.5" />
          </div>
          <div className="font-manrope text-2xl font-800 text-[#C66D4E]">{metrics.totalDevices}</div>
          <span className="text-[10px] text-[#75665D]">Active devices</span>
        </div>

        <div className="rounded-2xl border border-[#DDD1C3] bg-[#FFFDF8] p-4 shadow-warm-sm">
          <div className="flex items-center justify-between text-[#75665D] mb-1">
            <span className="font-dm-sans text-[11px] font-600">Pending Pickups</span>
            <Clock className="h-3.5 w-3.5 text-amber-600" />
          </div>
          <div className="font-manrope text-2xl font-800 text-amber-800">{metrics.pendingPickups}</div>
          <span className="text-[10px] text-[#75665D]">Awaiting approval</span>
        </div>

        <div className="rounded-2xl border border-[#DDD1C3] bg-[#FFFDF8] p-4 shadow-warm-sm">
          <div className="flex items-center justify-between text-[#75665D] mb-1">
            <span className="font-dm-sans text-[11px] font-600">Approved Pickups</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <div className="font-manrope text-2xl font-800 text-emerald-800">{metrics.approvedPickups}</div>
          <span className="text-[10px] text-[#75665D]">Scheduled dispatch</span>
        </div>

        <div className="rounded-2xl border border-[#DDD1C3] bg-[#FFFDF8] p-4 shadow-warm-sm">
          <div className="flex items-center justify-between text-[#75665D] mb-1">
            <span className="font-dm-sans text-[11px] font-600">Hub Received</span>
            <Truck className="h-3.5 w-3.5 text-[#B78B68]" />
          </div>
          <div className="font-manrope text-2xl font-800 text-[#47372E]">{metrics.devicesReceived}</div>
          <span className="text-[10px] text-[#75665D]">At central facility</span>
        </div>

        <div className="rounded-2xl border border-[#DDD1C3] bg-[#FFFDF8] p-4 shadow-warm-sm">
          <div className="flex items-center justify-between text-[#75665D] mb-1">
            <span className="font-dm-sans text-[11px] font-600">Inspection Due</span>
            <Microscope className="h-3.5 w-3.5 text-[#C66D4E]" />
          </div>
          <div className="font-manrope text-2xl font-800 text-[#C66D4E]">{metrics.devicesAwaitingInspection}</div>
          <span className="text-[10px] text-[#75665D]">Pending diagnostic</span>
        </div>
      </div>

      {/* Visual Analytics Grid (Recharts) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Device Categories Distribution */}
        <div className="rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-6 shadow-warm-sm">
          <div className="mb-4">
            <h3 className="font-manrope text-base font-800 text-[#47372E]">
              Device Category Distribution
            </h3>
            <p className="font-dm-sans text-xs text-[#75665D]">
              Aggregated hardware categories across all customer submissions
            </p>
          </div>

          <div className="h-64 w-full">
            {charts.categoryDistribution.length === 0 ? (
              <div className="flex h-full items-center justify-center font-dm-sans text-xs text-[#75665D]">
                No category data available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.categoryDistribution}>
                  <XAxis dataKey="name" stroke="#75665D" fontSize={11} tickLine={false} />
                  <YAxis stroke="#75665D" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFDF8",
                      borderColor: "#DDD1C3",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontFamily: "DM Sans",
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {charts.categoryDistribution.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={WARM_COLORS[index % WARM_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pickup Status Breakdown */}
        <div className="rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-6 shadow-warm-sm">
          <div className="mb-4">
            <h3 className="font-manrope text-base font-800 text-[#47372E]">
              Pickup Request Pipeline Status
            </h3>
            <p className="font-dm-sans text-xs text-[#75665D]">
              Real-time logistics status breakdown across all collection orders
            </p>
          </div>

          <div className="h-64 w-full">
            {charts.pickupStatusDistribution.length === 0 ? (
              <div className="flex h-full items-center justify-center font-dm-sans text-xs text-[#75665D]">
                No pickup requests recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.pickupStatusDistribution} layout="vertical">
                  <XAxis type="number" stroke="#75665D" fontSize={11} tickLine={false} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" stroke="#75665D" fontSize={10} tickLine={false} width={110} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFDF8",
                      borderColor: "#DDD1C3",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontFamily: "DM Sans",
                    }}
                  />
                  <Bar dataKey="value" fill="#B78B68" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent Pickup Requests & Recent Device Submissions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Pickups */}
        <div className="rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-6 shadow-warm-sm">
          <div className="flex items-center justify-between border-b border-[#DDD1C3] pb-4 mb-4">
            <div>
              <h3 className="font-manrope text-base font-800 text-[#47372E]">
                Latest Collection Requests
              </h3>
              <p className="font-dm-sans text-xs text-[#75665D]">
                Recent orders requiring administrative dispatch review
              </p>
            </div>
            <Link
              to="/admin/pickups"
              className="inline-flex items-center gap-1 font-dm-sans text-xs font-600 text-[#C66D4E] hover:underline"
            >
              <span>Manage all</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#DDD1C3]/60 space-y-2">
            {recentPickups.length === 0 ? (
              <div className="py-8 text-center text-xs font-dm-sans text-[#75665D]">
                No pickup requests logged.
              </div>
            ) : (
              recentPickups.map((req) => (
                <div key={req._id} className="flex items-center justify-between py-2.5 text-xs font-dm-sans">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-700 text-[#C66D4E]">{req.requestId}</span>
                      <span className="font-manrope font-700 text-[#47372E]">
                        {req.customerId?.fullName?.replace(/Ayush Sharma(\s*\(Demo Customer\))?/gi, 'Ayushi Singh').replace(/\s*\(Demo Customer\)/gi, '') || "Ayushi Singh"}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#75665D] mt-0.5">
                      {req.preferredDate} ({req.preferredTimeSlot}) &middot; {req.city}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[#EAE1D5]/50 px-2.5 py-0.5 text-[10px] font-600 text-[#47372E]">
                      {req.status}
                    </span>
                    <Link
                      to="/admin/pickups"
                      className="rounded-lg p-1 text-[#75665D] hover:text-[#47372E]"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Registered Devices */}
        <div className="rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-6 shadow-warm-sm">
          <div className="flex items-center justify-between border-b border-[#DDD1C3] pb-4 mb-4">
            <div>
              <h3 className="font-manrope text-base font-800 text-[#47372E]">
                Recent Device Inventory
              </h3>
              <p className="font-dm-sans text-xs text-[#75665D]">
                Hardware entered into the platform registry
              </p>
            </div>
            <Link
              to="/admin/devices"
              className="inline-flex items-center gap-1 font-dm-sans text-xs font-600 text-[#C66D4E] hover:underline"
            >
              <span>View inventory</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#DDD1C3]/60 space-y-2">
            {recentDevices.length === 0 ? (
              <div className="py-8 text-center text-xs font-dm-sans text-[#75665D]">
                No devices submitted yet.
              </div>
            ) : (
              recentDevices.map((dev) => (
                <div key={dev._id} className="flex items-center justify-between py-2.5 text-xs font-dm-sans">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-700 text-[#C66D4E]">{dev.deviceId}</span>
                      <span className="font-manrope font-700 text-[#47372E]">
                        {dev.brand} {dev.model}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#75665D] mt-0.5">
                      Customer: {dev.customerId?.fullName?.replace(/Ayush Sharma(\s*\(Demo Customer\))?/gi, 'Ayushi Singh').replace(/\s*\(Demo Customer\)/gi, '') || "Ayushi Singh"} &middot; {dev.category}
                    </div>
                  </div>

                  <span className="rounded-full bg-[#EAE1D5]/50 px-2.5 py-0.5 text-[10px] font-600 text-[#47372E]">
                    {dev.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

