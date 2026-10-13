import type { CreativeCategory } from './creator';

export type CampaignStatus =
  | 'draft'
  | 'published'
  | 'reviewing'
  | 'in-progress'
  | 'completed'
  | 'cancelled';

export type BriefContentType =
  | 'Short-form AI Video'
  | 'Cinematic Brand Film'
  | '3D Product Motion'
  | 'AI Photography & Lookbook'
  | 'AI Avatar Spokesperson'
  | 'Generative Key Art & Graphics'
  | 'Audio & Voice Design';

export type BriefAspectRatio =
  | '9:16 (Vertical Reels/TikTok/Shorts)'
  | '16:9 (Cinematic Widescreen)'
  | '1:1 (Square Feed)'
  | '4:5 (Portrait Social)';

export type BriefCommercialRight =
  | 'Full Worldwide Commercial Buyout (In Perpetuity)'
  | 'Digital Advertising Rights (1-Year Global)'
  | 'Social Media Organic Broadcast Only'
  | 'AI Model Training Exclusion Included'
  | 'Full IP Transfer + Seed & Prompt Provenance Archive';

export interface Campaign {
  id: string;
  brandId: string;
  brandName: string;
  title: string;
  description: string;
  category: CreativeCategory;
  requiredSkills: string[];
  preferredTools?: string[];
  contentType?: string;
  aspectRatio?: string;
  duration?: string;
  commercialRequirements?: string;
  budgetMin: number;
  budgetMax: number;
  deadline: string;
  preferredStyle: string;
  additionalRequirements?: string;
  status: CampaignStatus;
  generatedBy?: 'gemini' | 'deterministic' | 'manual';
  createdAt: string;
  updatedAt: string;
}

export interface CampaignBrief {
  title: string;
  description: string;
  category: CreativeCategory;
  requiredSkills: string[];
  preferredTools?: string[];
  contentType?: string;
  aspectRatio?: string;
  duration?: string;
  commercialRequirements?: string;
  budgetMin: number;
  budgetMax: number;
  deadline: string;
  preferredStyle: string;
  additionalRequirements?: string;
  generatedBy?: 'gemini' | 'deterministic' | 'manual';
}

