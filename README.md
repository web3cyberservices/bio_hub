
# Инфраструктурный портал Web3CyberServices

## Настройка окружения (.env)
Для корректной работы авторизации в продакшн-режиме, создайте файл `.env` в корне проекта:
```bash
# Генерация ключа: openssl rand -base64 32
AUTH_SECRET="ваш_секретный_ключ"
AUTH_URL="https://web3cyberservices.xyz/api/auth"
AUTH_TRUST_HOST=true
DATABASE_URL="sqlite.db"
```

## Развертывание
1. Установите зависимости: `npm install`
2. Обновите БД: `npx drizzle-kit push`
3. Сборка: `npm run build`
4. Запуск: `pm2 start npm --name "web3-cyber" -- start`

## Исправление ошибок UntrustedHost
Если вы используете Nginx, убедитесь, что передаются заголовки:
```nginx
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-Host $host;
```
