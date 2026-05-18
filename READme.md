# Proyecto: Sistema de Despachos 🚚

![CI](https://img.shields.io/badge/CI-deploy-blue) ![Docker](https://img.shields.io/badge/docker-ready-blue) ![AWS](https://img.shields.io/badge/aws-ecr-orange)

**Descripción**: Aplicación web para administrar despachos (CRUD). Frontend en React (Vite) servido por Nginx; backend REST en Spring Boot (Java 17); persistencia en MySQL. Despliegue automatizado mediante GitHub Actions → ECR → EC2.

---

## Arquitectura general

Frontend
↓
Backend / API
↓
MySQL


GitHub
↓
GitHub Actions
↓
Docker Build
↓
AWS ECR
↓
AWS EC2 (SSM)

> Frontend estático servido por Nginx. Backend expone `api/v1/despachos`. MySQL guarda los datos.

---

## Tecnologías (resumen)

| Tecnología | Uso |
|------------|-----|
| React (Vite) | Frontend SPA, build optimizado |
| Nginx | Servir estáticos + proxy `/api` |
| Spring Boot (Java 17) | API REST y lógica de negocio |
| MySQL 8.0 | Persistencia relacional |
| Docker / Compose | Contenerización y orquestación local |
| GitHub Actions | CI/CD (build → push → deploy) |
| AWS ECR / EC2 / SSM | Registro de imágenes y despliegue remoto |

---

## Contenedorización (resumen técnico)

- Multi-stage builds: `frontend` (node → nginx), `backend` (maven → jre) → imágenes más pequeñas.
- Usuario no-root: `USER nginx` y `appuser` en backend.
- `docker-compose` orquesta `mysql`, `backend-despachos`, `frontend` (red `proyecto-network`).
- Variables en `docker-compose` y GitHub Secrets para producción.
- Puertos: `80` (frontend), `8080` (backend), `3306` (MySQL — evitar exponer públicamente).

---

## Persistencia

- Volumen: `mysql_data` → montado en `/var/lib/mysql` en el contenedor MySQL.
- Garantiza durabilidad entre reinicios locales; en producción recomendar RDS o EBS con snapshots.

---

## Pipeline CI/CD (resumen)

- Trigger: `push` a rama `deploy` o manual (`workflow_dispatch`).
- Pasos: checkout → configurar AWS → `docker build` → `docker push` (ECR) → `aws ssm send-command` para actualizar contenedores en EC2.

Diagrama:

GitHub
↓
GitHub Actions
↓
Docker Build → ECR
↓
EC2 (SSM) → `docker pull` → `docker run`

---

## Despliegue en AWS EC2 (práctico)

- Imágenes en ECR; EC2 obtiene imágenes y ejecuta `docker run` vía SSM.
- Instancias identificadas por `EC2_*_INSTANCE_ID` en GitHub Secrets.
- Recomendación: migrar a ECS/Fargate y usar RDS para mayor resiliencia.

---

## Seguridad (puntos clave)

- GitHub Secrets para credenciales (AWS, ECR, MySQL).
- Contenedores no-root.
- Red interna en `docker-compose` para comunicación entre servicios.
- Mejora recomendada: OIDC para Actions, TLS/ALB y no exponer MySQL al exterior.

---

## Principios DevOps aplicados

- Contenerización   - Automatización CI/CD   - Control de versiones Git 
- Persistencia con volúmenes   - Separación de responsabilidades  - Recomendado: observabilidad y tests automáticos

---

## Instalación y ejecución (rápido)

```bash
git clone <repo>
cd evaluaciondevops
docker compose up --build
```

Acceder: `http://localhost` (frontend), API: `http://localhost:8080/api/v1/despachos`.

---

## Variables de entorno (principales)

| Variable | Uso |
|----------|-----|
| `MYSQL_ROOT_PASSWORD` | Root DB (docker-compose / secrets) |
| `MYSQL_USER` / `MYSQL_PASSWORD` | Usuario y contraseña DB |
| `SPRING_DATASOURCE_URL` | URL JDBC para Spring (ej. `jdbc:mysql://mysql:3306/despacho_db...`) |
| `ECR_REGISTRY` | URL ECR en workflows |
| `EC2_*_INSTANCE_ID` | IDs de instancias EC2 usadas por SSM |

---

## Estructura del repo (simplificada)

```
/
├─ docker-compose.yml
├─ db/
│  ├─ Dockerfile
│  └─ init.sql
├─ back-Despachos_SpringBoot/
│  └─ Springboot-API-REST-DESPACHO/
│     ├─ Dockerfile
│     ├─ pom.xml
│     └─ src/
├─ front_despacho/
│  ├─ Dockerfile
│  ├─ nginx.conf
│  └─ src/
└─ .github/workflows/
```

---


## Información adicional 

- Endpoints principales:

	| Método | Ruta | Descripción |
	|--------|------|-------------|
	| GET | /api/v1/despachos | Listar todos los despachos |
	| GET | /api/v1/despachos/{id} | Obtener despacho por ID |
	| POST | /api/v1/despachos | Crear despacho |
	| PUT | /api/v1/despachos/{id} | Actualizar despacho |
	| DELETE | /api/v1/despachos/{id} | Eliminar despacho |

- Dockerfile notes:

	- `back-Despachos_SpringBoot/.../Dockerfile`: multi-stage (maven → jre), `mvn dependency:go-offline` para cache de dependencias y `appuser` no-root.
	- `front_despacho/Dockerfile`: builder `node:18-alpine` → runtime `nginx:alpine`; copia `dist` y usa `nginx.conf` para proxy `/api`.
	- `db/Dockerfile`: base `mysql:8.0`, `init.sql` en `/docker-entrypoint-initdb.d` para inicialización.

- Docker Compose tips:

	- Levantar en desarrollo: `docker compose up --build`.
	- Volumen `mysql_data` mantiene datos entre reinicios.
	- `depends_on` + healthcheck asegura orden de arranque.

- CI/CD recomendaciones:

	- Taggear imágenes con SHA: `${ECR_REGISTRY}/backend_despachos:${GITHUB_SHA}`.
	- Añadir etapas de `test` y `scan` antes de `push`.
	- Preferir OIDC a claves estáticas para AWS.

- Comandos útiles (ejemplo tag & push):

```bash
# desde directorio del componente (ej: back-Despachos_SpringBoot/...)
GIT_SHA=$(git rev-parse --short HEAD)
IMAGE=${ECR_REGISTRY}/backend_despachos:${GIT_SHA}
docker build -t $IMAGE .
docker push $IMAGE
```

- Troubleshooting rápido:

	- Ver logs backend: `docker logs backend_despachos`.
	- Acceso MySQL: `docker exec -it db mysql -u root -p`.
	- Si frontend falla en llamadas: revisar `nginx.conf` y `VITE_API_URL`.

---
