'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getFigureById, HISTORICAL_FIGURES } from '@/lib/figures-data';
import { ChatMessage, Conversation, HistoricalInsight } from '@/types';
import { StorageService } from '@/lib/storage';
import { MessageBubble } from '@/components/chat/message-bubble';
import { StarterQuestions } from '@/components/chat/starter-questions';
import { HistoricalInsightsModal } from '@/components/chat/historical-insights-modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import {
  Send,
  Sparkles,
  RotateCcw,
  Trash2,
  Download,
  Edit2,
  ChevronLeft,
  Sliders,
  AlertTriangle,
  History,
  FileText,
  PlusCircle,
  ExternalLink,
  Info,
} from 'lucide-react';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const figureId = params.id as string;
  const figure = getFigureById(figureId);
  const { toast } = useToast();

  const [conversationId, setConversationId] = useState<string>('');
  const [conversationTitle, setConversationTitle] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [responseLength, setResponseLength] = useState<'concise' | 'detailed'>('concise');
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Modals & Panels
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [insights, setInsights] = useState<HistoricalInsight | null>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitleInput, setNewTitleInput] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize conversation session
  useEffect(() => {
    if (!figure) return;

    const initConversation = async () => {
      // Look for latest conversation with this figure or create new
      const allConvs = await StorageService.getConversations();
      setRecentConversations(allConvs);

      const existingForFigure = allConvs.find((c) => c.historical_figure_id === figure.id);
      if (existingForFigure) {
        setConversationId(existingForFigure.id);
        setConversationTitle(existingForFigure.title);
        const storedMsgs = await StorageService.getMessages(existingForFigure.id);
        setMessages(storedMsgs);
        // Load insights if any
        const existingInsights = await StorageService.getInsights(existingForFigure.id);
        if (existingInsights) setInsights(existingInsights);
      } else {
        const newId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const title = `Dialogue with ${figure.name}`;
        setConversationId(newId);
        setConversationTitle(title);
        setMessages([]);
      }
    };

    initConversation();
  }, [figureId, figure]);

  // Scroll to bottom on messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!figure) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-serif font-bold text-white mb-3">Historical Figure Not Found</h1>
        <p className="text-sm text-slate-400 mb-6">The requested personality could not be located in our archives.</p>
        <Link href="/figures">
          <Button variant="gold">Return to Figure Explorer</Button>
        </Link>
      </div>
    );
  }

  // Handle Send Message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    setErrorNotice(null);
    setInputValue('');

    const userMessage: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      conversation_id: conversationId,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Save user message
    await StorageService.saveMessage(conversationId, figure.id, userMessage, conversationTitle);

    setIsLoading(true);

    try {
      // Prepare history payload for API
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          figureId: figure.id,
          message: text,
          history: historyPayload,
          responseLength,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to receive historical response.');
      }

      const assistantMessage: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        conversation_id: conversationId,
        role: 'assistant',
        content: data.response,
        created_at: new Date().toISOString(),
      };

      setMessages([...updatedMessages, assistantMessage]);
      await StorageService.saveMessage(conversationId, figure.id, assistantMessage, conversationTitle);

      // Refresh recent conversations
      const allConvs = await StorageService.getConversations();
      setRecentConversations(allConvs);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorNotice(err.message || 'Error communicating with historical persona.');
      toast(err.message || 'Error occurred while contacting historical persona', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard shortcut: Enter to send, Shift+Enter for newline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Generate Insights Handler
  const handleGenerateInsights = async () => {
    if (messages.length === 0) {
      toast('Have a brief conversation before generating insights', 'info');
      return;
    }

    setIsInsightsOpen(true);
    setIsGeneratingInsights(true);

    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          figureId: figure.id,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to synthesize insights');

      setInsights(data.insights);
      await StorageService.saveInsights(conversationId, data.insights);
      toast('Historical insights synthesized successfully!', 'success');
    } catch (err: any) {
      console.error('Insights error:', err);
      toast(err.message || 'Could not generate historical insights', 'error');
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  // Rename Conversation
  const handleRename = async () => {
    if (!newTitleInput.trim()) return;
    await StorageService.renameConversation(conversationId, newTitleInput.trim());
    setConversationTitle(newTitleInput.trim());
    setIsRenaming(false);
    toast('Conversation renamed', 'success');
    const allConvs = await StorageService.getConversations();
    setRecentConversations(allConvs);
  };

  // Clear Conversation
  const handleClearChat = async () => {
    await StorageService.deleteConversation(conversationId);
    setMessages([]);
    setInsights(null);
    setShowClearConfirm(false);
    toast('Conversation cleared', 'info');
    // Re-init new id
    const newId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setConversationId(newId);
    const allConvs = await StorageService.getConversations();
    setRecentConversations(allConvs);
  };

  // Export File (TXT or MD)
  const handleExport = (format: 'txt' | 'md') => {
    if (messages.length === 0) {
      toast('No messages to export', 'info');
      return;
    }

    const content = StorageService.formatExport(
      figure.name,
      conversationTitle,
      new Date().toISOString(),
      messages,
      format
    );

    const mime = format === 'md' ? 'text/markdown' : 'text/plain';
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timetalk-${figure.id}-${Date.now()}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    toast(`Exported conversation as .${format}`, 'success');
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-slate-950 overflow-hidden relative">
      {/* Top Bar / Historical Figure Persona Header */}
      <div className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 sm:px-6 py-3 shrink-0 flex items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/figures" className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>

          {/* Portrait Thumbnail */}
          <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-amber-500/60 shadow-md shrink-0">
            <img src={figure.portrait_url} alt={figure.name} className="w-full h-full object-cover" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-bold text-white text-base sm:text-lg truncate">
                {figure.name}
              </h1>
              <Badge variant="gold" className="text-[10px] hidden sm:inline-flex">
                {figure.era}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 truncate">
              <span>{figure.lifespan}</span>
              <span>•</span>
              <span className="text-amber-300/80 truncate">{figure.expertise}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Response Length Toggle */}
          <div className="hidden lg:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setResponseLength('concise')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                responseLength === 'concise' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Concise
            </button>
            <button
              onClick={() => setResponseLength('detailed')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                responseLength === 'detailed' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Detailed
            </button>
          </div>

          {/* Insights Button */}
          <Button
            variant="gold"
            size="sm"
            onClick={handleGenerateInsights}
            disabled={messages.length === 0}
            className="text-xs gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Historical</span>
            <span>Insights</span>
          </Button>

          {/* Export Dropdown / Buttons */}
          <div className="flex items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('md')}
              disabled={messages.length === 0}
              className="text-xs p-2 sm:px-2.5 text-slate-300 hover:text-amber-400 gap-1"
              title="Export as Markdown"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Export</span>
            </Button>
          </div>

          {/* Clear Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowClearConfirm(true)}
            disabled={messages.length === 0}
            className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 p-2"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Messages Stream Container */}
        <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
          {/* Scrollable Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-12 py-4">
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Educational Disclaimer Banner */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-300/80 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Historical Persona Simulation:</strong> Responses are generated by Google Gemini informed by documented biographical archives and historical writings of {figure.name}. While maintained for fidelity, dialogue is not an authentic historical transcript.
                </p>
              </div>

              {/* Starter Inquiries if chat is fresh */}
              {messages.length === 0 && (
                <StarterQuestions figure={figure} onSelectQuestion={(q) => handleSendMessage(q)} />
              )}

              {/* Message History */}
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} figure={figure} />
              ))}

              {/* Typing / Generating Indicator */}
              {isLoading && (
                <div className="flex items-center gap-3 my-4 animate-fade-in">
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-amber-500/50 shadow-md">
                    <img src={figure.portrait_url} alt={figure.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 flex items-center gap-2 text-xs text-amber-300">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="ml-1 text-slate-400">{figure.name.split(' ')[0]} is formulating a response...</span>
                  </div>
                </div>
              )}

              {/* Error Notice */}
              {errorNotice && (
                <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-950/20 text-rose-300 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{errorNotice}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
                      if (lastUserMsg) handleSendMessage(lastUserMsg.content);
                    }}
                    className="text-xs text-rose-300 border-rose-500/40 hover:bg-rose-500/20 shrink-0"
                  >
                    Retry
                  </Button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Box Footer */}
          <div className="border-t border-slate-800 bg-slate-950/95 backdrop-blur-md p-3 sm:p-4 shrink-0">
            <div className="max-w-4xl mx-auto">
              <div className="relative bg-slate-900/90 border border-slate-700/80 rounded-2xl focus-within:border-amber-500/60 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all shadow-xl">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask ${figure.name} about their discoveries, philosophy, era, or challenges... (Enter to send, Shift+Enter for new line)`}
                  rows={2}
                  className="w-full bg-transparent text-slate-100 placeholder:text-slate-500 text-sm p-3.5 pr-24 resize-none focus:outline-none"
                  disabled={isLoading}
                />

                <div className="absolute right-2.5 bottom-2.5 flex items-center gap-2">
                  <Button
                    variant="gold"
                    size="sm"
                    onClick={() => handleSendMessage()}
                    disabled={!inputValue.trim() || isLoading}
                    className="rounded-xl px-3 py-1.5 gap-1.5 shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-xs font-semibold">Send</span>
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 px-2">
                <span>Press Enter to send • Shift + Enter for line break</span>
                <span className="hidden sm:inline">Model: Google Gemini 1.5 Flash</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white">Clear Conversation?</h3>
              <p className="text-xs text-slate-400 mt-1">
                This will delete the messages in this conversation with {figure.name}. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowClearConfirm(false)}>
                Cancel
              </Button>
              <Button variant="outline" size="sm" onClick={handleClearChat} className="bg-rose-600 hover:bg-rose-700 text-white border-transparent">
                Confirm Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Historical Insights Modal */}
      <HistoricalInsightsModal
        isOpen={isInsightsOpen}
        onClose={() => setIsInsightsOpen(false)}
        figure={figure}
        insights={insights}
        isLoading={isGeneratingInsights}
        onAskFollowUp={(question) => handleSendMessage(question)}
      />
    </div>
  );
}
