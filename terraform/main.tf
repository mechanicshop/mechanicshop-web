# Reference existing shared infrastructure created and owned by mechanicshop-api / shared platform
data "azurerm_resource_group" "app_rg" {
  name = "mechanic-shop-rg"
}

data "azurerm_container_app_environment" "existing" {
  name                = "quiznova-env"
  resource_group_name = "quiz-nova-resource-group"
}

data "azuread_application" "mechanicshop_app" {
  client_id = "d04e166e-1108-4be8-a8ba-09fe498785af"
}
