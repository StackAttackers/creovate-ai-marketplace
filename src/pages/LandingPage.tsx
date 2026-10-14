import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Target,
  ShieldCheck,
  CheckCircle2,
  Search,
  Check,
  Building2,
  Palette,
  Zap,
} from 'lucide-react';
import { useCreators } from '../hooks/useCreators';
import { useCampaigns } from '../hooks/useCampaigns';
import { matchCreators } from '../services/matching/engine';
import { formatPriceRange } from '../utils/format';
import { CreatorCard } from '../components/creators/CreatorCard';
import { CreatorAgencyRegistrationModal } from '../components/onboarding/CreatorAgencyRegistrationModal';
import { BrandRequirementMatcherModal } from '../components/onboarding/BrandRequirementMatcherModal';
import { InviteCreatorModal } from '../components/campaigns/InviteCreatorModal';
import { SafeImage } from '../components/ui/SafeImage';
import { SafeAvatar } from '../components/ui/SafeAvatar';

const popularServices = [
  {
    title: 'AI Video Ads',
    subtitle: 'Runway Gen-3 & Sora',
    category: 'AI Video Generation',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=85',
  },
  {
    title: '3D CGI Animation',
    subtitle: 'Blender & Unreal Engine',
    category: '3D Art and Animation',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=85',
  },
  {
    title: 'Commercial AI Fashion',
    subtitle: 'Midjourney v6 & Retouch',
    category: 'AI Photography',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=85',
  },
  {
    title: 'Virtual Brand Humans',
    subtitle: 'MetaHuman & HeyGen',
    category: 'AI Avatars',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=85',
  },
  {
    title: 'Product Renders 3D',
    subtitle: 'Cinema 4D & Octane',
    category: 'Product Visualization',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=85',
  },
];

