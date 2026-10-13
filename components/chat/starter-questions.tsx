'use client';

import React from 'react';
import { HistoricalFigure } from '@/types';
import { Sparkles, MessageCircleQuestion } from 'lucide-react';

interface StarterQuestionsProps {
  figure: HistoricalFigure;
  onSelectQuestion: (question: string) => void;
}

export function StarterQuestions({ figure, onSelectQuestion }: StarterQuestionsProps) {
  const defaultQuestions = [
    'What discovery or accomplishment are you most proud of?',
    'What challenges or setbacks shaped your life and worldview?',
    'How would you explain your core ideas to a beginner?',
    'What is one common historical misconception about you?',
    'How does your work continue to influence the modern world?',
  ];

  const questions =
    figure.starter_questions && figure.starter_questions.length > 0
      ? [...figure.starter_questions, ...defaultQuestions.slice(2)]
      : defaultQuestions;

  return (
    <div className="my-6 p-4 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-amber-400">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Suggested Historical Inquiries</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {questions.slice(0, 4).map((q, idx) => (
          <button
            key={idx}
            onClick={() => onSelectQuestion(q)}
            className="text-left text-xs p-3 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 hover:border-amber-500/40 text-slate-300 hover:text-white transition-all flex items-start gap-2.5 group"
          >
            <MessageCircleQuestion className="w-4 h-4 text-amber-400/70 shrink-0 mt-0.5 group-hover:text-amber-400" />
            <span className="leading-snug">{q}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
