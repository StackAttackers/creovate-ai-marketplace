import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Heart,
  Sparkles,
  Send,
} from 'lucide-react';
import type { MatchResult } from '../../types/matching';
import { Button } from '../ui/Button';
import { SafeImage } from '../ui/SafeImage';
import { SafeAvatar } from '../ui/SafeAvatar';
import { useShortlist } from '../../hooks/useShortlist';

interface MatchCardProps {
  result: MatchResult;
  rank: number;
  onInvite?: (creatorId: string, creatorName: string) => void;
}

export function MatchCard({ result, rank, onInvite }: MatchCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { isShortlisted, toggleShortlist } = useShortlist();
  const saved = isShortlisted(result.creatorId);

  const { score } = result;

  const getStrokeDashoffset = (percent: number) => {
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    return circumference - (percent / 100) * circumference;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.05 }}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/5 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Creator Info & Match Score */}
        <div className="flex items-start sm:items-center gap-4 min-w-0">
          {/* Rank Badge */}
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 font-mono text-xs font-bold text-slate-700">
            #{rank}
          </div>

          {/* Avatar */}
          <SafeAvatar
            src={result.creatorAvatar}
            name={result.creatorName}
            size="lg"
            shape="rounded"
            className="border-2 border-blue-500/30 shrink-0"
          />

          {/* Titles */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Link
                to={`/creators/${result.creatorId}`}
                className="text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors truncate"
              >
                {result.creatorName}
              </Link>
              {rank === 1 && (
                <span className="flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Best Match
                </span>
              )}
            </div>
            <p className="line-clamp-1 text-xs text-slate-500 mt-0.5">{result.creatorHeadline}</p>
          </div>
        </div>

        {/* Circular Progress & Action buttons */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-4 self-end sm:self-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
          {/* Circular Score Badge */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
              <svg className="w-14 h-14 transform -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-slate-200"
                  fill="transparent"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray={2 * Math.PI * 24}
                  strokeDashoffset={getStrokeDashoffset(score.overall)}
                  strokeLinecap="round"
                  className={
                    score.overall >= 80
                      ? 'text-[#2563EB]'
                      : score.overall >= 60
                      ? 'text-sky-500'
                      : 'text-amber-500'
                  }
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-black text-slate-900">{score.overall}%</span>
              </div>
            </div>
            <div className="text-left hidden md:block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Compatibility
              </span>
              <span className="text-xs font-semibold text-blue-700">
                {score.overall >= 85 ? 'Strong Match' : score.overall >= 70 ? 'Good Fit' : 'Moderate Fit'}
              </span>
            </div>
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => toggleShortlist(result.creatorId)}
              title={saved ? 'Remove from shortlist' : 'Shortlist creator'}
              className={`p-2 rounded-xl transition-all ${
                saved
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Heart className={`w-4 h-4 ${saved ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>

            {onInvite && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onInvite(result.creatorId, result.creatorName)}
                className="text-xs"
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                Invite
              </Button>
            )}

            <Link to={`/creators/${result.creatorId}`}>
              <Button size="sm" variant="primary" className="text-xs bg-[#2563EB] hover:bg-[#1D4ED8]">
                Profile
              </Button>
            </Link>

            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
              title={expanded ? 'Hide scoring details' : 'Show scoring breakdown'}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Primary Highlights Bar (Why this match?) */}
      <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
        <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl">
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Skills</span>
          <span className="font-bold text-slate-900">{score.skillScore}/30</span>
        </div>
        <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl">
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Category</span>
          <span className="font-bold text-slate-900">{score.categoryScore}/25</span>
        </div>
        <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl">
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Budget Fit</span>
          <span className="font-bold text-slate-900">{score.budgetScore}/20</span>
        </div>
        <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl">
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Timeline</span>
          <span className="font-bold text-slate-900">{score.availabilityScore}/15</span>
        </div>
        <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl col-span-2 sm:col-span-1">
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Style Match</span>
          <span className="font-bold text-slate-900">{score.styleScore}/10</span>
        </div>
      </div>

      {/* Expanded Breakdown */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 pt-4 border-t border-slate-200 space-y-4"
          >
            {/* Explanations */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB]" /> Strengths & Match Reasons
              </h5>
              <div className="space-y-1.5">
                {score.explanation.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                    <span className="text-[#2563EB] shrink-0 mt-0.5">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Warnings or missing skills if any */}
            {score.warnings.length > 0 && (
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Considerations
                </h5>
                <div className="space-y-1.5">
                  {score.warnings.map((warn, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-amber-800">
                      <span className="text-amber-500 shrink-0 mt-0.5">!</span>
                      <span>{warn}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Relevant portfolio items */}
            {score.relevantPortfolio && score.relevantPortfolio.length > 0 && (
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Relevant Work Samples
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {score.relevantPortfolio.map((item) => (
                    <div
                      key={item.id}
                      className="group/item relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 aspect-video shadow-sm"
                    >
                      <SafeImage
                        src={item.imageUrl}
                        alt={item.title}
                        category={item.category}
                        containerClassName="h-full w-full"
                        className="h-full w-full object-cover transition-transform group-hover/item:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2">
                        <span className="text-[11px] font-medium text-white truncate">
                          {item.title}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
