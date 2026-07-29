export default function LegalPage() {
  return (
    <div className="py-24 container mx-auto px-4 max-w-3xl">
      <h1 className="text-4xl font-black tracking-tighter mb-12">Юридическая информация</h1>
      
      <div className="space-y-16">
        <section>
          <h2 className="text-xl font-bold mb-6 text-primary tracking-wider">1. Условия использования</h2>
          <div className="text-sm text-muted-foreground leading-relaxed space-y-4 font-medium">
            <p>
              Используя платформу CyberLog, вы соглашаетесь с тем, что сервис предоставляется по модели "as is". CyberLog не несет ответственности за любую потерю данных, вызванную некорректной конфигурацией клиентских gRPC-агентов или SDK.
            </p>
            <p>
              Мы гарантируем аптайм (SLA) уровня 99.9% для тарифных планов Pro и Enterprise. Любые плановые технические работы проводятся с уведомлением за 48 часов.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-6 text-primary tracking-wider">2. Политика конфиденциальности</h2>
          <div className="text-sm text-muted-foreground leading-relaxed space-y-4 font-medium">
            <p>
              CyberLog придерживается строгой политики Zero-Knowledge: мы не дешифруем payload ваших логов, если это не предусмотрено конфигурацией ваших ключей для парсинга на лету.
            </p>
            <p>
              Все данные хранятся в зашифрованном виде (AES-256) в дата-центрах уровня Tier III. Доступ к данным ограничен политиками IAM и вашим уникальным API-ключом. Мы не передаем вашу телеметрию третьим лицам.
            </p>
          </div>
        </section>

        <section className="p-8 border border-white/5 bg-white/5 rounded-sm">
          <h2 className="text-sm font-bold mb-4 uppercase tracking-widest text-white">Compliance</h2>
          <p className="text-xs text-muted-foreground leading-relaxed font-medium">
            CyberLog соответствует стандартам GDPR и SOC2. Наши системы проходят ежегодный внешний аудит безопасности и регулярное тестирование на проникновение (Pentest).
          </p>
        </section>
      </div>
    </div>
  );
}
