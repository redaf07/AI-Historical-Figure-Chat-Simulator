'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { StorageService } from '@/lib/storage';
import { HISTORICAL_FIGURES, getFigureById } from '@/lib/figures-data';
import { Conversation, HistoricalFigure } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  LayoutDashboard,
  MessageSquare,
  Compass,
  Heart,
  History,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  BarChart2,
  Calendar,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function DashboardPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [convs, favs] = await Promise.all([
          StorageService.getConversations(),
          StorageService.getFavorites(),
        ]);
        setConversations(convs);
        setFavorites(favs);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute metrics from actual stored data
  const totalConversations = conversations.length;
  const exploredFigureIds = Array.from(
    new Set(conversations.map((c) => c.historical_figure_id))
  );
  const totalFiguresExplored = exploredFigureIds.length;

  // Recently explored eras from conversations
  const exploredEras = Array.from(
    new Set(
      conversations
        .map((c) => c.figure?.era)
        .filter((era): era is string => Boolean(era))
    )
  );

  // Favorite figures objects
  const favoriteFigures = favorites
    .map((id) => getFigureById(id))
    .filter((f): f is HistoricalFigure => Boolean(f));

  // Suggested figures (figures the user has NOT conversed with yet)
  const suggestedFigures = HISTORICAL_FIGURES.filter(
    (f) => !exploredFigureIds.includes(f.id)
  ).slice(0, 3);

  // Chart data: Distribution of conversations by Era
  const eraDistributionMap: Record<string, number> = {};
  conversations.forEach((c) => {
    const eraName = c.figure?.era ? c.figure.era.split('(')[0].trim() : 'Unknown';
    eraDistributionMap[eraName] = (eraDistributionMap[eraName] || 0) + 1;
  });

  const chartData = Object.entries(eraDistributionMap).map(([name, count]) => ({
    name,
    conversations: count,
  }));

  const COLORS = ['#f59e0b', '#fbbf24', '#d97706', '#b45309', '#78350f'];

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-10">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/30 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <LayoutDashboard className="w-4 h-4" />
            <span>TimeTalk Explorer Hub</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Welcome to Your Historical Journey
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Track your historical dialogues, continue ongoing inquiries, and explore new eras with
            world-changing minds.
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <Link href="/figures">
            <Button variant="gold" size="md" className="gap-2 shadow-lg shadow-amber-500/20">
              <Sparkles className="w-4 h-4" />
              <span>Quick Start Chat</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Analytics KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-5 border-slate-800 bg-slate-900/60 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Conversations</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-white">
              {totalConversations}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Stored user sessions</p>
          </div>
        </Card>

        <Card className="p-5 border-slate-800 bg-slate-900/60 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Figures Explored</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-white">
              {totalFiguresExplored} <span className="text-xs font-normal text-slate-500">/ 10</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Unique historical minds consulted</p>
          </div>
        </Card>

        <Card className="p-5 border-slate-800 bg-slate-900/60 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Favorite Figures</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-white">
              {favorites.length}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Bookmarked personalities</p>
          </div>
        </Card>

        <Card className="p-5 border-slate-800 bg-slate-900/60 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Explored Eras</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-white">
              {exploredEras.length || 0}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Distinct chronological epochs</p>
          </div>
        </Card>
      </div>

      {/* Chart Section (if conversations exist) */}
      {chartData.length > 0 && (
        <Card className="p-6 border-slate-800 bg-slate-900/60 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
            <BarChart2 className="w-4 h-4" />
            <span>Era Inquiries Breakdown</span>
          </div>
          <h2 className="font-serif text-lg font-bold text-white mb-4">
            Conversations by Historical Era
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                  cursor={{ fill: 'rgba(245, 158, 11, 0.05)' }}
                />
                <Bar dataKey="conversations" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Main Grid: Recent Conversations & Sidebar Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Conversations List (2 columns wide on lg) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-amber-400" />
              <h2 className="font-serif text-xl font-bold text-white">Recent Conversations</h2>
            </div>
            {conversations.length > 0 && (
              <Link href="/history" className="text-xs text-amber-400 hover:underline">
                View All
              </Link>
            )}
          </div>

          {conversations.length === 0 ? (
            <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/40 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-white">No Conversations Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Select a historical thinker like Albert Einstein, Marie Curie, or Cleopatra to begin
                your first conversation.
              </p>
              <Link href="/figures">
                <Button variant="gold" size="sm" className="mt-2">
                  Browse Figures
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.slice(0, 5).map((conv) => (
                <div
                  key={conv.id}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-amber-500/40 transition-all flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-amber-500/40 shrink-0">
                      <img
                        src={
                          conv.figure?.portrait_url ||
                          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'
                        }
                        alt={conv.figure?.name || 'Figure'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-serif text-sm font-bold text-white truncate group-hover:text-amber-400 transition-colors">
                        {conv.title}
                      </h4>
                      <p className="text-xs text-slate-400 truncate">
                        {conv.figure?.name} • {conv.figure?.era}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] text-slate-500 hidden sm:inline flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(conv.updated_at).toLocaleDateString()}
                    </span>
                    <Link href={`/chat/${conv.historical_figure_id}`}>
                      <Button variant="outline" size="sm" className="text-xs gap-1 hover:border-amber-500/50">
                        <span>Continue</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Favorites & Suggested Figures */}
        <div className="space-y-6">
          {/* Favorite Historical Figures */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3 shadow-lg">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <Heart className="w-4 h-4 text-rose-400" />
              <span>Favorite Thinkers</span>
            </div>

            {favoriteFigures.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">
                Click the heart on any figure card to bookmark them here.
              </p>
            ) : (
              <div className="space-y-2.5">
                {favoriteFigures.slice(0, 4).map((fig) => (
                  <Link
                    key={fig.id}
                    href={`/chat/${fig.id}`}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800/80 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-500/40 shrink-0">
                        <img src={fig.portrait_url} alt={fig.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white group-hover:text-amber-400 truncate">
                          {fig.name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">{fig.expertise}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Suggested Historical Figures */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3 shadow-lg">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Suggested for You</span>
            </div>
            <div className="space-y-2.5">
              {suggestedFigures.map((fig) => (
                <div
                  key={fig.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-700 shrink-0">
                      <img src={fig.portrait_url} alt={fig.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-200 truncate">{fig.name}</p>
                      <p className="text-[10px] text-amber-400/80 truncate">{fig.era}</p>
                    </div>
                  </div>
                  <Link href={`/chat/${fig.id}`}>
                    <Button variant="ghost" size="sm" className="text-xs text-amber-400 hover:text-white p-1">
                      Chat
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
