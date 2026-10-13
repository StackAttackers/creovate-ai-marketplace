import { demoCreators } from '../demo/creators';
import { demoCampaigns } from '../demo/campaigns';
import type { CreatorProfile, PortfolioItem } from '../../types/creator';
import type { Campaign } from '../../types/campaign';
import type { Invitation } from '../../types/invitation';
import type { Proposal } from '../../types/proposal';
import type { Engagement, GenerationDeliverable, CommercialLicenseCertificate } from '../../types/engagement';
import { firestore, isDemoMode } from '../firebase/config';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';


const CREATORS_KEY = 'creovate-creators';
const CAMPAIGNS_KEY = 'creovate-campaigns';
const INVITATIONS_KEY = 'creovate-invitations';
const SHORTLIST_KEY = 'creovate-shortlist';
const PROPOSALS_KEY = 'creovate-proposals-data';
const ENGAGEMENTS_KEY = 'creovate-engagements-data';

// Custom event names for cross-component reactive updates
export const DATA_EVENTS = {
  CREATORS_UPDATED: 'creovate-creators-updated',
  CAMPAIGNS_UPDATED: 'creovate-campaigns-updated',
  INVITATIONS_UPDATED: 'creovate-invitations-updated',
  SHORTLIST_UPDATED: 'creovate-shortlist-updated',
  PROPOSALS_UPDATED: 'creovate-proposals-updated',
  ENGAGEMENTS_UPDATED: 'creovate-engagements-updated',
};


function dispatchDataEvent(eventName: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(eventName));
  }
}

// ─────────────────────────────────────────────────────────────
// CREATORS STORE
// ─────────────────────────────────────────────────────────────

export function getStoredCreators(): CreatorProfile[] {
  try {
    const customData = localStorage.getItem(CREATORS_KEY);
    const customCreators: Record<string, CreatorProfile> = customData ? JSON.parse(customData) : {};

    // Merge default demo creators with custom updates
    const merged = demoCreators.map((demo) => {
      if (customCreators[demo.uid]) {
        return { ...demo, ...customCreators[demo.uid] };
      }
      return demo;
    });

    // Append any completely new creators that don't exist in demoCreators
    Object.values(customCreators).forEach((custom) => {
      if (!merged.some((m) => m.uid === custom.uid)) {
        merged.unshift(custom);
      }
    });

    return merged;
  } catch (err) {
    console.error('Failed to load creators from local store:', err);
    return demoCreators;
  }
}

export function saveCreatorProfile(profile: CreatorProfile): void {
  try {
    const customData = localStorage.getItem(CREATORS_KEY);
    const customCreators: Record<string, CreatorProfile> = customData ? JSON.parse(customData) : {};
    customCreators[profile.uid] = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(CREATORS_KEY, JSON.stringify(customCreators));
    dispatchDataEvent(DATA_EVENTS.CREATORS_UPDATED);

    // Persist to Cloud Firestore (both creatorProfiles and agencies collections if role == agency)
    if (!isDemoMode && firestore) {
      setDoc(doc(firestore, 'creatorProfiles', profile.uid), {
        ...profile,
        updatedAt: new Date().toISOString(),
      }, { merge: true }).catch((err) =>
        console.warn('Firestore creator save failed:', err)
      );

      if (profile.role === 'agency') {
        setDoc(doc(firestore, 'agencies', profile.uid), {
          ...profile,
          agencyType: 'AI Production Studio',
          updatedAt: new Date().toISOString(),
        }, { merge: true }).catch((err) =>
          console.warn('Firestore agency save failed:', err)
        );
      }
    }
  } catch (err) {
    console.error('Failed to save creator profile:', err);
  }
}

export function addPortfolioItemToCreator(creatorId: string, item: PortfolioItem): void {
  const creators = getStoredCreators();
  const target = creators.find((c) => c.uid === creatorId);
  if (!target) return;

  const updatedPortfolio = [item, ...target.portfolio];
  saveCreatorProfile({
    ...target,
    portfolio: updatedPortfolio,
  });
}

