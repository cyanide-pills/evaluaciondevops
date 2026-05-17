# GitHub Actions CI/CD Workflows

Three automated CI/CD workflows for deploying to AWS EC2 instances via ECR.

## Workflows

### 1. [cicd-backend.yml](.github/workflows/cicd-backend.yml)
- **Triggers**: Push to `main` with changes in `back-Despachos_SpringBoot/**`
- **Steps**:
  1. Builds Spring Boot Docker image
  2. Pushes to ECR
  3. Deploys to Backend EC2 instance via SSM
- **Ports**: 8080

### 2. [cicd-frontend.yml](.github/workflows/cicd-frontend.yml)
- **Triggers**: Push to `main` with changes in `front_despacho/**`
- **Steps**:
  1. Builds React+Vite Docker image
  2. Pushes to ECR
  3. Deploys to Frontend EC2 instance via SSM
- **Ports**: 80

### 3. [cicd-database.yml](.github/workflows/cicd-database.yml)
- **Triggers**: Push to `main` with changes in `db/**`
- **Steps**:
  1. Builds MySQL Docker image
  2. Pushes to ECR
  3. Deploys to Database EC2 instance via SSM
- **Ports**: 3306

## Required GitHub Secrets

Add these secrets to your repository (Settings → Secrets and variables → Actions):

### AWS Credentials
```
AWS_ACCESS_KEY_ID              # Your AWS access key
AWS_SECRET_ACCESS_KEY          # Your AWS secret key
AWS_SESSION_TOKEN              # Optional: if using temporary credentials
AWS_REGION                      # e.g., us-east-1
ECR_REGISTRY                    # Your ECR registry URL (e.g., 123456789.dkr.ecr.us-east-1.amazonaws.com)
```

### EC2 Instance IDs
```
EC2_BACKEND_INSTANCE_ID        # Instance ID of backend (private subnet)
EC2_FRONTEND_INSTANCE_ID       # Instance ID of frontend (public subnet)
EC2_DATABASE_INSTANCE_ID       # Instance ID of database (private subnet)
```

### Database Configuration
```
MYSQL_ROOT_PASSWORD             # Root password for MySQL
MYSQL_PASSWORD                  # Password for despacho_user
DB_USER                         # despacho_user
```

### Network Configuration
```
DATABASE_EC2_IP                 # Private IP of database EC2 instance
BACKEND_EC2_IP                  # Private IP of backend EC2 instance
```

## How It Works

1. **Automatic Triggering**: Workflows run automatically when code is pushed to `main` in specific directories
2. **ECR Push**: Docker images are built and pushed to AWS Elastic Container Registry
3. **SSM Deployment**: AWS Systems Manager runs commands on EC2 instances to:
   - Login to ECR
   - Pull latest image
   - Stop old container
   - Start new container with environment variables

## EC2 Instance Requirements

Each instance must have:
- Docker installed
- AWS SSM Agent running (enabled by default on Amazon Linux 2)
- IAM role with permissions for:
  - `ecr:GetAuthorizationToken`
  - `ecr:BatchGetImage`
  - `ecr:GetDownloadUrlForLayer`
  - CloudWatch Logs (for SSM)

### Example IAM Policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchGetImage",
        "ecr:GetDownloadUrlForLayer"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ssm:UpdateInstanceInformation",
        "ssmmessages:AcknowledgeMessage",
        "ssmmessages:GetEndpoint",
        "ssmmessages:GetMessages",
        "ec2messages:AcknowledgeMessage",
        "ec2messages:GetEndpoint",
        "ec2messages:GetMessages"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogStreams"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

## Monitoring Deployments

### GitHub Actions UI
- Go to your repository → **Actions** tab
- Click on a workflow to see detailed logs

### AWS SSM
- Go to AWS Systems Manager → **Session Manager**
- View command execution history and output

### EC2 Containers
- SSH into instance: `ssh -i key.pem ec2-user@instance-ip`
- Check running containers: `docker ps`
- View logs: `docker logs container-name`

## Troubleshooting

### Workflow fails: "ECR repository not found"
- Make sure ECR repositories exist or workflows have permission to create them
- Repository names: `despacho-backend`, `despacho-frontend`, `despacho-database`

### SSM command fails: "Instance not found"
- Verify instance IDs in secrets match running instances
- Ensure EC2 instances have SSM agent running
- Check EC2 instance IAM role has SSM permissions

### Container doesn't start after deployment
- SSH into instance and check logs: `docker logs despacho-backend`
- Verify environment variables are correctly set
- Ensure ports are available (check `netstat -tlnp`)

### ECR authentication fails
- Verify AWS credentials in GitHub secrets are correct
- Check AWS credentials have ECR permissions
- Verify AWS region matches ECR registry region

## Manual Testing

To manually test without committing:
```bash
# Build locally
cd back-Despachos_SpringBoot/Springboot-API-REST-DESPACHO
docker build -t despacho-backend .

# Tag for ECR
docker tag despacho-backend:latest YOUR_ECR_REGISTRY/despacho-backend:latest

# Login to ECR
aws ecr get-login-password --region YOUR_REGION | docker login --username AWS --password-stdin YOUR_ECR_REGISTRY

# Push
docker push YOUR_ECR_REGISTRY/despacho-backend:latest
```
