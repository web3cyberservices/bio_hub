
import { Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  const tiers = [
    {
      name: 'Developer',
      price: '$0',
      period: '/mo',
      desc: 'Для персональных проектов и тестирования API.',
      features: ['5 GB/mo Ingestion', '7 Days Retention', '1 API Key', 'Shared Ingestion Node', 'Community Support'],
      cta: 'Start Building',
      link: '#'
    },
    {
      name: 'Pro',
      price: '$299',
      period: '/mo',
      desc: 'Для растущих систем и команд разработки.',
      features: ['500 GB/mo Ingestion', '30 Days Retention', 'Unlimited API Keys', 'Dedicated Ingestion Pipeline', 'gRPC Native Support', '24/7 Priority Support'],
      cta: 'Choose Pro Plan',
      highlighted: true,
      link: 'https://app.lava.top/products/52abb33c-7a6d-4667-80df-c22730b988c6'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      desc: 'Для крупного бизнеса и критической инфраструктуры.',
      features: ['Unlimited Data Flow', 'Retention up to 10 Years', 'Dedicated Region Nodes', 'Custom SLA (99.999%)', 'Compliance & Security Audit', 'Dedicated Account Manager'],
      cta: 'Contact Sales',
      link: '#'
    }
  ];

  return (
    <div className="py-24 container mx-auto px-4">
      <div className="text-center mb-20">
        <h1 className="text-5xl font-black uppercase mb-6 tracking-tighter">Scale your Ingestion</h1>
        <p className="text-muted-foreground max-w-xl mx-auto font-medium">
          Прозрачное ценообразование без скрытых платежей. Платите за объем обрабатываемых данных, а не за количество серверов.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
        {tiers.map((tier) => (
          <div key={tier.name} className={`flex flex-col p-8 glass-panel relative ${tier.highlighted ? 'border-primary shadow-[0_0_40px_-15px_rgba(37,99,235,0.3)]' : ''}`}>
            {tier.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-background text-[9px] font-black px-4 py-1 rounded-full uppercase tracking-widest">
                Recommended
              </div>
            )}
            <div className="mb-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4">{tier.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black">{tier.price}</span>
                <span className="text-muted-foreground text-sm font-bold">{tier.period}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-4 leading-relaxed font-medium">{tier.desc}</p>
            </div>
            
            <ul className="space-y-4 mb-10 flex-1">
              {tier.features.map((f) => (
                <li key={f} className="text-[10px] font-bold flex items-start gap-3 uppercase tracking-wider leading-tight">
                  <Check className="w-3 h-3 text-primary shrink-0 mt-0.5" /> 
                  <span className="text-white/80">{f}</span>
                </li>
              ))}
            </ul>

            <Link 
              href={tier.link}
              target={tier.link.startsWith('http') ? '_blank' : '_self'}
              className={`w-full py-4 text-[10px] text-center font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${tier.highlighted ? 'bg-primary text-primary-foreground hover:opacity-90' : 'bg-white/5 hover:bg-white/10 border border-white/10'}`}
            >
              {tier.cta} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
