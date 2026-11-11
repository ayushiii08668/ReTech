import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Filter,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  X,
  Phone,
  MessageSquare,
  Send,
  ExternalLink,
} from "lucide-react"
import { phase4Service, MarketplaceListing } from "@/services/phase4Service"
import { useAuth } from "@/context/AuthContext"

export default function RefurbishedMarketplacePage() {
  const { user } = useAuth()
  const [listings, setListings] = useState<MarketplaceListing[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("ALL")
  const [condition, setCondition] = useState("ALL")
  const [sortBy, setSortBy] = useState("newest")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Modals
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null)
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false)
  const [enquiryMsg, setEnquiryMsg] = useState("")
  const [enquiryPrice, setEnquiryPrice] = useState("")
  const [enquiryPhone, setEnquiryPhone] = useState(user?.phone || "")
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false)
  const [enquirySuccess, setEnquirySuccess] = useState<string | null>(null)
  const [enquiryErr, setEnquiryErr] = useState<string | null>(null)

  const fetchListings = async () => {
    setLoading(true)
    try {
      const data = await phase4Service.getPublicListings({
        search,
        category,
        condition,
        sortBy,
        page,
        limit: 12,
      })
      setListings(data.listings)
      setTotalPages(data.pagination.pages || 1)
    } catch (err) {
      console.error("Failed to load marketplace listings:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchListings()
  }, [search, category, condition, sortBy, page])

  const handleSendEnquiry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedListing) return

    setSubmittingEnquiry(true)
    setEnquirySuccess(null)
    setEnquiryErr(null)

    try {
      const res = await phase4Service.submitEnquiry({
        listingId: selectedListing._id,
        customerMessage: enquiryMsg,
        offeredPrice: enquiryPrice ? parseFloat(enquiryPrice) : undefined,
        contactPhone: enquiryPhone,
      })
      setEnquirySuccess(
        `Enquiry reference ${res.enquiryId} recorded! Our operations manager will contact you to coordinate delivery.`
      )
      setTimeout(() => {
        setEnquiryModalOpen(false)
        setEnquiryMsg("")
        setEnquiryPrice("")
        setEnquirySuccess(null)
      }, 2500)
    } catch (err: any) {
      setEnquiryErr(err?.response?.data?.message || "Failed to submit enquiry.")
    } finally {
      setSubmittingEnquiry(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono font-700 text-[#C66D4E]">
          <ShoppingBag className="h-3.5 w-3.5" />
          CERTIFIED SECOND-LIFE HARDWARE MARKETPLACE
        </div>
        <h1 className="mt-1 font-manrope text-2xl font-800 tracking-tight text-[#47372E] sm:text-3xl">
          Certified Refurbished Electronics
        </h1>
        <p className="mt-1 font-dm-sans text-xs text-[#75665D]">
          High-performance electronics inspected by certified engineers, sanitized under NIST SP 800-88 guidelines, and backed by a 90-day ReTech warranty.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] p-4 shadow-warm-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#75665D]" />
          <input
            type="text"
            placeholder="Search refurbished laptops, smartphones, desktops by model or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] py-2 pl-9 pr-4 font-dm-sans text-xs text-[#47372E] placeholder-[#75665D]/60 focus:border-[#C66D4E] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] px-3 py-2 font-dm-sans text-xs font-600 text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
          >
            <option value="ALL">All Categories</option>
            <option value="Laptop">Laptops</option>
            <option value="Desktop">Desktops</option>
            <option value="Smartphone">Smartphones</option>
            <option value="Tablet">Tablets</option>
            <option value="Monitor">Monitors</option>
          </select>

          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] px-3 py-2 font-dm-sans text-xs font-600 text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
          >
            <option value="ALL">All Conditions</option>
            <option value="Like new">Like New</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] px-3 py-2 font-dm-sans text-xs font-600 text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
          >
            <option value="newest">Recently Listed</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Product Listings Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-[#75665D]">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#C66D4E] border-t-transparent" />
          Loading certified refurbished hardware...
        </div>
      ) : listings.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#DDD1C3] bg-[#FFFDF8] p-16 text-center space-y-3">
          <ShoppingBag className="mx-auto h-12 w-12 text-[#B78B68]" />
          <h3 className="font-manrope text-base font-800 text-[#47372E]">
            No Refurbished Devices Listed
          </h3>
          <p className="font-dm-sans text-xs text-[#75665D] max-w-md mx-auto">
            Devices are listed only after passing rigorous diagnostic inspection and verified NIST SP 800-88 sanitization. Check back soon for newly certified inventory.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((item) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] shadow-warm-sm overflow-hidden flex flex-col justify-between hover:border-[#C66D4E] transition-all group"
            >
              <div>
                {/* Photo Header */}
                <div className="relative h-48 w-full bg-[#FAF7F2] overflow-hidden flex items-center justify-center p-4 border-b border-[#DDD1C3]/60">
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-[#B78B68]">
                      <Cpu className="h-10 w-10 mb-1" />
                      <span className="font-mono text-[11px]">ReTech Certified Hardware</span>
                    </div>
                  )}

                  {/* Condition Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="rounded-full bg-[#FFFDF8]/90 backdrop-blur-sm px-2.5 py-1 font-mono text-[10px] font-700 text-[#47372E] shadow-sm border border-[#DDD1C3]">
                      {item.condition} Condition
                    </span>
                  </div>

                  {/* Sanitized Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="rounded-full bg-emerald-50/90 backdrop-blur-sm px-2.5 py-1 font-mono text-[10px] font-700 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-sm">
                      <ShieldCheck className="h-3 w-3" />
                      NIST Sanitized
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-3">
                  <div>
                    <span className="font-mono text-[11px] font-700 text-[#C66D4E]">
                      {item.brand} &bull; {item.category}
                    </span>
                    <h3 className="font-manrope text-base font-800 text-[#47372E] line-clamp-1">
                      {item.title}
                    </h3>
                  </div>

                  {/* Specs Chips */}
                  <div className="flex flex-wrap gap-1.5 font-mono text-[10px] text-[#5C504A]">
                    {item.specifications?.processor && (
                      <span className="rounded-lg bg-[#FAF7F2] border border-[#DDD1C3] px-2 py-0.5">
                        {item.specifications.processor}
                      </span>
                    )}
                    {item.specifications?.ram && (
                      <span className="rounded-lg bg-[#FAF7F2] border border-[#DDD1C3] px-2 py-0.5">
                        {item.specifications.ram}
                      </span>
                    )}
                    {item.specifications?.storage && (
                      <span className="rounded-lg bg-[#FAF7F2] border border-[#DDD1C3] px-2 py-0.5">
                        {item.specifications.storage}
                      </span>
                    )}
                  </div>

                  <p className="font-dm-sans text-xs text-[#75665D] line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Price & Action Footer */}
              <div className="border-t border-[#DDD1C3]/60 bg-[#FAF7F2] p-5 flex items-center justify-between">
                <div>
                  <span className="font-dm-sans text-[10px] text-[#75665D] block">
                    Certified Price:
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-manrope text-lg font-800 text-[#47372E]">
                      ₹{item.price.toLocaleString("en-IN")}
                    </span>
                    {item.originalEstimatedValue && item.originalEstimatedValue > item.price && (
                      <span className="font-dm-sans text-xs text-[#75665D] line-through">
                        ₹{item.originalEstimatedValue.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedListing(item)
                    setEnquiryModalOpen(true)
                  }}
                  className="rounded-xl bg-[#C66D4E] px-3.5 py-2 font-dm-sans text-xs font-700 text-white hover:bg-[#B55D3E] shadow-warm-sm transition-all flex items-center gap-1.5"
                >
                  <span>Inspect &amp; Enquire</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* PRODUCT DETAILS & PURCHASE ENQUIRY MODAL */}
      <AnimatePresence>
        {enquiryModalOpen && selectedListing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl rounded-3xl border border-[#DDD1C3] bg-[#FFFDF8] shadow-warm-xl overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-[#DDD1C3] px-6 py-4 bg-[#F5F0E7]">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-[#C66D4E]" />
                  <h3 className="font-manrope text-base font-800 text-[#47372E]">
                    Product Details &amp; Purchase Enquiry
                  </h3>
                </div>
                <button
                  onClick={() => setEnquiryModalOpen(false)}
                  className="rounded-xl p-1 text-[#75665D] hover:bg-[#DDD1C3]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
                {/* Product Brief Header */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-48 rounded-2xl bg-[#FAF7F2] border border-[#DDD1C3] flex items-center justify-center p-4">
                    {selectedListing.images && selectedListing.images.length > 0 ? (
                      <img
                        src={selectedListing.images[0]}
                        alt={selectedListing.title}
                        className="h-full object-contain"
                      />
                    ) : (
                      <Cpu className="h-12 w-12 text-[#B78B68]" />
                    )}
                  </div>

                  <div className="space-y-3">
                    <span className="font-mono text-xs font-700 text-[#C66D4E]">
                      Ref ID: {selectedListing.listingId}
                    </span>
                    <h2 className="font-manrope text-xl font-800 text-[#47372E]">
                      {selectedListing.title}
                    </h2>
                    <div className="flex items-baseline gap-2">
                      <span className="font-manrope text-2xl font-800 text-[#C66D4E]">
                        ₹{selectedListing.price.toLocaleString("en-IN")}
                      </span>
                      <span className="rounded-full bg-emerald-100 text-emerald-900 px-2.5 py-0.5 font-mono text-[10px] font-bold">
                        {selectedListing.warrantyInformation}
                      </span>
                    </div>
                    <p className="font-dm-sans text-xs text-[#75665D] leading-relaxed">
                      {selectedListing.description}
                    </p>
                  </div>
                </div>

                {/* Full Specifications Grid */}
                <div>
                  <h4 className="font-manrope text-xs font-800 text-[#47372E] mb-2 uppercase tracking-wider">
                    Hardware Specifications
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-dm-sans text-xs">
                    <div className="rounded-xl border border-[#DDD1C3] bg-[#FAF7F2] p-2.5">
                      <span className="text-[#75665D] block text-[10px]">Processor</span>
                      <span className="font-semibold text-[#47372E]">
                        {selectedListing.specifications?.processor || "OEM Standard"}
                      </span>
                    </div>
                    <div className="rounded-xl border border-[#DDD1C3] bg-[#FAF7F2] p-2.5">
                      <span className="text-[#75665D] block text-[10px]">Memory (RAM)</span>
                      <span className="font-semibold text-[#47372E]">
                        {selectedListing.specifications?.ram || "Standard"}
                      </span>
                    </div>
                    <div className="rounded-xl border border-[#DDD1C3] bg-[#FAF7F2] p-2.5">
                      <span className="text-[#75665D] block text-[10px]">Storage</span>
                      <span className="font-semibold text-[#47372E]">
                        {selectedListing.specifications?.storage || "Solid State"}
                      </span>
                    </div>
                    <div className="rounded-xl border border-[#DDD1C3] bg-[#FAF7F2] p-2.5">
                      <span className="text-[#75665D] block text-[10px]">Cosmetic Condition</span>
                      <span className="font-semibold text-[#47372E]">
                        {selectedListing.condition}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Enquiry Submission Form */}
                <div className="rounded-2xl border border-[#DDD1C3] bg-[#FAF7F2] p-5 space-y-4">
                  <div>
                    <h4 className="font-manrope text-sm font-800 text-[#47372E] flex items-center gap-1.5">
                      <MessageSquare className="h-4 w-4 text-[#C66D4E]" />
                      Submit Purchase Enquiry / Reserve Device
                    </h4>
                    <p className="font-dm-sans text-xs text-[#75665D]">
                      ReTech coordinates verified device inspections and handovers directly. Send your questions or reserve this device.
                    </p>
                  </div>

                  {enquirySuccess && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 font-dm-sans text-xs text-emerald-800">
                      {enquirySuccess}
                    </div>
                  )}

                  {enquiryErr && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 font-dm-sans text-xs text-rose-800">
                      {enquiryErr}
                    </div>
                  )}

                  <form onSubmit={handleSendEnquiry} className="space-y-3">
                    <div>
                      <label className="block font-dm-sans text-xs font-700 text-[#47372E] mb-1">
                        Your Enquiry / Reserve Message *
                      </label>
                      <textarea
                        rows={3}
                        value={enquiryMsg}
                        onChange={(e) => setEnquiryMsg(e.target.value)}
                        placeholder="I'm interested in reserving this device. What is the battery cycle count, and can I schedule an inspection?"
                        className="w-full rounded-xl border border-[#DDD1C3] bg-white p-3 font-dm-sans text-xs text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-dm-sans text-xs font-700 text-[#47372E] mb-1">
                          Offered Price (₹ Optional)
                        </label>
                        <input
                          type="number"
                          value={enquiryPrice}
                          onChange={(e) => setEnquiryPrice(e.target.value)}
                          placeholder={`₹${selectedListing.price}`}
                          className="w-full rounded-xl border border-[#DDD1C3] bg-white p-2.5 font-dm-sans text-xs text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                        />
                      </div>

                      <div>
                        <label className="block font-dm-sans text-xs font-700 text-[#47372E] mb-1">
                          Contact Phone Number
                        </label>
                        <input
                          type="text"
                          value={enquiryPhone}
                          onChange={(e) => setEnquiryPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full rounded-xl border border-[#DDD1C3] bg-white p-2.5 font-dm-sans text-xs text-[#47372E] focus:outline-none focus:border-[#C66D4E]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingEnquiry}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#C66D4E] py-3 font-dm-sans text-xs font-700 text-white hover:bg-[#B55D3E] transition-all shadow-warm-sm disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      {submittingEnquiry ? "Transmitting Enquiry..." : "Submit Purchase Enquiry"}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

