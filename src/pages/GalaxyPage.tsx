import { useState } from 'react';
import {
  Sparkles,
  Search,
  Grid,
  Radio,
} from 'lucide-react';
import { useCreators } from '../hooks/useCreators';
import { CreatorGalaxy } from '../components/galaxy/CreatorGalaxy';
import { CreatorGrid } from '../components/creators/CreatorGrid';
import type { CreativeCategory } from '../types/creator';

const CATEGORIES: (CreativeCategory | 'All')[] = [
  'All',
  'AI Video Generation',
  'AI Advertising',
  'AI Photography',
  '3D Art and Animation',
  'AI Graphic Design',
  'AI Avatars',
  'Product Visualization',
  'AI-Assisted Creative Development',
];

export default function GalaxyPage() {
  const { creators } = useCreators();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'3d' | 'grid'>('3d');

  const filteredCreators = creators.filter((c) => {
    if (
      selectedCategory !== 'All' &&
      !c.categories.includes(selectedCategory as CreativeCategory)
    ) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.displayName.toLowerCase().includes(q);
      const matchSkills = c.skills.some((s) => s.toLowerCase().includes(q));
      if (!matchName && !matchSkills) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-midnight-900 pt-24 pb-20 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3.5 py-1 text-xs font-semibold text-violet-300 mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Spatial Talent Intelligence
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Creator Galaxy
            </h1>
            <p className="text-gray-400 text-sm sm:text-base mt-2 max-w-2xl">
              An interactive 3D spatial network of India's elite generative AI creators. Clustered by
              creative medium, connected by shared model competencies.
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 self-start md:self-auto">
            <button
              onClick={() => setViewMode('3d')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === '3d'
                  ? 'bg-violet-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5" /> 3D Spatial Canvas
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-violet-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" /> Constellation Grid
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search creator node by name or AI tool..."
              className="w-full rounded-2xl border border-white/10 bg-midnight-800/80 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 backdrop-blur-xl focus:border-violet-500/50 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.slice(0, 5).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Visualization Area */}
        {viewMode === '3d' ? (
          <div className="mb-12">
            <CreatorGalaxy
              creators={filteredCreators}
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
            />
          </div>
        ) : (
          <div className="mb-12">
            <CreatorGrid creators={filteredCreators} />
          </div>
        )}

        {/* Feature Explainer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-white/5">
          <div className="rounded-2xl border border-white/5 bg-midnight-800/40 p-5 backdrop-blur-xl">
            <h4 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-violet-400" /> Dynamic Clustering
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Nodes are positioned gravitationally by domain affinity—animators, video directors, and
              photographers congregate into specialized creative sectors.
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-midnight-800/40 p-5 backdrop-blur-xl">
            <h4 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-400" /> Synaptic Skill Connections
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Glowing filaments represent shared mastery across generative pipelines (Runway ML,
              Midjourney, ComfyUI, ElevenLabs).
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-midnight-800/40 p-5 backdrop-blur-xl">
            <h4 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> Real-time Inspection
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Hover over any creator node to view verified skills, indicative INR pricing, and sample
              campaign works.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
