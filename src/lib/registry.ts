
/**
 * Единый реестр услуг и тарифных планов для обеспечения синхронизации данных.
 */
export const SERVICES = [
  { 
    id: 'osint', 
    name: 'OSINT и Агрегация данных', 
    href: '/services/osint', 
    desc: 'Разведка на основе открытых источников и мониторинг рисков.' 
  },
  { 
    id: 'streaming', 
    name: 'Потоковые данные (gRPC)', 
    href: '/services/data-streaming', 
    desc: 'Магистральные каналы доставки рыночных данных с минимальной задержкой.' 
  },
  { 
    id: 'pentest', 
    name: 'Pentest и Аудит ИБ', 
    href: '/services/pentest', 
    desc: 'Комплексный аудит безопасности и имитация APT атак.' 
  },
  { 
    id: 'telemetry', 
    name: 'B2B Телеметрия', 
    href: '/services/telemetry', 
    desc: 'Предиктивный мониторинг инфраструктуры на базе eBPF.' 
  },
  { 
    id: 'devsecops', 
    name: 'DevSecOps Консалтинг', 
    href: '/services/devsecops', 
    desc: 'Автоматизация ИБ и внедрение Secure SDLC.' 
  }
];

export const PLANS = [
  {
    name: 'Algorithmic Trader',
    price: '$850',
    period: '/мес',
    desc: 'Базовый набор для индивидуальных трейдеров.',
    features: [
      'Доступ к OSINT базового уровня',
      'Shared gRPC Stream (2,500 RPS)',
      'Telemetry (Public Relays)',
      'Стандартная поддержка'
    ],
    highlighted: false,
    cta: 'Начать работу',
    link: '/portal'
  },
  {
    name: 'Institutional MEV',
    price: '$3,200',
    period: '/мес',
    desc: 'Выделенная инфраструктура для фондов.',
    features: [
      'Полный OSINT мониторинг',
      'Dedicated gRPC Node (Zero-Latency)',
      'B2B Telemetry Advanced',
      'Initial Pentest Audit',
      'SLA: 99.99%'
    ],
    highlighted: true,
    cta: 'Выбрать Institutional',
    link: '/portal'
  },
  {
    name: 'Custom Backbone',
    price: 'Индив.',
    period: '',
    desc: 'Решения для провайдеров ликвидности.',
    features: [
      'Custom DevSecOps Pipeline',
      'Full Infrastructure Pentest',
      'Unlimited gRPC Throughput',
      '24/7 Dedicated Engineers',
      'Юридический SLA 99.999%'
    ],
    highlighted: false,
    cta: 'Связаться с Sales',
    link: '/portal'
  }
];
