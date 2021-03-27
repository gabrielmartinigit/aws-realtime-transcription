// VPC Variables

variable "vpc_name" {
  default = "aitelemetry-vpc"
}

variable "cidr_vpc" {
  default = "10.5.0.0/16"
}

variable "cidr_network_bits" {
  default = "8"
}

variable "subnet_count" {
  default = "2"
}

variable "azs" {
  default = {
    "us-east-1" = "us-east-1a,us-east-1b"
  }
}

variable "region" {
  default = "us-east-1"
}

variable "zone_name" {
  default = "client"
}

variable "environment" {
  default = "dev"
}