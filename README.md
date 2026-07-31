# Web3CyberServices Enterprise Portal

Инфраструктурная платформа для HFT и алгоритмической торговли.

## Требования
- Node.js 18.17 или выше
- NPM / Yarn

## Быстрый старт на сервере

1. **Установка зависимостей**
```bash
npm install
```

2. **Настройка базы данных**
Приложение использует SQLite. Для создания структуры таблиц выполните:
```bash
npm run db:push
```

3. **Сборка проекта**
```bash
npm run build
```

4. **Запуск в продакшн-режиме**
```bash
npm run start
```

## Развертывание через PM2 (рекомендуется)
```bash
npm install -g pm2
pm2 start npm --name "web3-cyber" -- start
```

## Технический стек
- **Framework**: Next.js 14 (App Router)
- **Database**: SQLite + Drizzle ORM
- **Auth**: NextAuth.js v5
- **UI**: Tailwind CSS + Lucide Icons
- **AI**: Genkit (для анализа логов)