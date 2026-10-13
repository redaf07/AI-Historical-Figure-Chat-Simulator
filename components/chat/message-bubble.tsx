'use client';

import React, { useState } from 'react';
import { ChatMessage, HistoricalFigure } from '@/types';
import { Copy, Check, User, Sparkles } from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
  figure: HistoricalFigure;
}

export function MessageBubble({ message, figure }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isAssistant = message.role === 'assistant';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const formattedTime = new Date(message.created_at || Date.now()).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`flex gap-3 sm:gap-4 my-4 animate-fade-in ${
        isAssistant ? 'justify-start' : 'justify-end'
      }`}
    >
      {/* Figure Avatar for Assistant */}
      {isAssistant && (
        <div className="shrink-0 pt-1">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-amber-500/50 shadow-md shadow-amber-500/10">
            <img
              src={figure.portrait_url}
              alt={figure.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Bubble Container */}
      <div
        className={`relative group max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 sm:p-5 shadow-lg ${
          isAssistant
            ? 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-sm'
            : 'bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-medium rounded-tr-sm shadow-amber-500/20'
        }`}
      >
        {/* Header Metadata */}
        <div className="flex items-center justify-between gap-4 mb-1.5 pb-1 border-b border-black/10 dark:border-white/5 text-[11px]">
          <div className="flex items-center gap-1.5 font-semibold">
            {isAssistant ? (
              <>
                <span className="text-amber-400 font-serif text-xs">{figure.name}</span>
                <span className="text-[10px] text-slate-500 font-normal">({figure.lifespan})</span>
              </>
            ) : (
              <span className="text-slate-950 font-sans">You</span>
            )}
          </div>
          <span className={`text-[10px] ${isAssistant ? 'text-slate-500' : 'text-slate-900/80'}`}>
            {formattedTime}
          </span>
        </div>

        {/* Message Content */}
        <div className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </div>

        {/* Action Toolbar on Hover (Copy Button) */}
        {isAssistant && (
          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-[10px] text-amber-400/80">
              <Sparkles className="w-3 h-3" /> Historical Simulation
            </span>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white transition-colors"
              title="Copy message"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 text-[10px]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span className="text-[10px]">Copy</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {!isAssistant && (
        <div className="shrink-0 pt-1">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shadow-sm">
            <User className="w-4 h-4" />
          </div>
        </div>
      )}
    </div>
  );
}
