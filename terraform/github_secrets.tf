# ==============================================================================
# GitHub Actions Secrets for mechanicshop-web
# ==============================================================================
resource "github_actions_secret" "web_azure_client_id" {
  repository  = var.web_repository_name
  secret_name = "AZURE_CLIENT_ID"
  value       = data.azuread_application.mechanicshop_app.client_id
}

resource "github_actions_secret" "web_azure_tenant_id" {
  repository  = var.web_repository_name
  secret_name = "AZURE_TENANT_ID"
  value       = data.azurerm_client_config.current.tenant_id
}

resource "github_actions_secret" "web_azure_subscription_id" {
  repository  = var.web_repository_name
  secret_name = "AZURE_SUBSCRIPTION_ID"
  value       = var.azure_subscription_id
}
