output "client_fqdn" {
  description = "FQDN of the Client Container App (use as CNAME target for www)"
  value       = azurerm_container_app.client.ingress[0].fqdn
}

output "environment_static_ip" {
  description = "Static IP of the Container App Environment (use as A record target for @)"
  value       = data.azurerm_container_app_environment.existing.static_ip_address
}

output "custom_domain_verification_id" {
  description = "Domain verification ID (use as TXT record value for asuid and asuid.www)"
  value       = azurerm_container_app.client.custom_domain_verification_id
  sensitive   = true
}
