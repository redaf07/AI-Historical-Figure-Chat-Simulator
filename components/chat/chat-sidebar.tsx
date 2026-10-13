'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Conversation, HistoricalFigure } from '@/types';
import {
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  Compass,
  Download,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatSidebarProps {
  currentConversationId: string;
  conversations: Conversation[];
  currentFigure: HistoricalFigure;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
  onExport: (format: 'txt' | 'md') => void;
  onNewChat: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatSidebar({
  currentConversationId,
  conversations,
  currentFigure,
  onRename,
  onDelete,
  onExport,
  onNewChat,
  isOpen,
  onClose,
}: ChatSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const startRename = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const saveRename = (id: string) => {
    if (editTitle.trim()) {
      onRename(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-72 sm:w-80 bg-slate-950 border-r border-slate-800/80 p-4 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Actions: New Conversation & Explorer Link */}
        <div className="space-y-2 mb-4">
          <Button
            variant="gold"
            size="md"
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full justify-center gap-2 shadow-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>New Conversation</span>
          </Button>

          <Link href="/figures" className="w-full block">
            <Button variant="outline" size="sm" className="w-full justify-center gap-2 text-xs">
              <Compass className="w-3.5 h-3.5" />
              <span>Switch Historical Figure</span>
            </Button>
          </Link>
        </div>

        {/* Current Figure Card Brief */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 mb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-500/40 shrink-0">
            <img
              src={currentFigure.portrait_url}
              alt={currentFigure.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-serif text-sm font-bold text-white truncate">
              {currentFigure.name}
            </h4>
            <p className="text-[11px] text-amber-400/90 truncate">{currentFigure.era}</p>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-1">
            Saved Dialogues ({conversations.length})
          </div>

          {conversations.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 px-4">
              No saved conversations yet. Start messaging to automatically save your dialogue.
            </div>
          ) : (
            conversations.map((conv) => {
              const isCurrent = conv.id === currentConversationId;
              const isEditing = editingId === conv.id;

              return (
                <div
                  key={conv.id}
                  className={`group relative rounded-xl p-2.5 text-xs transition-all flex items-center justify-between ${
                    isCurrent
                      ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium'
                      : 'hover:bg-slate-900 text-slate-300 hover:text-white border border-transparent'
                  }`}
                >
                  {isEditing ? (
                    <div className="flex items-center gap-1 w-full">
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 bg-slate-950 border border-amber-500/50 rounded px-2 py-1 text-xs text-white focus:outline-none"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveRename(conv.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                      />
                      <button
                        onClick={() => saveRename(conv.id)}
                        className="p-1 text-emerald-400 hover:text-emerald-300"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Link
                        href={`/chat/${conv.historical_figure_id}?c=${conv.id}`}
                        onClick={onClose}
                        className="flex items-center gap-2 min-w-0 flex-1 truncate"
                      >
                        <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                        <span className="truncate">{conv.title}</span>
                      </Link>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startRename(conv)}
                          className="p-1 text-slate-400 hover:text-white"
                          title="Rename title"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onDelete(conv.id)}
                          className="p-1 text-slate-400 hover:text-rose-400"
                          title="Delete conversation"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Export Options */}
        <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2">
            Export Current Thread
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('md')}
              className="text-xs gap-1.5 justify-center py-1.5 h-8"
            >
              <Download className="w-3 h-3" />
              <span>Markdown</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('txt')}
              className="text-xs gap-1.5 justify-center py-1.5 h-8"
            >
              <FileText className="w-3 h-3" />
              <span>Plain Text</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
