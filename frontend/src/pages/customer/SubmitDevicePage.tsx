import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
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
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  UploadCloud,
  X,
  AlertCircle,
  Truck,
  Sparkles,
} from "lucide-react"
import api from "@/services/api"
import { useAuth } from "@/context/AuthContext"

const categories = [
  { id: "Laptop", label: "Laptop", icon: Laptop, desc: "MacBook, ThinkPad, Dell, HP, etc." },
  { id: "Desktop", label: "Desktop computer", icon: Monitor, desc: "Towers, all-in-ones, workstations" },
  { id: "Smartphone", label: "Smartphone", icon: Smartphone, desc: "iPhone, Samsung, Android devices" },
  { id: "Tablet", label: "Tablet", icon: Tablet, desc: "iPads, Android tablets, e-readers" },
  { id: "Monitor", label: "Monitor", icon: ScreenShare, desc: "LCD, LED, ultra-wide panels" },
  { id: "Printer", label: "Printer", icon: Printer, desc: "Inkjet, laser, scanners" },
  { id: "Router", label: "Router", icon: Router, desc: "Wi-Fi routers, modems, switches" },
  { id: "Storage", label: "HDD / SSD", icon: HardDrive, desc: "SATA drives, NVMe SSDs, external disks" },
  { id: "Cables", label: "Charger and cables", icon: Cable, desc: "Power adapters, HDMI, bulk cables" },
  { id: "Other", label: "Other electronics", icon: CircuitBoard, desc: "PCBs, peripherals, audio hardware" },
]

const conditions = [
  { id: "Like new", label: "Like new", desc: "No visible wear, flawless operation" },
  { id: "Good", label: "Good", desc: "Minor cosmetic scratches, fully operational" },
  { id: "Fair", label: "Fair", desc: "Noticeable wear, fully or partially operational" },
  { id: "Damaged", label: "Damaged", desc: "Cracked glass, dented body, requires repair" },
  { id: "Not working", label: "Not working", desc: "Does not boot, missing parts or dead board" },
  { id: "Unknown", label: "Unknown", desc: "Untested / stored away for prolonged period" },
]

const timeSlots = [
  "Morning (09:00 AM – 12:00 PM)",
  "Afternoon (12:00 PM – 04:00 PM)",
  "Evening (04:00 PM – 07:00 PM)",
]

