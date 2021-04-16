output "repo_arn" {
  value = aws_ecr_repository.foo.arn
}

output "repo_url" {
  value = aws_ecr_repository.foo.repository_url
}
