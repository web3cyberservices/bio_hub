
# Инфраструктурный портал Web3CyberServices

## Настройка окружения (.env)
Для корректной работы авторизации в продакшн-режиме, создайте файл `.env` в корне проекта:
```bash
AUTH_SECRET="ваш_очень_длинный_секретный_ключ"
AUTH_URL="https://web3cyberservices.xyz/api/auth"
AUTH_TRUST_HOST=true
```

## Настройка Nginx (Reverse Proxy)
Добавьте эти заголовки в блок `location /` вашего конфига Nginx:
```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

## Запуск в условиях ограниченной памяти
Используйте лимиты V8 при запуске через PM2:
```bash
NODE_OPTIONS="--max-old-space-size=256" pm2 start npm --name "web3-cyber" -- start
```
