# AWS Transcription demo

## Getting Started

### IaC
```
cd terraform/
terraform init
terraform fmt
terraform validate
terraform plan
terraform apply
```

### Backend
```
cd backend/
virtualenv venv
source venv/bin/activate
pip install -r requirements
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ACCOUNT ID>.dkr.ecr.us-east-1.amazonaws.com
docker build -t aitelemetry-repository .
docker tag aitelemetry-repository:latest <ACCOUNT ID>.dkr.ecr.us-east-1.amazonaws.com/aitelemetry-repository:latest
docker push <ACCOUNT ID>.dkr.ecr.us-east-1.amazonaws.com/aitelemetry-repository:latest
# Crie uma task isolada do tipo Fargate nas subnets públicas utilizando a Role: ecs_transcribe_task
```

### Frontend
```
cd frontend/
npm install
npm start
# Ajustar em src/services/api.js para o IP público do container
npm run build
aws s3 rm s3://<BUCKET NAME>/ --recursive
aws s3 cp build/ s3://<BUCKET NAME>/ --recursive --acl public-read
```

Open the website: http://<BUCKET NAME>.s3-website-us-east-1.amazonaws.com

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