'use client';

import React from 'react';
import { Search, X, Filter, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FigureFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedEra: string;
  onEraChange: (era: string) => void;
  selectedExpertise: string;
  onExpertiseChange: (exp: string) => void;
  selectedRegion: string;
  onRegionChange: (reg: string) => void;
  onReset: () => void;
  totalCount: number;
}

export function FigureFilters({
  searchQuery,
  onSearchChange,
  selectedEra,
  onEraChange,
  selectedExpertise,
  onExpertiseChange,
  selectedRegion,
  onRegionChange,
  onReset,
  totalCount,
}: FigureFiltersProps) {
  const eras = [
    'All Eras',
    'Classical Antiquity',
    'Hellenistic Period',
    'Renaissance',
    'Victorian Era',
    '19th Century',
    'Modern Era',
  ];

  const expertises = [
    'All Fields',
    'Physics',
    'Philosophy',
    'Engineering',
    'Leadership',
    'Mathematics',
    'Science',
    'Nonviolence',
  ];

  const regions = [
    'All Regions',
    'Europe',
    'Greece',
    'Egypt',
    'United States',
    'India',
  ];

  const hasActiveFilters =
    searchQuery ||
    selectedEra !== 'All Eras' ||
    selectedExpertise !== 'All Fields' ||
    selectedRegion !== 'All Regions';

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 mb-8 backdrop-blur-md shadow-lg space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, discovery, philosophy, or keywords (e.g., relativity, satyagraha)..."
            className="pl-10 pr-9 bg-slate-950/80 border-slate-700/80 text-white placeholder:text-slate-500 rounded-xl"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="md"
            onClick={onReset}
            className="text-xs text-amber-400 border-amber-500/30 hover:bg-amber-500/10 gap-1.5 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </Button>
        )}
      </div>

      {/* Dropdown Filters & Quick Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
        {/* Era Selector */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1">
            <Filter className="w-3 h-3 text-amber-400" />
            <span>Historical Era</span>
          </label>
          <select
            value={selectedEra}
            onChange={(e) => onEraChange(e.target.value)}
            className="w-full bg-slate-950/90 border border-slate-700/80 text-slate-200 text-xs rounded-lg p-2.5 focus:border-amber-400 focus:outline-none"
          >
            {eras.map((era) => (
              <option key={era} value={era}>
                {era}
              </option>
            ))}
          </select>
        </div>

        {/* Expertise Selector */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1">
            <Filter className="w-3 h-3 text-amber-400" />
            <span>Field of Expertise</span>
          </label>
          <select
            value={selectedExpertise}
            onChange={(e) => onExpertiseChange(e.target.value)}
            className="w-full bg-slate-950/90 border border-slate-700/80 text-slate-200 text-xs rounded-lg p-2.5 focus:border-amber-400 focus:outline-none"
          >
            {expertises.map((exp) => (
              <option key={exp} value={exp}>
                {exp}
              </option>
            ))}
          </select>
        </div>

        {/* Region Selector */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1">
            <Filter className="w-3 h-3 text-amber-400" />
            <span>Geographic Region</span>
          </label>
          <select
            value={selectedRegion}
            onChange={(e) => onRegionChange(e.target.value)}
            className="w-full bg-slate-950/90 border border-slate-700/80 text-slate-200 text-xs rounded-lg p-2.5 focus:border-amber-400 focus:outline-none"
          >
            {regions.map((reg) => (
              <option key={reg} value={reg}>
                {reg}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
        <span>
          Showing <strong className="text-amber-400">{totalCount}</strong> historical figures
        </span>
        {hasActiveFilters && (
          <span className="text-amber-400/80 text-[11px]">Filtered results</span>
        )}
      </div>
    </div>
  );
}
