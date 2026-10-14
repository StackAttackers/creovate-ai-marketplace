import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from './Modal';
import { Button } from './Button';
import {
  Sparkles,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Film,
  Award,
  CheckCircle2,
  Search,
} from 'lucide-react';


interface ChallengePresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SLIDES = [
  {
    id: 1,
    title: 'The Challenge & Background',
    subtitle: 'Connecting AI Creators with Commercial Brands & Agencies',
    icon: Sparkles,
    color: 'violet',
    content: (
      <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <p className="text-sm sm:text-base text-slate-900 font-semibold">
          Generative AI tools have created a new category of elite creative professionals (AI filmmakers, animators, prompt architects).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/70 space-y-1.5">
            <strong className="text-rose-700 block text-xs uppercase tracking-wider font-bold">
              The Industry Problem:
            </strong>
            <p className="text-xs text-slate-700">
              Traditional marketplaces (Upwork, Fiverr) treat creative work generically. Brands struggle to verify AI tools, understand complex multi-pass pipelines, trace prompts/seeds, and ensure commercial buyout safety.
            </p>
          </div>
          <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/70 space-y-1.5">
            <strong className="text-blue-700 block text-xs uppercase tracking-wider font-bold">
              The Creovate AI Solution:
            </strong>
            <p className="text-xs text-slate-700">
              An AI-native platform designed around generative workflows: structured brief synthesis, reproducible prompt/seed provenance, multi-attribute discovery, and lifecycle management from discovery through delivery.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    title: 'AI-Native Profiles & Verification Signals',
    subtitle: 'Showcasing Tools, Workflows & Verifiable Provenance (30% + Bonus)',
    icon: ShieldCheck,
    color: 'emerald',
    content: (
      <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <p className="text-xs sm:text-sm text-slate-700">
          Portfolios are structured specifically for generative AI deliverables, with first-class metadata and verification badges:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
            <span className="text-[11px] font-bold text-blue-600 uppercase font-mono block">
              1. Verified Tools
            </span>
            <p className="text-xs text-slate-600">
              Visible trust indicators for verified licenses: Runway Gen-3 Alpha, Midjourney v6.1 Pro, ComfyUI, Kling AI.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
            <span className="text-[11px] font-bold text-emerald-600 uppercase font-mono block">
              2. Verified Workflows
            </span>
            <p className="text-xs text-slate-600">
              Step-by-step reproducible pipelines: LoRA Character Consistency, ControlNet Depth, Topaz 4K 60fps upscaling.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
            <span className="text-[11px] font-bold text-sky-600 uppercase font-mono block">
              3. Past Work & Provenance
            </span>
            <p className="text-xs text-slate-600">
              Inspectable generation prompts, reproducible seed numbers, and verified commercial delivery history.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title: 'Creative Briefs & AI Brief Builder',
    subtitle: 'From Rough Idea to Structured Brief with Commercial Buyouts (20% + Bonus)',
    icon: Film,
    color: 'violet',
    content: (
      <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <p className="text-xs sm:text-sm text-slate-700">
          Brands define exact campaign requirements across structured dimensions rather than loose text:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-center font-mono text-[11px]">
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 shadow-sm">
            <span className="text-slate-500 text-[10px] block">CONTENT TYPE</span>
            Short-form Video, 3D Motion, Avatar
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 shadow-sm">
            <span className="text-slate-500 text-[10px] block">ASPECT RATIO</span>
            9:16 Vertical, 16:9 Cinema, 1:1 Feed
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 shadow-sm">
            <span className="text-slate-500 text-[10px] block">VISUAL STYLE</span>
            Cinematic, Cyberpunk, Editorial
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 shadow-sm">
            <span className="text-blue-600 text-[10px] block">COMMERCIAL RIGHTS</span>
            Full Worldwide Buyout + Training Exclusion
          </div>
        </div>
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
          <strong>AI-Assisted Brief Builder:</strong> Type a 1-sentence thought (e.g., <em>&quot;Futuristic energy drink launch reel for Instagram&quot;</em>) and Google Gemini 1.5 Flash instantly synthesizes the full structured brief in Indian Rupees (₹ INR).
        </div>
      </div>
    ),
  },
  {
    id: 4,
    title: 'Multi-Vector Discovery & Filtering',
    subtitle: 'Search by Tools, Skills, Formats & Clean Empty States (25%)',
    icon: Search,
    color: 'cyan',
    content: (
      <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <p className="text-xs sm:text-sm text-slate-700">
          Brands find the exact match for their production needs across five specialized filter vectors:
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
          <li className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span><strong>Tools:</strong> Runway ML, Midjourney, ComfyUI, Pika, Blender, Flux.1</span>
          </li>
          <li className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span><strong>Skills:</strong> Prompt Engineering, LoRA Training, Motion Control, Color Grading</span>
          </li>
          <li className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span><strong>Content Formats:</strong> Video, Stills, 3D Asset, Interactive, Avatar</span>
          </li>
          <li className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span><strong>Sensible Empty States:</strong> Suggestion chips and 1-click filter reset</span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 5,
    title: 'Managing Engagements: Discovery Through Delivery',
    subtitle: 'From Proposal to Generation Rounds & License Certificate (15% UX + 10% Demo)',
    icon: Award,
    color: 'emerald',
    content: (
      <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <p className="text-xs sm:text-sm text-slate-700">
          The end-to-end lifecycle manages the commercial relationship across 5 clear operational milestones:
        </p>
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm font-mono text-xs text-slate-700 space-y-1.5">
          <div className="text-blue-600 font-bold">1. Discovery &amp; Brief Match</div>
          <div className="pl-3 border-l-2 border-slate-200">Brand publishes brief; AI matches creator competencies.</div>
          <div className="text-indigo-600 font-bold">2. Proposal Submission &amp; Acceptance</div>
          <div className="pl-3 border-l-2 border-slate-200">Creator submits quote (₹ INR) and proposed toolchain; brand accepts.</div>
          <div className="text-sky-600 font-bold">3. Generation Drafts (v1 / v2)</div>
          <div className="pl-3 border-l-2 border-slate-200">Creator uploads video passes with prompt formulas and seed logs.</div>
          <div className="text-amber-600 font-bold">4. Client Revision Cycles</div>
          <div className="pl-3 border-l-2 border-slate-200">Brand leaves targeted comments; creator iterates draft passes.</div>
          <div className="text-emerald-600 font-bold">5. Commercial License Certificate Handover</div>
          <div className="pl-3 border-l-2 border-slate-200">Brand approves 4K masters and receives signed IP certificate with non-infringement warranty.</div>
        </div>
      </div>
    ),
  },
];

export function ChallengePresentationModal({
  isOpen,
  onClose,
}: ChallengePresentationModalProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const slide = SLIDES[currentSlideIndex];

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : SLIDES.length - 1));
  };

  const handleNext = () => {
    setCurrentSlideIndex((prev) => (prev < SLIDES.length - 1 ? prev + 1 : 0));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Creovate AI — Challenge Approach & Architecture"
      description={`Slide ${currentSlideIndex + 1} of ${SLIDES.length}: ${slide.title}`}
      maxWidth="4xl"
    >

      <div className="space-y-6">
        {/* Slide Stage */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-6 min-h-[320px] flex flex-col justify-between shadow-sm"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
                  <slide.icon className="w-4 h-4" />
                </span>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600">
                  Slide {slide.id}: {slide.subtitle}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">{slide.title}</h3>

              {slide.content}
            </div>

            {/* Slide Pagination Dots */}
            <div className="flex items-center justify-center gap-2 pt-6">
              {SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    currentSlideIndex === idx ? 'w-8 bg-blue-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <div className="text-xs text-slate-500 font-mono font-medium">
            {currentSlideIndex + 1} / {SLIDES.length}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePrev}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous Slide
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleNext}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              {currentSlideIndex === SLIDES.length - 1 ? 'Back to Start' : 'Next Slide'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
