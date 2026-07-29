
import { Terminal, Shield, Zap, Database, ArrowRight, Code2 } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-grid">
      {/* Hero Section */}
      <section className="container mx-auto px-4 md:px-6 pt-20 pb-20 max-w-6xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 mb-8">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest">v2.4.0 Production Ready</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-white max-w-4xl leading-[1.1]">
          Unified Ingestion Layer for <span className="text-blue-500">Mission-Critical</span> Telemetry.
        </h1>
        
        <p className="max-w-2xl text-muted-foreground text-sm md:text-base mb-10 leading-relaxed font-medium">
          Высокопроизводительная платформа для сбора логов, метрик и трассировок. 
          Развернута на 128 edge-узлах. Поддержка gRPC, OTLP и REST с гарантированной доставкой.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <Link href="/dashboard" className="btn-enterprise">
            Deploy Console <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/api-docs" className="btn-outline flex items-center gap-2">
            <Code2 className="w-4 h-4" /> Documentation
          </Link>
        </div>
      </section>

      {/* Technical Features Grid */}
      <section className="container mx-auto px-4 md:px-6 py-10 border-t border-white/5 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1px bg-white/5 border border-white/5">
          {[
            {
              icon: <Database className="w-4 h-4" />,
              title: "Columnar Storage",
              desc: "Native ClickHouse integration for sub-second analytical queries over billions of rows."
            },
            {
              icon: <Shield className="w-4 h-4" />,
              title: "Zero-Trust Architecture",
              desc: "End-to-end TLS 1.3 encryption with hardware-backed key isolation (HSM)."
            },
            {
              icon: <Zap className="w-4 h-4" />,
              title: "gRPC Native",
              desc: "Binary protocol support for minimal CPU overhead and multiplexed streams."
            }
          ].map((feature, i) => (
            <div key={i} className="bg-background p-8 space-y-4">
              <div className="text-blue-500 mb-4">{feature.icon}</div>
              <h3 className="text-sm font-bold text-white uppercase tracking-tight">{feature.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CLI Section - Добавляет "человечности" и тех. веса */}
      <section className="container mx-auto px-4 md:px-6 py-20 max-w-6xl">
        <div className="bg-[#0c0c0e] border border-white/5 p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-md">
            <h2 className="text-xl font-bold mb-4">Start collecting in seconds.</h2>
            <p className="text-xs text-muted-foreground mb-6 font-medium">
              Install the Web3CyberServices agent on any Linux x86_64 or ARM64 instance using our one-line installer.
            </p>
            <div className="bg-black p-3 rounded border border-white/10 flex items-center justify-between group">
              <code className="text-[11px] font-mono text-blue-400">curl -sL https://pkg.web3cyberservices.xyz/install.sh | bash</code>
              <Terminal className="w-4 h-4 text-white/20 group-hover:text-white transition-colors cursor-pointer" />
            </div>
          </div>
          <div className="w-full md:w-auto grid grid-cols-2 gap-4">
            <div className="p-4 border border-white/5 rounded bg-white/5">
              <div className="technical-label">Binary Size</div>
              <div className="data-value mt-1">12.4 MB</div>
            </div>
            <div className="p-4 border border-white/5 rounded bg-white/5">
              <div className="technical-label">Memory Footprint</div>
              <div className="data-value mt-1">&lt; 28 MB</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
