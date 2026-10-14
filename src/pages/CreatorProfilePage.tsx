import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  Send,
  Sparkles,
  Wrench,
  CheckCircle2,
  Maximize2,
  X,
  Share2,
  Star,
  Clock,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  FileCode2,
  Award,
} from 'lucide-react';
import { useCreators } from '../hooks/useCreators';
import { useShortlist } from '../hooks/useShortlist';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { InviteCreatorModal } from '../components/campaigns/InviteCreatorModal';
import { SafeImage } from '../components/ui/SafeImage';
import { SafeAvatar } from '../components/ui/SafeAvatar';
import {
  formatCurrency,
  getAvailabilityLabel,
  getAvailabilityColor,
} from '../utils/format';
import type { PortfolioItem } from '../types/creator';

export default function CreatorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { getCreatorById } = useCreators();
  const { isShortlisted, toggleShortlist } = useShortlist();

  const creator = getCreatorById(id || '');

  // Active showcase item in gallery
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<PortfolioItem | null>(null);

  // Fiverr 3-Tier package selector state: 'basic' | 'standard' | 'premium'
  const [selectedTier, setSelectedTier] = useState<'basic' | 'standard' | 'premium'>('standard');

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Invite modal state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!creator) {
    return (
      <div className="min-h-screen bg-midnight-900 pt-32 pb-20 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-white mb-2">Service Not Found</h2>
        <p className="text-gray-400 mb-6">The generative AI gig or creator you are looking for is unavailable.</p>
        <Link to="/discover">
          <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Marketplace
          </Button>
        </Link>
      </div>
    );
  }

  const saved = isShortlisted(creator.uid);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Dynamic Fiverr-style Gig Title
  const gigTitle = `I will produce high-end ${creator.categories[0] || 'AI Commercials'} using ${creator.tools[0] || 'Runway Gen-3'} and ${creator.tools[1] || 'Midjourney'}`;

  // Deterministic 3-Tier Fiverr Packages calculated in INR
  const basicPrice = creator.priceRange.min;
  const standardPrice = Math.round((creator.priceRange.min + creator.priceRange.max) / 2);
  const premiumPrice = creator.priceRange.max;

  const packageData = {
    basic: {
      id: 'basic',
      name: 'Basic Concept',
      headline: 'Single AI Scene & Concept Test',
      price: basicPrice,
      deliveryDays: 2,
      revisions: 2,
      description: `1 High-definition ${creator.categories[0]} generation, rapid style exploratory, prompt engineering logs, and raw exports.`,
      features: [
        '1 Concept Direction',
        '3 High-Res Variations',
        'Prompt & Parameter Metadata',
        'Commercial Usage Rights',
      ],
      notIncluded: [
        'Multi-scene sequencing',
        'Custom LoRA / Model Training',
        'Audio & Voiceover Synchronization',
      ],
    },
    standard: {
      id: 'standard',
      name: 'Standard Production',
      headline: 'Full Commercial Campaign Asset',
      price: standardPrice,
      deliveryDays: 5,
      revisions: 4,
      isPopular: true,
      description: `Complete commercial-grade ${creator.categories[0]} production with high-resolution upscaling, color mastering, and multi-format exports.`,
      features: [
        'Complete Creative Direction',
        'Up to 10 Asset Deliverables',
        '4K AI Upscaling (Topaz Video AI)',
        'Prompt Recipe & Generation Logs',
        'Full Commercial IP Transfer',
        'Audio / SFX Design Integration',
      ],
      notIncluded: [
        'Dedicated Style LoRA Checkpoint Model',
      ],
    },
    premium: {
      id: 'premium',
      name: 'Premium Studio Retainer',
      headline: 'Custom AI Pipeline & Retainer',
      price: premiumPrice,
      deliveryDays: 8,
      revisions: 'Unlimited',
      description: `Dedicated AI production package including custom fine-tuned style LoRAs, complete multi-shot storytelling, and ongoing art direction.`,
      features: [
        'Custom Fine-Tuned Style Model (LoRA)',
        'Unlimited Asset Generations & Variations',
        'Priority Turnaround (24h syncs)',
        '4K & 8K ProRes 422 HQ Masters',
        'Complete Workflow Source Code (.json)',
        'Direct 1-on-1 Creative Directorship',
        'Full Global Commercial IP Buyout',
      ],
      notIncluded: [],
    },
  };

  const currentPkg = packageData[selectedTier];

  // Verified Client Testimonials
  const reviews = [
    {
      id: 'r1',
      client: 'StyleVerse India',
      role: 'Creative Director',
      rating: 5,
      date: '2 weeks ago',
      comment:
        'Exceptional prompt craft and scene composition. Delivered 4K video ads using Runway Gen-3 that outperformed our traditional studio shoots by 3.4x CTR.',
      deliverable: 'Commercial Video Ads',
    },
    {
      id: 'r2',
      client: 'CyberLuxe Digital',
      role: 'Brand Producer',
      rating: 5,
      date: '1 month ago',
      comment:
        'The character consistency across multiple angles was flawless. Included complete ComfyUI pipelines and provenance documentation as promised.',
      deliverable: 'AI Product Visuals',
    },
    {
      id: 'r3',
      client: 'HyperMotion Labs',
      role: 'Head of Media',
      rating: 5,
      date: '2 months ago',
      comment:
        'Fast turnaround and seamless communication in INR billing. Very professional creator with genuine mastery of generative tools.',
      deliverable: '3D AI Animation',
    },
  ];

  // Frequently Asked Questions
  const faqs = [
    {
      q: 'Do I get full commercial rights and prompt documentation?',
      a: 'Yes. Every project booked through Creovate AI includes complete commercial intellectual property buyout rights and fully transparent prompt metadata logs for corporate audit compliance.',
    },
    {
      q: 'Can you guarantee character and brand consistency across scenes?',
      a: 'Absolutely. We build custom reference embeddings and LoRA checkpoints to ensure your brand ambassador, product geometry, and color aesthetics remain 100% consistent across all shots.',
    },
    {
      q: 'What resolution and output formats do you deliver in?',
      a: 'Deliverables are mastered in 4K ProRes 422 HQ, H.265 MP4, and multi-ratio exports formatted for 16:9 widescreen, 9:16 Instagram Reels/YouTube Shorts, and 1:1 squares.',
    },
    {
      q: 'How does payment protection work on Creovate AI?',
      a: 'Your funds are held securely in Creovate Escrow in Indian Rupees (₹ INR). Funds are only released to the creator once you have reviewed and formally approved the milestone deliverables.',
    },
  ];

  const currentMedia = creator.portfolio[activeMediaIndex] || creator.portfolio[0];

  return (
    <div className="min-h-screen bg-white pt-24 pb-20 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Breadcrumb & Actions */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/discover" className="hover:text-blue-600 transition-colors">AI Services</Link>
            <span>/</span>
            <Link
              to={`/discover?category=${encodeURIComponent(creator.categories[0] || 'All')}`}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              {creator.categories[0] || 'Generative Media'}
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleShortlist(creator.uid)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                saved
                  ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{saved ? 'Saved to List' : 'Save Gig'}</span>
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Link Copied' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Fiverr-Style Gig Title */}
        <div className="mb-5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
            {gigTitle}
          </h1>

          {/* Seller Metadata Header Bar */}
          <div className="mt-3 flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
            <div className="flex items-center gap-2.5">
              <SafeAvatar
                src={creator.avatarUrl}
                name={creator.displayName}
                sizeClass="w-8 h-8"
                className="border border-blue-500/40"
              />
              <span className="font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer">
                {creator.displayName}
              </span>
            </div>

            <div className="h-3 w-px bg-slate-200" />

            <div className="flex items-center gap-1 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[11px] font-semibold text-blue-700">
              <Award className="w-3 h-3 text-blue-600" />
              <span>{creator.featured ? 'Top Rated Creator' : 'Level 2 Seller'}</span>
            </div>

            <div className="h-3 w-px bg-slate-200" />

            {/* Ratings */}
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="font-bold text-slate-900">4.9</span>
              <span className="text-slate-500">({(creator.portfolio.length * 7) + 12})</span>
            </div>

            <div className="h-3 w-px bg-slate-200" />

            <span className="text-slate-500">
              <strong className="text-slate-900">3</strong> Orders in Queue
            </span>

            <div className="h-3 w-px bg-slate-200" />

            <div className="flex items-center gap-1 text-blue-600">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="font-medium">Pro Verified IP</span>
            </div>
          </div>
        </div>

        {/* Bonus Feature: Creator Verification Signals Trust Banner */}
        <div className="mb-8 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/70 via-white to-slate-50 p-5 shadow-sm">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    Creator Trust &amp; Verification Signals
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-mono font-bold border border-blue-200">
                    {creator.verificationSignals?.verificationBadgeLevel || 'Elite Pro Verified'}
                  </span>
                  <span className="text-[11px] font-mono text-blue-600 font-semibold">
                    Trust Score: {creator.verificationSignals?.trustScore || 99}%
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Verified tools, reproducible generative workflows, prompt/seed audit provenance, and guaranteed commercial clearance.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <div className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-sm">
                Completed Commercial Work: <strong className="text-slate-900">{creator.verificationSignals?.completedCampaignsCount || 14}+ Campaigns</strong>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3 h-3 text-blue-600" />
                <span>Commercial Safety Certified</span>
              </div>
            </div>
          </div>

          {/* Signals Breakdown */}
          <div className="mt-4 pt-3.5 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 block mb-1">
                Verified Tools &amp; Model Credentials:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(creator.verificationSignals?.verifiedTools || creator.tools).map((tool) => (
                  <span
                    key={tool}
                    className="rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] text-blue-800 font-mono flex items-center gap-1 font-medium"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-blue-600" />
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 block mb-1">
                Verified Generative Workflows:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(creator.verificationSignals?.verifiedWorkflows || [
                  'Multi-Pass LoRA Character Consistency',
                  'Raw Seed & Prompt Audit Log',
                  'ACES Color Grading & 4K Upscale',
                ]).map((wf) => (
                  <span
                    key={wf}
                    className="rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] text-blue-800 flex items-center gap-1 font-medium"
                  >
                    <CheckCircle2 className="w-2.5 h-2.5 text-blue-600" />
                    {wf}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column Fiverr Layout: Left (65%) Showcase & Content | Right (35%) Sticky Pricing Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT COLUMN: Media Gallery, Gig Description, Seller Card, Provenance, Reviews, FAQs */}
          <div className="lg:col-span-8 space-y-10">
            {/* 1. Main Media Gallery with Thumbnails Carousel */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              {/* Main Showcase Stage */}
              <div
                className="relative aspect-video w-full bg-slate-100 overflow-hidden cursor-pointer group"
                onClick={() => setSelectedPortfolioItem(currentMedia)}
              >
                <SafeImage
                  src={currentMedia.imageUrl}
                  alt={currentMedia.title}
                  category={currentMedia.category}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                  containerClassName="w-full h-full"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />

                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between pointer-events-none z-10">
                  <div>
                    <span className="inline-block bg-blue-600/90 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-bold text-white mb-1.5 uppercase tracking-wider">
                      {currentMedia.category}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white drop-shadow-md">
                      {currentMedia.title}
                    </h3>
                  </div>

                  <button className="pointer-events-auto rounded-full bg-white/20 hover:bg-white/30 p-2.5 backdrop-blur-md text-white transition-colors">
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Thumbnails Row */}
              <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center gap-3 overflow-x-auto scrollbar-none">
                {creator.portfolio.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveMediaIndex(idx)}
                    className={`relative shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                      activeMediaIndex === idx
                        ? 'border-blue-600 shadow-md shadow-blue-500/20 opacity-100 scale-102'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <SafeImage
                      src={item.imageUrl}
                      alt={item.title}
                      category={item.category}
                      className="w-full h-full object-cover"
                      containerClassName="w-full h-full"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* 2. About This Gig (Fiverr Pitch Format) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 pb-4 border-b border-slate-200 mb-5">
                About This Gig
              </h2>

              <div className="max-w-none text-sm text-slate-600 space-y-4 leading-relaxed">
                <p className="text-base text-slate-800 font-medium">
                  Welcome to India&apos;s premier generative AI studio on Creovate AI.
                </p>

                <p>
                  Are you looking to create cinematic commercial video, photorealistic product assets,
                  or high-impact brand visuals without the massive overhead of traditional production sets?
                  I combine cutting-edge generative AI models with rigorous creative direction to produce
                  broadcast-ready deliverables.
                </p>

                <div className="my-5 rounded-xl border border-blue-200 bg-blue-50/60 p-4 space-y-2">
                  <h4 className="font-bold text-blue-700 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" /> What this gig includes:
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Consistent character &amp; product styling</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Custom LoRA checkpoint training</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>4K AI-upscaling &amp; color mastering</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>100% Full commercial broadcast rights</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Prompt engineering recipe logs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Fast revision turnaround in ₹ INR</span>
                    </li>
                  </ul>
                </div>

                <h4 className="text-sm font-bold text-slate-900 pt-2">Tools &amp; Pipelines Utilized:</h4>
                <div className="flex flex-wrap gap-2 pt-1 pb-3">
                  {creator.tools.map((tool) => (
                    <span
                      key={tool}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 font-medium"
                    >
                      <Wrench className="w-3 h-3 text-blue-600" />
                      <span>{tool}</span>
                    </span>
                  ))}
                </div>

                <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <strong>Please note:</strong> For custom requirements or multi-month brand campaigns,
                  feel free to click &quot;Contact Creator&quot; to discuss tailored project milestones.
                </p>
              </div>
            </div>

            {/* 3. About The Seller Card (Fiverr Style Seller Profile) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 pb-4 border-b border-slate-200 mb-6">
                About The Seller
              </h2>

              <div className="flex flex-col sm:flex-row items-start gap-5 mb-6">
                <SafeAvatar
                  src={creator.avatarUrl}
                  name={creator.displayName}
                  sizeClass="w-20 h-20"
                  className="rounded-2xl border-2 border-blue-500/40 shadow-sm"
                />

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-slate-900">{creator.displayName}</h3>
                    <span className="text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded font-semibold">
                      Verified Pro
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mb-3">{creator.headline}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <strong className="text-slate-900">4.9</strong>
                      <span className="text-slate-500">(42 reviews)</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          creator.availability === 'available' ? 'bg-blue-600' : 'bg-amber-500'
                        }`}
                      />
                      <span className={getAvailabilityColor(creator.availability)}>
                        {getAvailabilityLabel(creator.availability)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsInviteOpen(true)}
                  leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                >
                  Contact Me
                </Button>
              </div>

              {/* Seller Fast-Facts Box */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs mb-6">
                <div>
                  <span className="text-slate-500 block">From</span>
                  <strong className="text-slate-900 font-semibold">India (₹ INR)</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Member since</span>
                  <strong className="text-slate-900 font-semibold">Oct 2024</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Avg. response time</span>
                  <strong className="text-slate-900 font-semibold">1 Hour</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Last delivery</span>
                  <strong className="text-slate-900 font-semibold">3 hours ago</strong>
                </div>
              </div>

              <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line border-t border-slate-100 pt-4">
                {creator.biography}
              </div>

              {/* Skills Tags */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">
                  Skills &amp; Capabilities
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {creator.skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-700 border border-slate-200 font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Provenance & Workflow Audit (AI Native Marketplace Feature) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-blue-600" />
                <span>Verified AI Provenance &amp; Workflow Audit</span>
              </h2>

              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Creovate AI performs rigorous provenance verification on all portfolios to guarantee genuine
                generative generation and safeguard brand commercial exclusivity.
              </p>

              <div className="space-y-3">
                {creator.portfolio.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <strong className="text-slate-900 block">{item.title}</strong>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Pipeline: {item.workflow || 'Runway Gen-3 Alpha + ComfyUI LoRA Refine'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 font-semibold">
                        IP Buyout Cleared
                      </span>
                      <button
                        onClick={() => setSelectedPortfolioItem(item)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        Inspect Specs
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. FAQs Accordion */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 pb-4 border-b border-slate-200 mb-4">
                Frequently Asked Questions
              </h2>

              <div className="divide-y divide-slate-100">
                {faqs.map((faq, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div key={index} className="py-3.5">
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        className="w-full flex items-center justify-between text-left text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                      >
                        <span>{faq.q}</span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-blue-600 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </button>

                      {isOpen && (
                        <p className="mt-2.5 text-xs text-slate-600 leading-relaxed pr-6">
                          {faq.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 6. Client Reviews Section */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Client Reviews</h2>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="font-bold text-slate-900">4.9 out of 5</span>
                    <span>• {reviews.length} commercial briefs completed</span>
                  </div>
                </div>

                <Badge variant="blue" size="sm">
                  100% 5-Star Track Record
                </Badge>
              </div>

              <div className="space-y-5">
                {reviews.map((rev) => (
                  <div key={rev.id} className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-blue-700 text-xs">
                          {rev.client[0]}
                        </div>
                        <div>
                          <strong className="text-slate-900 block">{rev.client}</strong>
                          <span className="text-[11px] text-slate-500">{rev.role}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex text-amber-500 justify-end">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400" />
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400">{rev.date}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed pl-9">{rev.comment}</p>
                    <div className="pl-9 mt-2">
                      <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        Deliverable: {rev.deliverable}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sticky Fiverr 3-Tier Pricing Box */}
          <div className="lg:col-span-4 sticky top-28 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
              {/* 3-Tier Tabs Bar */}
              <div className="grid grid-cols-3 text-center border-b border-slate-200 bg-slate-50">
                {(['basic', 'standard', 'premium'] as const).map((tierKey) => {
                  const isSelected = selectedTier === tierKey;
                  return (
                    <button
                      key={tierKey}
                      onClick={() => setSelectedTier(tierKey)}
                      className={`py-3.5 text-xs font-bold uppercase tracking-wider transition-all relative ${
                        isSelected
                          ? 'text-blue-600 bg-white border-b-2 border-blue-600 shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {tierKey}
                      {tierKey === 'standard' && (
                        <span className="block text-[9px] text-blue-600 lowercase font-normal -mt-0.5">
                          popular
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Package Content */}
              <div className="p-6">
                {/* Price & Package Name */}
                <div className="flex items-baseline justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    {currentPkg.headline}
                  </h3>
                  <div className="text-2xl font-black text-slate-900 font-mono">
                    {formatCurrency(currentPkg.price)}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-5 min-h-[48px]">
                  {currentPkg.description}
                </p>

                {/* Delivery Time & Revisions Badges */}
                <div className="flex items-center gap-5 text-xs text-slate-700 font-semibold pb-4 border-b border-slate-200 mb-5">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>{currentPkg.deliveryDays} Days Delivery</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4 text-blue-600" />
                    <span>
                      {typeof currentPkg.revisions === 'number'
                        ? `${currentPkg.revisions} Revisions`
                        : currentPkg.revisions}
                    </span>
                  </div>
                </div>

                {/* What's Included Checklist */}
                <div className="space-y-2.5 mb-6">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    What&apos;s Included:
                  </span>
                  {currentPkg.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}

                  {currentPkg.notIncluded.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                      <X className="w-3.5 h-3.5 text-slate-300 shrink-0 mt-0.5" />
                      <span className="line-through">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Primary CTA Button: Continue */}
                <Button
                  variant="primary"
                  className="w-full shadow-md shadow-blue-500/20 text-sm font-bold py-3.5 mb-3"
                  onClick={() => setIsInviteOpen(true)}
                  rightIcon={<Send className="w-4 h-4" />}
                >
                  Continue ({formatCurrency(currentPkg.price)})
                </Button>

                {/* Secondary CTA: Contact Seller */}
                <Button
                  variant="secondary"
                  className="w-full text-xs font-medium"
                  onClick={() => setIsInviteOpen(true)}
                  leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                >
                  Contact Creator
                </Button>
              </div>

              {/* Safe Escrow Guarantee Footer */}
              <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-center gap-2 text-[11px] text-slate-600 text-center">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>100% Secure INR Escrow &amp; Commercial IP Transfer Guarantee</span>
              </div>
            </div>

            {/* Compare All Packages Button / Hint */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
              <span className="text-xs text-slate-500 block mb-1">Need a custom brand production?</span>
              <button
                onClick={() => setIsInviteOpen(true)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Request a Custom Quote →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Lightbox Modal */}
      <AnimatePresence>
        {selectedPortfolioItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl overflow-hidden text-slate-900"
            >
              <button
                onClick={() => setSelectedPortfolioItem(null)}
                className="absolute top-4 right-4 z-10 rounded-full bg-slate-100 hover:bg-slate-200 p-2 text-slate-600 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="aspect-video w-full overflow-hidden rounded-xl bg-slate-100 mb-4 border border-slate-200">
                <SafeImage
                  src={selectedPortfolioItem.imageUrl}
                  alt={selectedPortfolioItem.title}
                  category={selectedPortfolioItem.category}
                  className="h-full w-full object-cover"
                  containerClassName="h-full w-full"
                />
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900">{selectedPortfolioItem.title}</h3>
                  <Badge variant="blue" size="sm">
                    {selectedPortfolioItem.category}
                  </Badge>
                  {selectedPortfolioItem.contentType && (
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-semibold">
                      {selectedPortfolioItem.contentType}
                    </span>
                  )}
                  {selectedPortfolioItem.aspectRatio && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-mono">
                      {selectedPortfolioItem.aspectRatio}
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {selectedPortfolioItem.description}
                </p>

                {/* Workflow & Tech Stack Specification */}
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 shrink-0 mt-0.5">
                      Generation Pipeline:
                    </span>
                    <span className="text-slate-700">
                      {selectedPortfolioItem.workflow ||
                        'Runway Gen-3 Alpha -> ComfyUI Refine -> Topaz Video AI 4x upscale -> Premiere Pro sound design'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 shrink-0">
                      Format &amp; Specs:
                    </span>
                    <span className="text-slate-700 font-mono text-[11px]">
                      {selectedPortfolioItem.outputFormat || '4K ProRes 422 HQ & MP4 H.265 (60fps)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 shrink-0">
                      Commercial IP Clearance:
                    </span>
                    <span className="text-slate-700 text-[11px]">
                      {selectedPortfolioItem.commercialRights ||
                        'Full Commercial Buyout with global unrestricted digital advertising and broadcasting rights.'}
                    </span>
                  </div>
                </div>

                {/* Prompt & Seed Provenance Inspector (AI Native Verification) */}
                {selectedPortfolioItem.provenance && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-blue-600" />
                        Prompt &amp; Seed Provenance Log
                      </span>
                      <span className="text-[10px] font-mono text-blue-700 px-2 py-0.5 rounded bg-blue-100 border border-blue-200 font-semibold">
                        Seed Verified
                      </span>
                    </div>

                    <div className="rounded-lg bg-white border border-slate-200 p-2.5 font-mono text-[11px] text-slate-800 select-all leading-relaxed shadow-xs">
                      &quot;{selectedPortfolioItem.provenance.promptText}&quot;
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] font-mono text-slate-600 pt-1">
                      <div>
                        Model: <strong className="text-slate-900">{selectedPortfolioItem.provenance.modelCheckpoint}</strong>
                      </div>
                      <div>
                        Seed: <strong className="text-slate-900">{selectedPortfolioItem.provenance.seed}</strong>
                      </div>
                      {selectedPortfolioItem.provenance.sampler && (
                        <div>
                          Sampler: <strong className="text-slate-900">{selectedPortfolioItem.provenance.sampler}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPortfolioItem.tools.map((t: string) => (
                      <span
                        key={t}
                        className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-700 border border-slate-200 font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <Button
                    variant="primary"
                    onClick={() => {
                      setSelectedPortfolioItem(null);
                      setIsInviteOpen(true);
                    }}
                    leftIcon={<Send className="w-4 h-4" />}
                  >
                    Commission Similar Work
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Invite Modal */}
      <InviteCreatorModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        creatorId={creator.uid}
        creatorName={creator.displayName}
      />
    </div>
  );
}
