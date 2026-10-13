export type ProposalStatus =
  | 'submitted'
  | 'viewed'
  | 'shortlisted'
  | 'accepted'
  | 'rejected';

export interface Proposal {
  id: string;
  campaignId: string;
  creatorId: string;
  brandId: string;
  creatorName: string;
  creatorAvatar?: string;
  campaignTitle: string;
  message: string;
  proposedBudget: number; // in INR
  deliveryTimelineDays: number;
  proposedTools: string[];
  workflowApproach: string;
  status: ProposalStatus;
  createdAt: string;
}

