output "bucket_website_domain" {
  value = module.s3_bucket.s3_bucket_website_endpoint 
}
