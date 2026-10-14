import { useState, useMemo, type ChangeEvent } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  X,
  Check,
  ChevronDown,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Wrench,
  Film,
  Award,
  Flame,
} from 'lucide-react';

import { useCreators } from '../hooks/useCreators';
import { CreatorGrid } from '../components/creators/CreatorGrid';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { InviteCreatorModal } from '../components/campaigns/InviteCreatorModal';
import type { CreatorProfile, CreativeCategory } from '../types/creator';
import { formatCurrency } from '../utils/format';

const CATEGORIES: (CreativeCategory | 'All')[] = [
  'All',
  'AI Video Generation',
  'AI Advertising',
  'AI Photography',
  '3D Art and Animation',
  'AI Graphic Design',
  'AI Avatars',
  'Product Visualization',
  'AI-Assisted Creative Development',
];

const POPULAR_TOOLS = [
  'All Tools',
  'Runway ML',
  'Midjourney',
  'Pika Labs',
  'ComfyUI',
  'Blender',
  'ElevenLabs',
  'Sora',
  'Stable Diffusion',
];

const POPULAR_SKILLS = [
  'All Skills',
  'Prompt Engineering',
  'LoRA Training',
  'Motion Graphics',
  'Cinematic Editing',
  'Color Grading',
  'Storyboarding',
  'Photo Retouching',
  'A/B Testing',
];

const CONTENT_TYPES = [
  'All Formats',
  'Video',
  'Stills',
  '3D Asset',
  'Interactive',
  'Avatar',
];

const VERIFICATION_SIGNALS = [
  { id: 'all', label: 'All Creators' },
  { id: 'verified_tools', label: 'Verified Tools' },
  { id: 'verified_workflows', label: 'Verified Workflows' },
  { id: 'commercial_certified', label: 'Commercial Safe' },
];

interface SearchMatchResult {
  matches: boolean;
  score: number;
  matchedFields: string[];
}