// ─────────────────────────────────────────────────────────────
// CAMPAIGNS STORE
// ─────────────────────────────────────────────────────────────

export function getStoredCampaigns(): Campaign[] {
  try {
    const customData = localStorage.getItem(CAMPAIGNS_KEY);
    const customCampaigns: Campaign[] = customData ? JSON.parse(customData) : [];

    // Filter out duplicates if any
    const customIds = new Set(customCampaigns.map((c) => c.id));
    const activeDemo = demoCampaigns.filter((d) => !customIds.has(d.id));

    return [...customCampaigns, ...activeDemo];
  } catch (err) {
    console.error('Failed to load campaigns from local store:', err);
    return demoCampaigns;
  }
}

export function saveCampaign(campaign: Campaign): void {
  try {
    const existing = getStoredCampaigns().filter((c) => c.id !== campaign.id);
    const updated = [campaign, ...existing];
    localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(updated));
    dispatchDataEvent(DATA_EVENTS.CAMPAIGNS_UPDATED);

    // Persist to Firestore if configured
    if (!isDemoMode && firestore) {
      setDoc(doc(firestore, 'campaigns', campaign.id), campaign).catch((err) =>
        console.warn('Firestore campaign save failed:', err)
      );
    }
  } catch (err) {
    console.error('Failed to save campaign:', err);
  }
}

export function deleteStoredCampaign(campaignId: string): void {
  try {
    const existing = getStoredCampaigns().filter((c) => c.id !== campaignId);
    localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(existing));
    dispatchDataEvent(DATA_EVENTS.CAMPAIGNS_UPDATED);

    // Remove from Firestore if configured
    if (!isDemoMode && firestore) {
      deleteDoc(doc(firestore, 'campaigns', campaignId)).catch((err) =>
        console.warn('Firestore campaign delete failed:', err)
      );
    }
  } catch (err) {
    console.error('Failed to delete campaign:', err);
  }
}

// ─────────────────────────────────────────────────────────────
// INVITATIONS STORE
// ─────────────────────────────────────────────────────────────

export function getStoredInvitations(): Invitation[] {
  try {
    const stored = localStorage.getItem(INVITATIONS_KEY);
    if (stored) return JSON.parse(stored);

    // Default realistic seed invitation for immediate demonstration
    const seed: Invitation[] = [
      {
        id: 'inv-seed-1',
        campaignId: 'camp-1',
        brandId: 'brand-demo',
        creatorId: 'creator-1', // Maya Chen
        brandName: 'CyberLuxe Media',
        creatorName: 'Maya Chen',
        campaignTitle: 'Cyberpunk Sneaker Launch Reel',
        offeredBudget: 150000,
        message: 'Hi Maya! We loved your cinematic transitions in the Neo-Tokyo teaser and would like you to lead generative video production for our launch reel.',
        status: 'pending',
        createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      },
    ];
    localStorage.setItem(INVITATIONS_KEY, JSON.stringify(seed));
    return seed;
  } catch {
    return [];
  }
}

export function saveInvitation(invitation: Invitation): void {
  try {
    const existing = getStoredInvitations().filter((i) => i.id !== invitation.id);
    const updated = [invitation, ...existing];
    localStorage.setItem(INVITATIONS_KEY, JSON.stringify(updated));
    dispatchDataEvent(DATA_EVENTS.INVITATIONS_UPDATED);
  } catch (err) {
    console.error('Failed to save invitation:', err);
  }
}

export function updateInvitationStatus(
  invitationId: string,
  newStatus: 'accepted' | 'declined'
): void {
  try {
    const existing = getStoredInvitations();
    const updated = existing.map((inv) =>
      inv.id === invitationId ? { ...inv, status: newStatus, updatedAt: new Date().toISOString() } : inv
    );
    localStorage.setItem(INVITATIONS_KEY, JSON.stringify(updated));
    dispatchDataEvent(DATA_EVENTS.INVITATIONS_UPDATED);
  } catch (err) {
    console.error('Failed to update invitation status:', err);
  }
}

