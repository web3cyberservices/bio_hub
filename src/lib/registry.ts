
/**
 * Единый реестр услуг и тарифных планов для обеспечения синхронизации данных.
 */
export const SERVICES = [
  { 
    id: 'osint', 
    name: 'OSINT и Агрегация данных', 
    href: '/services/osint', 
    desc: 'Разведка на основе открытых источников и мониторинг рисков.',
    capabilities: [
      { title: "Dark Web Monitoring", desc: "Постоянное сканирование теневых форумов и баз данных на предмет утечек учетных записей." },
      { title: "Asset Discovery", desc: "Выявление всех публично доступных ИТ-активов компании, включая забытые поддомены." },
      { title: "Supply Chain Risk", desc: "Оценка безопасности сторонних вендоров и партнеров для предотвращения атак через цепочку поставок." },
      { title: "KYC/KYB Intelligence", desc: "Глубокая проверка контрагентов в рамках 115-ФЗ: анализ связей и выявление бенефициаров." },
      { title: "Brand Protection", desc: "Мониторинг фишинговых доменов и неправомерного использования бренда." },
      { title: "Compliance Reporting", desc: "Формирование юридически значимых отчетов для отделов ИБ и комплаенс-контроля." }
    ]
  },
  { 
    id: 'streaming', 
    name: 'Потоковые данные (gRPC)', 
    href: '/services/data-streaming', 
    desc: 'Магистральные каналы доставки рыночных данных с минимальной задержкой.',
    capabilities: [
      { title: "Native gRPC / Protobuf", desc: "Бинарный протокол передачи данных, минимизирующий оверхед на сериализацию." },
      { title: "SmartNIC Acceleration", desc: "Обработка пакетов на уровне сетевых карт FPGA, исключающая системные задержки." },
      { title: "Zero-Latency WSS", desc: "Сырые WebSocket потоки для моментальной доставки событий мемпула." },
      { title: "Dedicated Mempool Feed", desc: "Выделенный поток необработанных транзакций с защитой от фронтраннинга." },
      { title: "Cross-Region Peering", desc: "Прямые стыки во Франкфурте, Лондоне и Сингапуре." },
      { title: "mTLS Authentication", desc: "Двусторонняя криптографическая проверка сертификатов для защиты канала." }
    ]
  },
  { 
    id: 'pentest', 
    name: 'Pentest и Аудит ИБ', 
    href: '/services/pentest', 
    desc: 'Комплексный аудит безопасности и имитация APT атак.',
    capabilities: [
      { title: "Black / Grey / White Box", desc: "Тестирование с разным уровнем входных данных для имитации различных векторов атак." },
      { title: "Анализ API и Microservices", desc: "Глубокий аудит gRPC, REST и GraphQL эндпоинтов." },
      { title: "Сетевая инфраструктура", desc: "Проверка сегментации сетей и устойчивости к атакам на уровне L2-L4." },
      { title: "Автоматизированный DAST/SAST", desc: "Интеграция сканеров в CI/CD пайплайны с кастомными сигнатурами." },
      { title: "Аудит прав доступа (IAM)", desc: "Верификация политик RBAC/ABAC и выявление возможностей повышения привилегий." },
      { title: "Compliance-аудит", desc: "Подготовка к сертификации по стандартам 152-ФЗ, PCI DSS и ISO 27001." }
    ]
  },
  { 
    id: 'telemetry', 
    name: 'B2B Телеметрия', 
    href: '/services/telemetry', 
    desc: 'Предиктивный мониторинг инфраструктуры на базе eBPF.',
    capabilities: [
      { title: "eBPF Observability", desc: "Сбор метрик на уровне ядра ОС с нулевым влиянием на производительность." },
      { title: "High-Frequency Sampling", desc: "Сбор данных с частотой до 1мс для обнаружения микро-всплесков трафика." },
      { title: "Anomaly Detection", desc: "Машинное обучение для выявления отклонений от нормального поведения системы." },
      { title: "Hardware Telemetry", desc: "Мониторинг температуры ASIC, вольтажа SmartNIC и состояния памяти." },
      { title: "Network Flow Analysis", desc: "Детальная визуализация L2-L7 трафика с идентификацией протоколов." },
      { title: "Auto-Scaling Alerts", desc: "Интеграция с системами оркестрации для автоматического масштабирования ресурсов." }
    ]
  },
  { 
    id: 'devsecops', 
    name: 'DevSecOps Консалтинг', 
    href: '/services/devsecops', 
    desc: 'Автоматизация ИБ и внедрение Secure SDLC.',
    capabilities: [
      { title: "Pipeline Security", desc: "Внедрение SAST/DAST сканеров в GitLab CI, Jenkins или GitHub Actions." },
      { title: "Infrastructure as Code", desc: "Безопасное развертывание через Terraform и Ansible с проверкой политик OPA." },
      { title: "Secret Management", desc: "Централизованное управление секретами с использованием HashiCorp Vault." },
      { title: "Software Bill of Materials", desc: "Автоматическая генерация SBOM и мониторинг уязвимостей в библиотеках." },
      { title: "Container Hardening", desc: "Настройка политик безопасности для Docker и Kubernetes." },
      { title: "Compliance as Code", desc: "Автоматизация проверок на соответствие 152-ФЗ непосредственно в процессе деплоя." }
    ]
  }
];

export const PLANS = [
  {
    name: 'Algorithmic Trader',
    price: '$850',
    period: '/мес',
    desc: 'Базовый набор для индивидуальных трейдеров.',
    features: [
      'Shared gRPC Stream (2,500 RPS)',
      'Telemetry (Public Relays)',
      'OSINT Basic Intelligence'
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
      'Dedicated gRPC Node (Zero-Latency)',
      'Full B2B Telemetry Suite',
      'Advanced OSINT Monitoring',
      'Initial Pentest Audit'
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
      'Unlimited gRPC Throughput',
      'Custom DevSecOps Pipeline',
      'Full Infrastructure Pentest',
      '24/7 Dedicated Engineers'
    ],
    highlighted: false,
    cta: 'Связаться с Sales',
    link: '/portal'
  }
];
