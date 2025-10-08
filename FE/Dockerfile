# Используем Node.js 20
FROM node:20

# Рабочая директория
WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm install

# Код проекта монтируется через volume, COPY . . не нужен

# Открываем порт Vite
# EXPOSE 3001
EXPOSE 5173
# Команда запуска переопределена в docker-compose (npm run devdocker)
CMD ["npm", "run", "devdocker"]