import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Copy, Check } from 'lucide-react';


interface DataModelInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DataModelInspectorModal({
  isOpen,
  onClose,
}: DataModelInspectorModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'brief' | 'engagement'>('profile');
  const [copied, setCopied] = useState(false);

  const handleCopy = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const modelSnippets = {
    profile: `// 1. Creator Profile & AI Portfolio Data Model
export interface CreatorProfile {
  uid: string;
  displayName: string;
  headline: string;
  biography: string;
  avatarUrl: string;
  skills: string[];                     // Prompt Engineering, LoRA Training, etc.
  categories: CreativeCategory[];       // AI Video, 3D Art, AI Avatars, etc.
  tools: string[];                      // Runway Gen-3, Midjourney v6.1, ComfyUI, etc.
  portfolio: PortfolioItem[];
  priceRange: { min: number; max: number }; // In Indian Rupees (₹ INR)
  availability: 'available' | 'busy' | 'unavailable';
  verified: boolean;
  commercialUseCertified: boolean;
  verificationSignals: {
    verifiedTools: string[];            // Pro verified tool credentials
    verifiedWorkflows: string[];        // Reproducible multi-pass pipelines
    pastWorkVerified: boolean;          // Zero copyright claims track record
    completedCampaignsCount: number;    // Commercial contract deliveries
    trustScore: number;                 // 0-100% composite score
    verificationBadgeLevel: 'Elite Pro Verified' | 'Tool Certified';
  };
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: CreativeCategory;
  tools: string[];
  workflow: string;                     // Multi-pass pipeline explanation
  contentType: 'Video' | 'Stills' | '3D Asset' | 'Avatar';
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5';
  outputFormat: string;                 // 4K ProRes 422 HQ / MP4
  commercialRights: string;             // Unrestricted commercial buyout
  provenance: {
    promptText: string;                 // Exact generation prompt syntax
    seed: string;                       // Reproducible seed number
    modelCheckpoint: string;            // Exact model version checkpoint
    sampler?: string;
  };
}`,
    brief: `// 2. Creative Brief Data Model (AI-Assisted Brief Builder)
export interface Campaign {
  id: string;
  brandId: string;
  brandName: string;
  title: string;
  description: string;
  category: CreativeCategory;
  contentType: string;                  // Short-form AI Video, 3D Motion, Avatar, etc.
  preferredStyle: string;               // Cinematic, Cyberpunk, Hyper-realistic, etc.
  aspectRatio: string;                  // 9:16 (Vertical Reels), 16:9, 1:1
  duration?: string;                    // 15s, 30s, 60s
  commercialRequirements: string;       // Full Worldwide Buyout, AI Training Exclusion
  preferredTools: string[];             // Runway Gen-3, Midjourney v6.1, ComfyUI
  requiredSkills: string[];             // Prompt Engineering, LoRA Consistency
  budgetMin: number;                    // Floor in ₹ INR
  budgetMax: number;                    // Ceiling in ₹ INR
  deadline: string;                     // ISO Target Delivery Date
  status: 'draft' | 'published' | 'in-progress' | 'completed';
  generatedBy: 'gemini' | 'deterministic' | 'manual';
}`,
    engagement: `// 3. End-to-End Engagement & Licensing Lifecycle Model
export interface Engagement {
  id: string;
  campaignId: string;
  campaignTitle: string;
  brandId: string;
  brandName: string;
  creatorId: string;
  creatorName: string;
  agreedBudget: number;                 // Escrow backed in ₹ INR
  currentStage:
    | 'brief_matched'
    | 'proposal_accepted'
    | 'generation_drafts'
    | 'revisions_in_review'
    | 'final_delivery'
    | 'completed';
  milestones: {
    id: string;
    title: string;                      // Milestone 1 (Specs), Milestone 2 (Drafts), Milestone 3 (Master)
    status: 'pending' | 'in_review' | 'approved';
    deliverables: {
      roundNumber: number;              // Round 1, Round 2 (Revision pass)
      mediaUrl: string;
      generationPrompt: string;
      modelUsed: string;
      seed?: string;
      productionNotes: string;
      brandFeedback?: string;           // Client revision directions
    }[];
  }[];
  certificate?: {
    certificateId: string;              // CERT-CRV-XXXXXX
    licenseType: string;                // Full Worldwide Commercial Buyout (In Perpetuity)
    aiExclusionClause: boolean;         // Enforced non-training guarantee
    provenanceHash: string;             // SHA-256 cryptographic audit hash
    warrantyOfNonInfringement: true;
  };
}`,
  };

  const currentCode = modelSnippets[activeTab];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Creovate AI Data Model Architecture"
      description="Formal TypeScript specification covering AI tools, skills, formats, and commercial-use fields."
      maxWidth="4xl"
    >

      <div className="space-y-4">
        {/* Sub tabs */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex gap-2">
            {[
              { id: 'profile', label: '1. Creator Profile & Portfolio' },
              { id: 'brief', label: '2. Creative Brief Schema' },
              { id: 'engagement', label: '3. Delivery & Licensing Model' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-violet-600 text-white'
                    : 'text-gray-400 hover:text-white bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleCopy(currentCode)}
            leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            {copied ? 'Copied' : 'Copy Schema'}
          </Button>
        </div>

        {/* Code Viewer */}
        <div className="rounded-xl border border-white/10 bg-midnight-950 p-4 overflow-x-auto max-h-[380px] font-mono text-xs text-violet-200 leading-relaxed scrollbar-thin">
          <pre>{currentCode}</pre>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-gray-400">
          <span>Full markdown reference also saved in <code className="text-white">DATA_MODEL.md</code>.</span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
