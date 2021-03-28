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
  source = "../../"
}

module "container_repository" {
  source    = "../../../../../../modules/providers/aws/ecr"
  push_scan = var.push_scan
  repo_name = var.repo_name
}
