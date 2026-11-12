resource "azurerm_container_app_environment_managed_certificate" "client_cert" {
  for_each                     = var.enable_custom_domain ? toset(var.custom_domains) : toset([])
  name                         = "${replace(each.value, ".", "-")}-mc"
  container_app_environment_id = data.azurerm_container_app_environment.existing.id
  subject_name                 = each.value
  domain_control_validation    = startswith(each.value, "www.") ? "CNAME" : "HTTP"
}

resource "azurerm_container_app_custom_domain" "client_domain" {
  for_each         = var.enable_custom_domain ? toset(var.custom_domains) : toset([])
  name             = each.value
  container_app_id = azurerm_container_app.client.id

  # Omitting container_app_environment_certificate_id is required by azurerm when
  # using Azure Managed Certificates (which use /managedCertificates/ rather than /certificates/).
  lifecycle {
    ignore_changes = [
      certificate_binding_type,
      container_app_environment_certificate_id
    ]
  }
}
