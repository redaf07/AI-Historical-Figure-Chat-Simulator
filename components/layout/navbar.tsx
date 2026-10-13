'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Hourglass, Compass, LayoutDashboard, History, Sparkles, Menu, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/figures', label: 'Explore Figures', icon: Compass },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/history', label: 'Conversations', icon: History },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Hourglass className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <span className="font-serif text-lg font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
              TimeTalk <span className="text-amber-400 font-sans text-xs uppercase tracking-wider bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30 ml-1">AI</span>
            </span>
            <p className="text-[10px] text-slate-400 hidden sm:block tracking-wide">Chat with History</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  active
                    ? 'bg-slate-800 text-amber-400 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-850'
                }`}
              >
                {link.icon && <link.icon className="w-4 h-4 opacity-75" />}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/profile">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-amber-300 gap-1.5">
              <User className="w-4 h-4" />
              <span>Settings</span>
            </Button>
          </Link>
          <Link href="/figures">
            <Button variant="gold" size="sm" className="gap-1.5 shadow-sm">
              <Sparkles className="w-4 h-4" />
              <span>Start Exploring</span>
            </Button>
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
                  active ? 'bg-slate-800 text-amber-400' : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                {link.icon && <link.icon className="w-4 h-4" />}
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
            <Link href="/figures" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="gold" size="md" className="w-full gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Start Exploring</span>
              </Button>
            </Link>
            <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" size="md" className="w-full gap-2">
                <User className="w-4 h-4" />
                <span>Profile & Settings</span>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
