'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { HISTORICAL_FIGURES } from '@/lib/figures-data';
import { StorageService } from '@/lib/storage';
import { FigureCard } from '@/components/figures/figure-card';
import { FigureFilters } from '@/components/figures/figure-filters';
import { Badge } from '@/components/ui/badge';
import { Compass, Sparkles } from 'lucide-react';

export default function FiguresPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEra, setSelectedEra] = useState('All Eras');
  const [selectedExpertise, setSelectedExpertise] = useState('All Fields');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
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

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedEra('All Eras');
    setSelectedExpertise('All Fields');
    setSelectedRegion('All Regions');
  };

  const filteredFigures = useMemo(() => {
    return HISTORICAL_FIGURES.filter((fig) => {
      // Search text query
      const matchesSearch =
        !searchQuery ||
        fig.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fig.expertise.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fig.biography.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fig.era.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fig.region.toLowerCase().includes(searchQuery.toLowerCase());

      // Era
      const matchesEra =
        selectedEra === 'All Eras' || fig.era.toLowerCase().includes(selectedEra.toLowerCase());

      // Expertise
      const matchesExpertise =
        selectedExpertise === 'All Fields' ||
        fig.expertise.toLowerCase().includes(selectedExpertise.toLowerCase());

      // Region
      const matchesRegion =
        selectedRegion === 'All Regions' ||
        fig.region.toLowerCase().includes(selectedRegion.toLowerCase());

      return matchesSearch && matchesEra && matchesExpertise && matchesRegion;
    });
  }, [searchQuery, selectedEra, selectedExpertise, selectedRegion]);

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
          <Compass className="w-4 h-4" />
          <span>Historical Archive</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
          Historical Figure Explorer
        </h1>
        <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl">
          Search and filter across eras, disciplines, and continents. Select any historical personality
          to start a dynamic conversational dialogue powered by Google Gemini.
        </p>
      </div>

      {/* Filter Controls */}
      <FigureFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedEra={selectedEra}
        onEraChange={setSelectedEra}
        selectedExpertise={selectedExpertise}
        onExpertiseChange={setSelectedExpertise}
        selectedRegion={selectedRegion}
        onRegionChange={setSelectedRegion}
        onReset={handleResetFilters}
        totalCount={filteredFigures.length}
      />

      {/* Figures Grid */}
      {filteredFigures.length === 0 ? (
        <div className="py-20 text-center rounded-2xl border border-slate-800 bg-slate-900/40 p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-white">No historical figures match your filter</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try adjusting your search terms or reset the filters to browse our complete collection of 10
            historical thinkers.
          </p>
          <button
            onClick={handleResetFilters}
            className="text-xs text-amber-400 hover:text-amber-300 underline font-medium"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFigures.map((figure) => (
            <FigureCard
              key={figure.id}
              figure={figure}
              isFavorite={favorites.includes(figure.id)}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
