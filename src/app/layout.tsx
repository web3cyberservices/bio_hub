
import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CyberLog | Enterprise Telemetry Aggregation',
  description: 'High-throughput gRPC log ingestion for mission-critical infrastructure.',
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="dark">
      <body className={`${inter.className} bg-background text-foreground min-h-screen flex flex-col`}>
        <div className="scanline" />
        <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-background/80 backdrop-blur-md">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center font-black text-background">CL</div>
              <span className="font-black text-xl tracking-tighter uppercase text-white">CyberLog</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              <Link href="/api-docs" className="hover:text-primary transition-colors">Documentation</Link>
              <Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link>
              <Link href="/legal" className="hover:text-primary transition-colors">Legal</Link>
            </nav>
            <button className="bg-white text-black px-5 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-white/90 transition-all">
              Console
            </button>
          </div>
        </header>
        <main className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 hero-glow -z-10" />
          {children}
        </main>
        <footer className="border-t border-white/5 py-12 bg-black/40">
          <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em]">
              © 2026 CyberLog Systems Inc. Built for High Availability.
            </div>
            <div className="flex gap-6 text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              <Link href="/legal" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/legal" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
