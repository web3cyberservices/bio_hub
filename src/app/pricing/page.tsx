import { Check, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  const tiers = [
    {
      name: 'Разработчик',
      price: '$0',
      period: '/мес',
      desc: 'Для персональных проектов и тестирования API протоколов.',
      features: [
        '5 ГБ/мес данных',
        '7 дней хранения',
        '1 API ключ',
        'Общий узел приема',
        'Базовая поддержка'
      ],
      cta: 'Начать разработку',
      link: '#'
    },
    {
      name: 'Профессиональный',
      price: '$299',
      period: '/мес',
      desc: 'Для растущих систем и высоконагруженных приложений.',
      features: [
        '500 ГБ/мес данных',
        '30 дней хранения',
        'Безлимитные API ключи',
        'Выделенный gRPC пайплайн',
        'Приоритетная поддержка 24/7',
        'Аналитика в реальном времени'
      ],
      cta: 'Выбрать Pro',
      highlighted: true,
      link: 'https://app.lava.top/products/52abb33c-7a6d-4667-80df-c22730b988c6'
    },
    {
      name: 'Предприятие',
      price: 'Индив.',
      period: '',
      desc: 'Для крупного бизнеса и критически важной инфраструктуры.',
      features: [
        'Безлимитный поток данных',
        'Хранение до 10 лет',
        'Выделенные региональные узлы',
        'Кастомный SLA (99.999%)',
        'Аудит безопасности SOC2',
        'Персональный менеджер'
      ],
      cta: 'Связаться с нами',
      link: '#'
    }
  ];

  return (
    <div className="py-32 container mx-auto px-6">
      <div className="max-w-3xl mb-24">
        <div className="text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> Прозрачное ценообразование
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-none">Масштабируйте сбор данных</h1>
        <p className="text-muted-foreground text-sm font-medium leading-loose">
          Платите только за объем обрабатываемых данных. Никаких скрытых платежей или ограничений по количеству серверов в вашей сети.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-1px bg-white/5 border border-white/5 rounded-sm overflow-hidden shadow-2xl items-stretch">
        {tiers.map((tier) => (
          <div key={tier.name} className={`flex flex-col p-12 bg-background relative transition-colors hover:bg-white/[0.01] ${tier.highlighted ? 'z-10 shadow-[0_0_80px_-20px_rgba(37,99,235,0.2)]' : ''}`}>
            {tier.highlighted && (
              <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
            )}
            <div className="mb-12">
              <h3 className="text-[12px] font-black text-primary mb-6">{tier.name}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black tracking-tighter">{tier.price}</span>
                <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{tier.period}</span>
              </div>
              <p className="text-[12px] text-muted-foreground mt-6 leading-relaxed font-bold">{tier.desc}</p>
            </div>
            
            <ul className="space-y-5 mb-16 flex-1">
              {tier.features.map((f) => (
                <li key={f} className="text-[12px] font-black flex items-start gap-4 leading-tight">
                  <Check className="w-3.5 h-3.5 text-primary shrink-0" /> 
                  <span className="text-white/80">{f}</span>
                </li>
              ))}
            </ul>

            <Link 
              href={tier.link}
              target={tier.link.startsWith('http') ? '_blank' : '_self'}
              className={`w-full py-5 text-[12px] text-center font-black transition-all flex items-center justify-center gap-3 ${tier.highlighted ? 'bg-primary text-primary-foreground hover:bg-white hover:text-black' : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'}`}
            >
              {tier.cta} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>
      
      <div className="mt-20 text-center">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
          Нужно индивидуальное решение? <Link href="#" className="text-primary border-b border-primary/30 hover:border-primary transition-colors">Обсудить с архитектором</Link>
        </p>
      </div>
    </div>
  );
}
