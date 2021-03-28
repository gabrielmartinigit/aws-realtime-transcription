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

module "dynamodb_table" {
  source   = "terraform-aws-modules/dynamodb-table/aws"
  name     = var.table_name
  hash_key = "id"
  attributes = [
    {
      name = "id"
      type = "N"
    }
  ]
}

module "s3_bucket" {
  source        = "terraform-aws-modules/s3-bucket/aws"
  bucket        = var.bucket_name
  acl           = "private"
  force_destroy = true
}
