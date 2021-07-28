output "ecs_cluster_id" {
  value = module.ecs_cluster.ecs_cluster_id
}

output "private_subnets" {
  value = module.default_vpc.private_subnets
}

output "public_subnets" {
  value = module.default_vpc.public_subnets
}

output "vpc_id" {
  value = module.default_vpc.vpc_id
}

output "listener_arn" {
  value = aws_lb_listener.web.arn
}

output "ecs_cluster_name" {
  value = module.ecs_cluster.ecs_cluster_name
}