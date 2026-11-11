import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  MessageSquare,
  ShieldCheck,
  Tag,
  Phone,
  Mail,
  RefreshCw,
  AlertTriangle,
  Layers,
} from "lucide-react"
import {
  phase4Service,
  MarketplaceListing,
  MarketplaceEnquiry,
} from "@/services/phase4Service"
import api from "@/services/api"
import { IDevice } from "@/types"

export default function AdminMarketplacePage() {
  const [activeTab, setActiveTab] = useState<"listings" | "create" | "enquiries">("listings")
  const [listings, setListings] = useState<MarketplaceListing[]>([])
  const [enquiries, setEnquiries] = useState<MarketplaceEnquiry[]>([])
  const [eligibleDevices, setEligibleDevices] = useState<IDevice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")

  // Create Listing Form State
  const [selectedDeviceId, setSelectedDeviceId] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [originalValue, setOriginalValue] = useState("")
  const [condition, setCondition] = useState<"Like new" | "Good" | "Fair">("Good")
  const [processor, setProcessor] = useState("")
  const [ram, setRam] = useState("")
  const [storage, setStorage] = useState("")
  const [warranty, setWarranty] = useState("90-Day ReTech Certified Functional Warranty")
  const [creatingLoading, setCreatingLoading] = useState(false)
  const [createMsg, setCreateMsg] = useState<string | null>(null)
  const [createErr, setCreateErr] = useState<string | null>(null)

  // Mark Sold Modal
  const [sellingListing, setSellingListing] = useState<MarketplaceListing | null>(null)
  const [buyerName, setBuyerName] = useState("")
  const [buyerContact, setBuyerContact] = useState("")
  const [soldPrice, setSoldPrice] = useState("")
  const [markingSold, setMarkingSold] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [listData, enqData, devRes] = await Promise.all([
        phase4Service.getAdminListings({ search, status: statusFilter }),
        phase4Service.getAdminEnquiries(),
        api.get("/admin/devices", { params: { limit: 50 } }),
      ])
      setListings(listData.listings)
      setEnquiries(enqData)

      // Filter eligible devices: inspected, sanitized, not sold or recycled
      if (devRes.data.success) {
        const eligible = devRes.data.data.devices.filter(
          (d: any) =>
            (d.status === "SANITIZED" || d.status === "READY_FOR_RESALE" || d.status === "REFURBISHED") &&
            d.classification !== "D"
        )
        setEligibleDevices(eligible)
      }
    } catch (err) {
      console.error("Failed to load marketplace admin data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [search, statusFilter])

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateMsg(null)
    setCreateErr(null)

    if (!selectedDeviceId || !title || !price) {
      setCreateErr("Device, listing title, and price are required.")
      return
    }

    setCreatingLoading(true)
    try {
      const res = await phase4Service.createListing({
        deviceId: selectedDeviceId,
        title,
        description,
        price: parseFloat(price),
        originalEstimatedValue: originalValue ? parseFloat(originalValue) : undefined,
        condition,
        specifications: {
          processor,
          ram,
          storage,
        },
        warrantyInformation: warranty,
      })

      setCreateMsg(`Listing ${res.listingId} published successfully!`)
      loadData()
      setTimeout(() => {
        setActiveTab("listings")
        setTitle("")
        setDescription("")
        setPrice("")
        setOriginalValue("")
        setSelectedDeviceId("")
      }, 1500)
    } catch (err: any) {
      setCreateErr(err?.response?.data?.message || "Failed to create listing.")
    } finally {
      setCreatingLoading(false)
    }
  }

  const handleConfirmSold = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sellingListing) return

    setMarkingSold(true)
    try {
      await phase4Service.markListingSold(sellingListing.listingId, {
        buyerName,
        buyerContact,
        soldPrice: soldPrice ? parseFloat(soldPrice) : sellingListing.price,
      })
      setSellingListing(null)
      setBuyerName("")
      setBuyerContact("")
      setSoldPrice("")
      loadData()
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to mark listing as sold.")
    } finally {
      setMarkingSold(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-700 text-[#C66D4E]">
            <ShoppingBag className="h-3.5 w-3.5" />
            RESALE &amp; SECOND-LIFE INVENTORY MANAGEMENT
          </div>
          <h1 className="mt-1 font-manrope text-2xl font-800 tracking-tight text-[#47372E] sm:text-3xl">
            Refurbished Marketplace Operations
          </h1>
          <p className="mt-1 font-dm-sans text-xs text-[#75665D]">
            Manage certified electronics resale listings, verify sanitization prerequisites, and coordinate customer purchase enquiries.
          </p>
        </div>

        <button
          onClick={() => setActiveTab("create")}
          className="flex items-center gap-2 rounded-2xl bg-[#C66D4E] px-4 py-2 font-dm-sans text-xs font-700 text-white shadow-warm-sm hover:bg-[#B55D3E] transition-all"
        >
          <Plus className="h-4 w-4" />
          Create Resale Listing
        </button>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-6 shadow-warm-sm">
          <span className="font-dm-sans text-xs font-700 uppercase tracking-wider text-[#75665D]">
            Total Marketplace Listings
          </span>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-manrope text-3xl font-800 text-[#47372E]">
              {listings.length}
            </span>
            <span className="font-dm-sans text-xs text-[#75665D]">cataloged</span>
          </div>
        </div>

        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-6 shadow-warm-sm">
          <span className="font-dm-sans text-xs font-700 uppercase tracking-wider text-emerald-900">
            Available on Marketplace
          </span>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-manrope text-3xl font-800 text-emerald-950">
              {listings.filter((l) => l.availability === "AVAILABLE").length}
            </span>
            <span className="font-dm-sans text-xs text-emerald-800">live for customers</span>
          </div>
        </div>

        <div className="rounded-3xl border border-[#C66D4E]/20 bg-[#F5F0E7] p-6 shadow-warm-sm">
          <span className="font-dm-sans text-xs font-700 uppercase tracking-wider text-[#47372E]">
            Confirmed Second-Life Sales
          </span>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-manrope text-3xl font-800 text-[#C66D4E]">
              {listings.filter((l) => l.availability === "SOLD").length}
            </span>
            <span className="font-dm-sans text-xs text-[#75665D]">devices re-homed</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#DDD1C3] pb-3">
        <button
          onClick={() => setActiveTab("listings")}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2 font-dm-sans text-xs font-700 transition-all ${
            activeTab === "listings"
              ? "bg-[#47372E] text-white shadow-warm-sm"
              : "bg-[#FFFDF8] text-[#75665D] hover:bg-[#F5F0E7]"
          }`}
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          Active Listings ({listings.length})
        </button>

        <button
          onClick={() => setActiveTab("create")}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2 font-dm-sans text-xs font-700 transition-all ${
            activeTab === "create"
              ? "bg-[#C66D4E] text-white shadow-warm-sm"
              : "bg-[#FFFDF8] text-[#75665D] hover:bg-[#F5F0E7]"
          }`}
        >
          <Plus className="h-3.5 w-3.5" />
          Create New Listing
        </button>

        <button
          onClick={() => setActiveTab("enquiries")}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2 font-dm-sans text-xs font-700 transition-all ${
            activeTab === "enquiries"
              ? "bg-[#47372E] text-white shadow-warm-sm"
              : "bg-[#FFFDF8] text-[#75665D] hover:bg-[#F5F0E7]"
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Customer Enquiries ({enquiries.length})
        </button>
      </div>

      {/* TAB 1: LISTINGS TABLE */}
      {activeTab === "listings" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-4 shadow-warm-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#75665D]" />
              <input
                type="text"
                placeholder="Search listings by title, ID, brand..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] py-2 pl-9 pr-4 font-dm-sans text-xs text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] px-3 py-2 font-dm-sans text-xs font-600 text-[#47372E] focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="UNPUBLISHED">Unpublished</option>
              <option value="SOLD">Sold</option>
            </select>
          </div>

          <div className="overflow-hidden rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] shadow-warm-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-dm-sans text-xs">
                <thead className="border-b border-[#DDD1C3] bg-[#F5F0E7] text-[#47372E] font-700">
                  <tr>
                    <th className="py-3.5 px-5">Listing ID &amp; Device</th>
                    <th className="py-3.5 px-4">Title &amp; Category</th>
                    <th className="py-3.5 px-4">Condition &amp; Specs</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4">Availability</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDD1C3]/60">
                  {listings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#75665D]">
                        No marketplace listings found.
                      </td>
                    </tr>
                  ) : (
                    listings.map((l) => (
                      <tr key={l._id} className="hover:bg-[#FAF7F2] transition-colors">
                        <td className="py-4 px-5">
                          <span className="font-mono font-700 text-[#C66D4E]">{l.listingId}</span>
                          <div className="text-[11px] text-[#75665D]">Dev: {l.retechDeviceId}</div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-semibold text-[#47372E]">{l.title}</div>
                          <div className="text-[11px] text-[#75665D]">
                            {l.brand} {l.model} &bull; {l.category}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span className="rounded-full bg-[#EAE1D5] px-2 py-0.5 font-mono text-[10px] font-bold text-[#47372E]">
                            {l.condition}
                          </span>
                          <div className="font-mono text-[10px] text-[#75665D] mt-1">
                            {l.specifications?.ram || ""} {l.specifications?.storage || ""}
                          </div>
                        </td>

                        <td className="py-4 px-4 font-manrope font-800 text-sm text-[#47372E]">
                          ₹{l.price.toLocaleString("en-IN")}
                        </td>

                        <td className="py-4 px-4">
                          {l.availability === "AVAILABLE" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-700 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="h-3 w-3" /> AVAILABLE
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-0.5 font-mono text-[10px] font-700 text-stone-700 border border-stone-300">
                              SOLD OUT
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-5 text-right">
                          {l.availability === "AVAILABLE" && (
                            <button
                              onClick={() => {
                                setSellingListing(l)
                                setSoldPrice(l.price.toString())
                              }}
                              className="rounded-xl bg-[#C66D4E] px-3 py-1 font-dm-sans text-xs font-700 text-white hover:bg-[#B55D3E] shadow-warm-sm"
                            >
                              Mark Sold
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CREATE LISTING WIZARD */}
      {activeTab === "create" && (
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-8 shadow-warm-sm">
            <div className="border-b border-[#DDD1C3] pb-4 mb-6">
              <h2 className="font-manrope text-xl font-800 text-[#47372E]">
                Publish Refurbished Resale Listing
              </h2>
              <p className="mt-1 font-dm-sans text-xs text-[#75665D]">
                Select an eligible inspected and NIST SP 800-88 sanitized device from inventory to offer for second-life resale.
              </p>
            </div>

            {createMsg && (
              <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 font-dm-sans text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                {createMsg}
              </div>
            )}

            {createErr && (
              <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 font-dm-sans text-xs text-rose-800 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                {createErr}
              </div>
            )}

            <form onSubmit={handleCreateListing} className="space-y-4 font-dm-sans text-xs">
              <div>
                <label className="block font-700 text-[#47372E] mb-1">
                  Eligible Inspected &amp; Sanitized Inventory Device *
                </label>
                <select
                  value={selectedDeviceId}
                  onChange={(e) => {
                    setSelectedDeviceId(e.target.value)
                    const dev = eligibleDevices.find((d) => d._id === e.target.value)
                    if (dev) {
                      setTitle(`ReTech Certified Refurbished ${dev.brand} ${dev.model}`)
                      setDescription(
                        `Pre-owned ${dev.brand} ${dev.model} inspected and certified by ReTech. Completely sanitized in adherence to NIST SP 800-88.`
                      )
                      setStorage(`${dev.storageCapacity || "512 GB"} ${dev.storageType || "SSD"}`)
                    }
                  }}
                  className="w-full rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] p-3 text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                  required
                >
                  <option value="">-- Select Eligible Hardware --</option>
                  {eligibleDevices.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.deviceId} - {d.brand} {d.model} ({d.category} - {d.status})
                    </option>
                  ))}
                </select>
                <span className="mt-1 block text-[10px] text-emerald-800">
                  Only devices with verified data erasure and approved classification appear here.
                </span>
              </div>

              <div>
                <label className="block font-700 text-[#47372E] mb-1">Listing Headline *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Certified Dell XPS 15 9500 (16GB RAM / 512GB NVMe SSD)"
                  className="w-full rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] p-3 text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-700 text-[#47372E] mb-1">Resale Price (₹ INR) *</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="24999"
                    className="w-full rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] p-2.5 text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-700 text-[#47372E] mb-1">Original Retail Price (₹)</label>
                  <input
                    type="number"
                    value={originalValue}
                    onChange={(e) => setOriginalValue(e.target.value)}
                    placeholder="65000"
                    className="w-full rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] p-2.5 text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                  />
                </div>

                <div>
                  <label className="block font-700 text-[#47372E] mb-1">Condition Grading</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as any)}
                    className="w-full rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] p-2.5 text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                  >
                    <option value="Like new">Like New (Mint)</option>
                    <option value="Good">Good (Minor cosmetic wear)</option>
                    <option value="Fair">Fair (Noticeable cosmetic wear)</option>
                  </select>
                </div>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-700 text-[#47372E] mb-1">Processor</label>
                  <input
                    type="text"
                    value={processor}
                    onChange={(e) => setProcessor(e.target.value)}
                    placeholder="Intel Core i7-10750H"
                    className="w-full rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] p-2.5 text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                  />
                </div>

                <div>
                  <label className="block font-700 text-[#47372E] mb-1">RAM</label>
                  <input
                    type="text"
                    value={ram}
                    onChange={(e) => setRam(e.target.value)}
                    placeholder="16 GB DDR4"
                    className="w-full rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] p-2.5 text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                  />
                </div>

                <div>
                  <label className="block font-700 text-[#47372E] mb-1">Storage</label>
                  <input
                    type="text"
                    value={storage}
                    onChange={(e) => setStorage(e.target.value)}
                    placeholder="512 GB NVMe SSD"
                    className="w-full rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] p-2.5 text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-700 text-[#47372E] mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] p-3 text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                />
              </div>

              <div>
                <label className="block font-700 text-[#47372E] mb-1">Warranty Term</label>
                <input
                  type="text"
                  value={warranty}
                  onChange={(e) => setWarranty(e.target.value)}
                  className="w-full rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] p-2.5 text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                />
              </div>

              <button
                type="submit"
                disabled={creatingLoading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#C66D4E] py-3.5 font-dm-sans text-xs font-700 text-white shadow-warm-md hover:bg-[#B55D3E] transition-all disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                {creatingLoading ? "Publishing Listing..." : "Publish to Refurbished Marketplace"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOMER ENQUIRIES */}
      {activeTab === "enquiries" && (
        <div className="overflow-hidden rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] shadow-warm-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-dm-sans text-xs">
              <thead className="border-b border-[#DDD1C3] bg-[#F5F0E7] text-[#47372E] font-700">
                <tr>
                  <th className="py-3.5 px-5">Enquiry Ref &amp; Date</th>
                  <th className="py-3.5 px-4">Device Listing</th>
                  <th className="py-3.5 px-4">Customer Details</th>
                  <th className="py-3.5 px-4">Message &amp; Offer</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDD1C3]/60">
                {enquiries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[#75665D]">
                      No purchase enquiries received yet.
                    </td>
                  </tr>
                ) : (
                  enquiries.map((e) => (
                    <tr key={e._id} className="hover:bg-[#FAF7F2] transition-colors">
                      <td className="py-4 px-5">
                        <span className="font-mono font-700 text-[#C66D4E]">{e.enquiryId}</span>
                        <div className="text-[10px] text-[#75665D]">
                          {new Date(e.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-semibold text-[#47372E]">
                          {e.listingId?.title || "Product Listing"}
                        </div>
                        <div className="text-[11px] text-[#75665D]">
                          Listing Ref: {e.listingId?.listingId}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-semibold text-[#47372E]">{e.customerName}</div>
                        <div className="text-[11px] text-[#75665D]">{e.customerEmail}</div>
                        <div className="text-[10px] text-[#75665D]">{e.customerPhone}</div>
                      </td>

                      <td className="py-4 px-4 max-w-xs">
                        <p className="text-[#47372E] line-clamp-2">{e.customerMessage}</p>
                        {e.offeredPrice && (
                          <div className="text-[11px] font-mono text-[#C66D4E] font-bold mt-0.5">
                            Offer: ₹{e.offeredPrice.toLocaleString("en-IN")}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-900 border border-amber-200">
                          {e.enquiryStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MARK AS SOLD MODAL */}
      <AnimatePresence>
        {sellingListing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-6 shadow-warm-xl space-y-4"
            >
              <h3 className="font-manrope text-base font-800 text-[#47372E]">
                Record Confirmed Resale &bull; {sellingListing.listingId}
              </h3>
              <p className="font-dm-sans text-xs text-[#75665D]">
                Marking as sold confirms transaction completion, archives the listing from the public marketplace, and logs a device lifecycle event.
              </p>

              <form onSubmit={handleConfirmSold} className="space-y-3 font-dm-sans text-xs">
                <div>
                  <label className="block font-700 text-[#47372E] mb-1">Buyer Full Name</label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Aarav Sharma"
                    className="w-full rounded-xl border border-[#DDD1C3] bg-[#FAF7F2] p-2.5 text-[#47372E]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-700 text-[#47372E] mb-1">Buyer Contact Info</label>
                  <input
                    type="text"
                    value={buyerContact}
                    onChange={(e) => setBuyerContact(e.target.value)}
                    placeholder="+91 98765 12345 / aarav@example.com"
                    className="w-full rounded-xl border border-[#DDD1C3] bg-[#FAF7F2] p-2.5 text-[#47372E]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-700 text-[#47372E] mb-1">Confirmed Selling Price (₹)</label>
                  <input
                    type="number"
                    value={soldPrice}
                    onChange={(e) => setSoldPrice(e.target.value)}
                    placeholder={sellingListing.price.toString()}
                    className="w-full rounded-xl border border-[#DDD1C3] bg-[#FAF7F2] p-2.5 text-[#47372E]"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSellingListing(null)}
                    className="rounded-xl border border-[#DDD1C3] bg-white px-4 py-2 font-bold text-[#47372E]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={markingSold}
                    className="rounded-xl bg-[#C66D4E] px-4 py-2 font-bold text-white hover:bg-[#B55D3E]"
                  >
                    {markingSold ? "Recording..." : "Confirm Sale"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

