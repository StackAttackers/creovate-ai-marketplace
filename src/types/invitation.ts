export type InvitationStatus = 'pending' | 'accepted' | 'declined';

export interface Invitation {
  id: string;
  campaignId: string;
  brandId: string;
  creatorId: string;
  brandName: string;
  creatorName?: string;
  campaignTitle: string;
  offeredBudget?: number;
  message: string;
  status: InvitationStatus;
  createdAt: string;
  updatedAt?: string;
}
