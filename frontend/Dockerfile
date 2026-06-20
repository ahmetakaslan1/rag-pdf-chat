# 1. Build Aşaması (Node.js)
FROM node:20-alpine AS builder

WORKDIR /app

# docker-compose.prod.yml içerisindeki `args` bloğundan gelecek env'leri yakalıyoruz
ARG VITE_API_URL
ARG VITE_WS_URL

# Bu env'leri Vite build anında statik olarak kodun içine gömmesi için atıyoruz
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 2. Çalıştırma Aşaması (Nginx)
FROM nginx:alpine

# Vite router'ı desteklemek için custom nginx ayarlarını kopyalıyoruz
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Builder adımından üretilen HTML/CSS/JS çıktılarını Nginx klasörüne kopyalıyoruz
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
