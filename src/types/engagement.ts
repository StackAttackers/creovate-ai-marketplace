export type EngagementStage =
  | 'brief_matched'
  | 'proposal_accepted'
  | 'generation_drafts'
  | 'revisions_in_review'
  | 'final_delivery'
  | 'completed';

export type MilestoneStatus = 'pending' | 'in_progress' | 'in_review' | 'revision_requested' | 'approved';

export interface GenerationDeliverable {
  id: string;
  roundNumber: number; // 1 = initial draft, 2 = revision 1, etc.
  title: string;
  mediaUrl: string;
  contentType: 'Video' | 'Stills' | '3D Asset' | 'Interactive' | 'Avatar';
  generationPrompt: string;
  modelUsed: string; // e.g. Runway Gen-3 Alpha, Midjourney v6.1
  seed?: string;
  productionNotes: string;
  brandFeedback?: string;
  status: 'submitted' | 'revision_requested' | 'approved';
  submittedAt: string;
}

export interface EngagementMilestone {
  id: string;
  title: string;
  description: string;
  targetDays: number;
  status: MilestoneStatus;
  deliverables: GenerationDeliverable[];
  completedAt?: string;
}

export interface CommercialLicenseCertificate {
  certificateId: string;
  issuedAt: string;
  campaignTitle: string;
  brandName: string;
  creatorName: string;
  licenseType: string;
  scopeOfUse: string;
  territory: string;
  term: string;
  aiExclusionClause: boolean;
  provenanceHash: string;
  generationAuditLog: {
    primaryModel: string;
    seedsLogged: number;
    promptChainVerified: boolean;
  };
}

export interface Engagement {
  id: string;
  campaignId: string;
  campaignTitle: string;
  category: string;
  brandId: string;
  brandName: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  agreedBudget: number; // in INR
  currentStage: EngagementStage;
  targetDeadline: string;
  commercialRequirements: string;
  aspectRatio: string;
  milestones: EngagementMilestone[];
  certificate?: CommercialLicenseCertificate;
  createdAt: string;
  updatedAt: string;
}
