import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Sparkles,
  AtSign,
  Share2,
  Video,
  Globe,
  Wrench,
  Check,
  Plus,
  Send,
  Building2,
  Palette,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Database,
} from 'lucide-react';
import { saveCreatorProfile } from '../../services/store/dataStore';
import {
  saveCreatorProfileToFirestore,
  saveUserProfileToFirestore,
} from '../../services/firebase/firestore';
import { SafeImage } from '../ui/SafeImage';
import type { CreatorProfile, CreativeCategory } from '../../types/creator';
import { formatCurrency } from '../../utils/format';
import { Button } from '../ui/Button';

interface CreatorAgencyRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: 'creator' | 'agency';
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

const DEFAULT_TOOLS = [
  'Runway Gen-3',
  'Midjourney v6',
  'Pika Labs',
  'OpenAI Sora',
  'ComfyUI',
  'Blender 3D',
  'Topaz Video AI',
  'ElevenLabs',
  'Flux.1',
  'Luma Dream Machine',
  'Stable Diffusion XL',
  'Cinema 4D',
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
];

const PRESET_PORTFOLIOS = [
  {
    title: 'Cyberpunk Luxury EV Commercial (Runway Gen-3)',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&h=500&fit=crop',
  },
  {
    title: 'Vogue Haute Couture Generative Editorial',
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=500&fit=crop',
  },
  {
    title: '3D Mechanical Watch CGI Breakdown',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=500&fit=crop',
  },
];

