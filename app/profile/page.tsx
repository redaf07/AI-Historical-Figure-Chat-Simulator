'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import {
  User,
  Shield,
  Key,
  Trash2,
  Database,
  Cpu,
  LogOut,
  LogIn,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

export default function ProfilePage() {
  const { toast } = useToast();
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isSupabaseAvailable, setIsSupabaseAvailable] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (supabase) {
      setIsSupabaseAvailable(true);
      supabase.auth.getUser().then(({ data: { user } }) => {
        setSupabaseUser(user);
      });
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    if (!supabase) {
      toast('Supabase credentials not configured in .env.local', 'error');
      return;
    }

    setIsAuthLoading(true);
    try {
      if (authMode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setSupabaseUser(data.user);
        toast('Logged in successfully!', 'success');
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSupabaseUser(data.user);
        toast('Account created! Please check your email for confirmation.', 'success');
      }
    } catch (err: any) {
      toast(err.message || 'Authentication failed', 'error');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
      setSupabaseUser(null);
      toast('Signed out', 'info');
    }
  };

  const handleClearAllData = () => {
    if (typeof window === 'undefined') return;
    if (confirm('Are you sure you want to clear all your local conversations and settings?')) {
      localStorage.clear();
      toast('Local history and cache cleared', 'info');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
          <User className="w-4 h-4" />
          <span>User Account & Configuration</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Profile & Settings
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Manage your account, view API integration diagnostics, review privacy policies, and manage
          stored historical data.
        </p>
      </div>

      {/* Account Status Card */}
      <Card className="border-slate-800 bg-slate-900/60 p-6 rounded-2xl shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 font-bold text-xl shadow-lg shadow-amber-500/20">
              {supabaseUser?.email ? supabaseUser.email[0].toUpperCase() : 'G'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-white text-lg">
                  {supabaseUser ? supabaseUser.email : 'Guest Explorer'}
                </h3>
                <Badge variant={supabaseUser ? 'gold' : 'outline'} className="text-[10px]">
                  {supabaseUser ? 'Authenticated' : 'Demo / Guest Mode'}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {supabaseUser
                  ? `Supabase User ID: ${supabaseUser.id.substring(0, 16)}...`
                  : 'Conversations and favorites are stored locally in your browser.'}
              </p>
            </div>
          </div>

          {supabaseUser && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/10 gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </Button>
          )}
        </div>
      </Card>

      {/* Supabase Authentication Section (if not signed in) */}
      {!supabaseUser && (
        <Card className="border-slate-800 bg-slate-900/60 p-6 rounded-2xl shadow-lg space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <Database className="w-4 h-4" />
            <span>Supabase Cloud Sync</span>
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-white">
              {authMode === 'signin' ? 'Sign In to Sync History' : 'Create a Supabase Account'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Connect your account to synchronize conversations, favorites, and historical insights
              across devices. Guest mode is completely functional if you prefer not to sign in.
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-3 max-w-md pt-2">
            <div>
              <label className="block text-xs text-slate-300 mb-1">Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="historian@example.com"
                required
                className="bg-slate-950 border-slate-700 text-xs rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="bg-slate-950 border-slate-700 text-xs rounded-xl"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button variant="gold" size="sm" type="submit" disabled={isAuthLoading} className="text-xs">
                <LogIn className="w-3.5 h-3.5 mr-1" />
                <span>{authMode === 'signin' ? 'Sign In' : 'Create Account'}</span>
              </Button>
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                className="text-xs text-amber-400 hover:underline"
              >
                {authMode === 'signin'
                  ? "Don't have an account? Sign Up"
                  : 'Already have an account? Sign In'}
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* System Diagnostics & API Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Gemini API Diagnostic */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>Google Gemini AI</span>
            </span>
            <Badge variant="gold" className="text-[10px]">
              Active (1.5 Flash)
            </Badge>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Multi-turn chat & structured JSON insights powered by Google Gen AI SDK.
          </p>
        </div>

        {/* Supabase PostgreSQL Diagnostic */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-amber-400" />
              <span>Supabase Database</span>
            </span>
            <Badge variant={isSupabaseAvailable ? 'gold' : 'outline'} className="text-[10px]">
              {isSupabaseAvailable ? 'Connected' : 'Local Fallback'}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            PostgreSQL persistence with Row Level Security. Smooth client fallback to local storage.
          </p>
        </div>
      </div>

      {/* Educational & Privacy Disclaimers */}
      <Card className="border-slate-800 bg-slate-900/60 p-6 rounded-2xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
          <Shield className="w-4 h-4" />
          <span>Educational Disclaimer & Privacy Policy</span>
        </div>
        <div className="text-xs text-slate-400 space-y-2 leading-relaxed">
          <p>
            <strong>Educational Simulation:</strong> TimeTalk AI is designed as an interactive museum
            experience and historical educational tool. Generated dialogue is an AI reconstruction
            grounded in documented archival sources, letters, and scientific papers; it should never be
            cited as verbatim historical quotation.
          </p>
          <p>
            <strong>Temporal Integrity:</strong> Personas are programmed to acknowledge the boundaries
            of their lifespans. Inquiries regarding post-mortem discoveries or 21st-century events are
            addressed from an educational perspective rather than pretending the figure personally
            witnessed them.
          </p>
          <p>
            <strong>Data Privacy:</strong> We do not sell user data. When operating in guest mode, all
            chat records reside strictly in your local browser storage.
          </p>
        </div>
      </Card>

      {/* Danger Zone: Clear Data */}
      <Card className="border-rose-900/30 bg-rose-950/10 p-6 rounded-2xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-400">
          <Trash2 className="w-4 h-4" />
          <span>Data Management & Reset</span>
        </div>
        <p className="text-xs text-slate-400">
          Clear all locally cached conversations, favorites, and settings from this browser.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearAllData}
          className="text-xs text-rose-400 border-rose-500/40 hover:bg-rose-500/20"
        >
          Clear All Local Data
        </Button>
      </Card>
    </div>
  );
}
