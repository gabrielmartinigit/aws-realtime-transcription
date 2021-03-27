variable "create_ecs" {
  default = 1
}

variable "cluster_name" {
  default = "aitelemetry-cluster"
}

variable "capacity_providers" {
  default = []
}

variable "default_capacity_provider_strategy" {
  default = []
}

variable "container_insights" {
  default = false
}

variable "environment" {
  default = "dev"
}

variable "region" {
  default = "us-east-1"
}
