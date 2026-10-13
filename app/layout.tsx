import type { Metadata } from 'next';
import { Inter, Cinzel } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { ToastProvider } from '@/components/ui/toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
});

export const metadata: Metadata = {
  title: 'TimeTalk AI — Chat with History',
  description:
    'Interactive conversations with famous historical figures powered by Google Gemini API. Explore ideas, philosophies, and pivotal events.',
  keywords: ['History AI', 'Gemini API', 'Educational Chatbot', 'TimeTalk AI', 'Interactive Museum'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${cinzel.variable} font-sans bg-slate-950 text-slate-100 min-h-screen flex flex-col selection:bg-amber-500/30 selection:text-amber-200`}>
        <Navbar />
        <ToastProvider>
          <main className="flex-1 flex flex-col">{children}</main>
        </ToastProvider>
        <Footer />
      </body>
    </html>
  );
}
