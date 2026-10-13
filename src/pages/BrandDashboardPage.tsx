import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Plus,
  Send,
  Sparkles,
  Heart,
  ArrowRight,
  Trash2,
  CheckCircle2,
  FileCheck,
  MessageSquare,
  Download,
  Film,
  Wrench,
  Award,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCampaigns } from '../hooks/useCampaigns';
import { useCreators } from '../hooks/useCreators';
import { useShortlist } from '../hooks/useShortlist';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { CampaignFormModal } from '../components/campaigns/CampaignFormModal';
import { InviteCreatorModal } from '../components/campaigns/InviteCreatorModal';
import { formatCurrency } from '../utils/format';
import { SafeImage } from '../components/ui/SafeImage';
import { SafeAvatar } from '../components/ui/SafeAvatar';

import {
  getStoredInvitations,
  cancelInvitation,
  getStoredProposals,
  acceptProposalAndCreateEngagement,
  getStoredEngagements,
  submitRevisionFeedback,
  approveMilestone,
  completeEngagementWithCertificate,
  DATA_EVENTS,
} from '../services/store/dataStore';
import type { Invitation } from '../types/invitation';
import type { Proposal } from '../types/proposal';
import type { Engagement, CommercialLicenseCertificate } from '../types/engagement';

export default function BrandDashboardPage() {
  const { user } = useAuth();
  const { campaigns, createCampaign, deleteCampaign } = useCampaigns();
  const { getCreatorById } = useCreators();
  const { shortlist, removeFromShortlist } = useShortlist();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'campaigns' | 'proposals' | 'engagements' | 'shortlist' | 'invitations'
  >('overview');
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);

  // Invite Modal
  const [inviteModalData, setInviteModalData] = useState<{
    isOpen: boolean;
    creatorId: string;
    creatorName: string;
  }>({
    isOpen: false,
    creatorId: '',
    creatorName: '',
  });

  // Outgoing invitations stored in reactive dataStore
  const [invitations, setInvitations] = useState<Invitation[]>(() => getStoredInvitations());

  // Proposals received
  const [proposals, setProposals] = useState<Proposal[]>(() => getStoredProposals());

  // Active production engagements
  const [engagements, setEngagements] = useState<Engagement[]>(() => getStoredEngagements());

  // Revision feedback modal state

  const [revisionModalData, setRevisionModalData] = useState<{
    isOpen: boolean;
    engagementId: string;
    deliverableId: string;
    deliverableTitle: string;
  }>({
    isOpen: false,
    engagementId: '',
    deliverableId: '',
    deliverableTitle: '',
  });
  const [revisionFeedbackText, setRevisionFeedbackText] = useState('');

  // Certificate Modal state
  const [activeCertificate, setActiveCertificate] = useState<CommercialLicenseCertificate | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setInvitations(getStoredInvitations());
      setProposals(getStoredProposals());
      setEngagements(getStoredEngagements());
    };
    window.addEventListener(DATA_EVENTS.INVITATIONS_UPDATED, handleUpdate);
    window.addEventListener(DATA_EVENTS.PROPOSALS_UPDATED, handleUpdate);
    window.addEventListener(DATA_EVENTS.ENGAGEMENTS_UPDATED, handleUpdate);
    return () => {
      window.removeEventListener(DATA_EVENTS.INVITATIONS_UPDATED, handleUpdate);
      window.removeEventListener(DATA_EVENTS.PROPOSALS_UPDATED, handleUpdate);
      window.removeEventListener(DATA_EVENTS.ENGAGEMENTS_UPDATED, handleUpdate);
    };
  }, []);

  const shortlistedCreators = shortlist
    .map((id) => getCreatorById(id))
    .filter(Boolean) as any[];

  const handleCreateCampaign = (brief: any) => {
    createCampaign(brief);
    setActiveTab('campaigns');
  };

  const handleCancelInvitation = (invId: string) => {
    cancelInvitation(invId);
  };

  const handleAcceptProposal = (propId: string) => {
    const newEngagement = acceptProposalAndCreateEngagement(propId);
    if (newEngagement) {
      setEngagements(getStoredEngagements());
      setProposals(getStoredProposals());
      setActiveTab('engagements');
    }
  };


  const handleOpenRevisionModal = (engagementId: string, deliverableId: string, title: string) => {
    setRevisionModalData({
      isOpen: true,
      engagementId,
      deliverableId,
      deliverableTitle: title,
    });
    setRevisionFeedbackText('');
  };

  const handleSendRevision = () => {
    if (!revisionFeedbackText.trim()) return;
    submitRevisionFeedback(
      revisionModalData.engagementId,
      revisionModalData.deliverableId,
      revisionFeedbackText.trim()
    );
    setRevisionModalData((prev) => ({ ...prev, isOpen: false }));
  };

  const handleApproveMilestone = (engagementId: string, milestoneId: string) => {
    approveMilestone(engagementId, milestoneId);
  };

  const handleIssueLicense = (engagementId: string) => {
    completeEngagementWithCertificate(engagementId);
    const updated = getStoredEngagements().find((e) => e.id === engagementId);
    if (updated?.certificate) {
      setActiveCertificate(updated.certificate);
    }
  };

  return (
    <div className="min-h-screen bg-midnight-900 pt-24 pb-20 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-400 mb-1">
              <Briefcase className="w-3.5 h-3.5" /> Brand Studio Workspace
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Welcome, {user?.displayName || 'Creative Director'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Publish AI-assisted creative briefs, review creator proposals, and manage engagements from discovery through delivery.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link to="/matching">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Sparkles className="w-4 h-4 text-violet-400" />}
              >
                AI Match Finder
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCampaignModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Post Brief (AI Builder)
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-white/10 mb-8 flex gap-4 sm:gap-6 text-xs sm:text-sm overflow-x-auto scrollbar-none">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'campaigns', label: `Briefs (${campaigns.length})` },
            { id: 'proposals', label: `Proposals (${proposals.length})` },
            { id: 'engagements', label: `Production & Delivery (${engagements.length})` },
            { id: 'shortlist', label: `Saved Talent (${shortlistedCreators.length})` },
            { id: 'invitations', label: `Invites (${invitations.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 font-semibold transition-all relative whitespace-nowrap ${
                activeTab === tab.id ? 'text-violet-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="brandTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 shadow-sm shadow-violet-500/50"
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-white/[0.08] bg-midnight-800/60 p-5 backdrop-blur-xl">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                  Active Briefs
                </span>
                <span className="text-3xl font-black text-white">{campaigns.length}</span>
                <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Commercial IP Buyout Protected
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-midnight-800/60 p-5 backdrop-blur-xl">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                  Incoming Proposals
                </span>
                <span className="text-3xl font-black text-white">{proposals.length}</span>
                <div className="mt-2 text-xs text-violet-300">Awaiting your commissioning review</div>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-midnight-800/60 p-5 backdrop-blur-xl">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                  Production Engagements
                </span>
                <span className="text-3xl font-black text-white">{engagements.length}</span>
                <div className="mt-2 text-xs text-cyan-300">Active generative milestones</div>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-midnight-800/60 p-5 backdrop-blur-xl">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                  Committed Pipeline (₹)
                </span>
                <span className="text-2xl font-black text-white">
                  {formatCurrency(
                    engagements.reduce((acc, curr) => acc + curr.agreedBudget, 0) || 150000
                  )}
                </span>
                <div className="mt-2 text-xs text-gray-400">Escrow backed in INR</div>
              </div>
            </div>

            {/* Active Engagement Tracker Spotlight */}
            {engagements.length > 0 && (
              <div className="rounded-2xl border border-violet-500/25 bg-gradient-to-r from-violet-950/30 via-midnight-800 to-midnight-800 p-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 mb-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-violet-400 uppercase tracking-wider block">
                      Active Production Engagement In Progress
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5">
                      {engagements[0].campaignTitle}
                    </h3>
                    <p className="text-xs text-gray-400">
                      Commissioned Artist:{' '}
                      <strong className="text-white">{engagements[0].creatorName}</strong> • Agreed Budget:{' '}
                      <strong className="text-emerald-400">{formatCurrency(engagements[0].agreedBudget)}</strong>
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setActiveTab('engagements')}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Manage Engagement &amp; Review Drafts
                  </Button>
                </div>

                {/* Milestone Stepper */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {engagements[0].milestones.map((m, idx) => (
                    <div
                      key={m.id}
                      className={`p-3.5 rounded-xl border text-xs ${
                        m.status === 'approved'
                          ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-200'
                          : m.status === 'in_review' || m.status === 'in_progress'
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

            {/* Quick Actions: AI Brief Builder & Recent Proposals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Proposals Preview Card */}
              <div className="rounded-2xl border border-white/[0.08] bg-midnight-800/80 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-violet-400" />
                    Incoming Creator Proposals
                  </h3>
                  <button
                    onClick={() => setActiveTab('proposals')}
                    className="text-xs text-violet-400 hover:text-violet-300 font-semibold"
                  >
                    View All ({proposals.length})
                  </button>
                </div>

                <div className="space-y-3">
                  {proposals.slice(0, 2).map((prop) => (
                    <div
                      key={prop.id}
                      className="p-3.5 rounded-xl border border-white/5 bg-midnight-900/60 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <SafeAvatar
                            src={prop.creatorAvatar}
                            name={prop.creatorName}
                            size="sm"
                            className="border border-white/10"
                          />
                          <strong className="text-white">{prop.creatorName}</strong>
                        </div>
                        <span className="font-mono text-emerald-400 font-bold">
                          {formatCurrency(prop.proposedBudget)}
                        </span>
                      </div>
                      <p className="text-gray-300 line-clamp-2 italic">&quot;{prop.message}&quot;</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-gray-400 font-mono">
                          Timeline: {prop.deliveryTimelineDays} Days
                        </span>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleAcceptProposal(prop.id)}
                          className="text-[11px] py-1 h-7"
                        >
                          Accept Proposal
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fast Brief Launcher */}
              <div className="rounded-2xl border border-white/[0.08] bg-midnight-800/80 p-5 backdrop-blur-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
                    <Sparkles className="w-3.5 h-3.5" /> Structured Brief Engine
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">
                    Need a New Campaign Brief?
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed mb-4">
                    Our AI-Assisted Brief Builder transforms a simple 1-sentence prompt into a complete, structured creative brief with content type, visual style, 9:16 / 16:9 aspect ratios, recommended toolstack, and commercial IP buyout clauses.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsCampaignModalOpen(true)}
                    leftIcon={<Wrench className="w-3.5 h-3.5" />}
                  >
                    Open AI Brief Builder
                  </Button>
                  <Link to="/discover">
                    <Button variant="ghost" size="sm">
                      Explore Creator Portfolios
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Campaigns (Creative Briefs) */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Live Creative Campaign Briefs</h3>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCampaignModalOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Post New Brief
              </Button>
            </div>

            {campaigns.length === 0 ? (
              <div className="rounded-2xl border border-white/5 bg-midnight-800/40 p-12 text-center space-y-3">
                <Briefcase className="w-10 h-10 text-gray-500 mx-auto" />
                <h3 className="text-lg font-bold text-white">No Creative Briefs Published</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Post a brief to describe your commercial vision, formats, tools, and match with verified AI creators.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsCampaignModalOpen(true)}
                  className="mt-2"
                >
                  Create Brief with AI
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {campaigns.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-2xl border border-white/[0.08] bg-midnight-800/80 p-5 backdrop-blur-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-bold text-white text-base">{c.title}</h4>
                        <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 uppercase shrink-0">
                          {c.status}
                        </span>
                      </div>

                      <p className="text-xs text-gray-300 line-clamp-3 mb-4 leading-relaxed">
                        {c.description}
                      </p>

                      {/* Structured Fields Display */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] mb-4 bg-midnight-950/60 p-3 rounded-xl border border-white/5">
                        <div>
                          <span className="text-gray-400 block text-[10px]">CONTENT TYPE</span>
                          <strong className="text-white">{c.contentType || 'Short-form AI Video'}</strong>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">FORMAT / ASPECT RATIO</span>
                          <strong className="text-violet-300 font-mono">{c.aspectRatio || '9:16 (Vertical)'}</strong>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">STYLE</span>
                          <strong className="text-white">{c.preferredStyle || 'Cinematic'}</strong>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">COMMERCIAL RIGHTS</span>
                          <strong className="text-emerald-400 font-mono text-[10px] truncate block">
                            {c.commercialRequirements || 'Full Commercial Buyout'}
                          </strong>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {c.requiredSkills.map((s) => (
                          <span
                            key={s}
                            className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[10px] text-gray-300 border border-white/5"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-gray-400 block">BUDGET RANGE</span>
                        <strong className="text-sm font-black text-white font-mono">
                          {formatCurrency(c.budgetMin)} – {formatCurrency(c.budgetMax)}
                        </strong>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link to={`/matching?brief=${c.id}`}>
                          <Button variant="secondary" size="sm" className="text-xs">
                            Find Matches
                          </Button>
                        </Link>
                        <button
                          onClick={() => deleteCampaign(c.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-400 rounded-lg hover:bg-white/5 transition-colors"
                          title="Delete Campaign"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Proposals Received */}
        {activeTab === 'proposals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Creator Proposals &amp; Bids</h3>
                <p className="text-xs text-gray-400">
                  Review proposed quotes in ₹ INR, timelines, and proposed generative AI pipelines.
                </p>
              </div>
            </div>

            {proposals.length === 0 ? (
              <div className="rounded-2xl border border-white/5 bg-midnight-800/40 p-12 text-center space-y-3">
                <MessageSquare className="w-10 h-10 text-gray-500 mx-auto" />
                <h3 className="text-lg font-bold text-white">No Proposals Received Yet</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  When creators review your briefs and submit applications with custom quotes, they will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {proposals.map((prop) => (
                  <div
                    key={prop.id}
                    className="rounded-2xl border border-white/[0.08] bg-midnight-800/80 p-5 backdrop-blur-xl space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <SafeAvatar
                          src={prop.creatorAvatar}
                          name={prop.creatorName}
                          size="md"
                          className="border border-violet-500/40"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-base">{prop.creatorName}</h4>
                            <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/25 text-[10px] font-semibold text-emerald-400">
                              Verified Pro
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">
                            Applied to brief: <strong className="text-violet-300">{prop.campaignTitle}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 uppercase font-mono block">
                            PROPOSED QUOTE
                          </span>
                          <span className="text-lg font-black text-emerald-400 font-mono">
                            {formatCurrency(prop.proposedBudget)}
                          </span>
                        </div>
                        {prop.status === 'accepted' ? (
                          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Commissioned
                          </span>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleAcceptProposal(prop.id)}
                            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          >
                            Accept &amp; Commission Creator
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-midnight-950/70 border border-white/5 space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-400 block mb-0.5">
                          CREATIVE APPROACH &amp; AI PIPELINE
                        </span>
                        <p className="text-gray-300 leading-relaxed font-mono text-[11px]">
                          {prop.workflowApproach}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[10px] text-gray-400">Proposed Tools:</span>
                        {prop.proposedTools.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300 text-[10px] font-mono"
                          >
                            {t}
                          </span>
                        ))}
                        <span className="text-gray-500 mx-1">•</span>
                        <span className="text-[10px] text-gray-400">
                          Estimated Delivery: <strong className="text-white">{prop.deliveryTimelineDays} Days</strong>
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-300 italic">&quot;{prop.message}&quot;</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Production Engagements & Deliveries (Manage engagements from discovery through delivery) */}
        {activeTab === 'engagements' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-violet-400" />
                Active Engagements &amp; Delivery Management Hub
              </h3>
              <p className="text-xs text-gray-400">
                Track production stages, evaluate generation draft rounds (prompts, models &amp; seeds), provide revision feedback, and approve final master deliverables with commercial licenses.
              </p>
            </div>

            {engagements.map((eng) => (
              <div
                key={eng.id}
                className="rounded-2xl border border-white/[0.08] bg-midnight-800/90 p-6 backdrop-blur-xl space-y-6 shadow-2xl"
              >
                {/* Engagement Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div className="flex items-start gap-3.5">
                    <SafeAvatar
                      src={eng.creatorAvatar}
                      name={eng.creatorName}
                      size="lg"
                      shape="rounded"
                      className="border-2 border-violet-500/40"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base sm:text-lg font-bold text-white">{eng.campaignTitle}</h4>
                        <span className="rounded-full bg-violet-500/15 border border-violet-500/30 px-2.5 py-0.5 text-[10px] font-bold text-violet-300 uppercase font-mono">
                          {eng.currentStage.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Lead Creator: <strong className="text-white">{eng.creatorName}</strong> • Category:{' '}
                        <strong className="text-gray-300">{eng.category}</strong> • Target Deadline:{' '}
                        <strong className="text-gray-300">{eng.targetDeadline}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 uppercase font-mono block">COMMITTED BUDGET</span>
                      <span className="text-lg font-black text-emerald-400 font-mono">
                        {formatCurrency(eng.agreedBudget)}
                      </span>
                    </div>

                    {eng.certificate ? (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => setActiveCertificate(eng.certificate || null)}
                        leftIcon={<FileCheck className="w-3.5 h-3.5" />}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white"
                      >
                        View Commercial License Certificate
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleIssueLicense(eng.id)}
                        leftIcon={<Award className="w-3.5 h-3.5 text-emerald-400" />}
                      >
                        Issue &amp; Finalize License
                      </Button>
                    )}
                  </div>
                </div>

                {/* Milestone Deliverables Accordion / Cards */}
                <div className="space-y-4">
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Production Milestones &amp; Generation Rounds:
                  </h5>

                  {eng.milestones.map((m, mIdx) => (
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

                        {m.status !== 'approved' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleApproveMilestone(eng.id, m.id)}
                            leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                            className="text-xs py-1 h-8 shrink-0"
                          >
                            Approve Milestone {mIdx + 1}
                          </Button>
                        )}
                      </div>

                      {/* Deliverable Generation Rounds */}
                      {m.deliverables.length === 0 ? (
                        <div className="p-3 rounded-lg bg-white/[0.01] border border-dashed border-white/10 text-center text-xs text-gray-400">
                          Waiting for creator to submit round draft generations.
                        </div>
                      ) : (
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
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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

                                {/* Prompt & Seed Log */}
                                <div className="rounded-lg bg-black/50 border border-white/5 p-2 font-mono text-[10px] text-gray-300 leading-relaxed">
                                  <span className="text-violet-400 block mb-0.5">Generation Prompt:</span>
                                  &quot;{del.generationPrompt}&quot;
                                  {del.seed && (
                                    <span className="text-emerald-400 block mt-1">Seed: {del.seed}</span>
                                  )}
                                </div>

                                <p className="text-gray-400 text-[11px]">{del.productionNotes}</p>

                                {/* Brand Feedback if any */}
                                {del.brandFeedback && (
                                  <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px]">
                                    <strong className="block text-[10px] text-amber-300">Your Revision Feedback:</strong>
                                    {del.brandFeedback}
                                  </div>
                                )}

                                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                                  <span className="text-[10px] text-gray-400 font-mono">
                                    Status: {del.status}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleOpenRevisionModal(eng.id, del.id, del.title)}
                                    leftIcon={<MessageSquare className="w-3 h-3 text-violet-400" />}
                                    className="text-xs h-7"
                                  >
                                    Request Revision
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 5: Saved Talent (Shortlist) */}
        {activeTab === 'shortlist' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Your Saved Creator Roster</h3>

            {shortlistedCreators.length === 0 ? (
              <div className="rounded-2xl border border-white/5 bg-midnight-800/40 p-12 text-center space-y-3">
                <Heart className="w-10 h-10 text-gray-500 mx-auto" />
                <h3 className="text-lg font-bold text-white">No Creators Saved Yet</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Browse talent on the marketplace and tap the heart icon to save creators to your shortlist.
                </p>
                <Link to="/discover">
                  <Button variant="primary" size="sm" className="mt-2">
                    Browse Marketplace
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {shortlistedCreators.map((creator) => (
                  <div
                    key={creator.uid}
                    className="rounded-2xl border border-white/[0.08] bg-midnight-800/80 p-5 backdrop-blur-xl flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <SafeAvatar
                        src={creator.avatarUrl}
                        name={creator.displayName}
                        size="lg"
                        className="border border-violet-500/40"
                      />
                      <div>
                        <h4 className="font-bold text-white text-sm">{creator.displayName}</h4>
                        <span className="text-[11px] text-gray-400 block line-clamp-1">
                          {creator.headline}
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {formatCurrency(creator.priceRange.min)}+
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <button
                        onClick={() => removeFromShortlist(creator.uid)}
                        className="text-xs text-rose-400 hover:text-rose-300 font-medium"
                      >
                        Remove
                      </button>
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            setInviteModalData({
                              isOpen: true,
                              creatorId: creator.uid,
                              creatorName: creator.displayName,
                            })
                          }
                          className="text-xs"
                        >
                          Invite
                        </Button>
                        <Link to={`/creators/${creator.uid}`}>
                          <Button size="sm" variant="primary" className="text-xs">
                            Profile
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 6: Outgoing Invitations */}
        {activeTab === 'invitations' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Direct Creator Invitations</h3>

            {invitations.length === 0 ? (
              <div className="rounded-2xl border border-white/5 bg-midnight-800/40 p-12 text-center space-y-3">
                <Send className="w-10 h-10 text-gray-500 mx-auto" />
                <h3 className="text-lg font-bold text-white">No Invitations Sent Yet</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  When you invite creators to campaigns, you can manage and track their response status here.
                </p>
                <Link to="/discover">
                  <Button variant="primary" size="sm" className="mt-2">
                    Find Creators to Invite
                  </Button>
                </Link>
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
                          Invited {inv.creatorName}
                        </span>
                        <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 uppercase">
                          {inv.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Campaign: <strong className="text-gray-300">{inv.campaignTitle}</strong> • Offered Budget:{' '}
                        <strong className="text-white">{formatCurrency(inv.offeredBudget || 0)}</strong>
                      </p>
                      {inv.message && (
                        <p className="text-xs text-gray-300 italic mt-2 bg-white/[0.02] p-2 rounded-lg border border-white/5">
                          &quot;{inv.message}&quot;
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCancelInvitation(inv.id)}
                        className="text-xs text-gray-400 hover:text-rose-400 p-2"
                      >
                        Cancel Invitation
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Revision Feedback Modal */}
      <Modal
        isOpen={revisionModalData.isOpen}
        onClose={() => setRevisionModalData((prev) => ({ ...prev, isOpen: false }))}
        title="Submit Revision Feedback"
        description={`Provide clear direction on changes requested for ${revisionModalData.deliverableTitle}.`}
        maxWidth="lg"
      >
        <div className="space-y-4">
          <textarea
            value={revisionFeedbackText}
            onChange={(e) => setRevisionFeedbackText(e.target.value)}
            rows={4}
            placeholder="e.g. In scene 2, please enhance magenta rim lighting on the sneaker sole and slow down the camera pan to 45fps..."
            className="w-full rounded-xl border border-white/10 bg-midnight-950 p-3 text-xs text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRevisionModalData((prev) => ({ ...prev, isOpen: false }))}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSendRevision}
              disabled={!revisionFeedbackText.trim()}
            >
              Send Revision Request
            </Button>
          </div>
        </div>
      </Modal>

      {/* Commercial License & Provenance Certificate Modal */}
      {activeCertificate && (
        <Modal
          isOpen={Boolean(activeCertificate)}
          onClose={() => setActiveCertificate(null)}
          title="Verified Commercial Usage License & IP Certificate"
          description="Legally verifiable generative provenance certificate and unrestricted commercial IP transfer."
          maxWidth="2xl"
        >
          <div className="space-y-4 font-sans text-xs">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold text-emerald-400">
                  {activeCertificate.certificateId}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  VERIFIED &amp; EXCLUSIVE
                </span>
              </div>
              <h4 className="text-base font-bold text-white">{activeCertificate.campaignTitle}</h4>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  Grantee (Brand): <strong className="text-white">{activeCertificate.brandName}</strong>
                </div>
                <div>
                  Grantor (Creator): <strong className="text-white">{activeCertificate.creatorName}</strong>
                </div>
                <div>
                  Scope: <strong className="text-white">{activeCertificate.scopeOfUse}</strong>
                </div>
                <div>
                  Term &amp; Territory: <strong className="text-white">{activeCertificate.term} / {activeCertificate.territory}</strong>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-midnight-950 p-3.5 border border-white/5 space-y-2 font-mono text-[11px]">
              <div className="text-violet-300 font-bold uppercase text-[10px]">
                GENERATION AUDIT &amp; MODEL PROVENANCE LOG:
              </div>
              <div>Primary Toolchain: {activeCertificate.generationAuditLog.primaryModel}</div>
              <div>Seeds Audited: {activeCertificate.generationAuditLog.seedsLogged} verified reproducible seeds</div>
              <div>AI Model Training Exclusion Clause: <span className="text-emerald-400">ACTIVE &amp; ENFORCED</span></div>
              <div className="text-[10px] text-gray-500 truncate">
                Provenance Hash: {activeCertificate.provenanceHash}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-gray-400 text-[11px] leading-relaxed">
              <strong>Warranty of Non-Infringement:</strong> The creator certifies that all deliverables were synthesized in compliant environments with commercial subscriptions and zero unauthorized copyright assets. Full commercial indemnification applies.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setActiveCertificate(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  alert('Certificate downloaded in verified PDF & JSON provenance envelope.');
                  setActiveCertificate(null);
                }}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Download Certificate
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Campaign Create Modal */}
      <CampaignFormModal
        isOpen={isCampaignModalOpen}
        onClose={() => setIsCampaignModalOpen(false)}
        onSubmit={handleCreateCampaign}
      />

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
