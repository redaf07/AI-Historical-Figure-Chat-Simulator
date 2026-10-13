'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HISTORICAL_FIGURES } from '@/lib/figures-data';
import { StorageService } from '@/lib/storage';
import { FigureCard } from '@/components/figures/figure-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Hourglass,
  Sparkles,
  ArrowRight,
  BookOpen,
  MessageSquare,
  ShieldCheck,
  Compass,
  Cpu,
  Layers,
  HelpCircle,
  Award,
} from 'lucide-react';

export default function HomePage() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    StorageService.getFavorites().then(setFavorites);
  }, []);

  const handleToggleFavorite = async (id: string) => {
    const isNowFav = await StorageService.toggleFavorite(id);
    setFavorites((prev) =>
      isNowFav ? [...prev, id] : prev.filter((item) => item !== id)
    );
  };

  const featuredFigures = HISTORICAL_FIGURES.filter((f) => f.featured);

  const popularEras = [
    {
      era: 'Classical Antiquity',
      dates: '8th c. BC – 6th c. AD',
      description: 'The cradle of Western philosophy, democracy, and geometry.',
      highlightFigure: 'Aristotle',
      figureId: 'aristotle',
    },
    {
      era: 'The Renaissance',
      dates: '14th – 17th Century',
      description: 'The golden awakening of fine arts, engineering, and humanism.',
      highlightFigure: 'Leonardo da Vinci',
      figureId: 'leonardo-da-vinci',
    },
    {
      era: 'Victorian Innovation',
      dates: '1837 – 1901',
      description: 'The industrial revolution and birth of algorithmic computing.',
      highlightFigure: 'Ada Lovelace',
      figureId: 'ada-lovelace',
    },
    {
      era: 'Modern Era & Physics',
      dates: '20th Century',
      description: 'Quantum theory, relativity, spaceflight, and human civil rights.',
      highlightFigure: 'Albert Einstein',
      figureId: 'albert-einstein',
    },
  ];

  const popularInquiries = [
    {
      question: 'How did thought experiments lead to General Relativity?',
      figure: 'Albert Einstein',
      figureId: 'albert-einstein',
    },
    {
      question: 'What challenges did you face isolating polonium & radium?',
      figure: 'Marie Curie',
      figureId: 'marie-curie',
    },
    {
      question: 'Why did you foresee that machines could compose music?',
      figure: 'Ada Lovelace',
      figureId: 'ada-lovelace',
    },
    {
      question: 'What took place during the "War of the Currents" with Edison?',
      figure: 'Nikola Tesla',
      figureId: 'nikola-tesla',
    },
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-slate-800/80">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[400px] h-[300px] bg-yellow-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-medium mb-6 backdrop-blur-md shadow-lg shadow-amber-500/5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Interactive Historical Simulation • Powered by Google Gemini</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
            History Isn’t Silent.{' '}
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
              Ask It Anything.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-sans leading-relaxed">
            Step through time and hold authentic, multi-turn conversations with history’s greatest
            thinkers, innovators, and leaders — built on verified archival context and advanced AI.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/figures">
              <Button variant="gold" size="lg" className="gap-2.5 shadow-xl shadow-amber-500/20 text-base px-6 py-6">
                <Compass className="w-5 h-5" />
                <span>Start Exploring History</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="gap-2 text-base px-6 py-6 border-slate-700 hover:border-slate-500">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <span>User Dashboard</span>
              </Button>
            </Link>
          </div>

          {/* Key Metrics / Highlights */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-8 border-t border-slate-800/80">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-amber-400 font-serif">10+</div>
              <div className="text-xs text-slate-400 mt-1">Archival Personas</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-amber-400 font-serif">2,500+</div>
              <div className="text-xs text-slate-400 mt-1">Years of History</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-amber-400 font-serif">Gemini 1.5</div>
              <div className="text-xs text-slate-400 mt-1">Multi-Turn Context</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-amber-400 font-serif">100%</div>
              <div className="text-xs text-slate-400 mt-1">Educational Rigor</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Historical Figures Gallery */}
      <section className="py-16 sm:py-24 bg-slate-950/60 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
                <Hourglass className="w-4 h-4" />
                <span>Curated Historical Gallery</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
                Featured Historical Figures
              </h2>
              <p className="text-sm text-slate-400 mt-2 max-w-xl">
                Select a celebrated mind to begin a dialogue grounded in their documented writings,
                scientific breakthroughs, and philosophical heritage.
              </p>
            </div>
            <Link href="/figures">
              <Button variant="outline" size="sm" className="gap-2 text-amber-300 border-amber-500/30 hover:bg-amber-500/10">
                <span>View All 10 Personalities</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredFigures.slice(0, 6).map((fig) => (
              <FigureCard
                key={fig.id}
                figure={fig}
                isFavorite={favorites.includes(fig.id)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-24 bg-slate-900/40 border-b border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="gold" className="mb-3">
              Intelligent Educational Architecture
            </Badge>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              How the AI Historical Simulator Works
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Combining official Google Gemini API intelligence with rigorous biographical constraints
              to produce insightful, context-aware dialogues.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 relative group hover:border-amber-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 font-serif font-bold text-lg">
                01
              </div>
              <h3 className="font-serif text-lg font-bold text-white mb-2">
                Curated Biographical Context
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Each historical figure is backed by verified lifespan dates, era markers, regions, and
                custom system instructions designed to prevent anachronisms and preserve tone.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 relative group hover:border-amber-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 font-serif font-bold text-lg">
                02
              </div>
              <h3 className="font-serif text-lg font-bold text-white mb-2">
                Multi-Turn Gemini Dialogue
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Powered by Google Gemini models via Next.js server APIs. Maintains context across
                conversations while respecting historical temporal boundaries.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 relative group hover:border-amber-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 font-serif font-bold text-lg">
                03
              </div>
              <h3 className="font-serif text-lg font-bold text-white mb-2">
                Automated History Insights
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Synthesizes discussions into 5 verified facts, 3 takeaways, timelines, and a Fact vs.
                Creative Interpretation critique for academic integrity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Eras & Popular Inquiries */}
      <section className="py-16 sm:py-24 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Eras Column */}
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
                <Layers className="w-4 h-4" />
                <span>Chronological Epochs</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-6">
                Featured Historical Eras
              </h2>
              <div className="space-y-4">
                {popularEras.map((era, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-amber-500/30 transition-all flex items-start justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-white text-base">{era.era}</span>
                        <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/30">
                          {era.dates}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{era.description}</p>
                    </div>
                    <Link href={`/chat/${era.figureId}`}>
                      <Button variant="ghost" size="sm" className="text-xs text-amber-400 hover:text-white shrink-0">
                        Chat with {era.highlightFigure} →
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Questions Column */}
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
                <HelpCircle className="w-4 h-4" />
                <span>Inquisitive Starting Points</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-6">
                Popular Historical Inquiries
              </h2>
              <div className="space-y-4">
                {popularInquiries.map((inq, i) => (
                  <Link
                    key={i}
                    href={`/chat/${inq.figureId}`}
                    className="block p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-amber-500/40 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-4 h-4 text-amber-400 shrink-0 mt-1 group-hover:scale-110 transition-transform" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-200 group-hover:text-white">
                          "{inq.question}"
                        </p>
                        <p className="text-xs text-amber-300/80 mt-1">Directed to {inq.figure}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hackathon Callout Banner */}
      <section className="py-12 bg-gradient-to-r from-amber-950/30 via-slate-900 to-amber-950/20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 text-xs text-amber-400 font-semibold uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>AI & Machine Learning Hackathon Ready</span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Educational AI With Historical Integrity
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
            TimeTalk AI bridges cutting-edge LLMs with primary historiography. Built with Next.js App
            Router, Supabase PostgreSQL, Row Level Security, and Google Gemini API.
          </p>
          <div className="pt-2">
            <Link href="/figures">
              <Button variant="gold" size="md" className="gap-2">
                <span>Start Chatting Now</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
