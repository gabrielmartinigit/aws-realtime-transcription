output "repo_arn" {
  value = module.container_repository.repo_arn
}

output "repo_url" {
  value = module.container_repository.repo_url
}

output "ddb_table_trans" {
  value = module.transcription_table.this_dynamodb_table_id
}

output "ddb_table_audio" {
  value = module.audio_table.this_dynamodb_table_id
}
