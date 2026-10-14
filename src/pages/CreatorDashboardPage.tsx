import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Send,
  Plus,
  CheckCircle2,
  Save,
  ShieldCheck,
  Award,
  Film,
  ArrowRight,
  Upload,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCampaigns } from '../hooks/useCampaigns';
import { useCreators } from '../hooks/useCreators';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { formatCurrency, formatPriceRange } from '../utils/format';
import { SafeImage } from '../components/ui/SafeImage';
import { SafeAvatar } from '../components/ui/SafeAvatar';
import {
  getStoredInvitations,
  updateInvitationStatus,
  getStoredProposals,
  saveProposal,
  getStoredEngagements,
  submitDeliverableDraft,
  DATA_EVENTS,
} from '../services/store/dataStore';

import type { PortfolioItem, CreativeCategory } from '../types/creator';
import type { Invitation } from '../types/invitation';
import type { Proposal } from '../types/proposal';
import type { Engagement, GenerationDeliverable } from '../types/engagement';

export default function CreatorDashboardPage() {
  const { user } = useAuth();
  const { campaigns } = useCampaigns();
  const { creators, updateCreator, addPortfolio } = useCreators();

  // Find demo creator profile or fallback to Maya Chen
  const initialCreator =
    creators.find((c) => c.displayName.toLowerCase().includes('maya')) || creators[0];

  const [activeTab, setActiveTab] = useState<
    'overview' | 'engagements' | 'campaigns' | 'portfolio' | 'verification' | 'invitations' | 'profile'
  >('overview');

  // Creator Profile State
  const [headline, setHeadline] = useState(initialCreator?.headline || '');
  const [biography, setBiography] = useState(initialCreator?.biography || '');
  const [availability, setAvailability] = useState<'available' | 'busy' | 'unavailable'>(
    initialCreator?.availability || 'available'
  );
  const [minPrice, setMinPrice] = useState(initialCreator?.priceRange?.min || 25000);
  const [maxPrice, setMaxPrice] = useState(initialCreator?.priceRange?.max || 100000);
  const [profileSaved, setProfileSaved] = useState(false);

  // Portfolio items state
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(initialCreator?.portfolio || []);
  const [isAddPortfolioOpen, setIsAddPortfolioOpen] = useState(false);
  const [newWorkTitle, setNewWorkTitle] = useState('');
  const [newWorkDesc, setNewWorkDesc] = useState('');
  const [newWorkCategory, setNewWorkCategory] = useState<CreativeCategory>('AI Video Generation');
  const [newWorkImage, setNewWorkImage] = useState('');
  const [newWorkTools, setNewWorkTools] = useState('Runway Gen-3, After Effects, ComfyUI');
  const [newWorkWorkflow, setNewWorkWorkflow] = useState(
    'ComfyUI Character LoRA -> Runway Gen-3 Multi-Pass -> Topaz Video AI 4K Upscale'
  );
  const [newWorkContentType, setNewWorkContentType] = useState<'Video' | 'Stills' | '3D Asset'>('Video');
  const [newWorkAspectRatio, setNewWorkAspectRatio] = useState('16:9');
  const [newWorkPrompt, setNewWorkPrompt] = useState('Cinematic shot of neon runner, anamorphic lens --ar 16:9 --v 6.1');
  const [newWorkSeed, setNewWorkSeed] = useState('889214732');
  const [newWorkModel, setNewWorkModel] = useState('Runway Gen-3 Alpha');

  // Engagements (Active Production Lifecycle)
  const [engagements, setEngagements] = useState<Engagement[]>(() => {
    return getStoredEngagements().filter(
      (eng) => !initialCreator || eng.creatorId === initialCreator.uid || eng.creatorId === 'creator-001'
    );
  });

  // Submit Generation Draft Modal State
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [targetEngagementId, setTargetEngagementId] = useState('');
  const [targetMilestoneId, setTargetMilestoneId] = useState('');
  const [draftTitle, setDraftTitle] = useState('Generation Draft v2 — Refined Lighting & Motion Pass');
  const [draftMediaUrl, setDraftMediaUrl] = useState(
    'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=800&h=600&fit=crop'
  );
  const [draftModel, setDraftModel] = useState('Runway Gen-3 Alpha + ComfyUI');
  const [draftPrompt, setDraftPrompt] = useState(
    'Enhanced magenta neon glow along outer sole, high-speed fluid droplets, cinematic lens flare, anamorphic depth of field --motion 7'
  );
  const [draftSeed, setDraftSeed] = useState('889214733');
  const [draftNotes, setDraftNotes] = useState(
    'Addressed brand feedback from Round 1. Intensified sole bounce light and graded in DaVinci Resolve.'
  );

  // Incoming invitations
  const [invitations, setInvitations] = useState<Invitation[]>(() => {
    return getStoredInvitations().filter(
      (inv) => !initialCreator || inv.creatorId === initialCreator.uid || inv.creatorId === 'creator-1' || inv.creatorId === 'creator-001'
    );
  });

  // Submitted Proposals
  const [proposals, setProposals] = useState<Proposal[]>(() => getStoredProposals());

  // Apply / Submit Proposal Modal
  const [applyModalCampaign, setApplyModalCampaign] = useState<any>(null);
  const [pitchMessage, setPitchMessage] = useState(
    'I specialize in commercial generative video with temporal character consistency and multi-pass upscaling. I can guarantee high-resolution outputs with complete commercial buyout clearance.'
  );
  const [quoteAmount, setQuoteAmount] = useState('140000');
  const [deliveryDays, setDeliveryDays] = useState('14');
  const [proposedTools, setProposedTools] = useState('Runway Gen-3, ComfyUI, DaVinci Resolve, Topaz Video AI');
  const [proposedWorkflow, setProposedWorkflow] = useState(
    'Custom LoRA checkpoint for silhouette consistency -> Runway Gen-3 Alpha multi-pass -> Topaz 4K 60fps upscale.'
  );

  // Verification Benchmark Simulation State
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setInvitations(
        getStoredInvitations().filter(
          (inv) => !initialCreator || inv.creatorId === initialCreator.uid || inv.creatorId === 'creator-1' || inv.creatorId === 'creator-001'
        )
      );
      setEngagements(
        getStoredEngagements().filter(
          (eng) => !initialCreator || eng.creatorId === initialCreator.uid || eng.creatorId === 'creator-001'
        )
      );
      setProposals(getStoredProposals());
    };
    window.addEventListener(DATA_EVENTS.INVITATIONS_UPDATED, handleUpdate);
    window.addEventListener(DATA_EVENTS.ENGAGEMENTS_UPDATED, handleUpdate);
    window.addEventListener(DATA_EVENTS.PROPOSALS_UPDATED, handleUpdate);
    return () => {
      window.removeEventListener(DATA_EVENTS.INVITATIONS_UPDATED, handleUpdate);
      window.removeEventListener(DATA_EVENTS.ENGAGEMENTS_UPDATED, handleUpdate);
      window.removeEventListener(DATA_EVENTS.PROPOSALS_UPDATED, handleUpdate);
    };
  }, [initialCreator]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialCreator) {
      updateCreator({
        ...initialCreator,
        headline,
        biography,
        availability,
        priceRange: { min: Number(minPrice), max: Number(maxPrice) },
        portfolio,
        updatedAt: new Date().toISOString(),
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    }
  };

  const handleAddPortfolioItem = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: PortfolioItem = {
      id: `p-${Date.now()}`,
      title: newWorkTitle,
      description: newWorkDesc,
      category: newWorkCategory,
      imageUrl:
        newWorkImage ||
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=400&fit=crop',
      tools: newWorkTools.split(',').map((t) => t.trim()).filter(Boolean),
      workflow: newWorkWorkflow,
      contentType: newWorkContentType,
      aspectRatio: newWorkAspectRatio,
      outputFormat: '4K ProRes / MP4 Master',
      commercialRights: 'Full Commercial Buyout & Global Broadcasting Rights',
      verifiedBadge: 'Provenance Verified',
      provenance: {
        promptText: newWorkPrompt,
        seed: newWorkSeed,
        modelCheckpoint: newWorkModel,
      },
      createdAt: new Date().toISOString().split('T')[0],
    };

    setPortfolio([newItem, ...portfolio]);
    if (initialCreator) {
      addPortfolio(initialCreator.uid, newItem);
    }
    setIsAddPortfolioOpen(false);
    setNewWorkTitle('');
    setNewWorkDesc('');
  };

  const handleInvitationAction = (invId: string, newStatus: 'accepted' | 'declined') => {
    updateInvitationStatus(invId, newStatus);
  };

  const handleOpenDraftModal = (engagementId: string, milestoneId: string) => {
    setTargetEngagementId(engagementId);
    setTargetMilestoneId(milestoneId);
    setIsDraftModalOpen(true);
  };

  const handleSubmitDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEngagementId || !targetMilestoneId) return;

    const newDeliverable: GenerationDeliverable = {
      id: `del-${Date.now()}`,
      roundNumber: 2,
      title: draftTitle,
      mediaUrl: draftMediaUrl,
      contentType: 'Video',
      generationPrompt: draftPrompt,
      modelUsed: draftModel,
      seed: draftSeed,
      productionNotes: draftNotes,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
    };

    submitDeliverableDraft(targetEngagementId, targetMilestoneId, newDeliverable);
    setIsDraftModalOpen(false);
  };

  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyModalCampaign) return;

    const newProposal: Proposal = {
      id: `prop-${Date.now()}`,
      campaignId: applyModalCampaign.id,
      brandId: applyModalCampaign.brandId || 'brand-demo',
      creatorId: initialCreator.uid,
      creatorName: initialCreator.displayName,
      creatorAvatar: initialCreator.avatarUrl,
      campaignTitle: applyModalCampaign.title,
      proposedBudget: Number(quoteAmount) || 80000,
      deliveryTimelineDays: Number(deliveryDays) || 14,
      proposedTools: proposedTools.split(',').map((t) => t.trim()).filter(Boolean),
      workflowApproach: proposedWorkflow,
      message: pitchMessage,
      status: 'submitted',
      createdAt: new Date().toISOString(),
    };

    saveProposal(newProposal);
    setApplyModalCampaign(null);
    setActiveTab('campaigns');
  };

  const handleRunVerificationBenchmark = () => {
    setIsVerifying(true);
    setVerificationSuccess(false);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationSuccess(true);
      setTimeout(() => setVerificationSuccess(false), 5000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-20 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <SafeAvatar
              src={initialCreator.avatarUrl}
              name={user?.displayName || initialCreator.displayName}
              size="lg"
              shape="rounded"
              className="border-2 border-blue-500/40"
            />
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#2563EB] mb-1">
                <Sparkles className="w-3.5 h-3.5" /> Creator Studio Workspace
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                {user?.displayName || initialCreator.displayName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                {initialCreator.headline} • Provenance Verified
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActiveTab('verification')}
              leftIcon={<Award className="w-4 h-4 text-[#2563EB]" />}
            >
              Trust Center
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddPortfolioOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add AI Portfolio Item
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 mb-8 flex gap-4 sm:gap-6 text-xs sm:text-sm overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'engagements', label: `Active Deliveries (${engagements.length})` },
            { id: 'campaigns', label: `Open Briefs (${campaigns.length})` },
            { id: 'portfolio', label: `AI Portfolio (${portfolio.length})` },
            { id: 'verification', label: 'Verification Signals' },
            { id: 'invitations', label: `Invitations (${invitations.length})` },
            { id: 'profile', label: 'Rates & Bio (₹)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 font-semibold transition-all whitespace-nowrap relative ${
                activeTab === tab.id ? 'text-[#2563EB]' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="creatorTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB] shadow-sm shadow-blue-500/50"
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                  Trust &amp; Verification Score
                </span>
                <span className="text-3xl font-black text-[#2563EB]">99%</span>
                <div className="mt-2 text-xs text-blue-700 flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" /> Elite Pro Verified Tier
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                  Active Brand Contracts
                </span>
                <span className="text-3xl font-black text-slate-900">{engagements.length}</span>
                <div className="mt-2 text-xs text-blue-600">Live milestone deliveries</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                  Brand Invitations
                </span>
                <span className="text-3xl font-black text-slate-900">{invitations.length}</span>
                <div className="mt-2 text-xs text-amber-700">Direct commissioning requests</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                  Indicative Commercial Rates (₹)
                </span>
                <span className="text-xl font-black text-slate-900">
                  {formatPriceRange(minPrice, maxPrice)}
                </span>
                <div className="mt-2 text-xs text-slate-500">In Indian Rupees (₹ INR)</div>
              </div>
            </div>

            {/* Active Production Highlight */}
            {engagements.length > 0 && (
              <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-950/40 via-midnight-800 to-midnight-800 p-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 mb-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-violet-400 uppercase tracking-wider block">
                      Commissioned Campaign In Progress
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5">{engagements[0].campaignTitle}</h3>
                    <p className="text-xs text-gray-400">
                      Brand: <strong className="text-white">{engagements[0].brandName}</strong> • Agreed Budget:{' '}
                      <strong className="text-emerald-400">{formatCurrency(engagements[0].agreedBudget)}</strong>
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setActiveTab('engagements')}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Open Delivery Workspace
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {engagements[0].milestones.map((m, idx) => (
                    <div
                      key={m.id}
                      className={`p-3.5 rounded-xl border text-xs ${
                        m.status === 'approved'
                          ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-200'
                          : m.status === 'in_review'
                          ? 'border-violet-500/40 bg-violet-500/10 text-violet-200'
                          : 'border-white/5 bg-white/[0.02] text-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5 font-semibold">
                        <span>Milestone {idx + 1}</span>
                        <span className="uppercase text-[10px] font-mono font-bold">
                          {m.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-white font-medium mb-1 line-clamp-1">{m.title}</p>
                      <span className="text-[11px] opacity-80 line-clamp-2">{m.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Active Engagements & Deliveries (Manage engagements from discovery through delivery) */}
        {activeTab === 'engagements' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-violet-400" />
                Active Engagements &amp; Delivery Workspace
              </h3>
              <p className="text-xs text-gray-400">
                Submit draft generation rounds with prompt logs, model checkpoints, and reproducible seeds. Review brand revision comments and finalize commercial deliveries.
              </p>
            </div>

            {engagements.length === 0 ? (
              <div className="rounded-2xl border border-white/5 bg-midnight-800/40 p-12 text-center space-y-3">
                <Film className="w-10 h-10 text-gray-500 mx-auto" />
                <h3 className="text-lg font-bold text-white">No Active Deliveries</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  When a brand commissions your proposal or accepts an invite, active production milestones will appear here.
                </p>
              </div>
            ) : (
              engagements.map((eng) => (
                <div
                  key={eng.id}
                  className="rounded-2xl border border-white/[0.08] bg-midnight-800/90 p-6 backdrop-blur-xl space-y-6 shadow-2xl"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base sm:text-lg font-bold text-white">{eng.campaignTitle}</h4>
                        <span className="rounded-full bg-violet-500/15 border border-violet-500/30 px-2.5 py-0.5 text-[10px] font-bold text-violet-300 uppercase font-mono">
                          {eng.currentStage.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Brand Client: <strong className="text-white">{eng.brandName}</strong> • Agreed Budget:{' '}
                        <strong className="text-emerald-400 font-mono">{formatCurrency(eng.agreedBudget)}</strong> • Target
                        Delivery: <strong className="text-white">{eng.targetDeadline}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleOpenDraftModal(eng.id, eng.milestones[1]?.id || eng.milestones[0].id)}
                        leftIcon={<Upload className="w-3.5 h-3.5" />}
                      >
                        Submit Generation Draft
                      </Button>
                    </div>
                  </div>

                  {/* Milestones List */}
                  <div className="space-y-4">
                    {eng.milestones.map((m) => (
                      <div
                        key={m.id}

                        className="rounded-xl border border-white/5 bg-midnight-950/60 p-4 space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <strong className="text-white text-sm">{m.title}</strong>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                  m.status === 'approved'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : m.status === 'in_review'
                                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                                    : 'bg-white/5 text-gray-400'
                                }`}
                              >
                                {m.status.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">{m.description}</p>
                          </div>

                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleOpenDraftModal(eng.id, m.id)}
                            className="text-xs py-1 h-8 shrink-0"
                            leftIcon={<Plus className="w-3 h-3" />}
                          >
                            Upload Round Deliverable
                          </Button>
                        </div>

                        {/* Deliverables Cards */}
                        {m.deliverables.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                            {m.deliverables.map((del) => (
                              <div
                                key={del.id}
                                className="rounded-xl border border-white/10 bg-midnight-900/90 overflow-hidden flex flex-col justify-between"
                              >
                                <div className="relative aspect-video bg-black overflow-hidden group">
                                  <SafeImage
                                    src={del.mediaUrl}
                                    alt={del.title}
                                    containerClassName="w-full h-full"
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                                    <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur-md text-[10px] font-mono text-white">
                                      Round {del.roundNumber}
                                    </span>
                                    <span className="px-2 py-0.5 rounded bg-violet-600/80 text-[10px] font-mono text-white">
                                      {del.modelUsed}
                                    </span>
                                  </div>
                                </div>

                                <div className="p-3.5 space-y-2 text-xs">
                                  <h6 className="font-bold text-white text-xs">{del.title}</h6>

                                  <div className="rounded-lg bg-black/50 border border-white/5 p-2 font-mono text-[10px] text-gray-300 leading-relaxed">
                                    <span className="text-violet-400 block mb-0.5">Prompt:</span>
                                    &quot;{del.generationPrompt}&quot;
                                    {del.seed && (
                                      <span className="text-emerald-400 block mt-1">Seed: {del.seed}</span>
                                    )}
                                  </div>

                                  <p className="text-gray-400 text-[11px]">{del.productionNotes}</p>

                                  {/* Brand Revision Feedback */}
                                  {del.brandFeedback && (
                                    <div className="p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-200 text-[11px]">
                                      <strong className="block text-amber-300 text-[10px] uppercase font-bold mb-0.5">
                                        Client Revision Feedback:
                                      </strong>
                                      {del.brandFeedback}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Open Campaigns (Brand Briefs) & Proposals */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Open Brand Briefs</h3>
              <p className="text-xs text-gray-400">
                Browse client creative briefs and submit tailored proposals with your quote, timeline, and proposed AI pipeline.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campaigns.map((c) => {
                const hasApplied = proposals.some(
                  (p) => p.campaignId === c.id && p.creatorId === initialCreator.uid
                );

                return (
                  <div
                    key={c.id}
                    className="rounded-2xl border border-white/[0.08] bg-midnight-800/80 p-5 backdrop-blur-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-bold text-white text-base">{c.title}</h4>
                        <span className="rounded-full bg-violet-500/15 border border-violet-500/30 px-2.5 py-0.5 text-[10px] font-bold text-violet-300 uppercase shrink-0">
                          {c.category}
                        </span>
                      </div>

                      <p className="text-xs text-gray-300 line-clamp-3 mb-4 leading-relaxed">
                        {c.description}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-[11px] mb-4 bg-midnight-950/60 p-3 rounded-xl border border-white/5">
                        <div>
                          <span className="text-gray-400 block text-[10px]">CONTENT TYPE</span>
                          <strong className="text-white">{c.contentType || 'Short-form AI Video'}</strong>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">FORMAT</span>
                          <strong className="text-violet-300 font-mono">{c.aspectRatio || '9:16'}</strong>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">STYLE</span>
                          <strong className="text-white">{c.preferredStyle || 'Cinematic'}</strong>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">COMMERCIAL TERMS</span>
                          <strong className="text-emerald-400 font-mono text-[10px] truncate block">
                            {c.commercialRequirements || 'Commercial Buyout'}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-gray-400 block">BUDGET (₹ INR)</span>
                        <strong className="text-sm font-black text-white font-mono">
                          {formatCurrency(c.budgetMin)} – {formatCurrency(c.budgetMax)}
                        </strong>
                      </div>

                      {hasApplied ? (
                        <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-semibold text-xs border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Proposal Submitted
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            setApplyModalCampaign(c);
                            setQuoteAmount(c.budgetMax.toString());
                          }}
                          leftIcon={<Send className="w-3.5 h-3.5" />}
                        >
                          Submit Proposal
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: AI Portfolio & Workflow Studio */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">AI Portfolio Works &amp; Workflows</h3>
                <p className="text-xs text-gray-400">
                  Every portfolio piece displays tools/models used, step-by-step workflow pipeline, aspect ratio, and prompt provenance.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAddPortfolioOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add AI Work
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolio.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/[0.08] bg-midnight-800/80 overflow-hidden flex flex-col justify-between shadow-xl"
                >
                  <div className="relative aspect-video bg-black overflow-hidden">
                    <SafeImage
                      src={item.imageUrl}
                      alt={item.title}
                      category={item.category}
                      containerClassName="w-full h-full"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur-md text-[10px] font-bold text-white">
                        {item.category}
                      </span>
                      {item.aspectRatio && (
                        <span className="px-2 py-0.5 rounded bg-violet-600/80 text-[10px] font-mono text-white">
                          {item.aspectRatio}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <h4 className="font-bold text-white text-sm">{item.title}</h4>
                    <p className="text-xs text-gray-300 line-clamp-2">{item.description}</p>

                    <div className="p-2.5 rounded-xl bg-midnight-950 border border-white/5 space-y-1.5 text-[11px]">
                      <div>
                        <span className="text-violet-400 font-bold block text-[10px]">PIPELINE / WORKFLOW:</span>
                        <span className="text-gray-300 font-mono line-clamp-2">
                          {item.workflow || 'Runway Gen-3 Alpha -> ComfyUI LoRA -> Topaz 4K Upscale'}
                        </span>
                      </div>
                      {item.provenance && (
                        <div className="pt-1 border-t border-white/5 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Prompt &amp; Seed Provenance Verified</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {item.tools.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[10px] text-gray-300 font-mono"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 border-t border-white/5 bg-white/[0.01] flex items-center justify-between text-xs">
                    <span className="text-emerald-400 text-[11px] font-medium">Commercial Cleared</span>
                    <button
                      onClick={() => setPortfolio(portfolio.filter((p) => p.id !== item.id))}
                      className="text-gray-400 hover:text-rose-400 p-1"
                      title="Delete work"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Verification & Trust Center (Bonus Feature) */}
        {activeTab === 'verification' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Creator Verification &amp; Trust Signals Center
              </h3>
              <p className="text-xs text-gray-400">
                Help brands trust creator claims through visible indicators for verified tools, workflows, past work, and commercial clearance.
              </p>
            </div>

            {/* Verification Status Banner */}
            <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-midnight-800 to-midnight-800 p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white">Elite Pro Verified Creator</h4>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-bold font-mono">
                        99% Trust Score
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 mt-0.5">
                      Your tools, workflow pipelines, and prompt logs are verified against commercial safety benchmarks.
                    </p>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleRunVerificationBenchmark}
                  disabled={isVerifying}
                  leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                  className="shrink-0"
                >
                  {isVerifying ? 'Running Benchmark Audit...' : 'Run Automated Tool Benchmark'}
                </Button>
              </div>

              {verificationSuccess && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Audit passed! Verified tool licenses and seed logs re-indexed for Runway Gen-3 Alpha, Midjourney v6.1, and ComfyUI.
                  </span>
                </div>
              )}

              {/* Three Pill Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-midnight-950/70 border border-white/5 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-violet-400 block">
                    1. Verified Tools
                  </span>
                  <p className="text-xs text-gray-300">
                    Pro credentials verified for Runway ML, Midjourney Enterprise, ComfyUI, and Topaz Video AI.
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {['Runway Gen-3 Alpha', 'Midjourney v6.1 Pro', 'ComfyUI Master'].map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 text-[10px] font-mono">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-midnight-950/70 border border-white/5 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
                    2. Verified Workflows
                  </span>
                  <p className="text-xs text-gray-300">
                    Deterministic temporal consistency, LoRA multi-pass architecture, and prompt reproducibility.
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {['LoRA Character Lock', 'Prompt Audit Provenance', 'ACES Color Grade'].map((w) => (
                      <span key={w} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-[10px]">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-midnight-950/70 border border-white/5 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block">
                    3. Commercial Past Work
                  </span>
                  <p className="text-xs text-gray-300">
                    14 completed commercial brand engagements with 100% on-time milestone delivery and copyright indemnification.
                  </p>
                  <div className="text-[11px] font-mono text-cyan-300 pt-1">
                    Zero copyright claims • Full IP Buyout Ready
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Invitations */}
        {activeTab === 'invitations' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Incoming Brand Project Invitations</h3>

            {invitations.length === 0 ? (
              <div className="rounded-2xl border border-white/5 bg-midnight-800/40 p-12 text-center space-y-3">
                <Send className="w-10 h-10 text-gray-500 mx-auto" />
                <h3 className="text-lg font-bold text-white">No Invitations at the Moment</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  When commercial brands find your profile on the discover page and invite you to a campaign, you will see it here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="rounded-2xl border border-white/[0.08] bg-midnight-800/80 p-5 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white text-base">
                          {inv.brandName || 'Brand Partner'}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase font-mono ${
                            inv.status === 'accepted'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Campaign: <strong className="text-violet-300">{inv.campaignTitle}</strong> • Offered Budget:{' '}
                        <strong className="text-white font-mono">{formatCurrency(inv.offeredBudget || 0)}</strong>
                      </p>
                      {inv.message && (
                        <p className="text-xs text-gray-300 italic mt-2 bg-white/[0.02] p-2.5 rounded-lg border border-white/5">
                          &quot;{inv.message}&quot;
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {inv.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleInvitationAction(inv.id, 'declined')}
                            className="text-xs"
                          >
                            Decline
                          </Button>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleInvitationAction(inv.id, 'accepted')}
                            className="text-xs"
                          >
                            Accept &amp; Start
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 7: Profile & Pricing */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-6 max-w-2xl">
            <div className="rounded-2xl border border-white/[0.08] bg-midnight-800/80 p-6 backdrop-blur-xl space-y-4">
              <h3 className="text-lg font-bold text-white mb-2">Edit Marketplace Profile &amp; Pricing</h3>

              <Input
                label="Headline"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Cinematic AI Video Director & Motion Artist"
                required
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                  Biography &amp; Workflow Overview
                </label>
                <textarea
                  value={biography}
                  onChange={(e) => setBiography(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Starting Minimum Rate (₹ INR)"
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                  required
                />
                <Input
                  label="Commercial Full Retainer Rate (₹ INR)"
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  required
                />
              </div>

              <Select
                label="Current Client Availability"
                value={availability}
                onChange={(e) => setAvailability(e.target.value as any)}
                options={[
                  { value: 'available', label: 'Available for New Commercial Projects' },
                  { value: 'busy', label: 'Busy (Limited Slots Open)' },
                  { value: 'unavailable', label: 'Unavailable / On Production Break' },
                ]}
              />

              <div className="pt-2 flex items-center justify-between">
                {profileSaved && (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Profile saved successfully!
                  </span>
                )}
                <Button type="submit" variant="primary" leftIcon={<Save className="w-4 h-4" />} className="ml-auto">
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Add Portfolio Modal */}
      <Modal
        isOpen={isAddPortfolioOpen}
        onClose={() => setIsAddPortfolioOpen(false)}
        title="Add AI Work to Portfolio"
        description="Include model used, generation pipeline, format, and reproducible prompt provenance."
        maxWidth="2xl"
      >
        <form onSubmit={handleAddPortfolioItem} className="space-y-4">
          <Input
            label="Work Title"
            value={newWorkTitle}
            onChange={(e) => setNewWorkTitle(e.target.value)}
            placeholder="e.g. Cyberpunk Sneaker Brand Film"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Category"
              value={newWorkCategory}
              onChange={(e) => setNewWorkCategory(e.target.value as CreativeCategory)}
              options={[
                { value: 'AI Video Generation', label: 'AI Video Generation' },
                { value: 'AI Advertising', label: 'AI Advertising' },
                { value: 'AI Photography', label: 'AI Photography' },
                { value: '3D Art and Animation', label: '3D Art and Animation' },
                { value: 'AI Graphic Design', label: 'AI Graphic Design' },
                { value: 'AI Avatars', label: 'AI Avatars' },
                { value: 'Product Visualization', label: 'Product Visualization' },
              ]}
            />
            <Select
              label="Content Type"
              value={newWorkContentType}
              onChange={(e) => setNewWorkContentType(e.target.value as any)}
              options={[
                { value: 'Video', label: 'Video' },
                { value: 'Stills', label: 'Stills' },
                { value: '3D Asset', label: '3D Asset' },
              ]}
            />
            <Select
              label="Aspect Ratio"
              value={newWorkAspectRatio}
              onChange={(e) => setNewWorkAspectRatio(e.target.value)}
              options={[
                { value: '16:9', label: '16:9 (Landscape Cinematic)' },
                { value: '9:16', label: '9:16 (Vertical Reels/TikTok)' },
                { value: '1:1', label: '1:1 (Square Feed)' },
                { value: '4:5', label: '4:5 (Portrait Social)' },
              ]}
            />
          </div>


          <Input
            label="Cover Image / Video Thumbnail URL"
            value={newWorkImage}
            onChange={(e) => setNewWorkImage(e.target.value)}
            placeholder="https://images.unsplash.com/..."
          />

          <Input
            label="Tools & Models Used (comma-separated)"
            value={newWorkTools}
            onChange={(e) => setNewWorkTools(e.target.value)}
            placeholder="e.g. Runway Gen-3, Midjourney v6.1, ComfyUI, Topaz Video AI"
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              Generation Pipeline &amp; Workflow Architecture
            </label>
            <textarea
              value={newWorkWorkflow}
              onChange={(e) => setNewWorkWorkflow(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-white/10 bg-midnight-950 p-3 text-xs text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none"
              placeholder="e.g. Concept Keyframe -> Runway Gen-3 Alpha multi-pass -> Topaz 4K 60fps upscaling..."
            />
          </div>

          {/* Prompt & Seed Provenance Fields */}
          <div className="p-3.5 rounded-xl border border-violet-500/20 bg-midnight-950 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-violet-300 block">
              Prompt &amp; Seed Provenance Spec (Verifiable AI Work)
            </span>
            <Input
              label="Primary Generation Prompt"
              value={newWorkPrompt}
              onChange={(e) => setNewWorkPrompt(e.target.value)}
              placeholder="Cinematic camera move, neon rain..."
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Model Checkpoint"
                value={newWorkModel}
                onChange={(e) => setNewWorkModel(e.target.value)}
                placeholder="Runway Gen-3 Alpha"
              />
              <Input
                label="Seed Number"
                value={newWorkSeed}
                onChange={(e) => setNewWorkSeed(e.target.value)}
                placeholder="889214732"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              Short Description &amp; Deliverable Specs
            </label>
            <textarea
              value={newWorkDesc}
              onChange={(e) => setNewWorkDesc(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-white/10 bg-midnight-950 p-3 text-xs text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none"
              placeholder="Commercial deliverable produced for brand launch..."
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
            <Button variant="ghost" size="sm" onClick={() => setIsAddPortfolioOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Publish to Portfolio
            </Button>
          </div>
        </form>
      </Modal>

      {/* Submit Draft Deliverable Modal */}
      <Modal
        isOpen={isDraftModalOpen}
        onClose={() => setIsDraftModalOpen(false)}
        title="Submit Generation Draft Round"
        description="Deliver generative passes with prompts, model used, and seed log for brand client review."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitDraft} className="space-y-4">
          <Input
            label="Deliverable Title"
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            required
          />

          <Input
            label="Media Preview URL (Image or Video)"
            value={draftMediaUrl}
            onChange={(e) => setDraftMediaUrl(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="AI Model / Tool Used"
              value={draftModel}
              onChange={(e) => setDraftModel(e.target.value)}
              required
            />
            <Input
              label="Seed Number"
              value={draftSeed}
              onChange={(e) => setDraftSeed(e.target.value)}
              placeholder="e.g. 889214733"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              Generation Prompt Formula
            </label>
            <textarea
              value={draftPrompt}
              onChange={(e) => setDraftPrompt(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-white/10 bg-midnight-950 p-3 text-xs text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              Production Notes for Brand Director
            </label>
            <textarea
              value={draftNotes}
              onChange={(e) => setDraftNotes(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-white/10 bg-midnight-950 p-3 text-xs text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
            <Button variant="ghost" size="sm" onClick={() => setIsDraftModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Submit Draft for Review
            </Button>
          </div>
        </form>
      </Modal>

      {/* Submit Proposal Modal */}
      {applyModalCampaign && (
        <Modal
          isOpen={Boolean(applyModalCampaign)}
          onClose={() => setApplyModalCampaign(null)}
          title={`Submit Proposal for ${applyModalCampaign.title}`}
          description="Provide quote in ₹ INR, delivery days, and outline your generative pipeline."
          maxWidth="lg"
        >
          <form onSubmit={handleSubmitProposal} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Your Quote (₹ INR)"
                type="number"
                value={quoteAmount}
                onChange={(e) => setQuoteAmount(e.target.value)}
                required
              />
              <Input
                label="Delivery Days"
                type="number"
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(e.target.value)}
                required
              />
            </div>

            <Input
              label="Proposed AI Toolchain"
              value={proposedTools}
              onChange={(e) => setProposedTools(e.target.value)}
              placeholder="Runway Gen-3, Midjourney v6.1, ComfyUI, Topaz"
              required
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Proposed Workflow Architecture
              </label>
              <textarea
                value={proposedWorkflow}
                onChange={(e) => setProposedWorkflow(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-white/10 bg-midnight-950 p-3 text-xs text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Cover Note / Pitch to Brand
              </label>
              <textarea
                value={pitchMessage}
                onChange={(e) => setPitchMessage(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-midnight-950 p-3 text-xs text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <Button variant="ghost" size="sm" onClick={() => setApplyModalCampaign(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Send Proposal to Brand
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
