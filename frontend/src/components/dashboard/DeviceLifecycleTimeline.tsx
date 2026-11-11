import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  ShieldCheck,
  Truck,
  Microscope,
  HardDrive,
  ShoppingBag,
  Recycle,
  Wrench,
  AlertCircle,
  FileText,
} from "lucide-react"
import { phase4Service, DeviceLifecycleEvent } from "@/services/phase4Service"

interface DeviceLifecycleTimelineProps {
  deviceId: string
  onClose?: () => void
}

export default function DeviceLifecycleTimeline({
  deviceId,
  onClose,
}: DeviceLifecycleTimelineProps) {
  const [loading, setLoading] = useState(true)
  const [deviceInfo, setDeviceInfo] = useState<any>(null)
  const [events, setEvents] = useState<DeviceLifecycleEvent[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLifecycle = async () => {
      setLoading(true)
      try {
        const data = await phase4Service.getDeviceLifecycle(deviceId)
        setDeviceInfo(data.device)
        setEvents(data.events)
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load device lifecycle.")
      } finally {
        setLoading(false)
      }
    }
    fetchLifecycle()
  }, [deviceId])

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "DEVICE_SUBMITTED":
      case "PICKUP_REQUESTED":
        return <Calendar className="h-4 w-4 text-[#C66D4E]" />
      case "PICKUP_CONFIRMED":
      case "DEVICE_COLLECTED":
      case "DEVICE_RECEIVED":
        return <Truck className="h-4 w-4 text-[#B78B68]" />
      case "DEVICE_INSPECTED":
      case "CLASSIFICATION_ASSIGNED":
        return <Microscope className="h-4 w-4 text-amber-700" />
      case "SANITIZATION_INITIATED":
      case "SANITIZATION_RUNNING":
      case "SANITIZATION_VERIFIED":
        return <HardDrive className="h-4 w-4 text-emerald-700" />
      case "CERTIFICATE_ISSUED":
        return <ShieldCheck className="h-4 w-4 text-emerald-700" />
      case "ASSIGNED_TO_REFURBISHMENT":
      case "REFURBISHMENT_COMPLETED":
        return <Wrench className="h-4 w-4 text-blue-700" />
      case "LISTED_FOR_RESALE":
      case "DEVICE_SOLD":
        return <ShoppingBag className="h-4 w-4 text-[#C66D4E]" />
      case "TRANSFERRED_FOR_RECYCLING":
      case "DEVICE_RECYCLED":
        return <Recycle className="h-4 w-4 text-emerald-800" />
      case "CERTIFICATE_REVOKED":
        return <AlertCircle className="h-4 w-4 text-rose-700" />
      default:
        return <Layers className="h-4 w-4 text-[#75665D]" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Device Header Brief */}
      {deviceInfo && (
        <div className="rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-700 text-[#C66D4E]">
                {deviceInfo.deviceId}
              </span>
              <span className="text-[#DDD1C3]">&bull;</span>
              <h3 className="font-manrope text-sm font-800 text-[#47372E]">
                {deviceInfo.brand} {deviceInfo.model}
              </h3>
            </div>
            <div className="mt-0.5 font-dm-sans text-xs text-[#75665D]">
              Category: {deviceInfo.category} &bull; Condition: {deviceInfo.condition}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#EAE1D5] px-3 py-1 font-mono text-[11px] font-700 text-[#47372E]">
              STATUS: {deviceInfo.status}
            </span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-xs text-[#75665D]">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#C66D4E] border-t-transparent" />
          Tracing complete chronological lifecycle ledger...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
          {error}
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#DDD1C3] p-8 text-center text-xs text-[#75665D]">
          No lifecycle milestones logged for this device yet.
        </div>
      ) : (
        <div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#DDD1C3]">
          {events.map((evt, idx) => (
            <motion.div
              key={evt._id || idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="relative pl-6"
            >
              {/* Event Circle Dot */}
              <div className="absolute -left-3 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#FFFDF8] border-2 border-[#C66D4E] shadow-sm">
                <div className="h-2 w-2 rounded-full bg-[#C66D4E]" />
              </div>

              {/* Event Content Card */}
              <div className="rounded-2xl border border-[#DDD1C3] bg-[#FFFDF8] p-4 shadow-warm-sm space-y-1.5 hover:border-[#C66D4E]/40 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FAF7F2] border border-[#DDD1C3]/60">
                      {getEventIcon(evt.eventType)}
                    </div>
                    <h4 className="font-manrope text-sm font-800 text-[#47372E]">
                      {evt.title}
                    </h4>
                  </div>
                  <span className="font-mono text-[11px] text-[#75665D]">
                    {new Date(evt.eventTimestamp).toLocaleString()}
                  </span>
                </div>

                <p className="font-dm-sans text-xs text-[#5C504A] leading-relaxed pl-9">
                  {evt.description}
                </p>

                <div className="pt-2 pl-9 flex flex-wrap items-center gap-3 text-[11px] font-dm-sans text-[#75665D] border-t border-[#DDD1C3]/40 mt-2">
                  <span>
                    Logged by:{" "}
                    <span className="font-semibold text-[#47372E]">
                      {evt.performedByName || "System"}
                    </span>
                  </span>
                  {evt.sourceReference && (
                    <>
                      <span>&bull;</span>
                      <span className="font-mono text-[#C66D4E]">
                        Ref: {evt.sourceReference}
                      </span>
                    </>
                  )}
                  {evt.newStatus && (
                    <>
                      <span>&bull;</span>
                      <span className="font-mono font-700 text-stone-600">
                        Status &rarr; {evt.newStatus}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

