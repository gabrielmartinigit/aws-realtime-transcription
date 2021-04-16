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
  policy_arn = data.aws_iam_policy.AmazonS3FullAccess.arn
}

resource "aws_iam_role_policy_attachment" "task_role_attach2" {
  role       = aws_iam_role.ecs_transcribe_task.name
  policy_arn = data.aws_iam_policy.AmazonTranscribeFullAccess.arn
}

resource "aws_iam_role_policy_attachment" "task_role_attach3" {
  role       = aws_iam_role.ecs_transcribe_task.name
  policy_arn = data.aws_iam_policy.AmazonDynamoDBFullAccess.arn
}

resource "aws_iam_role_policy_attachment" "task_role_attach4" {
  role       = aws_iam_role.ecs_transcribe_task.name
  policy_arn = data.aws_iam_policy.AmazonECSTaskExecutionRolePolicy.arn
}
