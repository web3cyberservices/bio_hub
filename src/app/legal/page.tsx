
'use client';

import { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Lock, 
  Scale, 
  AlertTriangle, 
  ChevronRight,
  Info
} from 'lucide-react';

export default function LegalPage() {
  const [activeTab, setActiveTab] = useState('offer');

  const sections = [
    { id: 'offer', label: 'Публичная оферта', icon: <FileText className="w-4 h-4" /> },
    { id: 'privacy', label: 'Персональные данные (152-ФЗ)', icon: <Lock className="w-4 h-4" /> },
    { id: 'aml', label: 'AML/KYC Политика (115-ФЗ)', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-black text-white py-20 px-4 md:px-6 bg-grid">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-16 border-b border-white/10 pb-12">
          <div className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">ЮРИДИЧЕСКИЙ ДЕПАРТАМЕНТ</div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase mb-6">Правовые документы и комплаенс</h1>
          <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-[0.2em] max-w-2xl">
            Официальные условия использования инфраструктуры ООО «Веб3 Сайбер Сервисес». 
            Все сервисы предоставляются в строгом соответствии с ГК РФ и федеральными законами.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Навигация */}
          <aside className="lg:col-span-3">
            <nav className="space-y-1 sticky top-28">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveTab(section.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all border ${
                    activeTab === section.id 
                      ? 'bg-white text-black border-white' 
                      : 'bg-transparent text-muted-foreground border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {section.icon}
                    {section.label}
                  </div>
                  <ChevronRight className={`w-3 h-3 transition-transform ${activeTab === section.id ? 'rotate-90 text-black' : ''}`} />
                </button>
              ))}
            </nav>
            
            <div className="mt-12 p-6 border border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-2 text-blue-500 mb-4 text-[9px] font-black uppercase tracking-widest">
                <Info className="w-3.5 h-3.5" /> Юридические реквизиты
              </div>
              <div className="text-[9px] text-muted-foreground leading-relaxed uppercase font-bold space-y-2">
                <p>ООО «ВЕБ3 САЙБЕР СЕРВИСЕС»</p>
                <p>ОГРН: 1267700012345</p>
                <p>ИНН/КПП: 7701001001 / 770101001</p>
                <p>Адрес: 123112, г. Москва, Пресненская наб., д. 12</p>
              </div>
            </div>
          </aside>

          {/* Контентная область */}
          <main className="lg:col-span-9 space-y-8 pb-32">
            
            {activeTab === 'offer' && (
              <section className="prose prose-invert max-w-none">
                <h2 className="text-xl font-black uppercase tracking-widest mb-8 pb-4 border-b border-white/10">Публичная оферта на оказание услуг IaaS</h2>
                <div className="text-[11px] leading-relaxed space-y-6 font-medium text-gray-300 uppercase tracking-wide">
                  <p className="font-bold">1. ПРЕДМЕТ ДОГОВОРА</p>
                  <p>
                    1.1. Настоящий документ является публичной офертой ООО «Веб3 Сайбер Сервисес» (далее — Исполнитель) 
                    и содержит все существенные условия договора по предоставлению вычислительных мощностей (Bare-metal RPC узлы) 
                    и программных интерфейсов доступа к телеметрическим данным (далее — Услуги).
                  </p>
                  <p>
                    1.2. Услуги носят исключительно информационно-технологический характер (IaaS/SaaS). 
                    Исполнитель не является финансовой организацией и не предоставляет услуги по доверительному управлению активами.
                  </p>

                  <p className="font-bold">2. СООТВЕТСТВИЕ 259-ФЗ «О ЦИФРОВЫХ ФИНАНСОВЫХ АКТИВАХ»</p>
                  <p>
                    2.1. Исполнитель уведомляет Заказчика, что предоставляемая инфраструктура предназначена для анализа данных и маршрутизации технических запросов. 
                    Исполнитель не осуществляет выпуск, обмен, хранение или учет цифровых финансовых активов.
                  </p>
                  <p>
                    2.2. Расчеты за Услуги производятся строго в безналичном порядке в валюте Российской Федерации (рубль) на основании выставленных счетов.
                  </p>

                  <p className="font-bold">3. ОГРАНИЧЕНИЕ ОТВЕТСТВЕННОСТИ</p>
                  <p>
                    3.1. Исполнитель не несет ответственности за финансовые результаты торговых стратегий Заказчика, реализованных с использованием предоставляемого API.
                  </p>
                </div>
              </section>
            )}

            {activeTab === 'privacy' && (
              <section className="prose prose-invert max-w-none">
                <h2 className="text-xl font-black uppercase tracking-widest mb-8 pb-4 border-b border-white/10">Политика обработки персональных данных (152-ФЗ)</h2>
                <div className="text-[11px] leading-relaxed space-y-6 font-medium text-gray-300 uppercase tracking-wide">
                  <p>
                    Настоящая Политика определяет порядок обработки и защиты персональных данных физических лиц, 
                    представляющих интересы корпоративных клиентов (Заказчиков).
                  </p>

                  <p className="font-bold">1. КАТЕГОРИИ СОБИРАЕМЫХ ДАННЫХ</p>
                  <p>
                    Оператор осуществляет обработку следующих данных: адрес электронной почты, IP-адрес доступа, технические идентификаторы торговых алгоритмов, 
                    сведения о корпоративной принадлежности.
                  </p>

                  <p className="font-bold">2. ЦЕЛИ ОБРАБОТКИ</p>
                  <p>
                    Данные обрабатываются исключительно в целях обеспечения безопасности gRPC-туннелей, предотвращения несанкционированного доступа 
                    и исполнения обязательств по Договору.
                  </p>

                  <p className="font-bold">3. ТЕХНИЧЕСКИЕ ЛОГИ И ЛОКАЛИЗАЦИЯ</p>
                  <div className="bg-white/5 border border-white/10 p-6 rounded-sm">
                    <p className="text-[10px] leading-relaxed">
                      В соответствии с требованиями законодательства РФ о локализации данных, серверные мощности Оператора, 
                      используемые для хранения данных Заказчиков, физически расположены на территории Российской Федерации. 
                      Технические логи телеметрии хранятся не более 7 (семи) календарных дней.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'aml' && (
              <section className="prose prose-invert max-w-none">
                <h2 className="text-xl font-black uppercase tracking-widest mb-8 pb-4 border-b border-white/10">AML/KYC Политика и мониторинг (115-ФЗ)</h2>
                <div className="text-[11px] leading-relaxed space-y-6 font-medium text-gray-300 uppercase tracking-wide">
                  <p className="font-bold">1. ПРОЦЕДУРА ВЕРИФИКАЦИИ (KYB/KYC)</p>
                  <p>
                    Учитывая специфику работы с высокочастотной телеметрией и мемпулом сетей, каждый корпоративный клиент 
                    обязан пройти процедуру идентификации бенефициарных владельцев в соответствии с нормами 115-ФЗ.
                  </p>

                  <p className="font-bold">2. МОНИТОРИНГ АНОМАЛЬНОЙ АКТИВНОСТИ</p>
                  <div className="bg-red-500/5 border border-red-500/20 p-6 flex items-start gap-4">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-red-400 font-black">
                      ИСПОЛНИТЕЛЬ ОСУЩЕСТВЛЯЕТ ПОСТОЯННЫЙ ТЕХНИЧЕСКИЙ АНАЛИЗ ВХОДЯЩЕГО ТРАФИКА. В СЛУЧАЕ ОБНАРУЖЕНИЯ АНОМАЛЬНОЙ СЕТЕВОЙ АКТИВНОСТИ 
                      ИЛИ ПРИЗНАКОВ ИСПОЛЬЗОВАНИЯ ИНФРАСТРУКТУРЫ ДЛЯ НЕЗАКОННЫХ ФИНАНСОВЫХ ОПЕРАЦИЙ, ДОСТУП К GRPC-ТУННЕЛЯМ МОЖЕТ БЫТЬ ОГРАНИЧЕН 
                      В ОДНОСТОРОННЕМ ПОРЯДКЕ БЕЗ ПРЕДВАРИТЕЛЬНОГО УВЕДОМЛЕНИЯ.
                    </p>
                  </div>

                  <p className="font-bold">3. ОТКАЗ В ОБСЛУЖИВАНИИ</p>
                  <p>
                    Компания оставляет за собой право отказать в регистрации Личного кабинета (Provision Tenant) при непредоставлении 
                    запрошенных документов или при наличии Заказчика в списках лиц, связанных с финансированием терроризма.
                  </p>
                </div>
              </section>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
