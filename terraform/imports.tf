# ==============================================================================
# Declarative Imports for Existing Azure and GitHub Resources (Web)
# ==============================================================================

# 1. Existing Container App - Client
import {
  to = azurerm_container_app.client
  id = "/subscriptions/83ab56f5-88ee-436d-87a5-994d3185bf00/resourceGroups/mechanic-shop-rg/providers/Microsoft.App/containerApps/mechanic-shop-client"
}

# 2. Existing Federated Identity Credentials - Web
import {
  to = azuread_application_federated_identity_credential.web_main
  id = "b090c041-6479-4477-8403-b7054f127667/federatedIdentityCredential/6d8988f3-cccb-427f-976a-dc47e34bf061"
}

import {
  to = azuread_application_federated_identity_credential.web_main_enhanced
  id = "b090c041-6479-4477-8403-b7054f127667/federatedIdentityCredential/0858365e-df37-42f3-bbe4-14b394c4a0c3"
}

# 3. Existing GitHub Actions Secrets - Web
import {
  to = github_actions_secret.web_azure_client_id
  id = "mechanicshop-web:AZURE_CLIENT_ID"
}

import {
  to = github_actions_secret.web_azure_tenant_id
  id = "mechanicshop-web:AZURE_TENANT_ID"
}

import {
  to = github_actions_secret.web_azure_subscription_id
  id = "mechanicshop-web:AZURE_SUBSCRIPTION_ID"
}

# 4. Existing Custom Domains & Managed Certificates - Client
import {
  to = azurerm_container_app_environment_managed_certificate.client_cert["mechanicshop.tech"]
  id = "/subscriptions/83ab56f5-88ee-436d-87a5-994d3185bf00/resourceGroups/quiz-nova-resource-group/providers/Microsoft.App/managedEnvironments/quiznova-env/managedCertificates/mechanicshop-tech-mc"
}

import {
  to = azurerm_container_app_environment_managed_certificate.client_cert["www.mechanicshop.tech"]
  id = "/subscriptions/83ab56f5-88ee-436d-87a5-994d3185bf00/resourceGroups/quiz-nova-resource-group/providers/Microsoft.App/managedEnvironments/quiznova-env/managedCertificates/www-mechanicshop-tech-mc"
}

import {
  to = azurerm_container_app_custom_domain.client_domain["mechanicshop.tech"]
  id = "/subscriptions/83ab56f5-88ee-436d-87a5-994d3185bf00/resourceGroups/mechanic-shop-rg/providers/Microsoft.App/containerApps/mechanic-shop-client/customDomainName/mechanicshop.tech"
}

import {
  to = azurerm_container_app_custom_domain.client_domain["www.mechanicshop.tech"]
  id = "/subscriptions/83ab56f5-88ee-436d-87a5-994d3185bf00/resourceGroups/mechanic-shop-rg/providers/Microsoft.App/containerApps/mechanic-shop-client/customDomainName/www.mechanicshop.tech"
}
