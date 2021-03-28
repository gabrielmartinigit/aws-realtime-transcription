output "repo_arn" {
  value = module.container_repository.repo_arn
}

output "repo_url" {
  value = module.container_repository.repo_url
}

output "ddb_table" {
  value = module.dynamodb_table.this_dynamodb_table_id
}
