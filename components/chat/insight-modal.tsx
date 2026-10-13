'use client';

import React, { useState } from 'react';
import { HistoricalFigure, HistoricalInsight } from '@/types';
import {
  X,
  Sparkles,
  BookOpen,
  Calendar,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Download,
  Check,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface InsightModalProps {
  isOpen: boolean;
  onClose: () => void;
  insight: HistoricalInsight | null;
  figure: HistoricalFigure;
  isLoading: boolean;
}

export function InsightModal({
  isOpen,
  onClose,
  insight,
  figure,
  isLoading,
}: InsightModalProps) {
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleExportInsights = () => {
    if (!insight) return;
    let md = `# TimeTalk AI — Historical Insights Report\n\n`;
    md += `**Subject:** ${figure.name} (${figure.lifespan})\n`;
    md += `**Era:** ${figure.era}\n`;
    md += `**Generated:** ${new Date().toLocaleDateString()}\n\n`;
    md += `## Discussion Summary\n${insight.summary}\n\n`;

    md += `## 5 Verified Historical Facts\n`;
    insight.facts.forEach((f, i) => (md += `${i + 1}. ${f}\n`));
    md += `\n`;

    md += `## 3 Core Takeaways\n`;
    insight.takeaways.forEach((t, i) => (md += `- ${t}\n`));
    md += `\n`;

    md += `## Key Historical Timeline\n`;
    insight.timeline.forEach((item) => (md += `- **${item.year}**: ${item.event}\n`));
    md += `\n`;

    md += `## Recommended Follow-Up Inquiries\n`;
    insight.followUpQuestions.forEach((q, i) => (md += `${i + 1}. ${q}\n`));
    md += `\n`;

    md += `## Fact vs. Creative Interpretation\n`;
    insight.factVsInterpretation.forEach((comp) => {
      md += `- **Documented Fact:** ${comp.documentedFact}\n`;
      md += `  *Creative Framing:* ${comp.creativeContext}\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${figure.id}_historical_insights.md`;
    link.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold text-white">History Insights</h3>
                <Badge variant="gold" className="text-[10px]">
                  Gemini Synthesis
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Curated educational synthesis on {figure.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scrollable Area */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-200 flex-1">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-amber-400/20 border-t-amber-400 animate-spin" />
              <p className="text-sm font-medium text-slate-300">
                Synthesizing dialogue & verified biographical records...
              </p>
              <p className="text-xs text-slate-500">
                Analyzing historical timeline and formulating fact-checking checks
              </p>
            </div>
          ) : insight ? (
            <>
              {/* Executive Summary */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" />
                  <span>Discussion Overview</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{insight.summary}</p>
              </div>

              {/* 5 Facts & 3 Takeaways Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 5 Facts */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>5 Documented Facts</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {insight.facts.map((fact, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <span className="leading-snug">{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3 Key Takeaways */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                    <Layers className="w-4 h-4" />
                    <span>3 Core Takeaways</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {insight.takeaways.map((takeaway, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <span className="leading-snug">{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Relevant Timeline */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  <Calendar className="w-4 h-4" />
                  <span>Chronological Milestones</span>
                </div>
                <div className="space-y-2">
                  {insight.timeline.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 text-xs p-2 rounded-lg bg-slate-900/60 border border-slate-850"
                    >
                      <span className="font-mono font-bold text-amber-400 shrink-0 w-20">
                        {item.year}
                      </span>
                      <span className="text-slate-300">{item.event}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fact vs Creative Simulation */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Fact vs. Creative Simulation</span>
                </div>
                <div className="space-y-3">
                  {insight.factVsInterpretation.map((comp, idx) => (
                    <div
                      key={idx}
                      className="text-xs p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-start gap-2">
                        <strong className="text-emerald-400 shrink-0">Documented Fact:</strong>
                        <span className="text-slate-300">{comp.documentedFact}</span>
                      </div>
                      <div className="flex items-start gap-2 pt-1 border-t border-slate-800/60 text-slate-400">
                        <strong className="text-amber-400/90 shrink-0">Simulated Framing:</strong>
                        <span>{comp.creativeContext}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Follow-up Questions */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4" />
                  <span>Suggested Follow-Up Inquiries</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                  {insight.followUpQuestions.map((q, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Footer with Export */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            Saved automatically with this conversation.
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="gold"
              size="sm"
              onClick={handleExportInsights}
              disabled={isLoading || !insight}
              className="gap-1.5"
            >
              {downloaded ? (
                <>
                  <Check className="w-4 h-4 text-emerald-950" />
                  <span>Exported!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Export Insights (.md)</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
