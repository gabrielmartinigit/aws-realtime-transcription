# AWS Transcription Demo

## Getting Started

### IaC
```
cd terraform/
# Infrastructure
cd infrastructure/
# change vars.tf file with a new name
terraform init
terraform fmt
terraform validate
terraform plan
terraform apply
cd ../
# Application
cd applications/
cd backend/
# change vars.tf file with a new name
terraform init
terraform fmt
terraform validate
terraform plan
terraform apply
# repeat for frontend
```

### Backend

- Testing local:
```
cd backend/
virtualenv venv
source venv/bin/activate
pip install -r requirements.txt
# Change config.py file
docker build -t aitelemetry-repository .
docker run -d -p 80:80 aitelemetry-repository:latest
```

- Deploy ECS service:
```
# Change config.py file
# Build & Push image to ECR
# Update Task Definition https://docs.aws.amazon.com/AmazonECS/latest/developerguide/update-task-definition.html (E.g. in backend/task-definition.json)
# Update the ECS Service
aws ecs update-service --cluster <CLUSTER_NAME> --service aitelemetry --task-definition <FAMILY> --force-new-deployment
```

### Frontend

- Testing local:
```
cd frontend/
npm install
npm start
```

- Deploy S3 frontend:
```
# Adjust localhost in src/services/api.js for loadbalancer' DNS
npm install
npm run build
aws s3 rm s3://<BUCKET NAME>/ --recursive
aws s3 cp build/ s3://<BUCKET NAME>/ --recursive --acl public-read
```

- Open the website: http://<BUCKET NAME>.s3-website-us-east-1.amazonaws.com

## Clean Up

```
cd terraform/
terraform destroy
```

## References
- https://github.com/awslabs/amazon-transcribe-streaming-sdk
- https://automationrhapsody.com/how-to-use-aws-transcribe-in-real-time-with-react-and-net-core/
- https://docs.aws.amazon.com/transcribe/latest/dg/streaming.html
- https://www.hashicorp.com/resources/terraform-repository-best-practices
- https://github.com/aws-samples/aws-transcribe-captioning-tools