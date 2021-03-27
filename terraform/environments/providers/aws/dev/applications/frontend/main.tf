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

module "s3_bucket" {
  source        = "terraform-aws-modules/s3-bucket/aws"
  bucket        = var.bucket_name
  acl           = "private"
  force_destroy = true

  website = {
    index_document = "index.html"
    error_document = "index.html"
  }
}
