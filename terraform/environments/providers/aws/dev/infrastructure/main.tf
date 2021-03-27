provider "aws" {
  region = module.environment.aws_region
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.27"
    }
  }
}

module "environment" {
  source = "../"
}

module "default_vpc" {
  source      = "../../../../../modules/providers/aws/vpc"
  vpc_name    = var.vpc_name
  cidr_vpc    = var.cidr_vpc
  environment = module.environment.environment_name
}

module "ecs_cluster" {
  source             = "../../../../../modules/providers/aws/ecs_cluster"
  cluster_name       = var.cluster_name
  container_insights = false
  capacity_providers = ["FARGATE", "FARGATE_SPOT"]
  default_capacity_provider_strategy = [{
    capacity_provider = "FARGATE"
    weight            = "1"
  }]
  environment = module.environment.environment_name
}
