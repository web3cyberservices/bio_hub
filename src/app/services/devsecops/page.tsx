
import { Terminal, Layers, Settings, ShieldCheck, Zap, Server, Code, FileCode, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function DevSecOpsPage() {
  return (
    <div className="min-h-screen bg-grid py-20 md:py-32">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Hero Section */}
        <div className="mb-24 border-b border-white/10 pb-16">
          <div className="flex flex-wrap gap-3 mb-8">
            <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[9px] font-black uppercase tracking-widest rounded-full">
              Secure SDLC Implementation
            </span>
            <span className="px-3 py-1 bg-white/5 border border-white/10 text-white/60 text-[9px] font-black uppercase tracking-widest rounded-full">
              ISO 27001 / NIST CSF Alignment
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-[1.05]">
            DevSecOps Консалтинг и <br className="hidden lg:block" /> автоматизация ИБ
          </h1>
          <p className="text-[13px] md:text-[15px] text-muted-foreground font-medium tracking-wide max-w-3xl leading-relaxed mb-10">
            Трансформация цикла разработки ПО в безопасную экосистему. Мы интегрируем инструменты 
            контроля безопасности непосредственно в ваши CI/CD пайплайны, обеспечивая выявление 
            уязвимостей на ранних стадиях (Shift Left) и автоматизируя комплаенс.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <a href="#b2b-form" className="btn-enterprise py-4 px-8 text-[11px]">
              Запросить аудит процессов (B2B)
            </a>
            <Link href="/api-docs" className="btn-outline py-4 px-8 text-[11px]">
              Методология внедрения
            </Link>
          </div>
        </div>

        {/* Technical Capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
          {[
            {
              icon: <Terminal className="w-6 h-6 text-blue-500" />,
              title: "Pipeline Security Integration",
              desc: "Внедрение SAST/DAST сканеров в GitLab CI, Jenkins или GitHub Actions для автоматической блокировки небезопасного кода."
            },
            {
              icon: <Layers className="w-6 h-6 text-blue-500" />,
              title: "Infrastructure as Code (IaC)",
              desc: "Безопасное развертывание инфраструктуры через Terraform и Ansible с автоматической проверкой политик безопасности (OPA)."
            },
            {
              icon: <ShieldCheck className="w-6 h-6 text-blue-500" />,
              title: "Secret Management",
              desc: "Централизованное управление секретами и API-ключами с использованием HashiCorp Vault или аналогичных решений."
            },
            {
              icon: <Code className="w-6 h-6 text-blue-500" />,
              title: "Software Bill of Materials",
              desc: "Автоматическая генерация SBOM и мониторинг уязвимостей в сторонних библиотеках (SCA) в режиме реального времени."
            },
            {
              icon: <Server className="w-6 h-6 text-blue-500" />,
              title: "Container & K8s Hardening",
              desc: "Настройка политик безопасности для Docker и Kubernetes, включая контроль рантайма и сетевую сегментацию."
            },
            {
              icon: <FileCode className="w-6 h-6 text-blue-500" />,
              title: "Compliance as Code",
              desc: "Автоматизация проверок на соответствие стандартам PCI DSS, 152-ФЗ и SOC2 непосредственно в процессе деплоя."
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
          <h2 className="technical-label mb-16 text-blue-500 text-center">План внедрения DevSecOps</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-white/10 border border-white/10">
            {[
              { step: "01", title: "Gap Analysis", desc: "Анализ текущих процессов разработки и выявление узких мест в безопасности." },
              { step: "02", title: "Tooling Setup", desc: "Подбор и интеграция инструментов сканирования и управления секретами в пайплайны." },
              { step: "03", title: "Policy Definition", desc: "Настройка правил блокировки сборки при обнаружении критических уязвимостей." },
              { step: "04", title: "Staff Training", desc: "Обучение команды разработчиков и инженеров эксплуатации лучшим практикам безопасного кодинга." }
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
            <h2 className="text-2xl font-black tracking-tighter text-white mb-4">Запрос на DevSecOps консалтинг</h2>
            <p className="text-[10px] text-muted-foreground font-black tracking-widest uppercase">Повысьте безопасность продукта без потери скорости</p>
          </div>
          
          <form className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Компания / ИНН</label>
                <input type="text" className="w-full bg-white/5 border border-white/10 p-4 text-[11px] text-white focus:border-blue-500 outline-none transition-all" placeholder="ООО Софт-Девелопмент / 7704..." required />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Рабочий E-mail</label>
                <input type="email" className="w-full bg-white/5 border border-white/10 p-4 text-[11px] text-white focus:border-blue-500 outline-none transition-all" placeholder="cto@company.ru" required />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Стек технологий (CI/CD / Clouds)</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 p-4 text-[11px] text-white focus:border-blue-500 outline-none transition-all" placeholder="GitLab CI, AWS, Terraform, Go" required />
            </div>
            
            <div className="space-y-2">
              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Описание задач</label>
              <textarea className="w-full bg-white/5 border border-white/10 p-4 text-[11px] text-white focus:border-blue-500 outline-none transition-all h-32 resize-none" placeholder="Укажите текущие проблемы: утечки секретов, долгое прохождение ИБ-контроля или потребность в автоматизации комплаенса..."></textarea>
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" id="compliance" className="mt-1" required />
              <label htmlFor="compliance" className="text-[9px] text-muted-foreground font-bold leading-relaxed tracking-wider">
                Я подтверждаю полномочия на заказ консалтинговых услуг и согласен на проведение предварительного аудита процессов.
              </label>
            </div>

            <button type="submit" className="w-full btn-enterprise py-5 text-[11px]">
              Запросить консультацию
            </button>
          </form>
        </section>

      </div>
    </div>
  );
}
