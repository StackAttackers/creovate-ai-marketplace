import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Star, Sparkles, CheckCircle2 } from 'lucide-react';
import type { CreatorProfile } from '../../types/creator';
import { useShortlist } from '../../hooks/useShortlist';
import { formatCurrency } from '../../utils/format';
import { SafeImage } from '../ui/SafeImage';
import { SafeAvatar } from '../ui/SafeAvatar';

interface CreatorCardProps {
  creator: CreatorProfile;
  onInvite?: (creator: CreatorProfile) => void;
}

// Generate a deterministic Fiverr-style gig headline based on creator specialization
function getGigTitle(creator: CreatorProfile): string {
  const primaryCat = creator.categories[0] || 'AI Video Generation';
  switch (primaryCat) {
    case 'AI Video Generation':
      return `I will direct cinematic AI commercial videos using ${creator.tools[0] || 'Runway Gen-3'}`;
    case 'AI Advertising':
      return `I will create high-converting AI marketing ad creatives & social hooks`;
    case 'AI Photography':
      return `I will generate commercial photorealistic AI fashion & editorial photography`;
    case '3D Art and Animation':
      return `I will build stylized 3D CGI assets & spatial animation in ${creator.tools[0] || 'Unreal Engine'}`;
    case 'AI Graphic Design':
      return `I will design premium brand identity & key visuals with generative AI`;
    case 'AI Avatars':
      return `I will create photorealistic AI digital humans & lip-synced virtual avatars`;
    case 'Product Visualization':
      return `I will render photorealistic 3D product visualization & luxury packaging`;
    default:
      return `I will provide end-to-end generative AI creative direction & asset production`;
  }
}

export function CreatorCard({ creator, onInvite }: CreatorCardProps) {
  const { isShortlisted, toggleShortlist } = useShortlist();
  const saved = isShortlisted(creator.uid);
  const gigTitle = getGigTitle(creator);

  // Deterministic review count & rating for authentic marketplace feel
  const rating = 4.9;
  const reviewCount = (creator.uid.charCodeAt(creator.uid.length - 1) % 40) + 18;

  const thumbnailSrc =
    creator.portfolio[0]?.imageUrl ||
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5"
    >
      <div>
        {/* Fiverr-Style Gig Media Thumbnail */}
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          <Link to={`/creators/${creator.uid}`}>
            <SafeImage
              src={thumbnailSrc}
              alt={creator.displayName}
              category={creator.categories[0]}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              containerClassName="h-full w-full"
            />
          </Link>

          {/* Badges Overlay */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10 pointer-events-none">
            {creator.featured && (
              <span className="rounded-md bg-[#2563EB] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> PRO VERIFIED
              </span>
            )}
            <span className="rounded-md bg-white/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200 shadow-sm">
              {creator.categories[0]}
            </span>
          </div>

          {/* Shortlist Heart Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleShortlist(creator.uid);
            }}
            title={saved ? 'Remove from saved' : 'Save to shortlist'}
            className="absolute top-2.5 right-2.5 rounded-full bg-white/80 p-2 text-slate-600 backdrop-blur-md transition-all hover:bg-white hover:scale-110 shadow-sm z-10"
          >
            <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-rose-500 text-rose-500' : 'text-slate-600'}`} />
          </button>
        </div>

        {/* Gig Info Body */}
        <div className="p-4 space-y-3">
          {/* Creator Profile Row */}
          <div className="flex items-center justify-between">
            <Link
              to={`/creators/${creator.uid}`}
              className="flex items-center gap-2.5 group/author min-w-0"
            >
              <SafeAvatar
                src={creator.avatarUrl}
                name={creator.displayName}
                sizeClass="h-7 w-7"
                className="border border-slate-200"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-900 group-hover/author:text-[#2563EB] transition-colors truncate">
                    {creator.displayName}
                  </span>
                  <CheckCircle2 className="w-3 h-3 text-[#2563EB] shrink-0" />
                </div>
                <span className="text-[10px] text-slate-500 block truncate">
                  {creator.featured ? 'Top Rated Creator' : 'Level 2 Seller'}
                </span>
              </div>
            </Link>

            {/* Availability Dot */}
            <span
              title={`Status: ${creator.availability}`}
              className={`h-2 w-2 rounded-full shrink-0 ${
                creator.availability === 'available'
                  ? 'bg-blue-500'
                  : creator.availability === 'busy'
                  ? 'bg-amber-400'
                  : 'bg-slate-300'
              }`}
            />
          </div>

          {/* Fiverr-Style Gig Title */}
          <Link to={`/creators/${creator.uid}`} className="block">
            <h3 className="line-clamp-2 text-xs font-medium text-slate-800 hover:text-[#2563EB] transition-colors leading-relaxed">
              {gigTitle}
            </h3>
          </Link>

          {/* Visible Verification Signals */}
          <div className="flex flex-wrap items-center gap-1">
            {creator.verificationSignals?.verifiedTools?.[0] ? (
              <span className="rounded bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 text-[9px] font-mono font-medium flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-[#2563EB]" />
                {creator.verificationSignals.verifiedTools[0]}
              </span>
            ) : (
              <span className="rounded bg-slate-100 text-slate-600 px-1.5 py-0.5 text-[9px] font-mono">
                {creator.tools[0] || 'AI Native'}
              </span>
            )}

            {creator.commercialUseCertified && (
              <span className="rounded bg-sky-50 text-sky-700 border border-sky-200 px-1.5 py-0.5 text-[9px] font-medium flex items-center gap-0.5">
                <CheckCircle2 className="w-2.5 h-2.5 text-sky-600" />
                Commercial Safe
              </span>
            )}
          </div>

          {/* Rating and Reviews */}
          <div className="flex items-center gap-1.5 text-xs">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
            <strong className="text-slate-900 font-bold text-xs">{rating}</strong>
            <span className="text-[11px] text-slate-500">({reviewCount})</span>
            <span className="text-slate-300 mx-1">•</span>
            <span className="text-[10px] text-blue-600 font-mono truncate max-w-[120px]">
              {creator.tools.slice(0, 2).join(', ')}
            </span>
          </div>
        </div>
      </div>

      {/* Fiverr-Style Footer Bar: Price in INR */}
      <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/50">
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 block leading-tight">
            STARTING AT
          </span>
          <span className="text-sm font-black text-slate-900 font-mono">
            {formatCurrency(creator.priceRange.min)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {onInvite && (
            <button
              onClick={() => onInvite(creator)}
              className="rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 px-2.5 py-1.5 transition-colors border border-slate-200"
            >
              Invite
            </button>
          )}
          <Link
            to={`/creators/${creator.uid}`}
            className="rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-[11px] font-semibold text-white px-3 py-1.5 transition-all shadow-sm shadow-blue-500/25"
          >
            View Gig
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
