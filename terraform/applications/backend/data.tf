data "terraform_remote_state" "infrastructure" {
  backend = "local"

  config = {
    path = "../../infrastructure/terraform.tfstate"
  }
}

data "template_file" "web_task" {
  template = file("${path.module}/tasks/web_task_definition.json")

  vars = {
    log_group = aws_cloudwatch_log_group.aitelemetry_logs.name
  }
}
