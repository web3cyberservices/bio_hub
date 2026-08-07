
import { Check, ArrowRight, ShieldCheck, Info } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  const tiers = [
    {
      name: 'Algorithmic Trader',
      price: '$850',
      period: '/мес',
      desc: 'Базовый набор для индивидуальных алгоритмических трейдеров и MEV-поисковиков.',
      features: [
        '5 WSS эндпоинтов (Mainnet/L2)',
        'Shared Mempool Stream',
        'Лимит: 2,500 RPS',
        'Поддержка gRPC Telemetry',
        'Доступ к публичным релеям',
        'Стандартная документация API'
      ],
      cta: 'Начать работу',
      link: '/portal'
    },
    {
      name: 'Institutional MEV',
      price: '$3,200',
      period: '/мес',
      desc: 'Выделенная инфраструктура для фондов, требующая защиты от front-running.',
      features: [
        'Dedicated Bare-Metal Node',
        'Zero-Latency Fiber Links',
        'gRPC Telemetry Bypass',
        'Dark Pool Routing (Private)',
        'Приоритетный Mempool поток',
        'SLA: 99.99%',
        'Персональный Slack-канал'
      ],
      cta: 'Выбрать Institutional',
      highlighted: true,
      link: '/portal'
    },
    {
      name: 'Custom Backbone',
      price: 'Индив.',
      period: '',
      desc: 'Индивидуальные решения для провайдеров ликвидности и крупных HFT-хабов.',
      features: [
        'Cross-Region Load Balancing',
        'Выделенный BGP пиринг',
        'SLA: 99.999% (Юридический)',
        'Whitelist портов 10001-10007',
        'Аппаратная изоляция (HSM)',
        '24/7 Инженерная поддержка',
        'Custom Compression Algorithms'
      ],
      cta: 'Связаться с Sales',
      link: '/portal'
    }
  ];

  return (
    <div className="py-20 md:py-32 container mx-auto px-4 md:px-6 bg-grid">
      <div className="max-w-4xl mb-24">
        <h1 className="text-3xl md:text-6xl font-black mb-10 tracking-tighter uppercase leading-[1.05]">
          МАСШТАБИРУЕМАЯ <span className="text-blue-500">ИНФРАСТРУКТУРА</span> ДЛЯ КВАНТОВЫХ СТРАТЕГИЙ.
        </h1>
        <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-[0.2em] leading-relaxed max-w-3xl">
          ПРЯМОЙ ДОСТУП К BARE-METAL УЗЛАМ БЕЗ ОГРАНИЧЕНИЙ ТРАФИКА. ВСЕ ЦЕНЫ УКАЗАНЫ ЗА ЧИСТУЮ ПРОПУСКНУЮ СПОСОБНОСТЬ И ВЫДЕЛЕННЫЕ РЕСУРСЫ.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-white/5 border border-white/5 rounded-sm overflow-hidden mb-16">
        {tiers.map((tier) => (
          <div key={tier.name} className={`flex flex-col p-10 md:p-12 bg-black relative transition-colors hover:bg-white/[0.01] ${tier.highlighted ? 'border-y lg:border-y-0 lg:border-x border-blue-500/50' : ''}`}>
            {tier.highlighted && (
              <div className="absolute top-0 right-0 bg-blue-500 text-black text-[9px] font-black px-4 py-1.5 uppercase tracking-widest">
                Recommended
              </div>
            )}
            <div className="mb-14">
              <h3 className="text-[11px] font-black text-blue-500 mb-6 uppercase tracking-[0.3em]">{tier.name}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black tracking-tighter text-white">{tier.price}</span>
                <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{tier.period}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-6 leading-relaxed font-bold uppercase tracking-wider">{tier.desc}</p>
            </div>
            
            <ul className="space-y-5 mb-14 flex-1">
              {tier.features.map((f) => (
                <li key={f} className="text-[10px] font-bold flex items-start gap-3 leading-tight uppercase tracking-[0.15em]">
                  <Check className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" /> 
                  <span className="text-white/80">{f}</span>
                </li>
              ))}
            </ul>

            <Link 
              href={tier.link}
              className={`w-full py-5 text-[11px] text-center font-black transition-all flex items-center justify-center gap-2 uppercase tracking-[0.3em] ${tier.highlighted ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'}`}
            >
              {tier.cta} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </div>

      <div className="bg-blue-500/5 border border-blue-500/20 p-8 rounded-sm flex items-start gap-6 max-w-4xl mx-auto">
        <Info className="w-6 h-6 text-blue-500 shrink-0 mt-1" />
        <div className="space-y-2">
          <h4 className="text-[11px] font-black text-white uppercase tracking-widest">ВАЖНОЕ УВЕДОМЛЕНИЕ О КОМПЛАЕНСЕ</h4>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-relaxed">
            В СВЯЗИ СО СТРОГОЙ ПОЛИТИКОЙ AML/KYC, ВСЕ НОВЫЕ ТЕНАНТЫ ДОЛЖНЫ ПРОЙТИ ВЕРИФИКАЦИЮ СООТВЕТСТВИЯ ПЕРЕД ВЫПУСКОМ API-КЛЮЧЕЙ. 
            ДОСТУП К ВЫДЕЛЕННЫМ ПОРТАМ ПРЕДОСТАВЛЯЕТСЯ ТОЛЬКО ПОСЛЕ ПОДПИСАНИЯ СООТВЕТСТВУЮЩЕГО СОГЛАШЕНИЯ (MSA).
          </p>
        </div>
      </div>
    </div>
  );
}
