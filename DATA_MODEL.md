# Creovate AI — Profile & Brief Data Model Specification

## 1. Overview
Creovate AI is an AI-native commercial marketplace engineered specifically for generative AI creators (filmmakers, prompt architects, 3D spatial animators, digital artists) and brands/creative agencies. Unlike traditional freelance platforms that treat digital work generically, Creovate AI’s data model enforces first-class schemas for:
- **AI Models & Toolchains** (Runway Gen-3, Midjourney v6.1, ComfyUI, Kling AI, Flux.1, ElevenLabs, Topaz Video AI)
- **Generative Workflows** (Multi-pass LoRA conditioning, ControlNet depth mapping, temporal consistency pipelines)
- **Prompt & Seed Provenance** (Verifiable prompt syntax, seed logging, model checkpoints)
- **Commercial IP Licensing** (Worldwide commercial buyouts, AI model training exclusion guarantees, warranty of non-infringement)
- **Aspect Ratios & Output Specs** (9:16 Vertical Reels/TikTok, 16:9 Landscape Widescreen, 1:1 Square, 4K ProRes)

---

## 2. Creator Profile & AI Portfolio Data Model

### `CreatorProfile`
```typescript
export interface CreatorProfile {
  uid: string;                                   // Unique creator identifier
  displayName: string;                           // Creator or Studio Name
  headline: string;                              // Professional positioning headline
  biography: string;                             // Artistic background and technical workflow bio
  avatarUrl: string;                             // High-res avatar image
  skills: string[];                              // Specialized capabilities (e.g. Prompt Engineering, LoRA Training)
  categories: CreativeCategory[];                // Primary creative specializations
  tools: string[];                               // Toolchain credentials (e.g. Runway, Midjourney, ComfyUI)
  portfolio: PortfolioItem[];                    // Verified AI deliverables
  priceRange: { min: number; max: number };     // Indicative commercial project rates in INR (₹)
  availability: 'available' | 'busy' | 'unavailable';
  availableDate?: string;                        // Projected availability date
  preferredStyles: string[];                     // Aesthetic styles (e.g. Cinematic, Hyper-realistic, Cyberpunk)
  featured: boolean;                             // Marketplace editorial spotlight
  verified: boolean;                             // Identity & platform verification flag
  commercialUseCertified: boolean;               // Compliance with commercial safety standards
  verificationSignals: CreatorVerificationSignals; // Trust signals (tools, workflows, past work)
  createdAt: string;                             // ISO Timestamp
  updatedAt: string;                             // ISO Timestamp
}
```

### `CreatorVerificationSignals` (Bonus Feature)
```typescript
export interface CreatorVerificationSignals {
  verifiedTools: string[];                       // Tools with verified paid pro licenses & benchmarks
  verifiedWorkflows: string[];                   // Certified repeatable pipelines (e.g. LoRA Character Consistency)
  pastWorkVerified: boolean;                     // Independent verification of commercial deliveries
  completedCampaignsCount: number;               // Number of successfully delivered client contracts
  commercialSafetyCertified: boolean;           // Verified legal compliance & copyright safety
  trustScore: number;                            // Composite algorithmic trust score (0 - 100%)
  verificationBadgeLevel: 'Elite Pro Verified' | 'Tool Certified' | 'Community Creator';
}
```

### `PortfolioItem` & `PromptProvenance`
```typescript
export interface PortfolioItem {
  id: string;                                    // Unique work ID
  title: string;                                 // Showcase title
  description: string;                           // Creative concept and execution summary
  category: CreativeCategory;                    // Creative category
  imageUrl: string;                              // High-definition visual asset or video poster
  videoUrl?: string;                             // Optional video streaming link
  tools: string[];                               // Tools utilized in synthesis
  workflow?: string;                             // End-to-end multi-pass pipeline explanation
  contentType: 'Video' | 'Stills' | '3D Asset' | 'Interactive' | 'Avatar';
  outputFormat?: string;                         // e.g. 4K ProRes 422 HQ, H.265 MP4
  aspectRatio?: string;                          // e.g. 16:9, 9:16, 1:1, 4:5
  commercialRights?: string;                     // Commercial clearance status
  verifiedBadge?: string;                        // Provenance badge (e.g. "Provenance Verified")
  provenance?: {
    promptText: string;                          // Exact generation prompt syntax
    negativePrompt?: string;                     // Negative conditioning terms
    seed: string;                                // Seed number for reproducibility
    modelCheckpoint: string;                     // Exact checkpoint/version (e.g. Runway Gen-3 Alpha v1.2)
    sampler?: string;                            // e.g. Euler A, DPM++ 2M Karras
    steps?: number;                              // Inference step count
  };
  createdAt: string;
}
```

