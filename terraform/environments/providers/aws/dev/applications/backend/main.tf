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

module "transcription_table" {
  source   = "terraform-aws-modules/dynamodb-table/aws"
  name     = var.table_name_trans
  hash_key = "trans_id"
  attributes = [
    {
      name = "trans_id"
      type = "S"
    }
  ]
}

module "audio_table" {
  source   = "terraform-aws-modules/dynamodb-table/aws"
  name     = var.table_name_audio
  hash_key = "audio_id"
  attributes = [
    {
      name = "audio_id"
      type = "S"
    }
  ]
}

module "s3_bucket" {
  source        = "terraform-aws-modules/s3-bucket/aws"
  bucket        = var.bucket_name
  acl           = "private"
  force_destroy = true
}
