# GitHub Secrets Configuration Guide

**Architecture**: Public Frontend + Private Backend + Private Database

This file lists all the secrets you need to add to your GitHub repository for CI/CD deployment.

## How to Add Secrets to GitHub

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret below

## Required Secrets

### Database Secrets
```
MYSQL_ROOT_PASSWORD     = root  (or your chosen root password)
MYSQL_PASSWORD          = despacho_pass  (or your chosen password)
```

### Database Connection Secrets (Backend needs this)
```
DB_PASSWORD             = despacho_pass  (same as MYSQL_PASSWORD)
DATABASE_EC2_IP         = 10.0.2.45  (PRIVATE IP of your database EC2 instance in private subnet)
```

### Backend Secrets (Frontend needs this)
```
BACKEND_EC2_IP          = 10.0.1.50  (PRIVATE IP of your backend EC2 instance in private subnet)
FRONTEND_EC2_PUBLIC_IP  = 54.123.45.67  (PUBLIC IP of your frontend EC2 instance)
```

## How to Use in docker-compose

Since your architecture has public frontend and private backend/database, use appropriate IPs:

### .env.database (simplified - only public variables)
```
MYSQL_DATABASE=despacho_db
MYSQL_USER=despacho_user
```
**Secrets reference**: `MYSQL_ROOT_PASSWORD`, `MYSQL_PASSWORD`

### .env.backend (simplified - only public variables)
```
DB_HOST=10.0.2.45          # PRIVATE IP of database in private subnet
DB_PORT=3306
DB_NAME=despacho_db
DB_USER=despacho_user
SPRING_DDL_AUTO=update
```
**Secrets reference**: `DB_PASSWORD`, `DATABASE_EC2_IP`

### .env.frontend (no secrets needed)
```
VITE_API_URL=http://10.0.1.50:8080    # PRIVATE IP of backend in private subnet
```
**Note**: Frontend uses private IP because all communication stays within VPC

## For Local Development

Create a `.env.local` file (not committed to git) with:
```
MYSQL_ROOT_PASSWORD=root
MYSQL_PASSWORD=despacho_pass
DB_PASSWORD=despacho_pass
DB_HOST=localhost
BACKEND_EC2_IP=localhost
DATABASE_EC2_IP=localhost
```

## For GitHub Actions CI/CD

When setting up GitHub Actions workflows, reference secrets like this:
```yaml
env:
  DB_PASSWORD: ${{ secrets.MYSQL_PASSWORD }}
  DATABASE_EC2_IP: ${{ secrets.DATABASE_EC2_IP }}
  BACKEND_EC2_IP: ${{ secrets.BACKEND_EC2_IP }}
```

## Security Best Practices

✅ **DO:**
- Keep secrets in GitHub Secrets
- Use different passwords for dev/staging/production
- Rotate passwords regularly
- Use strong passwords for production

❌ **DON'T:**
- Commit `.env` files with passwords to git
- Share secrets in pull requests or issues
- Use simple passwords in production
- Commit `.env.local` files to git
