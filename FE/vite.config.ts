// Импортируем функцию для создания конфигурации Vite
import { defineConfig } from 'vite'

// Подключаем плагин React для поддержки JSX, Fast Refresh и других фич
import react from '@vitejs/plugin-react'

// Экспортируем конфигурацию Vite
export default defineConfig({
  // Подключаем плагины Vite (в данном случае — только React)
  plugins: [react()],

  // Настройки dev-сервера Vite
  server: {
    port: 5173,   // Порт, на котором будет запущен frontend (http://localhost:5173)

    host: true    //  Очень важно для работы внутри Docker-контейнера!
    // Указывает, что сервер должен быть доступен снаружи (не только на localhost)
    // Иначе frontend будет запускаться, но недоступен из браузера вне контейнера
  }
})

