# Fullstack Articles App

Fullstack проект на React + Node.js, где можно создавать, просматривать статьи.

## Настройка переменных окружения

Перед запуском проекта необходимо создать файл `.env` в папке `backend`.

**Содержимое файла `backend/.env`:**

DB_USER=your user
DB_PASSWORD=your password
DB_NAME=node_js
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DIALECT=postgres
JWT_SECRET=super_secret_key_123
JWT_EXPIRES_IN=1h



##  Запуск проекта
1. Перейдите в папку `backend` : cd backend
2. Установите все зависимости : npm install
3. Создайте базу PostgreSQL с именем node_js: createdb node_js
4. Запустите миграции для создания таблиц: npx sequelize-cli db:migrate
5.Запустите сервер: npm run dev
6.Перейдите в папку `frontend` : cd frontend
7. Установите все зависимости :npm install
8.npm run dev




