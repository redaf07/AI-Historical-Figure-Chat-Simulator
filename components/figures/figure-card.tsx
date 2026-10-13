'use client';

import React from 'react';
import Link from 'next/link';
import { HistoricalFigure } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MessageSquare, Sparkles, MapPin, Calendar } from 'lucide-react';

interface FigureCardProps {
  figure: HistoricalFigure;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export function FigureCard({ figure, isFavorite, onToggleFavorite }: FigureCardProps) {
  return (
    <Card className="group relative overflow-hidden flex flex-col h-full border-slate-800 bg-slate-900/60 hover:border-amber-500/50 hover:bg-slate-900/90 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300">
      {/* Portrait Header Image */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-950">
        <img
          src={figure.portrait_url}
          alt={figure.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          onError={(e) => {
            // Fallback placeholder if image fails
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite(figure.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
            isFavorite
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
              : 'bg-slate-900/70 text-slate-400 hover:text-white border border-slate-700/50 hover:bg-slate-800'
          }`}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Featured Tag */}
        {figure.featured && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-500/90 text-slate-950 px-2 py-0.5 rounded-full shadow-md">
              <Sparkles className="w-3 h-3" /> Featured
            </span>
          </div>
        )}

        {/* Lifespan & Name in Overlay */}
        <div className="absolute bottom-3 left-4 right-4">
          <div className="flex items-center gap-2 text-xs text-amber-300/90 font-medium mb-0.5">
            <Calendar className="w-3 h-3" />
            <span>{figure.lifespan}</span>
          </div>
          <h3 className="font-serif text-xl font-bold text-white group-hover:text-amber-400 transition-colors drop-shadow-md">
            {figure.name}
          </h3>
        </div>
      </div>

      {/* Card Body */}
      <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {/* Metadata Badges */}
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="gold" className="text-[11px]">
              {figure.era}
            </Badge>
            <Badge variant="default" className="text-[11px] flex items-center gap-1 bg-slate-800/80">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span className="truncate max-w-[140px]">{figure.region}</span>
            </Badge>
          </div>

          {/* Expertise */}
          <div className="text-xs font-semibold text-slate-300">
            <span className="text-amber-400/90">Focus:</span> {figure.expertise}
          </div>

          {/* Short Bio */}
          <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
            {figure.biography}
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-slate-800/80">
          <Link href={`/chat/${figure.id}`} className="w-full block">
            <Button variant="gold" size="md" className="w-full gap-2 group-hover:shadow-lg">
              <MessageSquare className="w-4 h-4" />
              <span>Converse with {figure.name.split(' ')[0]}</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