function evaluateSearchMatch(creator: CreatorProfile, rawQuery: string): SearchMatchResult {
  const q = rawQuery.trim().toLowerCase();
  if (!q) {
    return { matches: true, score: 0, matchedFields: [] };
  }

  // Tokenize query into words (e.g. "maya runway" -> ["maya", "runway"])
  const tokens = q.split(/\s+/).filter(Boolean);

  const matchedFields: string[] = [];
  let score = 0;

  // Searchable fields map
  const name = creator.displayName.toLowerCase();
  const headline = creator.headline.toLowerCase();
  const bio = (creator.biography || '').toLowerCase();
  const skills = creator.skills.map((s) => s.toLowerCase());
  const tools = creator.tools.map((t) => t.toLowerCase());
  const categories = creator.categories.map((c) => c.toLowerCase());
  const styles = (creator.preferredStyles || []).map((s) => s.toLowerCase());
  const verifiedTools = (creator.verificationSignals?.verifiedTools || []).map((t) => t.toLowerCase());
  const verifiedWorkflows = (creator.verificationSignals?.verifiedWorkflows || []).map((w) => w.toLowerCase());
  const badgeLevel = (creator.verificationSignals?.verificationBadgeLevel || '').toLowerCase();

  const portfolioTitles = creator.portfolio.map((p) => p.title.toLowerCase());
  const portfolioDescs = creator.portfolio.map((p) => p.description.toLowerCase());
  const portfolioTools = creator.portfolio.flatMap((p) => p.tools.map((t) => t.toLowerCase()));
  const portfolioWorkflows = creator.portfolio.map((p) => (p.workflow || '').toLowerCase());
  const portfolioFormats = creator.portfolio.map((p) => (p.contentType || '').toLowerCase());
  const portfolioRatios = creator.portfolio.map((p) => (p.aspectRatio || '').toLowerCase());
  const portfolioPrompts = creator.portfolio.map((p) => (p.provenance?.promptText || '').toLowerCase());
  const portfolioModels = creator.portfolio.map((p) => (p.provenance?.modelCheckpoint || '').toLowerCase());

  // Check whole phrase matches first for ranking
  if (name.includes(q)) {
    score += 150;
    matchedFields.push('Name');
  }
  if (tools.some((t) => t.includes(q))) {
    score += 110;
    matchedFields.push('Tools');
  }
  if (skills.some((s) => s.includes(q))) {
    score += 90;
    matchedFields.push('Skills');
  }
  if (headline.includes(q)) {
    score += 80;
    matchedFields.push('Headline');
  }
  if (categories.some((c) => c.includes(q))) {
    score += 70;
    matchedFields.push('Category');
  }
  if (styles.some((s) => s.includes(q))) {
    score += 60;
    matchedFields.push('Style');
  }
  if (verifiedTools.some((t) => t.includes(q)) || verifiedWorkflows.some((w) => w.includes(q))) {
    score += 60;
    matchedFields.push('Verified Signals');
  }
  if (portfolioPrompts.some((p) => p.includes(q))) {
    score += 55;
    matchedFields.push('AI Prompt');
  }
  if (portfolioTitles.some((t) => t.includes(q))) {
    score += 50;
    matchedFields.push('Portfolio Project');
  }
  if (portfolioModels.some((m) => m.includes(q))) {
    score += 45;
    matchedFields.push('Model Checkpoint');
  }
  if (bio.includes(q)) {
    score += 35;
    matchedFields.push('Bio');
  }

  // Token-level check: all tokens must be found somewhere in the creator's data
  const allFieldHaystacks = [
    { field: 'Name', values: [name] },
    { field: 'Headline', values: [headline] },
    { field: 'Bio', values: [bio] },
    { field: 'Tools', values: tools },
    { field: 'Skills', values: skills },
    { field: 'Category', values: categories },
    { field: 'Style', values: styles },
    { field: 'Verified Signals', values: [...verifiedTools, ...verifiedWorkflows, badgeLevel] },
    {
      field: 'Portfolio',
      values: [
        ...portfolioTitles,
        ...portfolioDescs,
        ...portfolioTools,
        ...portfolioWorkflows,
        ...portfolioFormats,
        ...portfolioRatios,
      ],
    },
    { field: 'AI Prompt', values: portfolioPrompts },
    { field: 'Model Checkpoint', values: portfolioModels },
  ];

  const allTokensMatched = tokens.every((token) => {
    let tokenMatched = false;
    for (const group of allFieldHaystacks) {
      if (group.values.some((v) => v.includes(token))) {
        tokenMatched = true;
        if (!matchedFields.includes(group.field)) {
          matchedFields.push(group.field);
        }
        score += 20;
      }
    }
    return tokenMatched;
  });

  return {
    matches: allTokensMatched,
    score,
    matchedFields,
  };
}

