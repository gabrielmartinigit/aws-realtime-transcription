module "default_vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = var.name
  cidr = "10.5.0.0/16"

  enable_dns_hostnames = true
  enable_dns_support   = true

  azs             = ["us-east-1a", "us-east-1b"]
  private_subnets = ["10.5.0.0/24", "10.5.1.0/24"]
  public_subnets  = ["10.5.3.0/24", "10.5.2.0/24"]

  enable_nat_gateway = true

  tags = {
    Terraform = "true"
  }
}

module "alb_sg" {
  source = "terraform-aws-modules/security-group/aws//modules/http-80"

  name        = var.name
  description = "Security group for alb with HTTP ports open within VPC"
  vpc_id      = module.default_vpc.vpc_id

  ingress_cidr_blocks = ["0.0.0.0/0"]

  tags = {
    Terraform = "true"
  }
}

module "alb" {
  source = "terraform-aws-modules/alb/aws"

  name               = "telemetry-alb"
  load_balancer_type = "application"

  vpc_id          = module.default_vpc.vpc_id
  subnets         = module.default_vpc.public_subnets
  security_groups = [module.alb_sg.this_security_group_id]

  tags = {
    Terraform = "true"
  }
}

resource "aws_lb_listener" "web" {
  load_balancer_arn = module.alb.this_lb_arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "NOT FOUND"
      status_code  = "404"
    }
  }
}

module "ecs_cluster" {
  source = "terraform-aws-modules/ecs/aws"

  name = var.name

  container_insights = true

  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy = [
    {
      capacity_provider = "FARGATE",
      weight            = "1"
    }
  ]

  tags = {
    Terraform = "true"
  }
}
