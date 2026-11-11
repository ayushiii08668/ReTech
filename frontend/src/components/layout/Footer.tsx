import { Mail, Phone, MapPin, ShieldCheck } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-dark-brown text-white border-t border-taupe/20">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-12 lg:px-8 lg:pt-20">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Info (2 columns on large) */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-0.5 select-none mb-4">
              <span className="font-manrope text-2xl font-800 tracking-tight text-terracotta">
                RE
              </span>
              <span className="font-manrope text-2xl font-800 tracking-tight text-white">
                TECH
              </span>
              <span className="ml-0.5 inline-block h-1.5 w-1.5 rounded-full bg-copper-light" />
            </div>

            <p className="max-w-sm font-dm-sans text-sm leading-relaxed text-taupe/80 mb-6">
              Smart E-Waste Collection and Data Sanitization Platform. Protecting organizational privacy and closing the loop on electronic equipment lifecycle.
            </p>

            <div className="inline-flex items-center gap-2 rounded-lg border border-taupe/20 bg-dark-surface/60 px-3.5 py-2">
              <ShieldCheck className="h-4 w-4 text-terracotta-light" />
              <span className="font-dm-sans text-xs text-taupe font-500">
                NIST SP 800-88 Aligned Sanitization
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-manrope text-sm font-700 tracking-wider text-white uppercase mb-4">
              Platform
            </h4>
            <ul className="space-y-3 font-dm-sans text-sm text-taupe/80">
              <li>
                <a href="#how-it-works" className="hover:text-terracotta-light transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#device-categories" className="hover:text-terracotta-light transition-colors">
                  Accepted Devices
                </a>
              </li>
              <li>
                <a href="#data-protection" className="hover:text-terracotta-light transition-colors">
                  Data Protection
                </a>
              </li>
              <li>
                <a href="#lifecycle" className="hover:text-terracotta-light transition-colors">
                  Device Lifecycle
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-manrope text-sm font-700 tracking-wider text-white uppercase mb-4">
              Services
            </h4>
            <ul className="space-y-3 font-dm-sans text-sm text-taupe/80">
              <li>
                <a href="#schedule" className="hover:text-terracotta-light transition-colors">
                  Schedule Pickup
                </a>
              </li>
              <li>
                <a href="#tracking" className="hover:text-terracotta-light transition-colors">
                  Track Collection
                </a>
              </li>
              <li>
                <a href="#certificates" className="hover:text-terracotta-light transition-colors">
                  Verify Certificate
                </a>
              </li>
              <li>
                <a href="#marketplace" className="hover:text-terracotta-light transition-colors">
                  Refurbished Market
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-manrope text-sm font-700 tracking-wider text-white uppercase mb-4">
              Get in Touch
            </h4>
            <ul className="space-y-3 font-dm-sans text-sm text-taupe/80">
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-copper-light" />
                <span>contact@retech.in</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-copper-light" />
                <span>+91 (080) 4120-RETECH</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-copper-light mt-0.5" />
                <span>Bengaluru &middot; Mumbai &middot; New Delhi</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 border-t border-taupe/15 pt-8 flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="font-dm-sans text-xs text-taupe/60">
            &copy; {new Date().getFullYear()} ReTech Technologies India. All rights reserved.
          </p>

          <div className="flex items-center gap-6 font-dm-sans text-xs text-taupe/60">
            <a href="#privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#compliance" className="hover:text-white transition-colors">
              E-Waste Compliance (EPR)
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
