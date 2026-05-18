# Code Analysis: Consistency & Best Practices

## 🔴 CRITICAL ISSUES

### 1. **Hardcoded ECR Registry & Container Names**
**Problem**: ECR registry is hardcoded in all workflows instead of using GitHub Secrets
```yaml
# ❌ CURRENT (BAD)
ECR_REGISTRY: 206916371090.dkr.ecr.us-east-1.amazonaws.com
ECR_REPOSITORY: backend_despachos
```

**Fix**: Move to GitHub Secrets
```yaml
# ✅ BETTER
env:
  ECR_REGISTRY: ${{ secrets.ECR_REGISTRY }}
  ECR_REPOSITORY: backend_despachos
```

### 2. **Port Inconsistency - Backend**
**Problem**: Workflow uses port 8081, but Spring Boot typically runs on 8080
```yaml
# ❌ CURRENT
docker run -d --name backend_despachos -p 8081:8081

# But .env.backend might expect 8080
```

**Issue**: Nginx proxy in frontend is hardcoded to 8080:
```nginx
# In nginx.conf
proxy_pass http://10.0.1.50:8080/;  # ← Port mismatch if backend is 8081
```

### 3. **Database Credentials in docker-compose.yml**
**Problem**: `docker-compose.yml` has hardcoded credentials
```yaml
# ❌ CURRENT - UNSAFE
environment:
  MYSQL_ROOT_PASSWORD: root
  MYSQL_DATABASE: despacho_db
  MYSQL_USER: despacho_user
  MYSQL_PASSWORD: despacho_pass
```

**Fix**: Use `.env.database` with environment variables
```yaml
# ✅ BETTER
environment:
  MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:-root}
```

---

## 🟡 INCONSISTENCIES

### 4. **Missing docker-compose.backend.yml**
**Problem**: `.env.backend` references a file that doesn't exist
```bash
# In .env.backend:
# Use this .env file with: docker-compose -f docker-compose.backend.yml --env-file .env.backend up -d
# ↑ This file doesn't exist!
```

**Solution**: Should create separate backend compose file OR note that it's not needed for EC2

### 5. **Inconsistent Variable Usage Across Files**

| Component | Variable Style | Example |
|---|---|---|
| workflows | Hardcoded | `206916371090.dkr.ecr...` |
| docker-compose.db.yml | Environment vars | `${MYSQL_ROOT_PASSWORD:-root}` |
| docker-compose.yml | Hardcoded | `root`, `despacho_pass` |
| .env files | Partial | Only non-secrets |

**Fix**: Standardize all to use environment variables

### 6. **Container Naming Inconsistency**

```yaml
# Backend
--name backend_despachos -p 8081:8081

# Frontend  
--name front_despachos -p 80:80

# Database
--name db -p 3306:3306
```

**Issues**:
- ❌ Naming convention differs (backend_despachos vs db)
- ❌ Use `despacho-` prefix consistently

**Fix**:
```yaml
backend:  despacho-backend
frontend: despacho-frontend
database: despacho-database
```

### 7. **Inconsistent Security Practices**

**Backend workflow** uses `sudo`:
```yaml
sudo docker login...
sudo docker pull...
sudo docker run...
```

**Frontend workflow** doesn't:
```yaml
aws ecr get-login-password...  # No sudo
docker login...
docker run...
```

**Issue**: Inconsistent approach. SSM runs as EC2 user, decide if sudo is needed

---

## 🟢 GOOD PRACTICES (Keep These)

✅ **Separate docker-compose files per service** (db.yml, frontend.yml)
✅ **Using GitHub Secrets for sensitive data**
✅ **AWS SSM for automated deployments**
✅ **Environment variable substitution in .env files**
✅ **Nginx reverse proxy for private backend access**

---

## 📋 ACTION ITEMS (Priority Order)

### Priority 1: Security & Functionality
- [ ] Fix port inconsistency: Backend should be 8080, not 8081
- [ ] Fix nginx.conf to match actual backend port
- [ ] Move ECR registry to GitHub Secrets (`ECR_REGISTRY`)
- [ ] Remove hardcoded credentials from `docker-compose.yml`

### Priority 2: Consistency
- [ ] Standardize container naming: `despacho-backend`, `despacho-frontend`, `despacho-database`
- [ ] Create consistent variable names across all files
- [ ] Standardize sudo usage in workflows (use consistently or don't use)
- [ ] Either create `docker-compose.backend.yml` or remove reference from `.env.backend`

### Priority 3: Best Practices
- [ ] Add `restart: always` to all compose services
- [ ] Add healthchecks to compose files (already in db.yml)
- [ ] Standardize error handling (`set -e` everywhere)
- [ ] Add detailed comments to workflows

---

## 📊 SUMMARY TABLE

| Aspect | Current | Recommended |
|---|---|---|
| **Backend Port** | 8081 | 8080 |
| **Container Names** | Mixed | `despacho-{service}` |
| **ECR Registry** | Hardcoded | `${{ secrets.ECR_REGISTRY }}` |
| **DB Credentials** | Hardcoded in .yml | Use .env files |
| **Sudo Usage** | Inconsistent | Decide & standardize |
| **Nginx Proxy Port** | 8080 | Match backend port |
| **docker-compose.backend.yml** | Missing/Referenced | Create or document why not needed |

---

## 🔧 Quick Fix: Standardized Variable Structure

### GitHub Secrets (Should have)
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_SESSION_TOKEN
AWS_REGION
ECR_REGISTRY                    # ← ADD THIS
EC2_BACKEND_INSTANCE_ID
EC2_FRONTEND_INSTANCE_ID
EC2_DATABASE_INSTANCE_ID
MYSQL_ROOT_PASSWORD
MYSQL_PASSWORD
DB_USER
DATABASE_EC2_IP
```

### All Workflows (env section)
```yaml
env:
  ECR_REGISTRY: ${{ secrets.ECR_REGISTRY }}        # ← FROM SECRETS
  ECR_REPOSITORY_BACKEND: despacho-backend         # ← Standardized name
  ECR_REPOSITORY_FRONTEND: despacho-frontend
  ECR_REPOSITORY_DATABASE: despacho-database
  IMAGE_TAG: latest
```

### All Compose Files
```yaml
environment:
  MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
  MYSQL_PASSWORD: ${MYSQL_PASSWORD}
  # ... all vars from .env files
```

---

## ✅ VERIFICATION CHECKLIST

Run this to verify consistency:
```bash
# Check for hardcoded registries
grep -r "206916371090" .github/workflows/

# Check for hardcoded credentials
grep -r "despacho_pass\|root" docker-compose*.yml

# Check port consistency
grep -r "8081\|8080" .github/workflows/ nginx.conf

# Check container naming
grep -r "name " docker-compose*.yml .github/workflows/
```

Expected output: No results for hardcoded values!
