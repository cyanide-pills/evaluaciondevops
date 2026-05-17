# Docker Setup for Proyecto Semestral

This document explains how to use Docker to run the Proyecto Semestral application.

## Project Structure

- **Backend**: Spring Boot REST API (Port 8080)
- **Frontend**: React + Vite application (Port 80)
- **Database**: MySQL 8.0 (Port 3306)

## Prerequisites

- Docker installed on your system
- Docker Compose installed on your system

## Building and Running with Docker Compose

The easiest way to run the entire application is using Docker Compose:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Building Individual Docker Images

### Backend
```bash
cd back-Despachos_SpringBoot/Springboot-API-REST-DESPACHO
docker build -t despacho-backend .
docker run -p 8080:8080 -e SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/despacho_db despacho-backend
```

### Frontend
```bash
cd front_despacho
docker build -t despacho-frontend .
docker run -p 80:80 despacho-frontend
```

### Database
```bash
cd db
docker build -t despacho-db .
docker run -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root despacho-db
```

## Environment Variables

The backend requires the following environment variables:
- `SPRING_DATASOURCE_URL`: MySQL connection string
- `SPRING_DATASOURCE_USERNAME`: Database user
- `SPRING_DATASOURCE_PASSWORD`: Database password

The database is initialized with:
- Database: `despacho_db`
- Root password: `root`
- User: `despacho_user`
- Password: `despacho_pass`

## Accessing the Application

- **Frontend**: http://localhost
- **Backend**: http://localhost:8080
- **Database**: localhost:3306

## Customization

### init.sql
Edit `db/init.sql` to customize the database schema. Changes will be applied when the container starts.

### Backend Configuration
Update environment variables in `docker-compose.yml` or create an `.env` file.

### Frontend Configuration
Modify the nginx configuration in `front_despacho/nginx.conf` as needed.
