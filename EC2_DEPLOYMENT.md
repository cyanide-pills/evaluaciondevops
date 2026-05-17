# EC2 Multi-Instance Deployment Guide

This guide explains how to deploy the Proyecto Semestral application across three EC2 instances.

## Architecture

```
                           INTERNET
                              ▲
                              │
                    ┌─────────┴─────────┐
                    │   Public Subnet   │
                    │ ┌───────────────┐ │
                    │ │   Frontend    │ │
                    │ │   (React/Ng)  │ │
                    │ │   :80         │ │
                    │ └───────────────┘ │
                    └────────┬──────────┘
                             │
                    ┌────────┴──────────────┐
                    │  Private Subnets     │
        ┌───────────┴────────┐  ┌──────────┴────────┐
        │  Subnet 1          │  │  Subnet 2         │
        │ ┌────────────────┐ │  │ ┌──────────────┐ │
        │ │   Backend      │◄───┤─│   MySQL DB   │ │
        │ │  Spring Boot   │ │  │ │   :3306      │ │
        │ │   :8080        │ │  │ │              │ │
        │ └────────────────┘ │  │ └──────────────┘ │
        └────────────────────┘  └──────────────────┘
```

**Network Flow:**
- Frontend (public) → Backend (private) via NAT or Load Balancer
- Backend (private) → Database (private) via private subnet routing
- Database (private) → only accepts from Backend security group

## Prerequisites on All Instances

1. **Install Docker**:
   ```bash
   sudo yum update -y
   sudo yum install docker -y
   sudo systemctl start docker
   sudo usermod -a -G docker ec2-user
   ```

2. **Install Docker Compose**:
   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   docker-compose --version
   ```

3. **Clone the project repository**:
   ```bash
   git clone <your-repo-url>
   cd proyecto\ semestral
   ```

## Deployment Steps

### Step 1: Deploy Database Instance (EC2 Instance 1)

1. **SSH into the database EC2 instance**:
   ```bash
   ssh -i your-key.pem ec2-user@<DATABASE_EC2_IP>
   ```

2. **Navigate to project directory** and start the database:
   ```bash
   cd proyecto\ semestral
   docker-compose -f docker-compose.db.yml --env-file .env.database up -d
   ```

3. **Verify the database is running**:
   ```bash
   docker ps
   docker-compose -f docker-compose.db.yml logs
   ```

4. **Note the private IP address** of this instance for the next step:
   ```bash
   hostname -I
   ```
   This will be used as `<DATABASE_EC2_IP>` in the backend configuration.

### Step 2: Deploy Backend Instance (EC2 Instance 2)

1. **SSH into the backend EC2 instance**:
   ```bash
   ssh -i your-key.pem ec2-user@<BACKEND_EC2_IP>
   ```

2. **Navigate to project directory**:
   ```bash
   cd proyecto\ semestral
   ```

3. **Update `.env.backend` with the database EC2 private IP**:
   ```bash
   nano .env.backend
   # Replace <DATABASE_EC2_IP> with the private IP from Step 1
   # Example: DB_HOST=10.0.1.45
   ```

4. **Start the backend**:
   ```bash
   docker-compose -f docker-compose.backend.yml --env-file .env.backend up -d
   ```

5. **Verify the backend is running**:
   ```bash
   docker ps
   docker-compose -f docker-compose.backend.yml logs
   # Wait for "Started SpringbootApiRestDespachoApplication" message
   ```

6. **Note the public IP address** of this instance:
   ```bash
   curl http://169.254.169.254/latest/meta-data/public-ipv4
   ```
   This will be used as `<BACKEND_EC2_IP>` in the frontend configuration.

### Step 3: Deploy Frontend Instance (EC2 Instance 3)

1. **SSH into the frontend EC2 instance**:
   ```bash
   ssh -i your-key.pem ec2-user@<FRONTEND_EC2_IP>
   ```

2. **Navigate to project directory**:
   ```bash
   cd proyecto\ semestral
   ```

3. **Update `.env.frontend` with the backend EC2 public IP**:
   ```bash
   nano .env.frontend
   # Replace <BACKEND_EC2_IP> with the public IP from Step 2
   # Example: VITE_API_URL=http://54.123.45.67:8080
   ```

4. **Start the frontend**:
   ```bash
   docker-compose -f docker-compose.frontend.yml --env-file .env.frontend up -d
   ```

5. **Verify the frontend is running**:
   ```bash
   docker ps
   docker-compose -f docker-compose.frontend.yml logs
   ```

## Security Group Configuration

Configure AWS Security Groups to allow communication between public and private resources:

### Frontend Instance Security Group (PUBLIC SUBNET):
- **Inbound Rule 1**: Port 80 (HTTP) from anywhere (0.0.0.0/0)
- **Inbound Rule 2**: Port 443 (HTTPS) from anywhere (0.0.0.0/0)
- **Outbound Rule**: Allow to Backend Security Group on port 8080

### Backend Instance Security Group (PRIVATE SUBNET):
- **Inbound Rule 1**: Port 8080 from Frontend Security Group
- **Inbound Rule 2**: Port 8080 from your IP (for management/debugging)
- **Outbound Rule**: Allow to Database Security Group on port 3306

### Database Instance Security Group (PRIVATE SUBNET):
- **Inbound Rule**: Port 3306 (MySQL) from Backend Security Group ONLY
- **No outbound rules needed** (database is read-only from application perspective)

## Accessing the Application

- **Frontend**: `http://<FRONTEND_EC2_IP>` (publicly accessible)
- **Backend API**: `http://<BACKEND_EC2_IP>:8080` (private - accessible only from Frontend or via VPN/Bastion)
- **Database**: `<DATABASE_EC2_IP>:3306` (private - only accessible from Backend)

**Note**: Since Backend and Database are in private subnets, they are not directly accessible from the internet. Access them through:
- SSH tunneling: `ssh -i key.pem -L 8080:10.0.1.x:8080 ec2-user@<frontend-public-ip>`
- Bastion Host (if configured)
- VPN connection to your VPC

## Useful Commands

### View logs:
```bash
# Specific service
docker-compose -f docker-compose.backend.yml logs -f

# All containers
docker ps -a
```

### Stop services:
```bash
docker-compose -f docker-compose.backend.yml down
```

### Restart a service:
```bash
docker-compose -f docker-compose.backend.yml restart
```

### SSH into a container:
```bash
docker exec -it despacho-backend bash
docker exec -it despacho-db bash
docker exec -it despacho-frontend bash
```

## Troubleshooting

### Backend cannot connect to database:
- Check that Database Instance security group allows traffic on port 3306
- Verify `DB_HOST` in `.env.backend` is the correct private IP
- Test connection: `docker exec despacho-backend bash -c "nc -zv <DB_HOST> 3306"`

### Frontend cannot reach backend:
- Check that Backend Instance security group allows traffic on port 8080
- Verify `VITE_API_URL` in `.env.frontend` uses the correct public IP
- Check browser console for CORS errors

### Database connection refused:
- Ensure database container is fully started (check `docker-compose logs`)
- Wait 30-60 seconds after starting the database container
- Check MySQL credentials in `.env.database` match `.env.backend`

## Database Initialization

The database is automatically initialized with the schema from `db/init.sql`. To add custom tables or data, edit that file before starting the database container.

## Updating Configuration

To update environment variables without restarting all containers:

1. Edit the `.env.*` file
2. Run: `docker-compose -f docker-compose.XXX.yml --env-file .env.XXX up -d`

Docker will only restart changed services.