export function cancelInvitation(invitationId: string): void {
  try {
    const existing = getStoredInvitations().filter((i) => i.id !== invitationId);
    localStorage.setItem(INVITATIONS_KEY, JSON.stringify(existing));
    dispatchDataEvent(DATA_EVENTS.INVITATIONS_UPDATED);
  } catch (err) {
    console.error('Failed to cancel invitation:', err);
  }
}

// ─────────────────────────────────────────────────────────────
// SHORTLIST STORE
// ─────────────────────────────────────────────────────────────

export function getStoredShortlist(): string[] {
  try {
    const stored = localStorage.getItem(SHORTLIST_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveStoredShortlist(ids: string[]): void {
  try {
    localStorage.setItem(SHORTLIST_KEY, JSON.stringify(ids));
    dispatchDataEvent(DATA_EVENTS.SHORTLIST_UPDATED);
  } catch (err) {
    console.error('Failed to save shortlist:', err);
  }
}

// ─────────────────────────────────────────────────────────────
// PROPOSALS STORE
// ─────────────────────────────────────────────────────────────

export function getStoredProposals(): Proposal[] {
  try {
    const stored = localStorage.getItem(PROPOSALS_KEY);
    if (stored) return JSON.parse(stored);

    const seed: Proposal[] = [
      {
        id: 'prop-seed-1',
        campaignId: 'camp-1',
        brandId: 'brand-demo',
        creatorId: 'creator-001',
        creatorName: 'Maya Chen',
        creatorAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=MayaChen&backgroundColor=b6e3f4',
        campaignTitle: 'Cyberpunk Sneaker Launch Reel',
        proposedBudget: 145000,
        deliveryTimelineDays: 14,
        proposedTools: ['Runway Gen-3', 'ComfyUI', 'DaVinci Resolve', 'Topaz Video AI'],
        workflowApproach: 'I will develop a custom LoRA checkpoint for the sneaker silhouette to guarantee multi-scene temporal consistency, generate raw 4K passes via Runway Gen-3, and grade in DaVinci Resolve.',
        message: 'Hi! I have directed 12+ commercial AI brand films. I can guarantee photorealistic lighting and consistent brand asset placement with multi-pass LoRA conditioning.',
        status: 'submitted',
        createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
      },
      {
        id: 'prop-seed-2',
        campaignId: 'camp-2',
        brandId: 'brand-demo',
        creatorId: 'creator-002',
        creatorName: 'Alex Rivera',
        creatorAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=AlexRivera&backgroundColor=c0aede',
        campaignTitle: 'Eco-Luxury Skincare Social Ad Campaign',
        proposedBudget: 85000,
        deliveryTimelineDays: 10,
        proposedTools: ['Midjourney v6.1', 'Magnific AI', 'Photoshop', 'Meta Ads Studio'],
        workflowApproach: 'High-contrast studio lighting prompting with botanical textures. Full provenance prompt seeds logged with 4:5 social optimization.',
        message: 'Excited about this! We will deliver 6 high-converting hook variants with complete commercial clearance.',
        status: 'submitted',
        createdAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
      },
    ];

    localStorage.setItem(PROPOSALS_KEY, JSON.stringify(seed));
    return seed;
  } catch {
    return [];
  }
}

export function saveProposal(proposal: Proposal): void {
  try {
    const existing = getStoredProposals().filter((p) => p.id !== proposal.id);
    const updated = [proposal, ...existing];
    localStorage.setItem(PROPOSALS_KEY, JSON.stringify(updated));
    dispatchDataEvent(DATA_EVENTS.PROPOSALS_UPDATED);
  } catch (err) {
    console.error('Failed to save proposal:', err);
  }
}

// ─────────────────────────────────────────────────────────────
// ENGAGEMENTS LIFECYCLE STORE (Discovery -> Brief -> Milestone -> Delivery)
// ─────────────────────────────────────────────────────────────

export function getStoredEngagements(): Engagement[] {
  try {
    const stored = localStorage.getItem(ENGAGEMENTS_KEY);
    if (stored) return JSON.parse(stored);

    const seed: Engagement[] = [
      {
        id: 'eng-001',
        campaignId: 'camp-1',
        campaignTitle: 'Cyberpunk Sneaker Launch Reel',
        category: 'AI Video Generation',
        brandId: 'brand-demo',
        brandName: 'CyberLuxe Media',
        creatorId: 'creator-001',
        creatorName: 'Maya Chen',
        creatorAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=MayaChen&backgroundColor=b6e3f4',
        agreedBudget: 150000,
        currentStage: 'generation_drafts',
        targetDeadline: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString().split('T')[0],
        commercialRequirements: 'Full Worldwide Commercial Buyout (In Perpetuity) + Raw Seed Provenance',
        aspectRatio: '9:16 (Vertical Reels/TikTok/Shorts)',
        milestones: [
          {
            id: 'm-1',
            title: 'Milestone 1: Brief & Prompt Specs Approved',
            description: 'Concept storyboards, moodboards, and camera prompt formulas finalized.',
            targetDays: 3,
            status: 'approved',
            completedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
            deliverables: [
              {
                id: 'd-1-1',
                roundNumber: 1,
                title: 'Storyboards & LoRA Silhouette Spec',
                mediaUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=600&fit=crop',
                contentType: 'Stills',
                generationPrompt: 'Cinematic storyboard frames, glowing cybernetic neon sneaker, wet Tokyo pavement reflections, anamorphic lens --ar 16:9 --v 6.1',
                modelUsed: 'Midjourney v6.1 + ComfyUI LoRA',
                seed: '44910284',
                productionNotes: 'Tested 14 seed variants; direction approved by creative director.',
                status: 'approved',
                submittedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
              },
            ],
          },
          {
            id: 'm-2',
            title: 'Milestone 2: Generation Rounds & Test Variations',
            description: 'First video generation passes, motion fidelity review, brand feedback iteration.',
            targetDays: 7,
            status: 'in_review',
            deliverables: [
              {
                id: 'd-2-1',
                roundNumber: 1,
                title: 'Generation Draft v1 — Hero Runner Scene',
                mediaUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=600&fit=crop',
                contentType: 'Video',
                generationPrompt: 'Hyper-speed tracking shot of cyber sneaker landing on puddle with luminescent purple droplets, neon city skyline, slow motion 60fps --motion 6',
                modelUsed: 'Runway Gen-3 Alpha',
                seed: '889214732',
                productionNotes: 'Pass 1 generated with Runway Gen-3. Motion speed dialed in; waiting for brand lighting approval before 4K upscaling pass.',
                brandFeedback: 'Lighting is stunning! Can we intensify the magenta bounce light on the sole in Scene 2?',
                status: 'revision_requested',
                submittedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
              },
              {
                id: 'd-2-2',
                roundNumber: 2,
                title: 'Generation Draft v2 — Revised Lighting Pass',
                mediaUrl: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=800&h=600&fit=crop',
                contentType: 'Video',
                generationPrompt: 'Enhanced magenta neon glow along outer sole, high-speed fluid droplets, cinematic lens flare, anamorphic depth of field --motion 7',
                modelUsed: 'Runway Gen-3 Alpha + Topaz Video AI',
                seed: '889214733',
                productionNotes: 'Adjusted color grading in DaVinci Resolve and applied localized magenta radiance mask.',
                status: 'submitted',
                submittedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
              },
            ],
          },
          {
            id: 'm-3',
            title: 'Milestone 3: 4K Master Deliverable & Commercial License Handover',
            description: 'ProRes 422 4K export, sound design stems, seed logs, and signed commercial copyright certificate.',
            targetDays: 4,
            status: 'pending',
            deliverables: [],
          },
        ],
        createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    localStorage.setItem(ENGAGEMENTS_KEY, JSON.stringify(seed));
    return seed;
  } catch {
    return [];
  }
}

export function saveEngagement(engagement: Engagement): void {
  try {
    const existing = getStoredEngagements().filter((e) => e.id !== engagement.id);
    const updated = [engagement, ...existing];
    localStorage.setItem(ENGAGEMENTS_KEY, JSON.stringify(updated));
    dispatchDataEvent(DATA_EVENTS.ENGAGEMENTS_UPDATED);
  } catch (err) {
    console.error('Failed to save engagement:', err);
  }
}

export function acceptProposalAndCreateEngagement(proposalId: string): Engagement | null {
  try {
    const proposals = getStoredProposals();
    const targetProp = proposals.find((p) => p.id === proposalId);
    if (!targetProp) return null;

    // Update proposal status
    const updatedProposals = proposals.map((p) =>
      p.id === proposalId ? { ...p, status: 'accepted' as const } : p
    );
    localStorage.setItem(PROPOSALS_KEY, JSON.stringify(updatedProposals));
    dispatchDataEvent(DATA_EVENTS.PROPOSALS_UPDATED);

    // Create new active Engagement
    const newEngagement: Engagement = {
      id: `eng-${Date.now()}`,
      campaignId: targetProp.campaignId,
      campaignTitle: targetProp.campaignTitle,
      category: 'AI Video Generation',
      brandId: targetProp.brandId,
      brandName: 'CyberLuxe Media',
      creatorId: targetProp.creatorId,
      creatorName: targetProp.creatorName,
      creatorAvatar: targetProp.creatorAvatar || 'https://api.dicebear.com/9.x/avataaars/svg?seed=Creator',
      agreedBudget: targetProp.proposedBudget,
      currentStage: 'proposal_accepted',
      targetDeadline: new Date(Date.now() + (targetProp.deliveryTimelineDays || 14) * 24 * 3600 * 1000)
        .toISOString()
        .split('T')[0],
      commercialRequirements: 'Full Worldwide Commercial Buyout (In Perpetuity)',
      aspectRatio: '16:9 (Cinematic)',
      milestones: [
        {
          id: `m-${Date.now()}-1`,
          title: 'Milestone 1: Brief & Prompt Specs Approved',
          description: 'Define prompt syntax, LoRA checkpoint, and initial moodboards.',
          targetDays: 3,
          status: 'in_progress',
          deliverables: [],
        },
        {
          id: `m-${Date.now()}-2`,
          title: 'Milestone 2: Generation Rounds (v1/v2)',
          description: 'Deliver first generative drafts, test scene variants, iterate on brand feedback.',
          targetDays: 7,
          status: 'pending',
          deliverables: [],
        },
        {
          id: `m-${Date.now()}-3`,
          title: 'Milestone 3: 4K Master & Commercial License Handover',
          description: 'Final 4K renders, seed/prompt audit package, and commercial usage certificate.',
          targetDays: 4,
          status: 'pending',
          deliverables: [],
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveEngagement(newEngagement);
    return newEngagement;
  } catch (err) {
    console.error('Failed to accept proposal:', err);
    return null;
  }
}

export function submitDeliverableDraft(
  engagementId: string,
  milestoneId: string,
  deliverable: GenerationDeliverable
): void {
  try {
    const engagements = getStoredEngagements();
    const updated = engagements.map((eng) => {
      if (eng.id !== engagementId) return eng;

      const updatedMilestones = eng.milestones.map((m) => {
        if (m.id !== milestoneId) return m;
        return {
          ...m,
          status: 'in_review' as const,
          deliverables: [...m.deliverables, deliverable],
        };
      });

      return {
        ...eng,
        currentStage: 'generation_drafts' as const,
        milestones: updatedMilestones,
        updatedAt: new Date().toISOString(),
      };
    });

    localStorage.setItem(ENGAGEMENTS_KEY, JSON.stringify(updated));
    dispatchDataEvent(DATA_EVENTS.ENGAGEMENTS_UPDATED);
  } catch (err) {
    console.error('Failed to submit deliverable draft:', err);
  }
}

export function submitRevisionFeedback(
  engagementId: string,
  deliverableId: string,
  feedback: string
): void {
  try {
    const engagements = getStoredEngagements();
    const updated = engagements.map((eng) => {
      if (eng.id !== engagementId) return eng;

      const updatedMilestones = eng.milestones.map((m) => {
        const hasDel = m.deliverables.some((d) => d.id === deliverableId);
        if (!hasDel) return m;

        return {
          ...m,
          status: 'revision_requested' as const,
          deliverables: m.deliverables.map((d) =>
            d.id === deliverableId
              ? { ...d, brandFeedback: feedback, status: 'revision_requested' as const }
              : d
          ),
        };
      });

      return {
        ...eng,
        currentStage: 'revisions_in_review' as const,
        milestones: updatedMilestones,
        updatedAt: new Date().toISOString(),
      };
    });

    localStorage.setItem(ENGAGEMENTS_KEY, JSON.stringify(updated));
    dispatchDataEvent(DATA_EVENTS.ENGAGEMENTS_UPDATED);
  } catch (err) {
    console.error('Failed to submit revision feedback:', err);
  }
}

export function approveMilestone(engagementId: string, milestoneId: string): void {
  try {
    const engagements = getStoredEngagements();
    const updated = engagements.map((eng) => {
      if (eng.id !== engagementId) return eng;

      let nextStage = eng.currentStage;
      const updatedMilestones = eng.milestones.map((m) => {
        if (m.id !== milestoneId) return m;
        return {
          ...m,
          status: 'approved' as const,
          completedAt: new Date().toISOString(),
          deliverables: m.deliverables.map((d) => ({ ...d, status: 'approved' as const })),
        };
      });

      // Advance stage
      const allApproved = updatedMilestones.every((m) => m.status === 'approved');
      if (allApproved) {
        nextStage = 'completed';
      } else {
        const nextPending = updatedMilestones.find((m) => m.status === 'pending');
        if (nextPending) {
          nextPending.status = 'in_progress';
          if (nextPending.title.includes('Milestone 3') || nextPending.title.includes('Master')) {
            nextStage = 'final_delivery';
          }
        }
      }

      return {
        ...eng,
        currentStage: nextStage,
        milestones: updatedMilestones,
        updatedAt: new Date().toISOString(),
      };
    });

    localStorage.setItem(ENGAGEMENTS_KEY, JSON.stringify(updated));
    dispatchDataEvent(DATA_EVENTS.ENGAGEMENTS_UPDATED);
  } catch (err) {
    console.error('Failed to approve milestone:', err);
  }
}

export function completeEngagementWithCertificate(
  engagementId: string,
  licenseType = 'Full Worldwide Commercial Buyout (In Perpetuity)'
): void {
  try {
    const engagements = getStoredEngagements();
    const updated = engagements.map((eng) => {
      if (eng.id !== engagementId) return eng;

      const certificate: CommercialLicenseCertificate = {
        certificateId: `CERT-CRV-${Math.floor(100000 + Math.random() * 900000)}`,
        issuedAt: new Date().toISOString(),
        campaignTitle: eng.campaignTitle,
        brandName: eng.brandName,
        creatorName: eng.creatorName,
        licenseType,
        scopeOfUse: 'Unrestricted Broadcast, Social, Streaming, Digital Advertising, and Print Media',
        territory: 'Worldwide',
        term: 'In Perpetuity',
        aiExclusionClause: true,
        provenanceHash: `sha256:0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        generationAuditLog: {
          primaryModel: 'Runway Gen-3 Alpha + Midjourney v6.1 Enterprise',
          seedsLogged: 6,
          promptChainVerified: true,
        },
      };

      const completedMilestones = eng.milestones.map((m) => ({
        ...m,
        status: 'approved' as const,
        completedAt: m.completedAt || new Date().toISOString(),
      }));

      return {
        ...eng,
        currentStage: 'completed' as const,
        milestones: completedMilestones,
        certificate,
        updatedAt: new Date().toISOString(),
      };
    });

    localStorage.setItem(ENGAGEMENTS_KEY, JSON.stringify(updated));
    dispatchDataEvent(DATA_EVENTS.ENGAGEMENTS_UPDATED);
  } catch (err) {
    console.error('Failed to complete engagement:', err);
  }
}

