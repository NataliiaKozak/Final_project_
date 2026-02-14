# ICHGRAMM

Fullstack-клон Instagram: лента постов, лайки, комментарии, подписки, личные сообщения в реальном времени, уведомления, поиск пользователей, загрузка изображений в AWS S3.

## Tech Stack

### Backend
- **Runtime:** Node.js + TypeScript (ES Modules)
- **Framework:** Express 5
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Auth:** JWT (access token + reset token)
- **Realtime:** Socket.IO
- **Storage:** AWS S3 (загрузка и обработка изображений через Sharp)
- **Email:** Nodemailer (SMTP)

### Frontend
- **Framework:** React 19 + TypeScript
- **Bundler:** Vite 7
- **State:** Redux Toolkit
- **Routing:** React Router 7
- **UI:** MUI Material, React Icons
- **Realtime:** Socket.IO Client
- **HTTP:** Axios

## Архитектура

```
Final_project_/
├── BE/                         # Backend (Express + TS)
│   ├── src/
│   │   ├── controllers/        # Логика обработки запросов
│   │   ├── models/             # Mongoose-схемы (User, Post, Comment, Like, Follow, Message, Notification)
│   │   ├── routes/             # REST-маршруты
│   │   ├── middlewares/        # Auth middleware (JWT)
│   │   └── config/             # JWT, S3, email конфигурация
│   ├── app.ts                  # Express app, CORS, маршруты
│   └── server.ts               # HTTP-сервер + Socket.IO
├── FE/                         # Frontend (React + Vite)
│   └── src/
│       ├── components/         # UI-компоненты (auth, posts, messages, navigation, profiles, ...)
│       ├── pages/              # Страницы (home, explore, profile, messages, notifications, ...)
│       ├── redux/slices/       # Redux Toolkit slices
│       ├── api/                # Axios instance + Socket.IO client
│       └── interfaces/         # TypeScript интерфейсы
└── docker-compose.yml          # Docker-окружение
```

## API Endpoints

Все маршруты под префиксом `/api`:

| Ресурс | Путь | Описание |
|--------|------|----------|
| Auth | `/api/auth` | Регистрация, логин, сброс пароля |
| Users | `/api/users` | Профиль, редактирование |
| Posts | `/api/posts` | CRUD постов |
| Likes | `/api/likes` | Лайки постов и комментариев |
| Comments | `/api/comments` | Комментарии к постам |
| Follows | `/api/follows` | Подписки / отписки |
| Search | `/api/search` | Поиск пользователей |
| Messages | `/api/messages` | Личные сообщения |
| Notifications | `/api/notifications` | Уведомления |

Realtime-события (Socket.IO): `sendMessage`, `receiveMessage`, `notification`.

## Установка и запуск

### Требования

- Node.js >= 18
- npm
- MongoDB Atlas (или локальный MongoDB)
- AWS S3 bucket (для изображений)

### 1. Клонировать репозиторий

```bash
git clone <repo-url>
cd Final_project_
```

### 2. Настроить переменные окружения

**BE/.env**
```env
PORT=3000
CLIENT_URL=http://localhost:5173
NODE_ENV=development

MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>

AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=eu-central-1
S3_BUCKET_NAME=your-bucket-name

JWT_SECRET=your_jwt_secret_key
JWT_ACCESS_EXPIRES=1d
JWT_RESET_SECRET=your_reset_secret_key

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your_email_app_password
```

**FE/.env**
```env
VITE_API_URL=http://localhost:3000/api
```

### 3. Установить зависимости

```bash
cd BE && npm install
cd ../FE && npm install
```

### 4. Запуск (development)

**Backend** (порт 3000):
```bash
cd BE
npm run dev
```

**Frontend** (порт 5173):
```bash
cd FE
npm run dev
```

Открыть в браузере: `http://localhost:5173`

### 5. Запуск через Docker

```bash
docker-compose up --build
```

Контейнеры:
- `ichgramm-BE` — backend на порту 3000
- `ichgramm-FE` — frontend на порту 5173

### 6. Production build

```bash
# Backend
cd BE
npm run build    # tsc → dist/
npm start        # node dist/server.js

# Frontend
cd FE
npm run build    # tsc + vite build → dist/
npm run preview  # предпросмотр билда
```

## Порты

| Сервис | Порт | Описание |
|--------|------|----------|
| Frontend (Vite) | `5173` | Dev-сервер React |
| Backend (Express) | `3000` | REST API + Socket.IO |

## Функциональность

- Регистрация и авторизация (JWT)
- Сброс пароля через email
- Создание / удаление постов с изображениями
- Лента подписок (home feed)
- Explore — все посты
- Лайки и комментарии с оптимистичным обновлением UI
- Подписки / отписки
- Профиль пользователя с редактированием (аватар, био, ссылка)
- Поиск пользователей
- Личные сообщения в реальном времени (Socket.IO)
- Уведомления (лайки, комментарии, подписки)
- Адаптивный дизайн (desktop / tablet / mobile)
