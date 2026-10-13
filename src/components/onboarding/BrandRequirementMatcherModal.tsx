import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Sparkles,
  Building2,
  Send,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { useCreators } from '../../hooks/useCreators';
import { saveCampaign } from '../../services/store/dataStore';
import { matchCreators } from '../../services/matching/engine';
import type { CreativeCategory } from '../../types/creator';
import type { Campaign } from '../../types/campaign';
import { formatCurrency, formatPriceRange } from '../../utils/format';
import { Button } from '../ui/Button';
import { SafeAvatar } from '../ui/SafeAvatar';

interface BrandRequirementMatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteCreator?: (creatorId: string, creatorName: string) => void;
}

const CATEGORIES: CreativeCategory[] = [
  'AI Video Generation',
  'AI Advertising',
  'AI Photography',
  '3D Art and Animation',
  'AI Graphic Design',
  'AI Avatars',
  'Product Visualization',
  'AI-Assisted Creative Development',
];

export function BrandRequirementMatcherModal({
  isOpen,
  onClose,
  onInviteCreator,
}: BrandRequirementMatcherModalProps) {
  const { creators } = useCreators();

  // Form State
  const [brandName, setBrandName] = useState('');
  const [projectTitle, setProjectTitle] = useState('Festive Commercial AI Video Ads');
  const [targetType, setTargetType] = useState<'all' | 'creator' | 'agency'>('all');
  const [category, setCategory] = useState<CreativeCategory>('AI Video Generation');
  const [description, setDescription] = useState(
    'Need a 30-45 second cinematic AI commercial video with photorealistic actors and sleek motion graphics for our upcoming festive campaign.'
  );
  const [preferredTools, setPreferredTools] = useState('Runway Gen-3, Midjourney v6, Topaz AI');
  const [budgetMin, setBudgetMin] = useState(50000);
  const [budgetMax, setBudgetMax] = useState(200000);
  const [deadline, setDeadline] = useState('Within 2 weeks');

  // Match / Result View State
  const [step, setStep] = useState<'form' | 'loading' | 'results'>('form');
  const [matchedResults, setMatchedResults] = useState<any[]>([]);

  if (!isOpen) return null;

  const handleRunAiMatching = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim() || !brandName.trim()) return;

    setStep('loading');

    // Create the campaign brief
    const newCampaignId = `camp-${Date.now()}`;
    const newCampaign: Campaign = {
      id: newCampaignId,
      brandId: `brand-${Date.now()}`,
      brandName: brandName.trim(),
      title: projectTitle.trim(),
      description: description.trim(),
      category: category,
      requiredSkills: [
        category,
        ...preferredTools.split(',').map((t) => t.trim()).filter(Boolean),
        '4K AI Upscaling',
      ],
      preferredStyle: 'Cinematic',
      budgetMin: Number(budgetMin),
      budgetMax: Number(budgetMax),
      deadline: deadline,
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveCampaign(newCampaign);

    // Filter creators if targetType is set
    let candidateCreators = creators;
    if (targetType === 'agency') {
      const agencies = creators.filter((c) =>
        c.skills.some((s) => s.toLowerCase().includes('agency') || s.toLowerCase().includes('studio'))
      );
      if (agencies.length > 0) candidateCreators = agencies;
    }

    setTimeout(() => {
      const results = matchCreators(candidateCreators, newCampaign);
      setMatchedResults(results.slice(0, 4));
      setStep('results');
    }, 700);
  };

  const handleReset = () => {
    setStep('form');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative w-full max-w-3xl rounded-3xl border border-white/10 bg-[#12151C] shadow-2xl overflow-hidden my-8"
      >
        {/* Header Ribbon */}
        <div className="relative px-6 py-5 border-b border-white/10 bg-[#181C26] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {step === 'results' ? 'AI Matched Creators & Agencies' : 'Brand Project Intake & AI Matcher'}
              </h2>
              <p className="text-xs text-gray-400">
                {step === 'results'
                  ? `Ranked recommendations for ${brandName || 'your campaign'} based on skill fit & budget`
                  : 'Define your campaign requirements to receive instant, verified AI creator suggestions'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full bg-white/5 hover:bg-white/10 p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step 1: Requirements Intake Form */}
        {step === 'form' && (
          <form onSubmit={handleRunAiMatching} className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Target Partner Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">
                What type of AI creative partner are you looking to commission?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'all', label: 'Creators & Agencies' },
                  { id: 'creator', label: 'Solo AI Creators' },
                  { id: 'agency', label: 'Full AI Agencies' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTargetType(item.id as any)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      targetType === item.id
                        ? 'border-[#10B981] bg-[#10B981]/15 text-white shadow-md'
                        : 'border-white/10 bg-[#0B0D12] text-gray-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Brand or Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. StyleVerse India, BoAt, Zepto"
                  className="w-full rounded-xl border border-white/10 bg-[#0B0D12] px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-[#10B981] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Creative Discipline / Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full rounded-xl border border-white/10 bg-[#0B0D12] px-3.5 py-2.5 text-xs text-white focus:border-[#10B981] focus:outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Project Title */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Campaign / Project Title *
              </label>
              <input
                type="text"
                required
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="e.g. 30s High-End AI Video Commercial for Festive Product Launch"
                className="w-full rounded-xl border border-white/10 bg-[#0B0D12] px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-[#10B981] focus:outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Brief Description &amp; Visual Requirements *
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail what visual mood, character style, storyline, and final deliverables you require..."
                className="w-full rounded-xl border border-white/10 bg-[#0B0D12] p-3 text-xs text-white placeholder-gray-500 focus:border-[#10B981] focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Preferred Tools & Pipeline */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Preferred AI Tools or Tech (Optional)
              </label>
              <input
                type="text"
                value={preferredTools}
                onChange={(e) => setPreferredTools(e.target.value)}
                placeholder="e.g. Runway Gen-3, Midjourney v6, Topaz Video AI, Blender"
                className="w-full rounded-xl border border-white/10 bg-[#0B0D12] px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-[#10B981] focus:outline-none"
              />
            </div>

            {/* Budget (₹ INR) & Timeline */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Min Budget (₹ INR)
                </label>
                <input
                  type="number"
                  step="10000"
                  min="20000"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-[#0B0D12] px-3.5 py-2.5 text-xs font-mono font-bold text-white focus:border-[#10B981] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Max Budget (₹ INR)
                </label>
                <input
                  type="number"
                  step="10000"
                  min="30000"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-[#0B0D12] px-3.5 py-2.5 text-xs font-mono font-bold text-white focus:border-[#10B981] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Target Timeline
                </label>
                <select
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0B0D12] px-3.5 py-2.5 text-xs text-white focus:border-[#10B981] focus:outline-none"
                >
                  <option value="Express 48 Hours">Express 48 Hours</option>
                  <option value="Within 1 week">Within 1 week</option>
                  <option value="Within 2 weeks">Within 2 weeks</option>
                  <option value="Within 1 month">Within 1 month</option>
                </select>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <span className="text-[11px] text-gray-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Commercial IP transfer guarantee included</span>
              </span>

              <Button
                type="submit"
                variant="primary"
                disabled={!brandName.trim() || !projectTitle.trim()}
                leftIcon={<Zap className="w-4 h-4" />}
                className="shadow-lg shadow-[#10B981]/30 text-xs font-bold px-6 py-2.5"
              >
                Find Matching Creators &amp; Agencies (AI)
              </Button>
            </div>
          </form>
        )}

        {/* Loading State */}
        {step === 'loading' && (
          <div className="p-16 text-center space-y-5">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping" />
              <div className="w-16 h-16 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
              <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-emerald-400" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Analyzing Requirements &amp; Running AI Match...</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Comparing creative category, tool stacks, rate feasibility, and verified provenance logs.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: AI Suggestions View */}
        {step === 'results' && (
          <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Top Match Summary Header */}
            <div className="p-4 rounded-2xl bg-[#0B0D12] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                  Campaign Registered
                </span>
                <h3 className="text-sm font-bold text-white">{projectTitle}</h3>
                <p className="text-xs text-gray-400">
                  Budget: <strong className="text-white font-mono">{formatPriceRange(budgetMin, budgetMax)}</strong> • {category}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={handleReset} className="text-xs">
                  Edit Brief
                </Button>
                <a
                  href="/brand-dashboard"
                  className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 border border-white/10"
                >
                  View in Dashboard
                </a>
              </div>
            </div>

            {/* AI Recommendations List */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" /> AI Recommended Creators for Your Project
              </h4>

              {matchedResults.map((result, idx) => (
                <div
                  key={result.creatorId}
                  className="rounded-2xl border border-white/10 bg-[#0B0D12] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-emerald-500/40 transition-all shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <SafeAvatar
                      src={result.creatorAvatar}
                      name={result.creatorName}
                      size="lg"
                      shape="rounded"
                      className="border-2 border-emerald-500/30 shrink-0"
                    />

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="w-5 h-5 rounded-full bg-white/10 text-white font-mono text-[11px] font-bold flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <h4 className="font-bold text-white text-sm">{result.creatorName}</h4>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                          {result.score.overall}% Match
                        </span>
                      </div>

                      <p className="text-xs text-gray-300 mb-2">{result.creatorHeadline}</p>

                      {/* Why AI Recommended */}
                      <div className="rounded-xl bg-[#141720] border border-white/5 p-2.5 text-xs text-gray-300 space-y-1">
                        <strong className="text-[10px] uppercase font-bold text-emerald-400 block">
                          AI Compatibility Rationale:
                        </strong>
                        <p className="text-[11px] text-gray-300 leading-snug">
                          {result.matchReasons && result.matchReasons[0]
                            ? result.matchReasons[0]
                            : `Strong category alignment in ${category} with verified tools and rates starting at ${formatCurrency(result.creatorPriceRange?.min || 30000)}.`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-gray-400 block uppercase">Starting Rate</span>
                      <strong className="text-sm font-mono text-white">
                        {formatCurrency(result.creatorPriceRange?.min || 35000)}
                      </strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`/creators/${result.creatorId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 hover:text-white border border-white/10 transition-colors"
                      >
                        View Gig
                      </a>

                      <button
                        onClick={() => {
                          if (onInviteCreator) {
                            onInviteCreator(result.creatorId, result.creatorName);
                          } else {
                            window.location.href = `/creators/${result.creatorId}`;
                          }
                        }}
                        className="px-4 py-1.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-xs font-bold text-white transition-all shadow-md shadow-[#10B981]/25 flex items-center gap-1.5"
                      >
                        <Send className="w-3 h-3" />
                        <span>Invite</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Done Button */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                You can review more candidates anytime in the Discover marketplace.
              </span>
              <Button variant="primary" onClick={onClose} className="text-xs font-bold">
                Done &amp; Explore Marketplace
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