export default function DiscoverPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { creators } = useCreators();

  // Filters state with URL synchronization
  const qParam = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(qParam);
  const [prevQParam, setPrevQParam] = useState(qParam);

  // If URL changes from outside (e.g. Navbar search or Hero tag click), adjust state
  if (qParam !== prevQParam) {
    setPrevQParam(qParam);
    setSearchTerm(qParam);
  }

  const selectedCategory = searchParams.get('category') || 'All';
  const [selectedTool, setSelectedTool] = useState<string>('All Tools');
  const [selectedSkill, setSelectedSkill] = useState<string>('All Skills');
  const [selectedContentType, setSelectedContentType] = useState<string>('All Formats');
  const [selectedVerification, setSelectedVerification] = useState<string>('all');
  const [sellerLevel, setSellerLevel] = useState<'all' | 'top-rated' | 'available'>('all');
  const [proOnly, setProOnly] = useState<boolean>(false);
  const [maxBudget, setMaxBudget] = useState<number>(300000);
  const [minBudget, setMinBudget] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  // Dropdown open states for horizontal filter bar
  const [activeDropdown, setActiveDropdown] = useState<
    'budget' | 'tools' | 'skills' | 'formats' | 'verification' | 'level' | null
  >(null);

  // Invite modal state
  const [inviteModalData, setInviteModalData] = useState<{
    isOpen: boolean;
    creatorId: string;
    creatorName: string;
  }>({
    isOpen: false,
    creatorId: '',
    creatorName: '',
  });

  // Handle live search input change and update URL params without page reload
  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    const nextParams = new URLSearchParams(searchParams);
    if (val.trim()) {
      nextParams.set('q', val.trim());
    } else {
      nextParams.delete('q');
    }
    setSearchParams(nextParams, { replace: true });
  };

  // Handle category change
  const handleCategoryChange = (cat: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (cat === 'All') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', cat);
    }
    setSearchParams(nextParams);
  };

  // Filtered & sorted creators with tokenized search and relevance scoring
  const filteredCreators = useMemo(() => {
    const creatorMatches = new Map<string, SearchMatchResult>();

    return creators
      .filter((creator: CreatorProfile) => {
        // Multi-attribute tokenized search
        if (searchTerm.trim()) {
          const result = evaluateSearchMatch(creator, searchTerm);
          if (!result.matches) {
            return false;
          }
          creatorMatches.set(creator.uid, result);
        }

        // Category check
        if (
          selectedCategory !== 'All' &&
          !creator.categories.includes(selectedCategory as CreativeCategory)
        ) {
          return false;
        }

        // Tool check
        if (selectedTool !== 'All Tools') {
          const hasTool = creator.tools.some((t) =>
            t.toLowerCase().includes(selectedTool.toLowerCase())
          );
          if (!hasTool) return false;
        }

        // Skill check
        if (selectedSkill !== 'All Skills') {
          const hasSkill = creator.skills.some((s) =>
            s.toLowerCase().includes(selectedSkill.toLowerCase())
          );
          if (!hasSkill) return false;
        }

        // Content Type check
        if (selectedContentType !== 'All Formats') {
          const hasContentType = creator.portfolio.some(
            (item) => item.contentType?.toLowerCase() === selectedContentType.toLowerCase()
          );
          if (!hasContentType) return false;
        }

        // Verification Signals check (Bonus criterion)
        if (selectedVerification === 'verified_tools') {
          const hasToolsVerified =
            (creator.verificationSignals?.verifiedTools &&
              creator.verificationSignals.verifiedTools.length > 0) ||
            creator.verified;
          if (!hasToolsVerified) return false;
        } else if (selectedVerification === 'verified_workflows') {
          const hasWorkflowVerified =
            (creator.verificationSignals?.verifiedWorkflows &&
              creator.verificationSignals.verifiedWorkflows.length > 0) ||
            creator.portfolio.some((p) => p.workflow && p.workflow.length > 0);
          if (!hasWorkflowVerified) return false;
        } else if (selectedVerification === 'commercial_certified') {
          if (!creator.commercialUseCertified) return false;
        }

        // Seller Level / status
        if (sellerLevel === 'top-rated' && !creator.featured) {
          return false;
        }
        if (sellerLevel === 'available' && creator.availability !== 'available') {
          return false;
        }

        // Pro only
        if (proOnly && creator.verified === false) {
          return false;
        }

        // Budget check (in INR)
        if (creator.priceRange.min < minBudget || creator.priceRange.min > maxBudget) {
          return false;
        }

        return true;
      })
      .sort((a: CreatorProfile, b: CreatorProfile) => {
        if (sortBy === 'price-asc') return a.priceRange.min - b.priceRange.min;
        if (sortBy === 'price-desc') return b.priceRange.max - a.priceRange.max;

        // When searching, sort by relevance score first
        if (searchTerm.trim()) {
          const scoreA = creatorMatches.get(a.uid)?.score || 0;
          const scoreB = creatorMatches.get(b.uid)?.score || 0;
          if (scoreA !== scoreB) {
            return scoreB - scoreA;
          }
        }

        // Default featured
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      });
  }, [
    creators,
    searchTerm,
    selectedCategory,
    selectedTool,
    selectedSkill,
    selectedContentType,
    selectedVerification,
    sellerLevel,
    proOnly,
    minBudget,
    maxBudget,
    sortBy,
  ]);

  const handleResetFilters = () => {
    handleSearchChange('');
    setSelectedTool('All Tools');
    setSelectedSkill('All Skills');
    setSelectedContentType('All Formats');
    setSelectedVerification('all');
    setSellerLevel('all');
    setProOnly(false);
    setMinBudget(0);
    setMaxBudget(300000);
    setSortBy('featured');
    setActiveDropdown(null);
  };

  const handleInvite = (creator: CreatorProfile) => {
    setInviteModalData({
      isOpen: true,
      creatorId: creator.uid,
      creatorName: creator.displayName,
    });
  };

  const activeFiltersCount =
    (selectedCategory !== 'All' ? 1 : 0) +
    (selectedTool !== 'All Tools' ? 1 : 0) +
    (selectedSkill !== 'All Skills' ? 1 : 0) +
    (selectedContentType !== 'All Formats' ? 1 : 0) +
    (selectedVerification !== 'all' ? 1 : 0) +
    (sellerLevel !== 'all' ? 1 : 0) +
    (proOnly ? 1 : 0) +
    (maxBudget < 300000 || minBudget > 0 ? 1 : 0) +
    (searchTerm ? 1 : 0);

  return (
    <div className="min-h-screen bg-white pt-24 pb-20 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Breadcrumb */}
        <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-600">Creator Search & Discovery</span>
          <span>/</span>
          <span className="text-[#2563EB] font-medium">
            {selectedCategory === 'All' ? 'All AI Services' : selectedCategory}
          </span>
        </div>

        {/* Page Header Banner */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {selectedCategory === 'All'
                ? searchTerm
                  ? `Results for "${searchTerm}"`
                  : 'AI Content Creators & Studios'
                : selectedCategory}
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1.5 max-w-2xl">
              Filter by verified AI tools, production workflows, skills, content types, and commercial buyout terms.
            </p>
          </div>

          {/* Creovate Pro Switcher */}
          <div className="flex items-center gap-3 shrink-0 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
            <div className="text-right">
              <span className="text-xs font-bold text-slate-900 block">creovate. Pro</span>
              <span className="text-[10px] text-[#2563EB] font-semibold flex items-center justify-end gap-1">
                <ShieldCheck className="w-3 h-3" /> Vetted Commercial Talent
              </span>
            </div>
            <button
              onClick={() => setProOnly(!proOnly)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                proOnly ? 'bg-[#2563EB]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  proOnly ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* High-Precision Central Search Bar */}
        <div className="mb-6 bg-gradient-to-r from-blue-50/50 via-slate-50 to-blue-50/50 border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="relative flex items-center"
          >
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#2563EB]">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by creator name, AI tool (Runway, Midjourney, ComfyUI), skill, prompt, or style..."
              className="w-full rounded-xl bg-white border border-slate-200 pl-12 pr-28 py-3.5 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all shadow-sm"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="absolute right-24 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs font-semibold text-[#2563EB]">
                <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>{filteredCreators.length} Found</span>
              </span>
            </div>
          </form>

          {/* Quick-Search Smart Suggestions */}
          <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium shrink-0 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" /> Quick Search:
            </span>
            {[
              'Runway Gen-3',
              'Midjourney v6',
              'ComfyUI',
              'Maya Chen',
              'Character Consistency',
              'Cinematic Film',
              'Cyberpunk',
              'Fashion Commercial',
              'ElevenLabs',
            ].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleSearchChange(tag)}
                className={`px-2.5 py-1 rounded-lg border text-xs transition-all ${
                  searchTerm.toLowerCase() === tag.toLowerCase()
                    ? 'border-[#2563EB] bg-blue-50 text-[#2563EB] font-semibold'
                    : 'border-slate-200 bg-white text-slate-600 hover:text-[#2563EB] hover:border-blue-300 hover:bg-blue-50/50'
                }`}
              >
                {tag}
              </button>
            ))}
            {searchTerm && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="px-2.5 py-1 rounded-lg text-blue-600 hover:text-blue-700 text-xs underline underline-offset-4"
              >
                Clear Query
              </button>
            )}
          </div>
        </div>

        {/* Horizontal Multi-Attribute Filter Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 bg-slate-50/90 border border-slate-200 p-3 rounded-2xl">
          <div className="flex flex-wrap items-center gap-2">
            {/* AI Tools Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() =>
                  setActiveDropdown(activeDropdown === 'tools' ? null : 'tools')
                }
                className={`px-3 py-2 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
                  selectedTool !== 'All Tools'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <Wrench className="w-3.5 h-3.5 text-blue-600" />
                <span>Tool: {selectedTool}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {activeDropdown === 'tools' && (
                <div className="absolute top-full left-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl z-30 space-y-1 max-h-60 overflow-y-auto">
                  {POPULAR_TOOLS.map((tool) => (
                    <button
                      key={tool}
                      onClick={() => {
                        setSelectedTool(tool);
                        setActiveDropdown(null);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left hover:bg-slate-100 text-slate-700 hover:text-blue-600"
                    >
                      <span>{tool}</span>
                      {selectedTool === tool && <Check className="w-3.5 h-3.5 text-[#2563EB]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* AI Skills Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() =>
                  setActiveDropdown(activeDropdown === 'skills' ? null : 'skills')
                }
                className={`px-3 py-2 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
                  selectedSkill !== 'All Skills'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Skill: {selectedSkill}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {activeDropdown === 'skills' && (
                <div className="absolute top-full left-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl z-30 space-y-1 max-h-60 overflow-y-auto">
                  {POPULAR_SKILLS.map((sk) => (
                    <button
                      key={sk}
                      onClick={() => {
                        setSelectedSkill(sk);
                        setActiveDropdown(null);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left hover:bg-slate-100 text-slate-700 hover:text-blue-600"
                    >
                      <span>{sk}</span>
                      {selectedSkill === sk && <Check className="w-3.5 h-3.5 text-[#2563EB]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Content Type / Format Dropdown */}
            <div className="relative">
              <button
                onClick={() =>
                  setActiveDropdown(activeDropdown === 'formats' ? null : 'formats')
                }
                className={`px-3 py-2 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
                  selectedContentType !== 'All Formats'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <Film className="w-3.5 h-3.5 text-sky-600" />
                <span>Format: {selectedContentType}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {activeDropdown === 'formats' && (
                <div className="absolute top-full left-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl z-30 space-y-1">
                  {CONTENT_TYPES.map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => {
                        setSelectedContentType(fmt);
                        setActiveDropdown(null);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left hover:bg-slate-100 text-slate-700 hover:text-blue-600"
                    >
                      <span>{fmt}</span>
                      {selectedContentType === fmt && <Check className="w-3.5 h-3.5 text-[#2563EB]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Verification Signals Dropdown */}
            <div className="relative">
              <button
                onClick={() =>
                  setActiveDropdown(activeDropdown === 'verification' ? null : 'verification')
                }
                className={`px-3 py-2 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
                  selectedVerification !== 'all'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-blue-600" />
                <span>Trust: {VERIFICATION_SIGNALS.find((v) => v.id === selectedVerification)?.label}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {activeDropdown === 'verification' && (
                <div className="absolute top-full left-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl z-30 space-y-1">
                  {VERIFICATION_SIGNALS.map((sig) => (
                    <button
                      key={sig.id}
                      onClick={() => {
                        setSelectedVerification(sig.id);
                        setActiveDropdown(null);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left hover:bg-slate-100 text-slate-700 hover:text-blue-600"
                    >
                      <span>{sig.label}</span>
                      {selectedVerification === sig.id && <Check className="w-3.5 h-3.5 text-[#2563EB]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Budget Filter Dropdown (in INR) */}
            <div className="relative">
              <button
                onClick={() =>
                  setActiveDropdown(activeDropdown === 'budget' ? null : 'budget')
                }
                className={`px-3 py-2 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
                  maxBudget < 300000 || minBudget > 0
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <span>
                  Budget: {minBudget > 0 || maxBudget < 300000 ? `Up to ${formatCurrency(maxBudget)}` : 'Any Budget'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {activeDropdown === 'budget' && (
                <div className="absolute top-full left-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-2xl z-30">
                  <span className="text-xs font-bold text-slate-900 block mb-2">Max Rate (₹ INR)</span>
                  <div className="text-sm font-black text-[#2563EB] mb-3">
                    {formatCurrency(maxBudget)}
                  </div>
                  <input
                    type="range"
                    min="15000"
                    max="300000"
                    step="10000"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(Number(e.target.value))}
                    className="w-full accent-blue-600 bg-slate-200 rounded-lg h-2 cursor-pointer mb-3"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mb-4">
                    <span>₹15,000</span>
                    <span>₹3,00,000+</span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => setActiveDropdown(null)}
                  >
                    Apply Budget Filter
                  </Button>
                </div>
              )}
            </div>

            {/* Search Input Filter */}
            <div className="relative min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search tools, models, skills..."
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-7 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#2563EB] focus:outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Reset All Filters Button */}
            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="px-3 py-1.5 rounded-xl text-xs text-[#2563EB] hover:text-[#1D4ED8] font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All ({activeFiltersCount})</span>
              </button>
            )}
          </div>

          {/* Right Side: Sort By Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 shrink-0">Sort:</span>
            <div className="min-w-[150px]">
              <Select
                value={sortBy}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as any)}
                options={[
                  { value: 'featured', label: 'Top Rated / Featured' },
                  { value: 'price-asc', label: 'Price: Low to High' },
                  { value: 'price-desc', label: 'Price: High to Low' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Specialization Category Pills */}
        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/25'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Results Header Status & Active Search Tag */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2 flex-wrap">
            <span>
              <strong className="text-slate-900 text-sm">{filteredCreators.length}</strong> AI creators match criteria
            </span>
            {searchTerm && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-medium text-[11px]">
                <span>Query: "{searchTerm}"</span>
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  className="hover:text-blue-900"
                  title="Remove query"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-[#2563EB]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Full Commercial IP Buyout Protected</span>
            </span>
          </div>
        </div>

        {/* Sensible Handling of Empty Results */}
        {filteredCreators.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center max-w-xl mx-auto my-8 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-200">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {searchTerm ? `No creators found matching "${searchTerm}"` : 'No creators found matching criteria'}
            </h3>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              {searchTerm
                ? `We couldn't find any creators matching "${searchTerm}". Try clicking one of the popular search terms below or reset your filters:`
                : "We couldn't find any creators matching your specific combination of tools, skills, and budget. Try exploring popular filters:"}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              {['Runway Gen-3', 'Midjourney v6', 'ComfyUI', 'Maya Chen', 'AI Video Generation', '3D Art and Animation'].map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => {
                    handleSearchChange(sug);
                  }}
                  className="rounded-lg bg-white hover:bg-blue-50 hover:text-blue-700 border border-slate-200 px-3 py-1.5 text-xs text-slate-700 transition-colors shadow-sm"
                >
                  Search "{sug}"
                </button>
              ))}
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleResetFilters}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset Search & All Filters
            </Button>
          </div>
        ) : (
          <CreatorGrid
            creators={filteredCreators}
            onClearFilters={handleResetFilters}
            onInvite={handleInvite}
          />
        )}
      </div>

      {/* Invite Modal */}
      <InviteCreatorModal
        isOpen={inviteModalData.isOpen}
        onClose={() => setInviteModalData((prev) => ({ ...prev, isOpen: false }))}
        creatorId={inviteModalData.creatorId}
        creatorName={inviteModalData.creatorName}
      />
    </div>
  );
}
