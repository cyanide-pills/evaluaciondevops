# Build stage
FROM node:18-alpine AS builder

WORKDIR /build

COPY package*.json ./

RUN npm install

COPY . .

# Use relative paths for API (nginx handles routing)
ENV VITE_API_URL=/api

RUN npm run build

# Runtime stage
FROM nginx:alpine

COPY --from=builder /build/dist /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/

# Nginx alpine already runs as 'nginx' user (non-root)
# Ensure proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /etc/nginx/conf.d/

USER nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
