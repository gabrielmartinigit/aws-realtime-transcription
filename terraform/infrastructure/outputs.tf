output "ecs_cluster_id" {
  value = module.ecs_cluster.this_ecs_cluster_id
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