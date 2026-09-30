resource "azurerm_container_app" "client" {
  name                         = "mechanic-shop-client"
  container_app_environment_id = data.azurerm_container_app_environment.existing.id
  resource_group_name          = data.azurerm_resource_group.app_rg.name
  revision_mode                = "Single"
  workload_profile_name        = "Consumption"

  secret {
    name  = "ghcr-pull-secret"
    value = var.github_token
  }

  registry {
    server               = "ghcr.io"
    username             = "moamenelbarky"
    password_secret_name = "ghcr-pull-secret"
  }

  template {
    min_replicas = 0
    max_replicas = 1

    container {
      name   = "mechanic-shop-client"
      image  = "ghcr.io/mechanicshop/mechanic-shop-client:latest"
      cpu    = "0.5"
      memory = "1Gi"

      env {
        name  = "PORT"
        value = "4000"
      }
      env {
        name  = "API_URL"
        value = "http://mechanic-shop-api"
      }
      env {
        name  = "NG_ALLOWED_HOSTS"
        value = "mechanic-shop-client.purpleforest-454b82e9.swedencentral.azurecontainerapps.io"
      }
    }
  }

  ingress {
    allow_insecure_connections = false
    external_enabled           = true
    target_port                = 4000
    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  lifecycle {
    ignore_changes = [
      template[0].container[0].image,
      template[0].container[0].liveness_probe,
      template[0].container[0].readiness_probe,
      template[0].container[0].startup_probe,
      template[0].container[0].env,
      secret,
      registry
    ]
  }
}
