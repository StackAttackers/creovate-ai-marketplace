import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Sparkles,
  LogOut,
  LayoutDashboard,
  Search,
  Award,
  FileCode2,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/cn';
import { ChallengePresentationModal } from '../ui/ChallengePresentationModal';
import { DataModelInspectorModal } from '../ui/DataModelInspectorModal';

const fiverrCategories = [
  'AI Video Generation',
  'AI Advertising',
  'AI Photography',
  '3D Art and Animation',
  'AI Graphic Design',
  'AI Avatars',
  'Product Visualization',
  'AI-Assisted Creative Development',
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navSearch, setNavSearch] = useState('');
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [isDataModelOpen, setIsDataModelOpen] = useState(false);
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();


  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const dashboardPath =
    user?.role === 'brand' ? '/brand-dashboard' : '/creator-dashboard';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/discover?q=${encodeURIComponent(navSearch.trim())}`);
      setNavSearch('');
      setMobileOpen(false);
    }
  };

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-white/95 backdrop-blur-2xl border-b border-slate-200/80 shadow-md shadow-slate-900/5'
            : 'bg-white/90 backdrop-blur-md border-b border-slate-200/60'
        )}
      >
        {/* Fiverr-Style Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 gap-4">
            {/* Creovate AI Wordmark Logo */}
            <Link
              to="/"
              className="flex items-center gap-2.5 group shrink-0 focus:outline-none"
              onClick={() => setMobileOpen(false)}
            >
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-[#2563EB] text-white shadow-md shadow-blue-500/30">
                <Sparkles className="w-4 h-4 fill-current" />
              </div>
              <div className="flex items-center">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-sans">
                  creovate<span className="text-[#2563EB]">.</span>
                </span>
                <span className="ml-1 text-[9px] uppercase font-mono font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-50 text-[#2563EB] border border-blue-200 font-semibold">
                  AI PRO
                </span>
              </div>
            </Link>

            {/* Fiverr-Style Integrated Search Input */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden md:flex flex-1 max-w-lg items-center relative"
            >
              <input
                type="text"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="What AI creative service are you looking for today?"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-4 pr-11 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#2563EB] focus:bg-white focus:outline-none transition-all"
              />
              <button
                type="submit"
                aria-label="Search"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white flex items-center justify-center transition-colors shadow-sm"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-3 text-xs font-semibold text-slate-600">
              {/* Challenge Deliverable Review Modals */}
              <button
                onClick={() => setIsPresentationOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                title="View Challenge Presentation Slides"
              >
                <Award className="w-3.5 h-3.5 text-blue-600" />
                <span>Demo Slides</span>
              </button>

              <button
                onClick={() => setIsDataModelOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors"
                title="Inspect Platform Data Models & Schemas"
              >
                <FileCode2 className="w-3.5 h-3.5 text-sky-600" />
                <span>Data Model</span>
              </button>

              {/* Auth Controls */}
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate(dashboardPath)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={signOut}
                    className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link
                    to="/auth?mode=signin"
                    className="text-slate-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    Sign In
                  </Link>

                  <Link
                    to="/auth?mode=signup&role=brand"
                    className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold transition-all shadow-sm shadow-blue-500/25"
                  >
                    Join
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Fiverr-Style Horizontal Category Ribbon (Sub-Navigation) */}
        <div className="hidden md:block border-t border-slate-200/80 bg-slate-50/95">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4 overflow-x-auto py-2.5 text-[11px] font-medium text-slate-600 scrollbar-none">
              {fiverrCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => navigate(`/discover?category=${encodeURIComponent(category)}`)}
                  className="whitespace-nowrap hover:text-blue-600 hover:underline underline-offset-8 transition-colors"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-slate-200 px-4 pt-4 pb-6 space-y-4 shadow-xl"
            >
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={navSearch}
                  onChange={(e) => setNavSearch(e.target.value)}
                  placeholder="Search AI creative services..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-3.5 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-blue-600"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>

              <div className="flex flex-col space-y-2 text-sm text-slate-700">
                <Link
                  to="/discover"
                  onClick={() => setMobileOpen(false)}
                  className="py-1.5 hover:text-blue-600"
                >
                  Explore Talent Directory
                </Link>
                <Link
                  to="/matching"
                  onClick={() => setMobileOpen(false)}
                  className="py-1.5 hover:text-blue-600"
                >
                  AI Compatibility Engine
                </Link>
                <Link
                  to="/brand-dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="py-1.5 hover:text-blue-600"
                >
                  Creovate Pro (Brand Studio)
                </Link>
              </div>

              <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
                <Link
                  to="/auth?mode=signup&role=creator"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center py-2 rounded-xl bg-slate-100 text-xs font-semibold text-blue-600 hover:bg-slate-200"
                >
                  Become a Creator
                </Link>
                <Link
                  to="/auth?mode=signin"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-xs font-semibold text-white shadow-md shadow-blue-500/25"
                >
                  Sign In / Join
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Challenge Approach Slides Modal */}
      <ChallengePresentationModal
        isOpen={isPresentationOpen}
        onClose={() => setIsPresentationOpen(false)}
      />

      {/* Data Model & Architecture Modal */}
      <DataModelInspectorModal
        isOpen={isDataModelOpen}
        onClose={() => setIsDataModelOpen(false)}
      />
    </>
  );
}

