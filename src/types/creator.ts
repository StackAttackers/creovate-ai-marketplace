export type CreativeCategory =
  | 'AI Video Generation'
  | 'AI Advertising'
  | 'AI Photography'
  | '3D Art and Animation'
  | 'AI Graphic Design'
  | 'AI Avatars'
  | 'Product Visualization'
  | 'AI-Assisted Creative Development';

export const CREATIVE_CATEGORIES: CreativeCategory[] = [
  'AI Video Generation',
  'AI Advertising',
  'AI Photography',
  '3D Art and Animation',
  'AI Graphic Design',
  'AI Avatars',
  'Product Visualization',
  'AI-Assisted Creative Development',
];

export type Availability = 'available' | 'busy' | 'unavailable';

export interface PromptProvenance {
  promptText: string;
  negativePrompt?: string;
  seed: string;
  modelCheckpoint: string;
  sampler?: string;
  steps?: number;
  cfgScale?: number;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: CreativeCategory;
  imageUrl: string;
  videoUrl?: string;
  tools: string[];
  workflow?: string;
  contentType?: 'Video' | 'Stills' | '3D Asset' | 'Interactive' | 'Avatar';
  outputFormat?: string;
  aspectRatio?: string;
  commercialRights?: string;
  provenance?: PromptProvenance;
  verifiedBadge?: string;
  createdAt: string;
}

export interface CreatorVerificationSignals {
  verifiedTools: string[]; // e.g. ['Runway Gen-3 Certified', 'Midjourney v6 Pro', 'ComfyUI Node Architect']
  verifiedWorkflows: string[]; // e.g. ['LoRA Character Consistency', 'Multi-Pass 4K Upscale', 'Seed & Prompt Audit']
  pastWorkVerified: boolean;
  completedCampaignsCount: number;
  commercialSafetyCertified: boolean;
  trustScore: number;
  verificationBadgeLevel: 'Elite Pro Verified' | 'Tool Certified' | 'Community Creator';
}

export interface CreatorProfile {
  uid: string;
  displayName: string;
  headline: string;
  biography: string;
  avatarUrl: string;
  skills: string[];
  categories: CreativeCategory[];
  tools: string[];
  portfolio: PortfolioItem[];
  priceRange: { min: number; max: number };
  availability: Availability;
  availableDate?: string;
  preferredStyles: string[];
  role?: 'creator' | 'agency';
  socialHandles?: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    website?: string;
  };
  featured: boolean;
  verified?: boolean;
  verificationMethod?: 'portfolio_provenance' | 'identity_verified' | 'self_reported';
  verificationSignals?: CreatorVerificationSignals;
  commercialUseCertified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatorFilters {
  search: string;
  category: CreativeCategory | 'All' | '';
  skill?: string;
  tool?: string;
  contentType?: string;
  budgetMin?: number;
  budgetMax: number;
  availability: Availability | 'all' | '';
  verifiedOnly?: boolean;
  verifiedToolsOnly?: boolean;
  verifiedWorkflowsOnly?: boolean;
  commercialCertifiedOnly?: boolean;
  sortBy: 'relevance' | 'featured' | 'price-low' | 'price-high';
}