---

## 3. Brand Creative Brief Data Model

### `CampaignBrief` & `Campaign`
```typescript
export interface Campaign {
  id: string;                                    // Unique brief ID
  brandId: string;                               // Commissioning brand ID
  brandName: string;                             // Brand or agency studio name
  title: string;                                 // Campaign title
  description: string;                           // Detailed creative vision and requirements
  category: CreativeCategory;                    // Primary category
  contentType: string;                           // e.g. Short-form AI Video, 3D Product Motion, Lookbook
  preferredStyle: string;                        // e.g. Cinematic, Hyper-realistic, Cyberpunk, Minimalist
  aspectRatio: string;                           // e.g. 9:16 (Vertical Reels/TikTok), 16:9, 1:1, 4:5
  duration?: string;                             // e.g. 15s, 30s, 60s
  commercialRequirements: string;                // Mandatory licensing model (e.g. Full Worldwide Buyout)
  preferredTools?: string[];                     // Desired models/tools (e.g. Runway Gen-3, Midjourney v6.1)
  requiredSkills: string[];                      // Mandatory creator competencies
  budgetMin: number;                             // Budget floor in INR (₹)
  budgetMax: number;                             // Budget ceiling in INR (₹)
  deadline: string;                              // Delivery target date (YYYY-MM-DD)
  additionalRequirements?: string;               // Codec specs (ProRes 422), clean plates, seed logs
  status: 'draft' | 'published' | 'in-progress' | 'completed';
  generatedBy: 'gemini' | 'deterministic' | 'manual'; // Brief synthesis provenance
  createdAt: string;
  updatedAt: string;
}
```

---

## 4. End-to-End Engagement & Licensing Lifecycle

### `Engagement` (Discovery Through Delivery)
```typescript
export type EngagementStage =
  | 'brief_matched'                              // Brand discovers suitable talent via AI Match / Discover
  | 'proposal_accepted'                          // Brand commissions creator's submitted bid
  | 'generation_drafts'                          // Creator submits generation rounds (v1, v2)
  | 'revisions_in_review'                        // Brand reviews passes & provides feedback
  | 'final_delivery'                             // Master 4K exports & sound stems uploaded
  | 'completed';                                 // Verified Commercial License Certificate issued

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
  agreedBudget: number;                          // Escrow-backed agreed compensation in INR (₹)
  currentStage: EngagementStage;
  targetDeadline: string;
  commercialRequirements: string;
  aspectRatio: string;
  milestones: EngagementMilestone[];
  certificate?: CommercialLicenseCertificate;
  createdAt: string;
  updatedAt: string;
}
```

### `GenerationDeliverable` & `Milestone`
```typescript
export interface GenerationDeliverable {
  id: string;
  roundNumber: number;                           // Round 1 (Initial Draft), Round 2 (Revision pass)
  title: string;
  mediaUrl: string;                              // Streamable preview or 4K asset
  contentType: 'Video' | 'Stills' | '3D Asset' | 'Interactive' | 'Avatar';
  generationPrompt: string;                      // Exact prompt formula used
  modelUsed: string;                             // Model checkpoint used (e.g. Runway Gen-3 Alpha)
  seed?: string;                                 // Reproducible seed number
  productionNotes: string;                       // Creator's technical & aesthetic commentary
  brandFeedback?: string;                        // Client's revision directions
  status: 'submitted' | 'revision_requested' | 'approved';
  submittedAt: string;
}
```

### `CommercialLicenseCertificate`
```typescript
export interface CommercialLicenseCertificate {
  certificateId: string;                         // e.g. CERT-CRV-984210
  issuedAt: string;
  campaignTitle: string;
  brandName: string;
  creatorName: string;
  licenseType: string;                           // Full Worldwide Commercial Buyout (In Perpetuity)
  scopeOfUse: string;                            // Unrestricted Broadcast, Social, Streaming, Digital Ads
  territory: string;                             // Worldwide
  term: string;                                  // In Perpetuity
  aiExclusionClause: boolean;                    // Enforces prohibition on using client assets to train external models
  provenanceHash: string;                        // SHA-256 cryptographic audit hash
  generationAuditLog: {
    primaryModel: string;
    seedsLogged: number;
    promptChainVerified: boolean;
  };
}
```
