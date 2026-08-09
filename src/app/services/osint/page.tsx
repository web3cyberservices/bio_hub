
import { Search, Shield, Database, Globe, AlertTriangle, FileCheck, Target, Zap, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function OsintPage() {
  return (
    <div className="min-h-screen bg-grid py-20 md:py-32">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Hero Section */}
        <div className="mb-24 border-b border-white/10 pb-16">
          <div className="flex flex-wrap gap-3 mb-8">
            <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[9px] font-black uppercase tracking-widest rounded-full">
              SLA 99.9% Data Freshness
            </span>
            <span className="px-3 py-1 bg-white/5 border border-white/10 text-white/60 text-[9px] font-black uppercase tracking-widest rounded-full">
              Compliance: 152-FZ / GDPR / 115-FZ
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-[1.05]">
            Агрегация данных и мониторинг <br className="hidden lg:block" /> цифровых рисков (OSINT)
          </h1>
          <p className="text-[13px] md:text-[15px] text-muted-foreground font-medium tracking-wide max-w-3xl leading-relaxed mb-10">
            Профессиональная разведка на основе открытых и специализированных источников. Мы предоставляем 
            комплексный анализ цифрового следа организации, мониторинг утечек в Dark Web и оценку 
            надежности контрагентов с использованием автоматизированных алгоритмов анализа связей.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <a href="#b2b-form" className="btn-enterprise py-4 px-8 text-[11px]">
              Запросить расчет стоимости (B2B)
            </a>
            <Link href="/api-docs" className="btn-outline py-4 px-8 text-[11px]">
              Технический регламент
            </Link>
          </div>
        </div>

        {/* Technical Capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
          {[
            {
              icon: <Database className="w-6 h-6 text-blue-500" />,
              title: "Dark Web Monitoring",
              desc: "Постоянное сканирование теневых форумов и баз данных на предмет утечек учетных записей, API-ключей и конфиденциальной документации."
            },
            {
              icon: <Target className="w-6 h-6 text-blue-500" />,
              title: "Asset Discovery",
              desc: "Выявление всех публично доступных ИТ-активов компании, включая забытые поддомены, открытые порты и незащищенные облачные хранилища."
            },
            {
              icon: <Globe className="w-6 h-6 text-blue-500" />,
              title: "Supply Chain Risk",
              desc: "Оценка безопасности сторонних вендоров и партнеров для предотвращения атак через цепочку поставок (Supply Chain Attacks)."
            },
            {
              icon: <Shield className="w-6 h-6 text-blue-500" />,
              title: "KYC/KYB Intelligence",
              desc: "Глубокая проверка контрагентов в рамках 115-ФЗ: анализ связей, выявление конечных бенефициаров и проверка по санкционным спискам."
            },
            {
              icon: <AlertTriangle className="w-6 h-6 text-blue-500" />,
              title: "Brand Protection",
              desc: "Мониторинг фишинговых доменов, поддельных мобильных приложений и неправомерного использования бренда в цифровом пространстве."
            },
            {
              icon: <FileCheck className="w-6 h-6 text-blue-500" />,
              title: "Compliance Reporting",
              desc: "Формирование юридически значимых отчетов о результатах проверки для предоставления в отделы ИБ и комплаенс-контроля."
            }
          ].map((item, i) => (
            <div key={i} className="p-10 border border-white/10 bg-black/40 backdrop-blur-sm space-y-6 hover:border-blue-500/30 transition-colors">
              {item.icon}
              <h3 className="text-lg font-black text-white tracking-tighter">{item.title}</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed font-bold tracking-wider">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Workflow */}
        <div className="mb-32">
          <h2 className="technical-label mb-16 text-blue-500 text-center">Процесс оказания услуг</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-white/10 border border-white/10">
            {[
              { step: "01", title: "NDA & Scope", desc: "Подписание договора о неразглашении и согласование объектов мониторинга (домены, бренды, ФИО)." },
              { step: "02", title: "Active Collection", desc: "Сбор данных из открытых источников, форумов, блокчейн-сетей и баз данных утечек." },
              { step: "03", title: "Analysis & Scoring", desc: "Верификация найденных данных, оценка критичности рисков и приоритизация угроз." },
              { step: "04", title: "Executive Delivery", desc: "Передача детализированного отчета с практическими рекомендациями по минимизации рисков." }
            ].map((item, i) => (
              <div key={i} className="p-8 bg-black space-y-6">
                <div className="text-2xl font-black text-white/10">{item.step}</div>
                <h4 className="text-[12px] font-black text-white uppercase tracking-widest">{item.title}</h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed font-bold">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* B2B Form */}
        <section id="b2b-form" className="max-w-3xl mx-auto border border-white/10 bg-white/[0.02] p-10 md:p-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-black tracking-tighter text-white mb-4">Запрос на OSINT-исследование</h2>
            <p className="text-[10px] text-muted-foreground font-black tracking-widest uppercase">Конфиденциальность гарантирована</p>
          </div>
          
          <form className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Компания / ИНН</label>
                <input type="text" className="w-full bg-white/5 border border-white/10 p-4 text-[11px] text-white focus:border-blue-500 outline-none transition-all" placeholder="ООО Аналитика / 7725..." required />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Рабочий E-mail</label>
                <input type="email" className="w-full bg-white/5 border border-white/10 p-4 text-[11px] text-white focus:border-blue-500 outline-none transition-all" placeholder="security@corp.ru" required />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Объект исследования</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 p-4 text-[11px] text-white focus:border-blue-500 outline-none transition-all" placeholder="Доменное имя, название бренда или список контрагентов" required />
            </div>
            
            <div className="space-y-2">
              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Цели и задачи</label>
              <textarea className="w-full bg-white/5 border border-white/10 p-4 text-[11px] text-white focus:border-blue-500 outline-none transition-all h-32 resize-none" placeholder="Укажите специфику: поиск утечек, проверка партнера или мониторинг бренда..."></textarea>
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" id="compliance" className="mt-1" required />
              <label htmlFor="compliance" className="text-[9px] text-muted-foreground font-bold leading-relaxed tracking-wider">
                Я подтверждаю согласие на обработку персональных данных и ознакомлен с политикой конфиденциальности Исполнителя.
              </label>
            </div>

            <button type="submit" className="w-full btn-enterprise py-5 text-[11px]">
              Отправить запрос на аудит
            </button>
          </form>
        </section>

      </div>
    </div>
  );
}