const trustedBrands = [
  'Meta AI Partners',
  'StyleVerse India',
  'CyberLuxe Studio',
  'Netflix Creative Lab',
  'Unreal Engine Creators',
  'Vogue Digital',
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { creators } = useCreators();
  const { campaigns } = useCampaigns();

  const [heroSearch, setHeroSearch] = useState('');

  // 3-Role Onboarding Modal States
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isCreatorAgencyModalOpen, setIsCreatorAgencyModalOpen] = useState(false);
  const [creatorAgencyRole, setCreatorAgencyRole] = useState<'creator' | 'agency'>('creator');

  // Direct Invite Modal state from matched results
  const [inviteModalData, setInviteModalData] = useState<{
    isOpen: boolean;
    creatorId: string;
    creatorName: string;
  }>({
    isOpen: false,
    creatorId: '',
    creatorName: '',
  });

  // Mini Interactive Matching Playground state
  const [selectedDemoCampaignIndex, setSelectedDemoCampaignIndex] = useState(0);
  const [isDemoMatching, setIsDemoMatching] = useState(false);
  const activeCampaign = campaigns[selectedDemoCampaignIndex] || campaigns[0];
  const demoMatches = activeCampaign ? matchCreators(creators, activeCampaign).slice(0, 3) : [];

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/discover?q=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      navigate('/discover');
    }
  };

  const handleSimulateMatch = (index: number) => {
    setSelectedDemoCampaignIndex(index);
    setIsDemoMatching(true);
    setTimeout(() => {
      setIsDemoMatching(false);
    }, 350);
  };

  const handleTriggerInvite = (creatorId: string, creatorName: string) => {
    setInviteModalData({
      isOpen: true,
      creatorId,
      creatorName,
    });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-hidden">
      {/* ═══════════════════════════════════════════════════════════════════
          1. FIVERR-STYLE HERO SECTION WITH CENTRAL SEARCH & ROLE HUB
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative pt-36 sm:pt-44 pb-20 sm:pb-28 overflow-hidden bg-gradient-to-b from-blue-50/60 via-white to-white border-b border-slate-200">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-[#2563EB]/[0.06] blur-[160px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[300px] bg-[#38BDF8]/[0.05] blur-[140px] pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-7 relative z-10">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-[#2563EB] animate-pulse" />
            <span>Creovate AI • India's Leading AI Freelance Creator Platform</span>
          </div>

          {/* Fiverr-Style Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-[1.08] font-sans">
            Find the right <span className="text-[#2563EB]">AI creative service</span>,{' '}
            <br className="hidden sm:inline" />
            right now.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Discover elite AI video directors, prompt architects, and 3D CGI artists with transparent{' '}
            <strong className="text-slate-900 font-semibold">Indian Rupee (₹ INR)</strong> rates and commercial IP rights.
          </p>

          {/* Fiverr-Style Central Search Box */}
          <form onSubmit={handleHeroSearch} className="max-w-2xl mx-auto pt-2">
            <div className="flex flex-col sm:flex-row items-stretch rounded-2xl sm:rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-blue-500/5 focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <div className="flex items-center flex-1 px-3 py-2 sm:py-0">
                <Search className="w-5 h-5 text-slate-400 mr-2.5 shrink-0" />
                <input
                  type="text"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="What AI service are you looking for? (e.g. Runway Gen-3, 3D CGI)..."
                  className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-7 py-3 rounded-xl sm:rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm transition-all shadow-md shadow-blue-500/25 shrink-0 flex items-center justify-center gap-2"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Popular Tag Pills (Fiverr Signature Feature) */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-slate-600">
            <span className="font-semibold text-slate-700">Popular:</span>
            {[
              'Runway Gen-3',
              'Midjourney v6',
              'Commercial Video Ads',
              '3D CGI Animation',
              'Virtual Avatars',
              'Flux LoRA Models',
            ].map((tag) => (
              <button
                key={tag}
                onClick={() => navigate(`/discover?q=${encodeURIComponent(tag)}`)}
                className="rounded-full bg-slate-100 hover:bg-blue-50 hover:text-[#2563EB] px-3 py-1 text-slate-600 border border-slate-200 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              3-ROLE INTERACTIVE ENTRY HUB (BRANDS • AI CREATORS • AI AGENCIES)
          ═══════════════════════════════════════════════════════════════════ */}
          <div className="pt-8 max-w-4xl mx-auto">
            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-[#2563EB] mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Start Your Creative Journey
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Who are you joining as today?
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Choose your profile to access instant AI matching or list your generative video tools &amp; rate cards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              {/* Card 1: Brand */}
              <div
                onClick={() => setIsBrandModalOpen(true)}
                className="group cursor-pointer rounded-2xl border border-slate-200 bg-white hover:bg-blue-50/30 p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:border-blue-400 hover:scale-[1.02] flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition-transform">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-1">
                    For Brands &amp; Companies
                  </span>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    I'm a Brand
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Looking to hire elite AI creators or creative agencies for commercials &amp; campaigns.
                  </p>
                </div>
                <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#2563EB] group-hover:translate-x-0.5 transition-transform">
                  <span>Post Brief &amp; Get Matches</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Card 2: Solo AI Creator */}
              <div
                onClick={() => {
                  setCreatorAgencyRole('creator');
                  setIsCreatorAgencyModalOpen(true);
                }}
                className="group cursor-pointer rounded-2xl border border-slate-200 bg-white hover:bg-blue-50/30 p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:border-blue-400 hover:scale-[1.02] flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition-transform">
                    <Palette className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-1">
                    Solo Creative Talent
                  </span>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    I'm an AI Creator
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Solo generative director, prompt engineer, or visual artist seeking client commissions in ₹ INR.
                  </p>
                </div>
                <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#2563EB] group-hover:translate-x-0.5 transition-transform">
                  <span>Publish Creator Gig</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Card 3: AI Agency */}
              <div
                onClick={() => {
                  setCreatorAgencyRole('agency');
                  setIsCreatorAgencyModalOpen(true);
                }}
                className="group cursor-pointer rounded-2xl border border-slate-200 bg-white hover:bg-blue-50/30 p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:border-blue-400 hover:scale-[1.02] flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mb-3 group-hover:scale-110 transition-transform">
                    <Zap className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block mb-1">
                    Studio / Production House
                  </span>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    I'm an AI Agency
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Creative production studio offering end-to-end multi-model pipelines and enterprise retainers.
                  </p>
                </div>
                <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#2563EB] group-hover:translate-x-0.5 transition-transform">
                  <span>Register Agency Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Trusted Brands Banner (Fiverr Signature Trust Strip) */}
          <div className="pt-10 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span className="text-slate-600">Trusted by modern brands:</span>
            <div className="flex flex-wrap items-center justify-center gap-6 text-slate-600 font-sans tracking-normal">
              {trustedBrands.map((brand) => (
                <span key={brand} className="text-xs hover:text-blue-600 transition-colors">
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          2. FIVERR-STYLE POPULAR SERVICES CAROUSEL / CARDS
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Popular AI Services
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              Top generative services commissioned this week by brands.
            </p>
          </div>
          <button
            onClick={() => navigate('/discover')}
            className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1"
          >
            Explore All Services <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {popularServices.map((svc) => (
            <div
              key={svc.title}
              onClick={() => navigate(`/discover?category=${encodeURIComponent(svc.category)}`)}
              className="group cursor-pointer relative h-80 rounded-2xl overflow-hidden border border-slate-200 p-5 flex flex-col justify-between shadow-md transition-all duration-300 hover:border-[#2563EB] hover:scale-[1.03] hover:shadow-xl hover:shadow-blue-500/10"
            >
              {/* Full-color crystal-clear image with smooth zoom */}
              <SafeImage
                src={svc.imageUrl}
                alt={svc.title}
                category={svc.category}
                containerClassName="absolute inset-0 w-full h-full"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 brightness-[0.95] group-hover:brightness-105"
              />

              {/* Gentle bottom gradient for text contrast without obscuring the artwork */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />

              {/* Top Category Badge */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-bold text-white shadow-md">
                  <Sparkles className="w-3 h-3 text-blue-400" />
                  <span>{svc.subtitle}</span>
                </span>
                <span className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-md border border-white/15 flex items-center justify-center text-white/80 group-hover:text-blue-300 group-hover:bg-blue-600/30 group-hover:border-blue-400 transition-all">
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>

              {/* Bottom Title & Action */}
              <div className="relative z-10 space-y-1">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block drop-shadow">
                  {svc.category}
                </span>
                <h3 className="text-xl font-black text-white tracking-tight drop-shadow-lg group-hover:text-blue-200 transition-colors">
                  {svc.title}
                </h3>
                <div className="pt-1 flex items-center gap-1 text-xs text-gray-200 font-medium drop-shadow">
                  <span>Explore Gigs</span>
                  <ArrowRight className="w-3 h-3 text-blue-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          3. FIVERR-STYLE VALUE PROPOSITION GRID ("WHOLE WORLD OF TALENT")
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#2563EB] block mb-2">
              Why Creovate AI
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              A whole world of AI talent at your fingertips
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'Over 8 Generative Disciplines',
                desc: 'Find any specialized service—from cinematic video ads and 3D CGI to virtual avatars and prompt architecture.',
                icon: Sparkles,
              },
              {
                title: 'Algorithmic Multi-Vector Matching',
                desc: 'Our deterministic engine pairs your creative brief with creators based on verified skill intersection and budget fit.',
                icon: Target,
              },
              {
                title: 'Upfront Indian Rupee (₹ INR) Rates',
                desc: 'Clear indicative packages starting from ₹20,000 without hidden fees, conversion cuts, or currency surprises.',
                icon: CheckCircle2,
              },
              {
                title: 'Full Commercial IP Rights',
                desc: 'Every commission includes complete commercial copyright buyout and unrestricted broadcasting rights upon delivery.',
                icon: ShieldCheck,
              },
            ].map((col, idx) => {
              const Icon = col.icon;
              return (
                <div key={idx} className="space-y-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{col.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{col.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          4. FIVERR PRO STYLE BANNER ("CREOVATE PRO FOR BRANDS")
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border border-blue-500/30 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-bold uppercase tracking-wider border border-blue-400/30">
                  <Sparkles className="w-3.5 h-3.5 text-blue-300" /> Creovate Pro
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  The premium solution for brands & creative agencies
                </h2>
                <p className="text-sm sm:text-base text-blue-100/90 max-w-2xl leading-relaxed">
                  Access pre-vetted AI directors, dedicated prompt architects, and end-to-end commercial campaign management with verified provenance audits.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs font-semibold text-blue-100">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Top 1% AI Model Masters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Dedicated Brief Builder</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>End-to-End IP Buyout</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => setIsBrandModalOpen(true)}
                    className="px-7 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/30"
                  >
                    Post Brand Brief
                  </button>
                  <button
                    onClick={() => navigate('/matching')}
                    className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors"
                  >
                    Match With a Pro
                  </button>
                </div>
              </div>

              <div className="lg:col-span-4 hidden lg:block text-right">
                <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-left space-y-3">
                  <span className="text-[10px] uppercase font-bold text-blue-300 block tracking-wider">
                    Live Brand Workspace
                  </span>
                  <div className="text-2xl font-black text-white font-mono">₹14,00,000+</div>
                  <p className="text-xs text-blue-100/80">
                    Active campaign budget managed by creative agencies on Creovate AI.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          5. TRENDING AI GIGS (FIVERR GIG CARDS GRID)
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 bg-slate-50/60 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#2563EB] block mb-2">
                Trending Creator Services
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Gigs You May Like
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-1">
                Verified commercial AI services commissioned by agencies across India.
              </p>
            </div>
            <button
              onClick={() => navigate('/discover')}
              className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1"
            >
              See More Gigs <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {creators.slice(0, 8).map((creator) => (
              <CreatorCard key={creator.uid} creator={creator} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          6. AI MATCHING PLAYGROUND (LIVE ALGORITHMIC SIMULATION)
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-slate-50 border border-slate-200 p-8 sm:p-12 shadow-md">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column */}
              <div className="lg:col-span-5 space-y-5">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#2563EB] block">
                  Algorithmic Compatibility Engine
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Simulate Live Creator Matching
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Select a live commercial campaign scenario below to see how our multi-vector algorithm evaluates skill intersection, ₹ budget fit, and stylistic synergy in milliseconds.
                </p>

                {/* Scenario Selector */}
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Choose Campaign Scenario:
                  </span>
                  {campaigns.slice(0, 3).map((camp, idx) => (
                    <button
                      key={camp.id}
                      onClick={() => handleSimulateMatch(idx)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                        selectedDemoCampaignIndex === idx
                          ? 'border-[#2563EB] bg-blue-50 text-blue-900 font-bold shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate max-w-[200px]">{camp.title}</span>
                        <span className="font-mono text-[10px] text-slate-500">
                          {formatPriceRange(camp.budgetMin, camp.budgetMax)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setIsBrandModalOpen(true)}
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] pt-2 transition-colors"
                >
                  <span>Build Custom Brief in AI Matching Engine</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Right Column: Ranked Matches */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Target className="w-4 h-4 text-[#2563EB]" />
                      Top Matched Creators for "{activeCampaign?.title}"
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Category: {activeCampaign?.category} • Budget:{' '}
                      {activeCampaign && formatPriceRange(activeCampaign.budgetMin, activeCampaign.budgetMax)}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#2563EB] font-bold">
                    {isDemoMatching ? 'Calculating...' : 'Ranked 0–100%'}
                  </span>
                </div>

                <div className="space-y-3">
                  {demoMatches.map((res, i) => (
                    <div
                      key={res.creatorId}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-slate-200/70 font-mono text-xs font-bold text-slate-700 flex items-center justify-center shrink-0">
                          #{i + 1}
                        </span>
                        <SafeAvatar
                          src={res.creatorAvatar}
                          alt={res.creatorName}
                          size="md"
                          className="rounded-xl border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 truncate">
                            {res.creatorName}
                          </h4>
                          <p className="text-[11px] text-slate-500 truncate">
                            {res.creatorHeadline}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="text-sm font-black font-mono text-[#2563EB]">
                            {res.score.overall}%
                          </div>
                          <div className="text-[10px] text-slate-500">Compatibility</div>
                        </div>
                        <button
                          onClick={() => navigate(`/creators/${res.creatorId}`)}
                          className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200 transition-colors shadow-sm"
                        >
                          View Gig
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          7. FIVERR BUYER REQUESTS STYLE BRIEFS ("CREATIVE OPPORTUNITIES")
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#2563EB] block mb-2">
                Open Project Briefs
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Featured Commercial Opportunities
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-1">
                Campaign briefs posted by brands looking for immediate creator proposals.
              </p>
            </div>
            <button
              onClick={() => setIsBrandModalOpen(true)}
              className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1"
            >
              Post a Brief <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.slice(0, 6).map((c) => (
              <div
                key={c.id}
                className="rounded-2xl bg-white border border-slate-200 hover:border-[#2563EB]/60 p-5 flex flex-col justify-between transition-all shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                      {c.category}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Due: {c.deadline}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2">{c.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                    {c.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {c.requiredSkills.slice(0, 3).map((sk) => (
                      <span
                        key={sk}
                        className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 border border-slate-200"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Budget</span>
                    <span className="font-bold font-mono text-slate-900 text-sm">
                      {formatPriceRange(c.budgetMin, c.budgetMax)}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate('/matching')}
                    className="px-3.5 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs transition-colors shadow-sm shadow-blue-500/20"
                  >
                    Match Talent
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          8. CALL TO ACTION — FIVERR CLOSING HERO
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 sm:py-32 bg-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs text-blue-700">
            <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>AI Creator Marketplace • Stack Attack</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Suddenly, commissioning elite AI talent is simple.
          </h2>

          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Join the creative platform connecting extraordinary brands with the world's most talented generative AI creators.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setIsBrandModalOpen(true)}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-bold rounded-xl shadow-xl shadow-blue-500/25 transition-all"
            >
              Post a Campaign Brief
            </button>
            <button
              onClick={() => navigate('/discover')}
              className="w-full sm:w-auto px-7 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-xl border border-slate-200 transition-all"
            >
              Explore AI Creator Gigs
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          ONBOARDING & MATCHING MODALS
      ═══════════════════════════════════════════════════════════════════ */}
      {/* 1. Creator & Agency Registration Modal */}
      <CreatorAgencyRegistrationModal
        isOpen={isCreatorAgencyModalOpen}
        onClose={() => setIsCreatorAgencyModalOpen(false)}
        initialRole={creatorAgencyRole}
      />

      {/* 2. Brand Requirement Intake & AI Matching Modal */}
      <BrandRequirementMatcherModal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
        onInviteCreator={handleTriggerInvite}
      />

      {/* 3. Direct Invite Modal */}
      <InviteCreatorModal
        isOpen={inviteModalData.isOpen}
        onClose={() => setInviteModalData((prev) => ({ ...prev, isOpen: false }))}
        creatorId={inviteModalData.creatorId}
        creatorName={inviteModalData.creatorName}
      />
    </div>
  );
}
