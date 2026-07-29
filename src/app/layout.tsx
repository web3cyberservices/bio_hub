
import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { Shield } from 'lucide-react';

const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Web3CyberServices | Ingestion & Analytics Platform',
  description: 'Enterprise-grade telemetry ingestion for global infrastructure.',
  icons: {
    icon: 'https://picsum.photos/seed/web3-logo/32/32',
  }
};

export const viewport: Viewport = {
  themeColor: '#09090b',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${inter.variable} dark`}>
      <body className="bg-background text-foreground min-h-screen flex flex-col font-sans selection:bg-blue-500/30 overflow-x-hidden antialiased">
        <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-background/80 backdrop-blur-md">
          <div className="container mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center transition-transform">
                <Shield className="w-3.5 h-3.5 text-black" />
              </div>
              <span className="font-bold text-sm tracking-tight text-white uppercase">Web3CyberServices</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <Link href="/dashboard" className="hover:text-white transition-colors">Console</Link>
              <Link href="/api-docs" className="hover:text-white transition-colors">Documentation</Link>
              <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            </nav>

            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors hidden xs:block">
                Sign In
              </Link>
              <Link href="/dashboard" className="btn-enterprise py-1.5 px-4 text-[10px] uppercase tracking-widest">
                Access
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full max-w-full overflow-x-hidden">
          {children}
        </main>

        <footer className="border-t border-white/[0.08] py-12 mt-20 bg-black/20">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
              <div className="col-span-2 space-y-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-white" />
                  <span className="text-xs font-bold tracking-tight uppercase text-white">Web3CyberServices</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed max-w-xs font-medium uppercase tracking-wider">
                  Industrial telemetry ingestion platform for global high-load environments.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="technical-label">Platform</h4>
                <ul className="space-y-2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                  <li><Link href="/dashboard" className="hover:text-white">Console</Link></li>
                  <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="technical-label">Legal</h4>
                <ul className="space-y-2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                  <li><Link href="/legal" className="hover:text-white">Privacy</Link></li>
                  <li><Link href="/legal" className="hover:text-white">Terms</Link></li>
                </ul>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
              <div>© 2026 Web3CyberServices. Build 42.0.1</div>
              <div className="flex gap-6">
                <Link href="#" className="hover:text-white">Status: OK</Link>
                <Link href="#" className="hover:text-white">API: v1</Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