export function CreatorAgencyRegistrationModal({
  isOpen,
  onClose,
  initialRole = 'creator',
}: CreatorAgencyRegistrationModalProps) {
  const [role, setRole] = useState<'creator' | 'agency'>(initialRole);

  // Form Fields
  const [displayName, setDisplayName] = useState('');
  const [headline, setHeadline] = useState('');
  const [category, setCategory] = useState<CreativeCategory>('AI Video Generation');
  const [bio, setBio] = useState('');
  const [minRate, setMinRate] = useState<number>(35000);
  const [maxRate, setMaxRate] = useState<number>(120000);

  // Social Handles
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [youtube, setYoutube] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  // Tools Selection
  const [selectedTools, setSelectedTools] = useState<string[]>([
    'Runway Gen-3',
    'Midjourney v6',
    'Topaz Video AI',
  ]);
  const [customToolInput, setCustomToolInput] = useState('');

  // Portfolio Item
  const [portfolioTitle, setPortfolioTitle] = useState('Featured AI Commercial Showcase');
  const [portfolioImage, setPortfolioImage] = useState(PRESET_PORTFOLIOS[0].imageUrl);
  const [avatarUrl] = useState(PRESET_AVATARS[0]);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredCreatorId, setRegisteredCreatorId] = useState('');

  if (!isOpen) return null;

  const toggleTool = (tool: string) => {
    if (selectedTools.includes(tool)) {
      setSelectedTools(selectedTools.filter((t) => t !== tool));
    } else {
      setSelectedTools([...selectedTools, tool]);
    }
  };

  const handleAddCustomTool = () => {
    if (customToolInput.trim() && !selectedTools.includes(customToolInput.trim())) {
      setSelectedTools([...selectedTools, customToolInput.trim()]);
      setCustomToolInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !headline.trim()) return;

    setIsSubmitting(true);

    const newUid = `user-${role}-${Date.now()}`;
    const newProfile: CreatorProfile = {
      uid: newUid,
      displayName: displayName.trim(),
      headline: headline.trim(),
      biography:
        bio.trim() ||
        `${role === 'agency' ? 'Full-service AI production studio' : 'Generative AI creator'} specializing in ${category} with deep expertise in ${selectedTools.slice(0, 3).join(', ')}. Available for commercial briefs in India with 100% IP buyout.`,
      avatarUrl: avatarUrl,
      verified: true,
      featured: true,
      availability: 'available',
      priceRange: {
        min: Number(minRate) || 30000,
        max: Number(maxRate) || 100000,
      },
      categories: [category],
      skills: [
        category,
        role === 'agency' ? 'Full Studio Production' : 'Prompt Craft',
        'Commercial Licensing',
        '4K AI Upscaling',
        ...selectedTools.slice(0, 3),
      ],
      tools: selectedTools.length > 0 ? selectedTools : ['Runway Gen-3', 'Midjourney v6'],
      preferredStyles: ['Cinematic', 'Photorealistic', 'High-End Commercial'],
      portfolio: [
        {
          id: `port-${Date.now()}`,
          title: portfolioTitle,
          description: `Mastered commercial AI video deliverable utilizing ${selectedTools.join(', ')} with complete color grading and provenance metadata.`,
          imageUrl: portfolioImage,
          category: category,
          tools: selectedTools,
          aspectRatio: '16:9',
          contentType: 'Video',
          workflow: `${selectedTools[0] || 'Runway Gen-3'} generation -> ComfyUI Refine -> Topaz Video AI 4x upscale -> Premiere Pro sound design`,
          commercialRights: 'Full Commercial IP transfer granted to client.',
          outputFormat: '4K ProRes 422 HQ & MP4 (60fps)',
          createdAt: new Date().toISOString(),
        },
      ],
      role: role,
      socialHandles: {
        instagram: instagram.trim() || undefined,
        twitter: twitter.trim() || undefined,
        youtube: youtube.trim() || undefined,
        website: portfolioUrl.trim() || undefined,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTimeout(async () => {
      // 1. Save to local reactive dataStore
      saveCreatorProfile(newProfile);

      // 2. Persist to Cloud Firestore (`creatorProfiles` and `agencies` collections)
      await saveCreatorProfileToFirestore(newProfile);

      // 3. Persist user auth document in Cloud Firestore (`users` collection)
      await saveUserProfileToFirestore({
        uid: newUid,
        email: `${displayName.toLowerCase().replace(/[^a-z0-9]/g, '')}@creovate.ai`,
        role: role,
        displayName: displayName.trim(),
        avatarUrl: avatarUrl,
        createdAt: new Date().toISOString(),
      });

      setRegisteredCreatorId(newUid);
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative w-full max-w-3xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden my-8 text-slate-900"
      >
        {/* Header Ribbon */}
        <div className="relative px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              {role === 'agency' ? <Building2 className="w-5 h-5" /> : <Palette className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isSuccess
                  ? 'Registration Complete!'
                  : role === 'agency'
                  ? 'Register as an AI Creative Agency'
                  : 'Join as an AI Content Creator'}
              </h2>
              <p className="text-xs text-slate-500">
                {isSuccess
                  ? 'Your profile & services are now live on Creovate AI'
                  : 'Showcase your AI tools, social channels, and start receiving brand campaigns in ₹ INR'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full bg-slate-100 hover:bg-slate-200 p-2 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success View */}
        {isSuccess ? (
          <div className="p-8 sm:p-12 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-blue-50 border-2 border-blue-200 text-blue-600 mx-auto flex items-center justify-center shadow-lg shadow-blue-500/10">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-slate-900">Welcome to Creovate AI PRO!</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
                Congratulations, <strong className="text-slate-900">{displayName}</strong>. Your{' '}
                {role === 'agency' ? 'agency studio' : 'creator profile'} has been verified with starting rates of{' '}
                <strong className="text-blue-600">{formatCurrency(minRate)}</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-left text-xs space-y-2">
              <div className="flex justify-between text-slate-500">
                <span>Account Role:</span>
                <strong className="text-slate-900 uppercase">{role}</strong>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Category:</span>
                <strong className="text-slate-900">{category}</strong>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tools Listed:</span>
                <strong className="text-slate-900">{selectedTools.slice(0, 3).join(', ')}</strong>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-blue-600">
                <span className="flex items-center gap-1.5 font-medium">
                  <Database className="w-3.5 h-3.5 text-blue-600" />
                  Cloud Firestore Backend
                </span>
                <span className="font-mono text-[10px] text-slate-500">
                  {role === 'agency' ? 'agencies & creatorProfiles' : 'creatorProfiles'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={`/creators/${registeredCreatorId}`}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <span>View My Live Gig</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200 transition-colors"
              >
                Close &amp; Explore Marketplace
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Role Switcher */}
            <div className="grid grid-cols-2 gap-3 p-1 rounded-xl bg-slate-100 border border-slate-200">
              <button
                type="button"
                onClick={() => setRole('creator')}
                className={`py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  role === 'creator'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Solo AI Creator</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('agency')}
                className={`py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  role === 'agency'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>AI Creative Agency</span>
              </button>
            </div>

            {/* 1. Identity & Specialty */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Basic Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {role === 'agency' ? 'Agency / Studio Name' : 'Full Name or Artist Handle'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={role === 'agency' ? 'e.g. HyperMotion AI Studios' : 'e.g. Aryan Sharma'}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Primary Creative Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none shadow-xs"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Professional Headline / Gig Pitch *
                </label>
                <input
                  type="text"
                  required
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Cinematic Runway Gen-3 Director & Prompt Architect for Commercial Brands"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Short Bio / Studio Vision
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Briefly describe your production workflow, turnaround times, and past client experience..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none resize-none shadow-xs"
                />
              </div>
            </div>

            {/* 2. Tools You Use to Make Videos */}
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-2">
                  <Wrench className="w-3.5 h-3.5 text-blue-600" /> What Tools Do You Use to Make Videos / Art? *
                </h3>
                <span className="text-[11px] text-slate-500">Select all that apply</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {DEFAULT_TOOLS.map((tool) => {
                  const isSelected = selectedTools.includes(tool);
                  return (
                    <button
                      key={tool}
                      type="button"
                      onClick={() => toggleTool(tool)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-blue-600" />}
                      <span>{tool}</span>
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Tool Input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={customToolInput}
                  onChange={(e) => setCustomToolInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTool();
                    }
                  }}
                  placeholder="Add other AI tools (e.g. Magnific, Krea, Kling)..."
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none shadow-xs"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddCustomTool}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Tool
                </Button>
              </div>
            </div>

            {/* 3. Social Media Handles */}
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-blue-600" /> Social Media &amp; Portfolio Handles
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-500" />
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="Instagram handle (@username)"
                    className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none shadow-xs"
                  />
                </div>

                <div className="relative">
                  <Share2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                  <input
                    type="text"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    placeholder="X / Twitter handle (@username)"
                    className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none shadow-xs"
                  />
                </div>

                <div className="relative">
                  <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                  <input
                    type="text"
                    value={youtube}
                    onChange={(e) => setYoutube(e.target.value)}
                    placeholder="YouTube / Vimeo showreel URL"
                    className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none shadow-xs"
                  />
                </div>

                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
                  <input
                    type="text"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="Website or Behance portfolio link"
                    className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none shadow-xs"
                  />
                </div>
              </div>
            </div>

            {/* 4. Rates & Pricing in Indian Rupees (₹ INR) */}
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-blue-600" /> Indicative Rates (Indian Rupees ₹ INR)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Starting Minimum Rate (₹ INR)
                  </label>
                  <input
                    type="number"
                    step="5000"
                    min="10000"
                    value={minRate}
                    onChange={(e) => setMinRate(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-mono font-bold text-slate-900 focus:border-blue-600 focus:outline-none shadow-xs"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Starting at {formatCurrency(minRate)}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Full Campaign Retainer Max Rate (₹ INR)
                  </label>
                  <input
                    type="number"
                    step="10000"
                    min="20000"
                    value={maxRate}
                    onChange={(e) => setMaxRate(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-mono font-bold text-slate-900 focus:border-blue-600 focus:outline-none shadow-xs"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Up to {formatCurrency(maxRate)}
                  </span>
                </div>
              </div>
            </div>

            {/* 5. Featured Portfolio Work */}
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Featured Portfolio Artwork Preset
              </h3>

              <div>
                <label className="block text-xs text-slate-500 mb-2">
                  Choose a style preset or input your own showcase media URL:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {PRESET_PORTFOLIOS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setPortfolioTitle(item.title);
                        setPortfolioImage(item.imageUrl);
                      }}
                      className={`relative rounded-xl overflow-hidden border-2 h-20 transition-all ${
                        portfolioImage === item.imageUrl
                          ? 'border-blue-600 shadow-md shadow-blue-500/20'
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <SafeImage
                        src={item.imageUrl}
                        alt={item.title}
                        containerClassName="w-full h-full pointer-events-none"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center p-1 text-center">
                        <span className="text-[9px] font-bold text-white line-clamp-2 drop-shadow-sm">{item.title}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-900"
              >
                Cancel
              </button>

              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || !displayName.trim()}
                leftIcon={<Send className="w-4 h-4" />}
                className="shadow-md shadow-blue-500/20 text-xs font-bold px-6 py-2.5"
              >
                {isSubmitting
                  ? 'Publishing Profile...'
                  : role === 'agency'
                  ? 'Register Agency Profile'
                  : 'Publish Creator Gig'}
              </Button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
