import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Sparkles, Wand2, CheckCircle2, ShieldCheck } from 'lucide-react';

import { buildAIBrief } from '../../services/ai/briefBuilder';
import type { Campaign, CampaignBrief } from '../../types/campaign';
import type { CreativeCategory } from '../../types/creator';

interface CampaignFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CampaignBrief) => void;
  initialData?: Campaign;
}

const CATEGORIES: CreativeCategory[] = [
  'AI Video Generation',
  'AI Advertising',
  'AI Photography',
  '3D Art and Animation',
  'AI Graphic Design',
  'AI Avatars',
  'Product Visualization',
  'AI-Assisted Creative Development',
];

const CONTENT_TYPES = [
  'Short-form AI Video',
  'Cinematic Brand Film',
  '3D Product Motion',
  'AI Photography & Lookbook',
  'AI Avatar Spokesperson',
  'Generative Key Art & Graphics',
  'Audio & Voice Design',
];

const STYLES = [
  'Cinematic',
  'Hyper-realistic',
  'Cyberpunk & Neon',
  'Minimalist & Editorial',
  'Surrealist & Dreamlike',
  'Retro Anime',
  'Bold & Commercial',
  'Corporate & Polished',
];

const ASPECT_RATIOS = [
  '9:16 (Vertical Reels/TikTok/Shorts)',
  '16:9 (Cinematic Widescreen)',
  '1:1 (Square Feed)',
  '4:5 (Portrait Social)',
];

const COMMERCIAL_RIGHTS_OPTIONS = [
  'Full Worldwide Commercial Buyout (In Perpetuity)',
  'Digital Advertising Rights (1-Year Global)',
  'Social Media Organic Broadcast Only',
  'AI Model Training Exclusion Included',
  'Full IP Transfer + Seed & Prompt Provenance Archive',
];

const AI_SAMPLE_PROMPTS = [
  'Futuristic 30-second neon energy drink launch reel for Instagram with commercial rights',
  'Luxury glass perfume bottle 3D motion with floating water droplets and light refraction',
  'Cyberpunk streetwear editorial fashion video with photorealistic virtual avatar models',
  'Photorealistic 15-second electric hypercar teaser with cinematic anamorphic flares',
];

