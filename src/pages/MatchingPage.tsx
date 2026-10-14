import { useState, type ChangeEvent } from 'react';
import {
  Sparkles,
  Zap,
  Target,
  RotateCcw,
} from 'lucide-react';
import { useCreators } from '../hooks/useCreators';
import { matchCreators } from '../services/matching/engine';
import { MatchCard } from '../components/matching/MatchCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { InviteCreatorModal } from '../components/campaigns/InviteCreatorModal';
import type { CampaignBrief } from '../types/campaign';
import type { CreativeCategory } from '../types/creator';
import type { MatchResult } from '../types/matching';
import { demoCampaigns } from '../services/demo/campaigns';

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

const STYLES = ['Cinematic', 'Minimalist', 'Bold', 'Playful', 'Corporate', 'Artistic'];

export default function MatchingPage() {
  const { creators } = useCreators();

  // Brief Form State
  const [title, setTitle] = useState('NextGen Luxury Electric SUV — Cinematic Teaser');
  const [description, setDescription] = useState(
    'Need a 45-second high-end AI cinematic teaser video for our EV launch in India. Needs dramatic lighting, photorealistic textures, and sleek motion design. Must feel like a high-budget Hollywood car commercial.'
  );
  const [category, setCategory] = useState<CreativeCategory>('AI Video Generation');
  const [skills, setSkills] = useState<string[]>([
    'AI Video Generation',
    'Motion Graphics',
    'Cinematic Editing',
    'Visual Effects',
  ]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [budgetMin, setBudgetMin] = useState(150000);
  const [budgetMax, setBudgetMax] = useState(350000);
  const [deadline, setDeadline] = useState('2026-12-15');
  const [preferredStyle, setPreferredStyle] = useState('Cinematic');

  // Matching Execution State
  const [isMatching, setIsMatching] = useState(false);
  const [matchStep, setMatchStep] = useState(0);
  const [results, setResults] = useState<MatchResult[] | null>(null);

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

  const matchingSteps = [
    'Parsing campaign objectives & artistic requirements...',
    'Scanning verified creator skill graphs & tool stacks...',
    'Evaluating ₹ INR budget boundaries & availability...',
    'Calculating multi-dimensional compatibility scores...',
  ];

  // Quick preset loader
  const loadPreset = (presetIndex: number) => {
    const campaign = demoCampaigns[presetIndex];
    if (!campaign) return;
    setTitle(campaign.title);
    setDescription(campaign.description);
    setCategory(campaign.category);
    setSkills(campaign.requiredSkills);
    setBudgetMin(campaign.budgetMin);
    setBudgetMax(campaign.budgetMax);
    setDeadline(campaign.deadline);
    setPreferredStyle(campaign.preferredStyle);
    setResults(null);
  };

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newSkillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(newSkillInput.trim())) {
        setSkills([...skills, newSkillInput.trim()]);
      }
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleRunMatching = () => {
    setIsMatching(true);
    setMatchStep(0);
    setResults(null);

    const brief: CampaignBrief = {
      title,
      description,
      category,
      requiredSkills: skills,
      budgetMin,
      budgetMax,
      deadline,
      preferredStyle,
    };

    // Simulate multi-step AI matching algorithm
    const interval = setInterval(() => {
      setMatchStep((prev) => {
        if (prev < matchingSteps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            const calculated = matchCreators(creators, brief);
            setResults(calculated);
            setIsMatching(false);
          }, 400);
          return prev;
        }
      });
    }, 450);
  };

  const handleInvite = (creatorId: string, creatorName: string) => {
    setInviteModalData({
      isOpen: true,
      creatorId,
      creatorName,
    });
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-20 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-xs font-semibold text-blue-700 mb-3 shadow-sm">
            <Sparkles className="w-4 h-4 text-[#2563EB]" /> AI Creator Compatibility Engine
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 mb-3">
            Find Your Perfect AI Creator Match
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Our deterministic multi-vector matching engine scores creators across skills, category,
            rupee budget fit, availability, and stylistic alignment.
          </p>
        </div>

        {/* Preset Campaign Templates */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Try Sample Campaign Briefs:
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                'Summer Fashion Photography',
                'Smart Home Product Video',
                'Gaming Mascot 3D Avatar',
              ].map((label, idx) => (
                <button
                  key={label}
                  onClick={() => loadPreset(idx)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 transition-all shadow-sm"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Layout: Brief Form on left, Results or Animation on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Brief Input Column (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-[#2563EB]" /> Campaign Specification
              </h3>
              <span className="text-xs text-slate-500 font-mono">INR (₹) Enabled</span>
            </div>

            <Input
              label="Campaign Title"
              value={title}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder="e.g. AI Product Commercial"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Category"
                value={category}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value as CreativeCategory)}
                options={CATEGORIES.map((c) => ({ value: c, label: c }))}
              />
              <Select
                label="Style Preference"
                value={preferredStyle}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setPreferredStyle(e.target.value)}
                options={STYLES.map((s) => ({ value: s, label: s }))}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Brief Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Describe your campaign goals, deliverables, and vibe..."
              />
            </div>

            {/* Required Skills Tag Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Required Skills & Tools (Press Enter to add)
              </label>
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={handleAddSkill}
                placeholder="Type skill & press Enter..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-blue-100 mb-2"
              />
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-medium text-blue-700"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-rose-600 text-slate-400 text-xs font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Budget in Rupees */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Min Budget (₹)"
                type="number"
                value={budgetMin}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setBudgetMin(Number(e.target.value))}
              />
              <Input
                label="Max Budget (₹)"
                type="number"
                value={budgetMax}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setBudgetMax(Number(e.target.value))}
              />
            </div>

            <Input
              label="Project Deadline"
              type="date"
              value={deadline}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setDeadline(e.target.value)}
            />

            <Button
              variant="primary"
              className="w-full py-3.5 text-base shadow-xl shadow-blue-500/25 bg-[#2563EB] hover:bg-[#1D4ED8]"
              onClick={handleRunMatching}
              isLoading={isMatching}
              leftIcon={<Sparkles className="w-5 h-5" />}
            >
              {isMatching ? 'Matching Creators...' : 'Compute AI Matches'}
            </Button>
          </div>

          {/* Results Column (7 cols) */}
          <div className="lg:col-span-7">
            {/* Loading / Matching Simulation State */}
            {isMatching && (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm text-center space-y-6">
                <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-ping" />
                  <div className="h-16 w-16 rounded-full border-4 border-[#2563EB] border-t-transparent animate-spin" />
                  <Sparkles className="absolute w-8 h-8 text-[#2563EB]" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Analyzing Creator Graph</h3>
                  <p className="text-sm text-blue-700 font-mono min-h-[1.5rem]">
                    {matchingSteps[matchStep]}
                  </p>
                </div>

                {/* Step indicator pills */}
                <div className="flex justify-center gap-2">
                  {matchingSteps.map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i <= matchStep ? 'w-8 bg-[#2563EB]' : 'w-2 bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Results Ready */}
            {!isMatching && results && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Top Creator Matches</h3>
                    <p className="text-xs text-slate-500">
                      Ranked by multi-factor score: skills (30), category (25), budget (20), timeline
                      (15), style (10).
                    </p>
                  </div>
                  <button
                    onClick={() => setResults(null)}
                    className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                  </button>
                </div>

                <div className="space-y-4">
                  {results.slice(0, 8).map((res, idx) => (
                    <MatchCard
                      key={res.creatorId}
                      result={res}
                      rank={idx + 1}
                      onInvite={handleInvite}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Default Initial State before Run */}
            {!isMatching && !results && (
              <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-10 text-center space-y-6 shadow-sm">
                <div className="inline-flex p-4 rounded-3xl bg-blue-50 border border-blue-200 text-[#2563EB]">
                  <Sparkles className="w-10 h-10" />
                </div>
                <div className="max-w-md mx-auto">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Transparent, Multi-Vector AI Matching
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Adjust the brief parameters on the left or select a sample preset, then click{' '}
                    <strong className="text-slate-900">"Compute AI Matches"</strong> to calculate
                    instant compatibility scores for every creator in our Indian talent network.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left pt-4 border-t border-slate-200">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-[#2563EB] block">
                      30% Weight
                    </span>
                    <span className="text-xs font-semibold text-slate-900">Skill Overlap</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-[#2563EB] block">
                      25% Weight
                    </span>
                    <span className="text-xs font-semibold text-slate-900">Domain Focus</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-[#2563EB] block">
                      20% Weight
                    </span>
                    <span className="text-xs font-semibold text-slate-900">Budget (INR)</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-[#2563EB] block">
                      25% Weight
                    </span>
                    <span className="text-xs font-semibold text-slate-900">Style & Schedule</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
