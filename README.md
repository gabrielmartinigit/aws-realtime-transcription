# AWS Real-time transcription demo

## Getting Started

### Frontend
```
cd frontend/
npm install
npm start
npm build
```

### Backend
```
cd backend/
virtualenv venv
source venv/bin/activate
pip install -r requirements
```

### IaC
```
cd terraform/
terraform init
terraform fmt
terraform validate
terraform plan
terraform apply
```
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