export default function SubmitDevicePage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [step, setStep] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [submittedData, setSubmittedData] = useState<{
    device: any
    pickupRequest: any
  } | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    category: "",
    brand: "",
    model: "",
    purchaseYear: "",
    condition: "Good",
    powersOn: true,
    storageType: "SSD",
    storageCapacity: "512 GB",
    description: "",
    images: [] as string[],
    pickup: {
      pickupAddress: user?.address?.street || "",
      city: user?.address?.city || "",
      state: user?.address?.state || "",
      pinCode: user?.address?.pinCode || "",
      contactNumber: user?.phone || "",
      preferredDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
      preferredTimeSlot: timeSlots[0],
      instructions: "",
    },
  })

  // Handle Photo Upload (Convert to Base64 preview)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setError("Images must be under 5MB each.")
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, event.target!.result as string],
          }))
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleNext = () => {
    setError(null)
    if (step === 1 && !formData.category) {
      setError("Please select a device category to continue.")
      return
    }
    if (step === 2) {
      if (!formData.brand.trim() || !formData.model.trim()) {
        setError("Please enter both the brand and model.")
        return
      }
    }
    if (step === 4) {
      const p = formData.pickup
      if (!p.pickupAddress || !p.city || !p.state || !p.pinCode || !p.contactNumber) {
        setError("Please complete all required address and contact details.")
        return
      }
    }
    setStep((prev) => Math.min(prev + 1, 5))
  }

  const handleBack = () => {
    setError(null)
    setStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    setError(null)
    setLoading(true)

    try {
      const res = await api.post("/customer/devices", formData)
      if (res.data.success) {
        setSubmittedData(res.data.data)
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to submit device. Please check your network and fields."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Page Title & Breadcrumb */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Link to="/dashboard" className="font-dm-sans text-xs text-[#75665D] hover:underline">
            Dashboard
          </Link>
          <span className="text-xs text-[#DDD1C3]">&gt;</span>
          <span className="font-dm-sans text-xs font-600 text-[#C66D4E]">
            Request Collection
          </span>
        </div>
        <h1 className="font-manrope text-2xl font-800 tracking-tight text-[#47372E] sm:text-3xl">
          Submit Hardware for Pickup
        </h1>
        <p className="mt-1 font-dm-sans text-sm text-[#75665D]">
          Complete the 5-step registration to assign a unique ReTech device ID and schedule your pickup.
        </p>
      </div>

      {/* Step Progress Tracker */}
      <div className="rounded-2xl border border-[#DDD1C3] bg-[#FFFDF8] p-4 shadow-warm-sm">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: "Category" },
            { num: 2, label: "Specs" },
            { num: 3, label: "Photos" },
            { num: 4, label: "Pickup" },
            { num: 5, label: "Review" },
          ].map((item, idx) => (
            <React.Fragment key={item.num}>
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full font-manrope text-xs font-700 transition-colors ${
                    step === item.num
                      ? "bg-[#C66D4E] text-white shadow-warm-sm"
                      : step > item.num
                      ? "bg-emerald-600 text-white"
                      : "bg-[#EAE1D5] text-[#75665D]"
                  }`}
                >
                  {step > item.num ? <CheckCircle2 className="h-4 w-4" /> : item.num}
                </div>
                <span className="hidden sm:inline font-dm-sans text-[11px] font-600 text-[#47372E]">
                  {item.label}
                </span>
              </div>
              {idx < 4 && (
                <div
                  className={`h-0.5 flex-1 mx-2 transition-colors ${
                    step > idx + 1 ? "bg-emerald-600" : "bg-[#DDD1C3]"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Step Container */}
      <div className="rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-6 shadow-warm-sm sm:p-10">
        {/* ================= STEP 1: CATEGORY SELECTION ================= */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
              <h2 className="font-manrope text-lg font-800 text-[#47372E] sm:text-xl">
                Step 1: Select Device Category
              </h2>
              <p className="mt-1 font-dm-sans text-xs text-[#75665D]">
                Choose the category that best matches your hardware for optimized sanitization planning.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => {
                const isSelected = formData.category === cat.id
                return (
                  <div
                    key={cat.id}
                    onClick={() => setFormData({ ...formData, category: cat.id })}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
                      isSelected
                        ? "border-[#C66D4E] bg-[#C66D4E]/5 shadow-warm-sm ring-1 ring-[#C66D4E]"
                        : "border-[#DDD1C3] bg-white hover:border-[#B78B68]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                          isSelected ? "bg-[#C66D4E] text-white" : "bg-[#EAE1D5]/50 text-[#47372E]"
                        }`}
                      >
                        <cat.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-manrope text-xs font-700 text-[#47372E]">
                          {cat.label}
                        </div>
                        <p className="mt-0.5 font-dm-sans text-[11px] text-[#75665D]">
                          {cat.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* ================= STEP 2: SPECIFICATIONS ================= */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
              <h2 className="font-manrope text-lg font-800 text-[#47372E] sm:text-xl">
                Step 2: Device Specifications
              </h2>
              <p className="mt-1 font-dm-sans text-xs text-[#75665D]">
                Provide technical specifications so our intake team can prepare the correct wipe protocol.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1.5">
                  Brand / Manufacturer *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apple, Dell, Lenovo, HP"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full rounded-xl border border-[#DDD1C3] bg-white py-2.5 px-3.5 font-dm-sans text-sm text-[#47372E] outline-none focus:border-[#C66D4E]"
                />
              </div>

              <div>
                <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1.5">
                  Model Name or Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MacBook Pro 14 (M1) or ThinkPad T14"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full rounded-xl border border-[#DDD1C3] bg-white py-2.5 px-3.5 font-dm-sans text-sm text-[#47372E] outline-none focus:border-[#C66D4E]"
                />
              </div>

              <div>
                <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1.5">
                  Approximate Purchase Year
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2021"
                  value={formData.purchaseYear}
                  onChange={(e) => setFormData({ ...formData, purchaseYear: e.target.value })}
                  className="w-full rounded-xl border border-[#DDD1C3] bg-white py-2.5 px-3.5 font-dm-sans text-sm text-[#47372E] outline-none focus:border-[#C66D4E]"
                />
              </div>

              <div>
                <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1.5">
                  Does the device turn on?
                </label>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="powersOn"
                      checked={formData.powersOn === true}
                      onChange={() => setFormData({ ...formData, powersOn: true })}
                      className="text-[#C66D4E] focus:ring-[#C66D4E]"
                    />
                    <span className="font-dm-sans text-xs font-500 text-[#47372E]">Yes, powers on</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="powersOn"
                      checked={formData.powersOn === false}
                      onChange={() => setFormData({ ...formData, powersOn: false })}
                      className="text-[#C66D4E] focus:ring-[#C66D4E]"
                    />
                    <span className="font-dm-sans text-xs font-500 text-[#47372E]">No / dead battery</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1.5">
                  Storage Type (if known)
                </label>
                <select
                  value={formData.storageType}
                  onChange={(e) => setFormData({ ...formData, storageType: e.target.value })}
                  className="w-full rounded-xl border border-[#DDD1C3] bg-white py-2.5 px-3.5 font-dm-sans text-sm text-[#47372E] outline-none focus:border-[#C66D4E]"
                >
                  <option value="SSD">NVMe / SATA Solid State Drive (SSD)</option>
                  <option value="HDD">Magnetic Hard Disk Drive (HDD)</option>
                  <option value="eMMC / Flash">eMMC / Onboard Flash Storage</option>
                  <option value="None / Removed">No Storage / Drive Removed</option>
                  <option value="Unknown">Unknown / Not Sure</option>
                </select>
              </div>

              <div>
                <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1.5">
                  Storage Capacity (if known)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 512 GB or 1 TB"
                  value={formData.storageCapacity}
                  onChange={(e) => setFormData({ ...formData, storageCapacity: e.target.value })}
                  className="w-full rounded-xl border border-[#DDD1C3] bg-white py-2.5 px-3.5 font-dm-sans text-sm text-[#47372E] outline-none focus:border-[#C66D4E]"
                />
              </div>
            </div>

            {/* Condition selector */}
            <div>
              <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-2">
                Physical &amp; Cosmetic Condition
              </label>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {conditions.map((c) => {
                  const isSelected = formData.condition === c.id
                  return (
                    <div
                      key={c.id}
                      onClick={() => setFormData({ ...formData, condition: c.id as any })}
                      className={`cursor-pointer rounded-xl border p-3 transition-colors ${
                        isSelected
                          ? "border-[#C66D4E] bg-[#C66D4E]/10"
                          : "border-[#DDD1C3] bg-white hover:border-[#B78B68]"
                      }`}
                    >
                      <div className="font-manrope text-xs font-700 text-[#47372E]">{c.label}</div>
                      <div className="text-[10px] text-[#75665D] mt-0.5">{c.desc}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1.5">
                Additional Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Include charger status, missing keys, special pickup instructions, etc."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-xl border border-[#DDD1C3] bg-white p-3 font-dm-sans text-xs text-[#47372E] outline-none focus:border-[#C66D4E]"
              />
            </div>
          </motion.div>
        )}

        {/* ================= STEP 3: PHOTOS ================= */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
              <h2 className="font-manrope text-lg font-800 text-[#47372E] sm:text-xl">
                Step 3: Upload Device Photos
              </h2>
              <p className="mt-1 font-dm-sans text-xs text-[#75665D]">
                Clear photographs assist our inspection team in verifying condition before arrival.
              </p>
            </div>

            {/* Dropzone */}
            <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#DDD1C3] bg-[#EAE1D5]/20 p-8 text-center cursor-pointer hover:border-[#C66D4E] transition-colors">
              <UploadCloud className="h-10 w-10 text-[#C66D4E] mb-3" />
              <span className="font-manrope text-sm font-700 text-[#47372E]">
                Click or drag photos to upload
              </span>
              <span className="mt-1 font-dm-sans text-xs text-[#75665D]">
                PNG, JPG or WebP (max 5MB per photo)
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>

            {/* Preview Grid */}
            {formData.images.length > 0 && (
              <div>
                <h4 className="font-manrope text-xs font-700 text-[#47372E] mb-3">
                  Uploaded Photos ({formData.images.length})
                </h4>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {formData.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-[#DDD1C3] bg-white shadow-sm"
                    >
                      <img
                        src={img}
                        alt={`Device upload ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ================= STEP 4: PICKUP DETAILS ================= */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
              <h2 className="font-manrope text-lg font-800 text-[#47372E] sm:text-xl">
                Step 4: Doorstep Collection Details
              </h2>
              <p className="mt-1 font-dm-sans text-xs text-[#75665D]">
                Where and when should our verified collection personnel arrive?
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1.5">
                  Complete Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Flat/House No., Building Name, Street"
                  value={formData.pickup.pickupAddress}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pickup: { ...formData.pickup, pickupAddress: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-[#DDD1C3] bg-white py-2.5 px-3.5 font-dm-sans text-sm text-[#47372E] outline-none focus:border-[#C66D4E]"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Bengaluru"
                    value={formData.pickup.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pickup: { ...formData.pickup, city: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-[#DDD1C3] bg-white py-2.5 px-3.5 font-dm-sans text-sm text-[#47372E] outline-none focus:border-[#C66D4E]"
                  />
                </div>

                <div>
                  <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1.5">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Karnataka"
                    value={formData.pickup.state}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pickup: { ...formData.pickup, state: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-[#DDD1C3] bg-white py-2.5 px-3.5 font-dm-sans text-sm text-[#47372E] outline-none focus:border-[#C66D4E]"
                  />
                </div>

                <div>
                  <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1.5">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="560001"
                    value={formData.pickup.pinCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pickup: { ...formData.pickup, pinCode: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-[#DDD1C3] bg-white py-2.5 px-3.5 font-dm-sans text-sm text-[#47372E] outline-none focus:border-[#C66D4E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1.5">
                    Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={formData.pickup.contactNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pickup: { ...formData.pickup, contactNumber: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-[#DDD1C3] bg-white py-2.5 px-3.5 font-dm-sans text-sm text-[#47372E] outline-none focus:border-[#C66D4E]"
                  />
                </div>

                <div>
                  <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1.5">
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.pickup.preferredDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pickup: { ...formData.pickup, preferredDate: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-[#DDD1C3] bg-white py-2 px-3 font-dm-sans text-sm text-[#47372E] outline-none focus:border-[#C66D4E]"
                  />
                </div>

                <div>
                  <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1.5">
                    Time Slot *
                  </label>
                  <select
                    value={formData.pickup.preferredTimeSlot}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pickup: { ...formData.pickup, preferredTimeSlot: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-[#DDD1C3] bg-white py-2.5 px-3 font-dm-sans text-xs text-[#47372E] outline-none focus:border-[#C66D4E]"
                  >
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-dm-sans text-xs font-600 text-[#47372E] mb-1.5">
                  Gate / Landmark Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Near Community Center, Gate 2"
                  value={formData.pickup.instructions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pickup: { ...formData.pickup, instructions: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-[#DDD1C3] bg-white py-2.5 px-3.5 font-dm-sans text-sm text-[#47372E] outline-none focus:border-[#C66D4E]"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= STEP 5: REVIEW & SUBMIT ================= */}
        {step === 5 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
              <h2 className="font-manrope text-lg font-800 text-[#47372E] sm:text-xl">
                Step 5: Review &amp; Confirm
              </h2>
              <p className="mt-1 font-dm-sans text-xs text-[#75665D]">
                Please review your device and pickup summary before confirming the collection request.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Hardware Summary */}
              <div className="rounded-2xl border border-[#DDD1C3] bg-[#EAE1D5]/20 p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-[#DDD1C3] pb-2">
                  <h4 className="font-manrope text-xs font-700 text-[#47372E] uppercase tracking-wider">
                    Hardware Specifications
                  </h4>
                  <button
                    onClick={() => setStep(2)}
                    className="font-dm-sans text-[11px] text-[#C66D4E] hover:underline"
                  >
                    Edit
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-dm-sans">
                  <span className="text-[#75665D]">Category:</span>
                  <span className="font-600 text-[#47372E]">{formData.category}</span>

                  <span className="text-[#75665D]">Brand &amp; Model:</span>
                  <span className="font-600 text-[#47372E]">
                    {formData.brand} {formData.model}
                  </span>

                  <span className="text-[#75665D]">Condition:</span>
                  <span className="font-600 text-[#47372E]">{formData.condition}</span>

                  <span className="text-[#75665D]">Powers On:</span>
                  <span className="font-600 text-[#47372E]">
                    {formData.powersOn ? "Yes" : "No"}
                  </span>

                  <span className="text-[#75665D]">Storage Media:</span>
                  <span className="font-600 text-[#47372E]">
                    {formData.storageType} ({formData.storageCapacity})
                  </span>
                </div>
              </div>

              {/* Pickup Summary */}
              <div className="rounded-2xl border border-[#DDD1C3] bg-[#EAE1D5]/20 p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-[#DDD1C3] pb-2">
                  <h4 className="font-manrope text-xs font-700 text-[#47372E] uppercase tracking-wider">
                    Pickup Logistics
                  </h4>
                  <button
                    onClick={() => setStep(4)}
                    className="font-dm-sans text-[11px] text-[#C66D4E] hover:underline"
                  >
                    Edit
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-dm-sans">
                  <span className="text-[#75665D]">Address:</span>
                  <span className="font-600 text-[#47372E] leading-tight">
                    {formData.pickup.pickupAddress}, {formData.pickup.city}, {formData.pickup.state} – {formData.pickup.pinCode}
                  </span>

                  <span className="text-[#75665D]">Contact Number:</span>
                  <span className="font-600 text-[#47372E]">{formData.pickup.contactNumber}</span>

                  <span className="text-[#75665D]">Scheduled Date:</span>
                  <span className="font-600 text-[#47372E]">{formData.pickup.preferredDate}</span>

                  <span className="text-[#75665D]">Slot:</span>
                  <span className="font-600 text-[#47372E]">{formData.pickup.preferredTimeSlot}</span>
                </div>
              </div>
            </div>

            {/* Sanitization Guarantee Banner */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" />
              <p className="font-dm-sans text-xs text-emerald-800 leading-relaxed">
                By submitting, you confirm authorization to recycle this hardware. All storage components will be sanitized following NIST SP 800-88 guidelines with cryptographic verification.
              </p>
            </div>
          </motion.div>
        )}

        {/* Action Buttons Footer */}
        <div className="mt-8 flex items-center justify-between border-t border-[#DDD1C3] pt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 rounded-xl border border-[#DDD1C3] px-5 py-2.5 font-dm-sans text-xs font-600 text-[#47372E] hover:bg-[#EAE1D5]/40 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous Step</span>
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 rounded-xl bg-[#C66D4E] px-6 py-2.5 font-dm-sans text-xs font-600 text-white hover:bg-[#B5482A] transition-colors"
            >
              <span>Continue</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 rounded-xl bg-[#C66D4E] px-8 py-3 font-dm-sans text-xs font-700 text-white shadow-warm-md hover:bg-[#B5482A] transition-colors disabled:opacity-50"
            >
              <Truck className="h-4 w-4" />
              <span>{loading ? "Registering Device…" : "Confirm & Schedule Pickup"}</span>
            </button>
          )}
        </div>
      </div>

      {/* SUCCESS MODAL ON SUBMISSION */}
      <AnimatePresence>
        {submittedData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-8 shadow-2xl text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 mb-4">
                <Sparkles className="h-8 w-8" />
              </div>

              <span className="font-dm-sans text-xs font-700 text-emerald-800 uppercase tracking-wider">
                Registration Confirmed
              </span>

              <h3 className="mt-1 font-manrope text-2xl font-800 text-[#47372E]">
                Pickup Successfully Booked!
              </h3>

              <p className="mt-2 font-dm-sans text-xs text-[#75665D] leading-relaxed">
                Your device has been entered into the ReTech tracking registry. Our operations team will verify pickup scheduling shortly.
              </p>

              {/* ID Chips */}
              <div className="mt-6 rounded-2xl border border-[#DDD1C3] bg-[#EAE1D5]/30 p-4 space-y-2 text-left">
                <div className="flex items-center justify-between text-xs font-dm-sans">
                  <span className="text-[#75665D]">ReTech Device ID:</span>
                  <span className="font-mono font-700 text-[#C66D4E]">
                    {submittedData.device.deviceId}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-dm-sans">
                  <span className="text-[#75665D]">Pickup Request ID:</span>
                  <span className="font-mono font-700 text-[#47372E]">
                    {submittedData.pickupRequest.requestId}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-dm-sans">
                  <span className="text-[#75665D]">Scheduled For:</span>
                  <span className="font-600 text-[#47372E]">
                    {submittedData.pickupRequest.preferredDate}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <Link
                  to="/dashboard/devices"
                  className="flex-1 rounded-xl bg-[#C66D4E] py-2.5 font-dm-sans text-xs font-600 text-white hover:bg-[#B5482A]"
                >
                  View in My Devices
                </Link>
                <Link
                  to="/dashboard/track"
                  className="flex-1 rounded-xl border border-[#DDD1C3] py-2.5 font-dm-sans text-xs font-600 text-[#47372E] hover:bg-[#EAE1D5]/40"
                >
                  Track Pickup Timeline
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

