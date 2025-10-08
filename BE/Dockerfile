# Используем официальный Node.js образ
FROM node:20

# Рабочая директория
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# По умолчанию в docker-compose будет монтироваться код с хоста,
# поэтому COPY . . здесь не нужен (иначе будет перетирать live-код)

# Открываем порты
EXPOSE 3000
EXPOSE 3000

# Запускаем приложение (команда переопределена в docker-compose)
CMD ["npm", "run", "dev"]
