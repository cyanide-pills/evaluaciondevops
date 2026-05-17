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

# Nginx handles proxying to private backend via /api/ routes
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
