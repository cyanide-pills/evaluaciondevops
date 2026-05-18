# Build stage
FROM node:18-alpine AS builder

WORKDIR /build

COPY package*.json ./

RUN npm install

COPY . .

ENV VITE_API_URL=/api

RUN npm run build

# Runtime stage
FROM nginx:alpine

# 1. Eliminar la configuración por defecto
RUN rm /etc/nginx/conf.d/default.conf

# 2. Copiar tu archivo de configuración en conf.d
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 3. Copiar los estáticos de React
COPY --from=builder /build/dist /usr/share/nginx/html

# 4. Solución de Permisos: Crear rutas temporales de caché y asignar dueño al usuario nginx
RUN mkdir -p /var/cache/nginx/client_temp \
             /var/cache/nginx/proxy_temp \
             /var/cache/nginx/fastcgi_temp \
             /var/cache/nginx/uwsgi_temp \
             /var/cache/nginx/scgi_temp && \
    chown -R nginx:nginx /usr/share/nginx/html \
                         /var/cache/nginx \
                         /var/log/nginx \
                         /etc/nginx/conf.d

# Cambiar al usuario no-root seguro
USER nginx

EXPOSE 80

# 5. Pasarle el PID alternativo por parámetro para evitar escribir en /var/run/ nginx.pid
CMD ["nginx", "-g", "daemon off; pid /tmp/nginx.pid;"]