
import { Check, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  const tiers = [
    {
      name: 'Узел Разработчика',
      price: '$499',
      period: '/мес',
      desc: 'Базовый доступ к инфраструктуре для отладки и тестирования.',
      features: [
        'Общий Mempool поток',
        'Стандартный HTTP-RPC протокол',
        'Лимит: 100 запросов/сек',
        'Shared Ingress эндпоинты',
        'Базовая телеметрия (Delay > 200ms)',
        'Поддержка через тикет-систему'
      ],
      cta: 'Заказать Node',
      link: '/portal'
    },
    {
      name: 'Institutional MEV-Protect',
      price: '$2,500',
      period: '/мес',
      desc: 'Выделенная инфраструктура для алгоритмической торговли с защитой от сэндвич-атак.',
      features: [
        'Dedicated Bare-Metal RPC',
        'gRPC Telemetry Bypass',
        'Оптико-волоконные линки (0-latency)',
        'Dark Pool роутинг транзакций',
        'Защита от Front-running',
        'SLA: 99.99%',
        'Приоритетный доступ к Mempool'
      ],
      cta: 'Выбрать Institutional',
      highlighted: true,
      link: '/portal'
    },
    {
      name: 'Custom Backbone',
      price: 'Индив.',
      period: '',
      desc: 'Индивидуальные решения для крупных HFT-фондов и провайдеров ликвидности.',
      features: [
        'SLA: 99.999% (Гарантированный)',
        'Приватный BGP пиринг',
        'Выделенные порты 10001-10007',
        'Аппаратная изоляция ключей (HSM)',
        'Кастомные алгоритмы сжатия потока',
        'Персональный архитектор 24/7'
      ],
      cta: 'Связаться с Sales',
      link: '/portal'
    }
  ];

  return (
    <div className="py-16 md:py-32 container mx-auto px-4 md:px-6 bg-grid">
      <div className="max-w-4xl mb-20">
        <div className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> ИНСТИТУЦИОНАЛЬНОЕ ЦЕНООБРАЗОВАНИЕ
        </div>
        <h1 className="text-3xl md:text-5xl font-black mb-8 tracking-tighter uppercase leading-[1.1]">
          МАСШТАБИРУЕМАЯ <span className="text-blue-500">ИНФРАСТРУКТУРА</span> ДЛЯ WEB3 АКТИВОВ.
        </h1>
        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest leading-relaxed max-w-2xl">
          ПРЯМОЙ ДОСТУП К BARE-METAL УЗЛАМ С МИНИМАЛЬНОЙ ЗАДЕРЖКОЙ. БЕЗ СКРЫТЫХ КОМИССИЙ ЗА ТРАФИК.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-white/5 border border-white/5 rounded-sm overflow-hidden">
        {tiers.map((tier) => (
          <div key={tier.name} className={`flex flex-col p-8 md:p-10 bg-black relative transition-colors hover:bg-white/[0.01] ${tier.highlighted ? 'border-y lg:border-y-0 lg:border-x border-blue-500/50' : ''}`}>
            <div className="mb-12">
              <h3 className="text-[10px] font-black text-blue-500 mb-4 uppercase tracking-[0.2em]">{tier.name}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black tracking-tighter text-white">{tier.price}</span>
                <span className="text-muted-foreground text-[9px] font-black uppercase tracking-widest">{tier.period}</span>
              </div>
              <p className="text-[9px] text-muted-foreground mt-4 leading-relaxed font-bold uppercase tracking-widest">{tier.desc}</p>
            </div>
            
            <ul className="space-y-4 mb-12 flex-1">
              {tier.features.map((f) => (
                <li key={f} className="text-[9px] font-bold flex items-start gap-3 leading-tight uppercase tracking-wider">
                  <Check className="w-3 h-3 text-blue-500 shrink-0 mt-0.5" /> 
                  <span className="text-white/70">{f}</span>
                </li>
              ))}
            </ul>

            <Link 
              href={tier.link}
              className={`w-full py-4 text-[10px] text-center font-black transition-all flex items-center justify-center gap-2 uppercase tracking-widest ${tier.highlighted ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'}`}
            >
              {tier.cta} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
