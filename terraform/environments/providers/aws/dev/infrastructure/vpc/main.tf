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

//Import the constants
module "environment" {
  source = "../../"
}

module "default_vpc" {
  source      = "../../../../../../modules/providers/aws/vpc"
  vpc_name    = var.vpc_name
  cidr_vpc    = var.cidr_vpc
  environment = "dev"
}
