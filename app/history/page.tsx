'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { StorageService } from '@/lib/storage';
import { HISTORICAL_FIGURES } from '@/lib/figures-data';
import { Conversation, ChatMessage } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import {
  History,
  Search,
  MessageSquare,
  Edit2,
  Trash2,
  Download,
  Calendar,
  ArrowRight,
  Filter,
  Check,
  X,
} from 'lucide-react';

export default function HistoryPage() {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFigureId, setSelectedFigureId] = useState('all');
  const [loading, setLoading] = useState(true);

  // Rename state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitleInput, setEditTitleInput] = useState('');

  // Delete modal state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const data = await StorageService.getConversations();
      setConversations(data);
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartRename = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditTitleInput(conv.title);
  };

  const handleSaveRename = async (id: string) => {
    if (!editTitleInput.trim()) return;
    await StorageService.renameConversation(id, editTitleInput.trim());
    toast('Conversation renamed', 'success');
    setEditingId(null);
    loadConversations();
  };

  const handleDelete = async (id: string) => {
    await StorageService.deleteConversation(id);
    toast('Conversation deleted', 'info');
    setDeletingId(null);
    loadConversations();
  };

  const handleExport = async (conv: Conversation, format: 'txt' | 'md') => {
    const messages = await StorageService.getMessages(conv.id);
    if (messages.length === 0) {
      toast('Conversation has no messages to export', 'info');
      return;
    }

    const figureName = conv.figure?.name || 'Historical Figure';
    const content = StorageService.formatExport(
      figureName,
      conv.title,
      conv.created_at,
      messages,
      format
    );

    const mime = format === 'md' ? 'text/markdown' : 'text/plain';
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timetalk-${conv.historical_figure_id}-${conv.id}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    toast(`Exported conversation as .${format}`, 'success');
  };

  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      const matchesSearch =
        !searchQuery ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.figure?.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFigure =
        selectedFigureId === 'all' || c.historical_figure_id === selectedFigureId;

      return matchesSearch && matchesFigure;
    });
  }, [conversations, searchQuery, selectedFigureId]);

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
          <History className="w-4 h-4" />
          <span>Archival Records</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Conversation History
        </h1>
        <p className="text-sm text-slate-400 mt-2 max-w-xl">
          Review your past dialogues, rename inquiry logs, export transcripts as TXT or Markdown, or
          continue your conversations.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations by title or historical figure..."
            className="pl-10 bg-slate-950/80 border-slate-700/80 text-white placeholder:text-slate-500 rounded-xl"
          />
        </div>

        {/* Figure Filter */}
        <div className="w-full sm:w-64 shrink-0">
          <select
            value={selectedFigureId}
            onChange={(e) => setSelectedFigureId(e.target.value)}
            className="w-full bg-slate-950/90 border border-slate-700/80 text-slate-200 text-xs rounded-xl p-2.5 focus:border-amber-400 focus:outline-none"
          >
            <option value="all">All Historical Figures</option>
            {HISTORICAL_FIGURES.map((fig) => (
              <option key={fig.id} value={fig.id}>
                {fig.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Conversations List */}
      {filteredConversations.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
          <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-white">No Conversations Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery || selectedFigureId !== 'all'
              ? 'No dialogues match your filter criteria.'
              : 'You have not held any historical conversations yet.'}
          </p>
          <Link href="/figures">
            <Button variant="gold" size="sm" className="mt-2">
              Start a Conversation
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredConversations.map((conv) => (
            <div
              key={conv.id}
              className="p-4 sm:p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Figure and Title */}
              <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-amber-500/50 shadow-md shrink-0">
                  <img
                    src={
                      conv.figure?.portrait_url ||
                      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'
                    }
                    alt={conv.figure?.name || 'Figure'}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  {editingId === conv.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editTitleInput}
                        onChange={(e) => setEditTitleInput(e.target.value)}
                        className="h-8 text-xs bg-slate-950 border-amber-500/60 text-white rounded-lg"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveRename(conv.id)}
                        className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                        title="Save title"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif font-bold text-white text-base truncate">
                        {conv.title}
                      </h3>
                      <button
                        onClick={() => handleStartRename(conv)}
                        className="text-slate-500 hover:text-amber-400 p-1 rounded"
                        title="Rename conversation"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                    <span className="text-amber-400/90 font-medium">{conv.figure?.name}</span>
                    <span>•</span>
                    <Badge variant="outline" className="text-[10px] text-slate-400">
                      {conv.figure?.era}
                    </Badge>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(conv.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800 shrink-0">
                {/* Export TXT */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport(conv, 'txt')}
                  className="text-xs text-slate-300 hover:text-white px-2.5"
                  title="Export as TXT"
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  <span>TXT</span>
                </Button>

                {/* Export MD */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport(conv, 'md')}
                  className="text-xs text-slate-300 hover:text-white px-2.5"
                  title="Export as Markdown"
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  <span>MD</span>
                </Button>

                {/* Delete */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeletingId(conv.id)}
                  className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 px-2"
                  title="Delete conversation"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>

                {/* Continue Chat */}
                <Link href={`/chat/${conv.historical_figure_id}`}>
                  <Button variant="gold" size="sm" className="text-xs gap-1 shadow-sm">
                    <span>Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white">Delete Conversation?</h3>
              <p className="text-xs text-slate-400 mt-1">
                This will permanently delete this conversation and its message transcript.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setDeletingId(null)}>
                Cancel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(deletingId)}
                className="bg-rose-600 hover:bg-rose-700 text-white border-transparent"
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
