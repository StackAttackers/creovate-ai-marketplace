import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Globe, Mail, Share2, MessageSquare, ShieldCheck, Database } from 'lucide-react';
import { FirebaseStatusModal } from '../firebase/FirebaseStatusModal';

const fiverrFooterLinks = {
  Categories: [
    { label: 'AI Video Generation', href: '/discover?category=AI%20Video%20Generation' },
    { label: 'AI Advertising', href: '/discover?category=AI%20Advertising' },
    { label: 'AI Photography', href: '/discover?category=AI%20Photography' },
    { label: '3D Art & CGI Animation', href: '/discover?category=3D%20Art%20and%20Animation' },
    { label: 'AI Graphic Design', href: '/discover?category=AI%20Graphic%20Design' },
    { label: 'Virtual Avatars & Humans', href: '/discover?category=AI%20Avatars' },
    { label: 'Product Visualization', href: '/discover?category=Product%20Visualization' },
  ],
  'For Brands': [
    { label: 'Creovate Pro Studio', href: '/brand-dashboard' },
    { label: 'Post a Campaign Brief', href: '/brand-dashboard' },
    { label: 'AI Compatibility Matcher', href: '/matching' },
    { label: 'Find Verified Talent', href: '/discover' },
    { label: 'Brand IP Protection', href: '/brand-dashboard' },
  ],
  'For Creators': [
    { label: 'Become an AI Creator', href: '/auth?mode=signup&role=creator' },
    { label: 'Creator Studio Dashboard', href: '/creator-dashboard' },
    { label: 'Browse Creative Gigs', href: '/discover' },
    { label: 'Rate Cards in ₹ INR', href: '/creator-dashboard' },
    { label: 'Browse Open Briefs', href: '/#opportunities' },
  ],
  Platform: [
    { label: 'Explore All Gigs', href: '/discover' },
    { label: 'AI Brief Builder', href: '/brand-dashboard' },
    { label: 'Platform Showcase', href: '/' },
    { label: 'Creator Provenance Audits', href: '/discover' },
  ],
};

export default function Footer() {
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);

  return (
    <>
      <footer className="bg-slate-50 border-t border-slate-200 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Top 4-Column Directory Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {Object.entries(fiverrFooterLinks).map(([title, links]) => (
              <div key={title} className="space-y-3">
                <h4 className="text-slate-900 font-bold text-sm tracking-wide">{title}</h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className="text-slate-600 hover:text-[#2563EB] hover:underline underline-offset-4 transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Brand & Accreditation Bottom Strip */}
          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-black">
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                </div>
                <span className="text-lg font-black text-slate-900 font-sans">
                  creovate<span className="text-[#2563EB]">.</span>
                </span>
              </Link>
              <span className="text-slate-300">|</span>
              <span className="text-[11px] text-slate-500">
                © 2026 Creovate AI Ltd. • Team Stack Attack
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[11px]">
              <button
                type="button"
                onClick={() => setIsFirebaseModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#2563EB] border border-blue-200 transition-all cursor-pointer font-bold"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Firebase Backend</span>
              </button>

              <div className="flex items-center gap-1.5 text-[#2563EB]">
                <ShieldCheck className="w-4 h-4" />
                <span>Commercial IP Buyout Guaranteed</span>
              </div>

              <div className="flex items-center gap-2 text-slate-400">
                {[Globe, MessageSquare, Share2, Mail].map((Icon, i) => (
                  <span
                    key={i}
                    className="w-7 h-7 rounded-lg bg-white hover:bg-blue-50 hover:text-[#2563EB] border border-slate-200 shadow-sm flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>

      <FirebaseStatusModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
      />
    </>
  );
}
