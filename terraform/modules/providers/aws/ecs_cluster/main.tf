// Provision ECS Cluster stack

resource "aws_ecs_cluster" "this" {
  count              = var.create_ecs
  name               = var.cluster_name
  capacity_providers = var.capacity_providers

  dynamic "default_capacity_provider_strategy" {
    for_each = var.default_capacity_provider_strategy
    iterator = strategy

    content {
      capacity_provider = strategy.value["capacity_provider"]
      weight            = lookup(strategy.value, "weight", null)
      base              = lookup(strategy.value, "base", null)
    }
  }

  setting {
    name  = "containerInsights"
    value = var.container_insights ? "enabled" : "disabled"
  }

  tags = {
    Name        = var.cluster_name
    Environment = var.environment
  }
}

// END of ECS Cluster
