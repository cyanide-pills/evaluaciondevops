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

# 1. EXPRESIÓN REGULAR UNIVERSAL: Reemplaza cualquier directiva pid por /tmp/nginx.pid
RUN sed -i 's|^pid\s.*;|pid /tmp/nginx.pid;|g' /etc/nginx/nginx.conf

# 2. Limpiar y colocar tu archivo de configuración en conf.d
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 3. Copiar los estáticos de React desde la etapa de compilación
COPY --from=builder /build/dist /usr/share/nginx/html

# 4. Crear rutas temporales de caché y asignar propiedad al usuario no-root 'nginx'
RUN mkdir -p /var/cache/nginx/client_temp \
             /var/cache/nginx/proxy_temp \
             /var/cache/nginx/fastcgi_temp \
             /var/cache/nginx/uwsgi_temp \
             /var/cache/nginx/scgi_temp && \
    chown -R nginx:nginx /usr/share/nginx/html \
                         /var/cache/nginx \
                         /var/log/nginx \
                         /etc/nginx/conf.d

# Cambiar de forma segura al usuario sin privilegios
USER nginx

EXPOSE 80

# Comando de arranque limpio
CMD ["nginx", "-g", "daemon off;"]