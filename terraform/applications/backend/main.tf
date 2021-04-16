module "container_repository" {
  source    = "../../modules/ecr"
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
  source = "terraform-aws-modules/s3-bucket/aws"
  bucket = var.bucket_name
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

resource "aws_iam_role" "ecs_transcribe_task" {
  name = "ecs_transcribe_task"

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

  tags = {
    Name = "ecs_transcribe_task"
  }
}

resource "aws_iam_role_policy_attachment" "task_role_attach1" {
  role       = aws_iam_role.ecs_transcribe_task.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
}

resource "aws_iam_role_policy_attachment" "task_role_attach2" {
  role       = aws_iam_role.ecs_transcribe_task.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonTranscribeFullAccess"
}

resource "aws_iam_role_policy_attachment" "task_role_attach3" {
  role       = aws_iam_role.ecs_transcribe_task.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
}

resource "aws_iam_role_policy_attachment" "task_role_attach4" {
  role       = aws_iam_role.ecs_transcribe_task.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# resource "aws_lb_listener_rule" "transcribeapi" {
#   listener_arn = aws_lb_listener.front_end.arn
#   priority     = 100

#   action {
#     type             = "forward"
#     target_group_arn = aws_lb_target_group.static.arn
#   }

#   condition {
#     path_pattern {
#       values = ["/transcribeapi/*"]
#     }
#   }
# }

module "container_sg" {
  source = "terraform-aws-modules/security-group/aws//modules/http-80"

  name        = "container_sg"
  description = "Security group for container with HTTP ports open within VPC"
  vpc_id      = data.terraform_remote_state.infrastructure.outputs.vpc_id

  ingress_cidr_blocks = ["0.0.0.0/0"]

  tags = {
    Terraform = "true"
  }
}

resource "aws_ecs_task_definition" "aitelemetry" {
  depends_on = [aws_iam_role.ecs_transcribe_task]

  family                = "aitelemetry"
  container_definitions = file("files/dummy-task.json")
}

resource "aws_ecs_service" "aitelemetry" {
  name    = "aitelemetry"
  cluster = data.terraform_remote_state.infrastructure.outputs.ecs_cluster_id

  task_definition         = aws_ecs_task_definition.aitelemetry.arn
  enable_ecs_managed_tags = true
  enable_execute_command  = true

  network_configuration {
    subnets          = data.terraform_remote_state.infrastructure.outputs.private_subnets
    security_groups  = [module.container_sg.this_security_group_id]
    assign_public_ip = false
  }

  # load_balancer {
  #   target_group_arn = aws_lb_target_group.foo.arn
  #   container_name   = "mongo"
  #   container_port   = 8080
  # }
}
