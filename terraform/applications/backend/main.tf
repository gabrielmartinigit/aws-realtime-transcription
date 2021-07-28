module "container_repository" {
  source    = "../../modules/ecr"
  push_scan = var.push_scan
  repo_name = var.name
}

module "transcription_table" {
  source   = "terraform-aws-modules/dynamodb-table/aws"
  name     = "${var.name}-transcription"
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
  name     = "${var.name}-audio"
  hash_key = "audio_id"
  attributes = [
    {
      name = "audio_id"
      type = "S"
    }
  ]
}

module "s3_bucket" {
  source = "terraform-aws-modules/s3-bucket/aws"
  bucket = var.name
  acl    = "private"
  cors_rule = [
    {
      allowed_headers = ["*"]
      allowed_methods = ["GET"]
      allowed_origins = ["*"]
      max_age_seconds = 3000
    },
  ]
  force_destroy = true
}

resource "aws_iam_role" "ecs_task_role" {
  name = "${var.name}-taskrole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      },
    ]
  })
}

resource "aws_iam_role_policy_attachment" "task_role_attach1" {
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
}

resource "aws_iam_role_policy_attachment" "task_role_attach2" {
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonTranscribeFullAccess"
}

resource "aws_iam_role_policy_attachment" "task_role_attach3" {
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
}

resource "aws_iam_role_policy_attachment" "task_role_attach4" {
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_lb_target_group" "transcribe-tg" {
  name        = var.name
  port        = 80
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = data.terraform_remote_state.infrastructure.outputs.vpc_id
}

resource "aws_lb_listener_rule" "transcribeapi" {
  listener_arn = data.terraform_remote_state.infrastructure.outputs.listener_arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.transcribe-tg.arn
  }

  condition {
    path_pattern {
      values = ["/transcribeapi", "/transcribeapi/*"]
    }
  }
}

module "container_sg" {
  source = "terraform-aws-modules/security-group/aws//modules/http-80"

  name        = var.name
  description = "Security group for container with HTTP ports open within VPC"
  vpc_id      = data.terraform_remote_state.infrastructure.outputs.vpc_id

  ingress_cidr_blocks = ["0.0.0.0/0"]

  tags = {
    Terraform = "true"
  }
}

resource "aws_cloudwatch_log_group" "aitelemetry_logs" {
  name = "${var.name}-logs"

  tags = {
    Terraform = "true"
  }
}

### Dummy Task Definition to create service ###
resource "aws_ecs_task_definition" "aitelemetry" {
  depends_on = [aws_iam_role.ecs_task_role]

  family                   = var.name
  container_definitions    = data.template_file.web_task.rendered
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]

  cpu    = "256"
  memory = "512"

  execution_role_arn = aws_iam_role.ecs_task_role.arn
  task_role_arn      = aws_iam_role.ecs_task_role.arn
}

resource "aws_ecs_service" "aitelemetry" {
  name    = "aitelemetry"
  cluster = data.terraform_remote_state.infrastructure.outputs.ecs_cluster_id

  task_definition                   = aws_ecs_task_definition.aitelemetry.arn
  enable_ecs_managed_tags           = true
  enable_execute_command            = true
  platform_version                  = "LATEST"
  health_check_grace_period_seconds = 0
  desired_count                     = 3

  capacity_provider_strategy {
    base              = 0
    capacity_provider = "FARGATE"
    weight            = 1
  }

  deployment_controller {
    type = "ECS"
  }

  network_configuration {
    subnets          = data.terraform_remote_state.infrastructure.outputs.private_subnets
    security_groups  = [module.container_sg.security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.transcribe-tg.arn
    container_name   = "transcribe-task"
    container_port   = 80
  }

  lifecycle {
    ignore_changes = [
      task_definition,
      desired_count
    ]
  }
}

resource "aws_appautoscaling_target" "ecs_target" {
  max_capacity       = 6
  min_capacity       = 3
  resource_id        = "service/${data.terraform_remote_state.infrastructure.outputs.ecs_cluster_name}/${aws_ecs_service.aitelemetry.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "ecs_policy" {
  name               = "ecs_service_cpu_scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_target.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_target.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }

    target_value       = 75
    scale_in_cooldown  = 300
    scale_out_cooldown = 300
  }
}
