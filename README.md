# AWS Transcription Demo

## Getting Started

### IaC
```
# Change vars on Terraform
cd terraform/
terraform init
terraform fmt
terraform validate
terraform plan
terraform apply
```

### Backend

- Testing local:
```
cd backend/
virtualenv venv
source venv/bin/activate
pip install -r requirements
docker build -t aitelemetry-repository .
docker run -d -p 80:80 aitelemetry-repository:latest
```

- Push image:
```
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ACCOUNT ID>.dkr.ecr.us-east-1.amazonaws.com
docker tag aitelemetry-repository:latest <ACCOUNT ID>.dkr.ecr.us-east-1.amazonaws.com/aitelemetry-repository:latest
docker push <ACCOUNT ID>.dkr.ecr.us-east-1.amazonaws.com/aitelemetry-repository:latest
```

- Deploy ECS service:
```
# Update Task Definition https://docs.aws.amazon.com/AmazonECS/latest/developerguide/update-task-definition.html (E.g. in backend/task-definition.json)
# Update the ECS Service
aws ecs update-service --cluster aitelemetry --service aitelemetry --task-defition aitelemetry:<REVISION> --force-new-deployment
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