export function CampaignFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: CampaignFormModalProps) {
  // Form fields
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState<CreativeCategory>(
    initialData?.category || 'AI Video Generation'
  );
  const [contentType, setContentType] = useState<string>(
    initialData?.contentType || 'Short-form AI Video'
  );
  const [preferredStyle, setPreferredStyle] = useState(initialData?.preferredStyle || 'Cinematic');
  const [aspectRatio, setAspectRatio] = useState(
    initialData?.aspectRatio || '9:16 (Vertical Reels/TikTok/Shorts)'
  );
  const [commercialRequirements, setCommercialRequirements] = useState(
    initialData?.commercialRequirements || 'Full Worldwide Commercial Buyout (In Perpetuity)'
  );
  const [preferredTools, setPreferredTools] = useState(
    initialData?.preferredTools?.join(', ') || 'Runway Gen-3, Midjourney v6.1, Topaz Video AI'
  );
  const [duration, setDuration] = useState(initialData?.duration || '30 seconds');
  const [skills, setSkills] = useState(
    initialData?.requiredSkills?.join(', ') || 'Prompt Engineering, LoRA Consistency, Color Grading'
  );
  const [budgetMin, setBudgetMin] = useState(initialData?.budgetMin?.toString() || '75000');
  const [budgetMax, setBudgetMax] = useState(initialData?.budgetMax?.toString() || '180000');
  const [deadline, setDeadline] = useState(
    () => initialData?.deadline || new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [additionalRequirements, setAdditionalRequirements] = useState(
    initialData?.additionalRequirements || 'Output: 4K ProRes 422 + raw seed/prompt audit log. AI model training excluded.'
  );

  // AI Brief Builder state
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiMeta, setAiMeta] = useState<{
    source: 'gemini' | 'deterministic';
    modelName: string;
    explanation: string;
  } | null>(null);

  const handleGenerateWithAI = async (promptToUse?: string) => {
    const p = promptToUse || aiPrompt;
    if (!p.trim()) return;

    setIsGeneratingAI(true);
    try {
      const result = await buildAIBrief(p);
      const b = result.brief;

      setTitle(b.title);
      setDescription(b.description);
      setCategory(b.category);
      if (b.contentType) setContentType(b.contentType);
      if (b.aspectRatio) setAspectRatio(b.aspectRatio);
      if (b.commercialRequirements) setCommercialRequirements(b.commercialRequirements);
      if (b.preferredTools && b.preferredTools.length > 0) setPreferredTools(b.preferredTools.join(', '));
      if (b.duration) setDuration(b.duration);
      setSkills(b.requiredSkills.join(', '));
      setBudgetMin(b.budgetMin.toString());
      setBudgetMax(b.budgetMax.toString());
      setDeadline(b.deadline);
      setPreferredStyle(b.preferredStyle);
      setAdditionalRequirements(
        b.additionalRequirements || `Delivery in 4K ProRes + full prompt provenance log. ${b.commercialRequirements || ''}`
      );
      setAiMeta({
        source: result.source,
        modelName: result.modelName,
        explanation: result.explanation,
      });
    } catch (err) {
      console.error('AI generation error:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const skillsList = skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const toolsList = preferredTools
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSubmit({
      title,
      description,
      category,
      contentType,
      aspectRatio,
      duration,
      commercialRequirements,
      preferredTools: toolsList,
      requiredSkills: skillsList.length > 0 ? skillsList : [category],
      budgetMin: Number(budgetMin) || 0,
      budgetMax: Number(budgetMax) || 0,
      deadline,
      preferredStyle,
      additionalRequirements,
      generatedBy: aiMeta?.source || (initialData?.generatedBy || 'manual'),
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Campaign Brief' : 'Publish Creative Brief'}
      description="Capture content type, style, aspect ratio, tools, and commercial-use requirements."
      maxWidth="4xl"
    >

      <div className="space-y-6">
        {/* Bonus Feature: AI-Assisted Brief Builder */}
        <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-950/40 via-midnight-800 to-[#101321] p-4.5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-2 text-xs font-bold text-violet-300 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              AI-Assisted Brief Builder
            </span>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Turn rough idea into complete structured brief
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mb-2.5">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. Energy drink launch video with futuristic neon cyber aesthetic for Instagram reels with commercial rights"
              className="flex-1 rounded-xl border border-white/10 bg-midnight-900/80 px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-violet-500/60 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleGenerateWithAI();
                }
              }}
            />
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={isGeneratingAI || !aiPrompt.trim()}
              onClick={() => handleGenerateWithAI()}
              leftIcon={<Wand2 className="w-3.5 h-3.5" />}
              className="shrink-0"
            >
              {isGeneratingAI ? 'Structuring Brief...' : 'Synthesize Brief'}
            </Button>
          </div>

          {/* Quick Preset Prompts */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-gray-400">Sample ideas:</span>
            {AI_SAMPLE_PROMPTS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setAiPrompt(sample);
                  handleGenerateWithAI(sample);
                }}
                className="rounded-lg bg-white/[0.04] hover:bg-violet-600/20 hover:text-violet-200 border border-white/5 px-2 py-0.5 text-[10px] text-gray-300 transition-colors truncate max-w-[220px]"
              >
                {sample.slice(0, 36)}...
              </button>
            ))}
          </div>

          {/* Model Status Indicator */}
          {aiMeta && (
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-violet-500/10 border border-violet-500/20 p-2.5 text-xs text-violet-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-white block">
                  {aiMeta.source === 'gemini' ? '✨ Generated by Google Gemini 1.5 Flash' : '⚡ Generated by Creovate Semantic Reasoning Engine'}
                </strong>
                <span className="text-[11px] text-violet-300/80">{aiMeta.explanation}</span>
              </div>
            </div>
          )}
        </div>

        {/* Structured Form matching Challenge Scope */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Campaign Brief Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Neon Cyberpunk Sneaker Launch Reel"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Creative Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as CreativeCategory)}
              options={CATEGORIES.map((c) => ({ value: c, label: c }))}
            />

            <Select
              label="Content Type"
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              options={CONTENT_TYPES.map((ct) => ({ value: ct, label: ct }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Visual Style"
              value={preferredStyle}
              onChange={(e) => setPreferredStyle(e.target.value)}
              options={STYLES.map((s) => ({ value: s, label: s }))}
            />

            <Select
              label="Format / Aspect Ratio"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              options={ASPECT_RATIOS.map((ar) => ({ value: ar, label: ar }))}
            />

            <Input
              label="Target Duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 15s, 30s, 60s"
            />
          </div>

          {/* Commercial-use requirements */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Commercial-Use & Licensing Requirements
            </div>
            <Select
              label="Primary Licensing Model"
              value={commercialRequirements}
              onChange={(e) => setCommercialRequirements(e.target.value)}
              options={COMMERCIAL_RIGHTS_OPTIONS.map((cr) => ({ value: cr, label: cr }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Preferred AI Tools & Models"
              value={preferredTools}
              onChange={(e) => setPreferredTools(e.target.value)}
              placeholder="e.g. Runway Gen-3, Midjourney v6.1, ComfyUI, Topaz"
            />
            <Input
              label="Required Creator Skills"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. Prompt Engineering, LoRA Training, Temporal Consistency"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Min Budget (₹ INR)"
              type="number"
              value={budgetMin}
              onChange={(e) => setBudgetMin(e.target.value)}
              required
            />
            <Input
              label="Max Budget (₹ INR)"
              type="number"
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
              required
            />
            <Input
              label="Target Delivery Date"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              Project Description & Creative Goals
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs sm:text-sm text-white placeholder-gray-500 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              placeholder="Outline target audience, mood, visual pacing, and core message..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              Production Deliverables & IP Protection Clauses (Optional)
            </label>
            <textarea
              value={additionalRequirements}
              onChange={(e) => setAdditionalRequirements(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs text-white placeholder-gray-500 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              placeholder="e.g. 4K ProRes master, clean background plate, raw generation seed/prompt audit package..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {initialData ? 'Save Brief Updates' : 'Publish Creative Brief'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
