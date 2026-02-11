# Project Structure

A full-featured full-stack web application — an Instagram-style social network.

Backend (BE/) — Node.js + Express + TypeScript

- Express 5.1, TypeScript 5.9, MongoDB Atlas (cloud)
- JWT for authentication, bcrypt for password hashing
- AWS S3 for image storage, Sharp for image processing
- Socket.IO for real-time features (messages, notifications)
- Nodemailer for sending emails
- Structure: controllers/ (8), models/ (7), routes/ (9), middlewares/, config/, utils/
- Entry point: server.ts → app.ts

Frontend (FE/) — React + Vite + TypeScript

- React 19.1, Vite 7.1, Redux Toolkit for state management
- Material UI (MUI) for UI components, Emotion for styling
- React Router DOM for routing, Axios for HTTP requests
- Socket.IO Client for real-time communication
- Components are organized by features: auth/, posts/, comments/, messages/, notifications/, profiles/, search/, navigation/
- Entry point: main.tsx → App.tsx

Infrastructure:

- Docker Compose (docker-compose.yml) — two services: ichgramm-BE (port 3000) and ichgramm-FE (port 5173), shared network app-network
- MongoDB is hosted in the cloud (Atlas); the docker-compose config for it is commented out
- Social App API.json — API documentation

Features:

- Sign-up / login / password reset
- User profiles and subscriptions (follow/unfollow)
- Creating posts with images
- Likes and comments
- Direct messages (real-time via Socket.IO)
- Notifications
- Search for users/posts

# Структура проекта

Полноценное full-stack веб-приложение — социальная сеть в стиле Instagram

Backend (BE/) — Node.js + Express + TypeScript

- Express 5.1, TypeScript 5.9, MongoDB Atlas (облако)
- JWT для аутентификации, bcrypt для хешей паролей
- AWS S3 для хранения изображений, Sharp для обработки картинок
- Socket.IO для real-time (сообщения, уведомления)
- Nodemailer для отправки email
- Структура: controllers/ (8 шт), models/ (7 шт), routes/ (9 шт), middlewares/, config/, utils/
- Точка входа: server.ts → app.ts

Frontend (FE/) — React + Vite + TypeScript

- React 19.1, Vite 7.1, Redux Toolkit для стейта
- Material-UI (MUI) для UI-компонентов, Emotion для стилей
- React Router DOM для роутинга, Axios для HTTP-запросов
- Socket.IO Client для real-time
- Компоненты организованы по фичам: auth/, posts/, comments/, messages/, notifications/, profiles/, search/, navigation/
- Точка входа: main.tsx → App.tsx

Инфраструктура:

- Docker Compose (docker-compose.yml) — два сервиса: ichgramm-BE (порт 3000) и ichgramm-FE (порт 5173), общая сеть app-network
- MongoDB вынесена в облако (Atlas), в docker-compose закомментирована
- Файл Social App API.json — документация API

Функциональность:

- Регистрация / вход / сброс пароля
- Профили пользователей, подписки (follow/unfollow)
- Создание постов с изображениями
- Лайки и комментарии
- Личные сообщения (real-time через Socket.IO)
- Уведомления
- Поиск пользователей/постов
