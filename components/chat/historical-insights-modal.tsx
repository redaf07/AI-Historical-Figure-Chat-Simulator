'use client';

import React, { useState } from 'react';
import { HistoricalFigure, HistoricalInsight } from '@/types';
import {
  Sparkles,
  BookOpen,
  Calendar,
  Lightbulb,
  CheckCircle2,
  FileText,
  X,
  HelpCircle,
  ShieldCheck,
  Download,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';

interface HistoricalInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  figure: HistoricalFigure;
  insights: HistoricalInsight | null;
  isLoading: boolean;
  onAskFollowUp?: (question: string) => void;
}

export function HistoricalInsightsModal({
  isOpen,
  onClose,
  figure,
  insights,
  isLoading,
  onAskFollowUp,
}: HistoricalInsightsModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleExportMarkdown = () => {
    if (!insights) return;
    let md = `# TimeTalk AI — Historical Insights: ${figure.name}\n\n`;
    md += `**Lifespan:** ${figure.lifespan}\n`;
    md += `**Era:** ${figure.era}\n`;
    md += `**Field of Study:** ${figure.expertise}\n\n`;
    md += `## Discussion Summary\n${insights.summary}\n\n`;

    md += `## 5 Verified Historical Facts\n`;
    insights.facts.forEach((fact, i) => {
      md += `${i + 1}. ${fact}\n`;
    });
    md += `\n`;

    md += `## 3 Key Educational Takeaways\n`;
    insights.takeaways.forEach((item, i) => {
      md += `${i + 1}. ${item}\n`;
    });
    md += `\n`;

    md += `## Chronological Timeline\n`;
    insights.timeline.forEach((t) => {
      md += `- **${t.year}:** ${t.event}\n`;
    });
    md += `\n`;

    md += `## Fact vs. Creative Simulation\n`;
    insights.factVsInterpretation.forEach((pair) => {
      md += `### Documented Fact\n${pair.documentedFact}\n\n`;
      md += `### Creative Context\n${pair.creativeContext}\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timetalk-insights-${figure.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Historical insights downloaded as Markdown!', 'success');
  };

  const handleCopySummary = async () => {
    if (!insights) return;
    try {
      await navigator.clipboard.writeText(
        `TimeTalk AI Insights: ${figure.name}\n\nSummary:\n${insights.summary}\n\nKey Takeaways:\n${insights.takeaways.join(
          '\n'
        )}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast('Insights summary copied to clipboard', 'info');
    } catch {
      toast('Failed to copy', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                  Historical Insights
                </h2>
                <Badge variant="gold" className="text-[10px]">
                  AI Synthesis
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Synthesized knowledge & historical critique for {figure.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative w-14 h-14">
                <div className="w-14 h-14 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin" />
                <Sparkles className="w-6 h-6 text-amber-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  Synthesizing Historical Archives...
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Gemini is analyzing your conversation, verifying biographical facts, and constructing timeline milestones.
                </p>
              </div>
            </div>
          ) : !insights ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <HelpCircle className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm">No insights generated yet.</p>
            </div>
          ) : (
            <>
              {/* Discussion Summary Card */}
              <div className="p-4 sm:p-5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  <FileText className="w-4 h-4" />
                  <span>Discussion Overview</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-sans">
                  {insights.summary}
                </p>
              </div>

              {/* 5 Verified Facts */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" />
                  <span>5 Important Historical Facts</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {insights.facts.map((fact, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border border-slate-800/80 bg-slate-950/40 text-xs text-slate-300 flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="leading-relaxed">{fact}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3 Key Takeaways */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4" />
                  <span>3 Key Educational Takeaways</span>
                </div>
                <div className="space-y-2">
                  {insights.takeaways.map((takeaway, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 text-xs text-amber-200/90 flex items-start gap-3"
                    >
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{takeaway}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chronological Timeline */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  <Calendar className="w-4 h-4" />
                  <span>Relevant Historical Timeline</span>
                </div>
                <div className="relative pl-6 border-l-2 border-amber-500/30 space-y-4 my-2">
                  {insights.timeline.map((event, index) => (
                    <div key={index} className="relative group">
                      <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-amber-400 ring-4 ring-slate-900" />
                      <div className="text-xs font-bold text-amber-400">{event.year}</div>
                      <div className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                        {event.event}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fact vs. Interpretation Section */}
              <div className="p-4 sm:p-5 rounded-xl border border-indigo-500/30 bg-indigo-950/20 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Fact vs. Creative Interpretation</span>
                </div>
                <p className="text-xs text-slate-400">
                  Educational transparency: clearly distinguishing archival records from AI simulation.
                </p>
                <div className="space-y-3 pt-1">
                  {insights.factVsInterpretation.map((item, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800"
                    >
                      <div>
                        <span className="font-semibold text-emerald-400 block mb-1">
                          ✓ Documented History
                        </span>
                        <p className="text-slate-300 leading-relaxed">{item.documentedFact}</p>
                      </div>
                      <div className="border-t md:border-t-0 md:border-l border-slate-800 pt-2 md:pt-0 md:pl-3">
                        <span className="font-semibold text-amber-400 block mb-1">
                          🎭 Creative Persona Framing
                        </span>
                        <p className="text-slate-400 leading-relaxed">{item.creativeContext}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Follow-ups */}
              {insights.followUpQuestions && insights.followUpQuestions.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                    <HelpCircle className="w-4 h-4" />
                    <span>Suggested Next Questions to Ask</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {insights.followUpQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (onAskFollowUp) {
                            onAskFollowUp(q);
                            onClose();
                          }
                        }}
                        className="text-left text-xs px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-white transition-all flex items-center gap-2"
                      >
                        <span className="text-amber-400">→</span>
                        <span>{q}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500">
            Powered by Google Gemini 1.5 Flash
          </div>
          <div className="flex items-center gap-2">
            {insights && !isLoading && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopySummary}
                  className="text-xs gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Summary'}</span>
                </Button>
                <Button
                  variant="gold"
                  size="sm"
                  onClick={handleExportMarkdown}
                  className="text-xs gap-1.5 shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Markdown</span>
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={onClose} className="text-xs text-slate-400">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
