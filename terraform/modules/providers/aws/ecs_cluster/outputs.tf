output "ecs_cluster_arn" {
  value       = concat(aws_ecs_cluster.this.*.arn, [""])[0]
}

output "ecs_cluster_name" {
  value       = var.cluster_name
}
