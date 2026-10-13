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
            ? 'bg-[#0B0D12]/95 backdrop-blur-2xl border-b border-white/[0.08] shadow-2xl shadow-black/50'
            : 'bg-[#0B0D12]/90 backdrop-blur-md border-b border-white/[0.06]'
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
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-[#10B981] text-white shadow-md shadow-[#10B981]/30">
                <Sparkles className="w-4 h-4 fill-current" />
              </div>
              <div className="flex items-center">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
                  creovate<span className="text-[#10B981]">.</span>
                </span>
                <span className="ml-1 text-[9px] uppercase font-mono font-bold tracking-widest px-1.5 py-0.2 rounded bg-emerald-500/20 text-[#34D399] border border-emerald-500/30">
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
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] pl-4 pr-11 py-2 text-xs text-white placeholder-gray-400 focus:border-[#10B981] focus:bg-[#141720] focus:outline-none transition-all"
              />
              <button
                type="submit"
                aria-label="Search"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white flex items-center justify-center transition-colors shadow-sm"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-3 text-xs font-semibold text-[#94A3B8]">
              {/* Challenge Deliverable Review Modals */}
              <button
                onClick={() => setIsPresentationOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 transition-colors"
                title="View Challenge Presentation Slides"
              >
                <Award className="w-3.5 h-3.5 text-violet-400" />
                <span>Demo Slides</span>
              </button>

              <button
                onClick={() => setIsDataModelOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 transition-colors"
                title="Inspect Platform Data Models & Schemas"
              >
                <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Data Model</span>
              </button>

              {/* Auth Controls */}
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate(dashboardPath)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 transition-colors"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={signOut}
                    className="p-1.5 text-gray-400 hover:text-white transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link
                    to="/auth?mode=signin"
                    className="text-white hover:text-emerald-300 transition-colors"
                  >
                    Sign In
                  </Link>

                  <Link
                    to="/auth?mode=signup&role=brand"
                    className="px-4 py-2 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white font-semibold transition-all shadow-sm shadow-[#10B981]/30"
                  >
                    Join
                  </Link>
                </div>
              )}
            </div>


            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white bg-white/[0.03] border border-white/5"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Fiverr-Style Horizontal Category Ribbon (Sub-Navigation) */}
        <div className="hidden md:block border-t border-white/[0.06] bg-[#090A12]/90">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4 overflow-x-auto py-2.5 text-[11px] font-medium text-gray-400 scrollbar-none">
              {fiverrCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => navigate(`/discover?category=${encodeURIComponent(category)}`)}
                  className="whitespace-nowrap hover:text-white hover:underline underline-offset-8 transition-colors"
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
              className="lg:hidden bg-[#090A12] border-t border-white/10 px-4 pt-4 pb-6 space-y-4"
            >
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={navSearch}
                  onChange={(e) => setNavSearch(e.target.value)}
                  placeholder="Search AI creative services..."
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-gray-400"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-violet-400"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>

              <div className="flex flex-col space-y-2 text-sm text-gray-300">
                <Link
                  to="/discover"
                  onClick={() => setMobileOpen(false)}
                  className="py-1.5 hover:text-white"
                >
                  Explore Talent Directory
                </Link>
                <Link
                  to="/matching"
                  onClick={() => setMobileOpen(false)}
                  className="py-1.5 hover:text-white"
                >
                  AI Compatibility Engine
                </Link>
                <Link
                  to="/brand-dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="py-1.5 hover:text-white"
                >
                  Creovate Pro (Brand Studio)
                </Link>
              </div>

              <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
                <Link
                  to="/auth?mode=signup&role=creator"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center py-2 rounded-xl bg-white/[0.05] text-xs font-semibold text-violet-300"
                >
                  Become a Creator
                </Link>
                <Link
                  to="/auth?mode=signin"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center py-2 rounded-xl bg-[#10B981] text-xs font-semibold text-white shadow-md shadow-[#10B981]/25"
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

