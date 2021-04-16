data "terraform_remote_state" "infrastructure" {
  backend = "local"

  config = {
    path = "../../infrastructure/terraform.tfstate"
  }
}
