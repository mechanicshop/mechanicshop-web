output "client_fqdn" {
  description = "FQDN of the Client Container App"
  value       = azurerm_container_app.client.ingress[0].fqdn
}
