import React from 'react';
import Link from 'next/link';
import { Hourglass, Shield, BookOpen, Sparkles, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <Hourglass className="w-4 h-4 text-amber-400" />
              </div>
              <span className="font-serif text-lg font-bold text-white">TimeTalk AI</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Experience history firsthand through immersive, contextual dialogues with the world’s most influential thinkers, leaders, and innovators powered by Google Gemini.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-amber-400/80" />
              <span>AI & ML Hackathon Project • Built with Next.js, Gemini API & Supabase</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-3">Explore Eras</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/figures?era=Classical+Antiquity" className="hover:text-amber-400 transition-colors">
                  Classical Antiquity
                </Link>
              </li>
              <li>
                <Link href="/figures?era=Renaissance" className="hover:text-amber-400 transition-colors">
                  The Renaissance
                </Link>
              </li>
              <li>
                <Link href="/figures?era=Victorian" className="hover:text-amber-400 transition-colors">
                  Victorian & 19th Century
                </Link>
              </li>
              <li>
                <Link href="/figures?era=Modern" className="hover:text-amber-400 transition-colors">
                  Modern 20th Century
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources & Educational Disclaimer */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-3">Integrity & Ethics</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-1.5 text-slate-400">
                <BookOpen className="w-4 h-4 text-amber-400/80" />
                <span>Primary Source Grounding</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-400">
                <Shield className="w-4 h-4 text-amber-400/80" />
                <span>Temporal Boundary Safeguards</span>
              </li>
              <li>
                <Link href="/profile" className="hover:text-amber-400 transition-colors">
                  Privacy & Guest Mode
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer Callout Box */}
        <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/50 mb-8 flex items-start gap-3">
          <Shield className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-400 leading-relaxed">
            <strong className="text-slate-200">Educational Simulation Disclaimer:</strong> TimeTalk AI generates dialogue using Google Gemini trained on documented historical literature, papers, and biographies. Generated conversations are pedagogical simulations for educational exploration and must not be cited as verbatim historical quotes.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 pt-6 border-t border-slate-850 gap-3">
          <p>© {new Date().getFullYear()} TimeTalk AI. Open-source educational project.</p>
          <p className="flex items-center gap-1">
            Crafted with <Heart className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> for history and AI enthusiasts.
          </p>
        </div>
      </div>
    </footer>
  );
}
