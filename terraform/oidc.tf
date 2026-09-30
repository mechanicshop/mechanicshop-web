# --- Federated Credentials for Web Repository ---
resource "azuread_application_federated_identity_credential" "web_main" {
  application_id = data.azuread_application.mechanicshop_app.id
  display_name   = "github-actions-mechanicshop-web-main"
  description    = "Federated credential for mechanicshop-web main branch"
  audiences      = ["api://AzureADTokenExchange"]
  issuer         = "https://token.actions.githubusercontent.com"
  subject        = "repo:${var.github_owner}/${var.web_repository_name}:ref:refs/heads/${var.git_branch}"
}

resource "azuread_application_federated_identity_credential" "web_main_enhanced" {
  application_id = data.azuread_application.mechanicshop_app.id
  display_name   = "github-actions-mechanicshop-web-enhanced"
  description    = "Federated credential for mechanicshop-web enhanced format"
  audiences      = ["api://AzureADTokenExchange"]
  issuer         = "https://token.actions.githubusercontent.com"
  subject        = "repo:${var.github_owner}@335052983/${var.web_repository_name}@1393002315:ref:refs/heads/${var.git_branch}"
}
