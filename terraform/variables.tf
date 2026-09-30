variable "azure_subscription_id" {
  type        = string
  description = "Azure Subscription ID"
  default     = "83ab56f5-88ee-436d-87a5-994d3185bf00"
}

variable "github_owner" {
  type        = string
  description = "GitHub Organization or Owner"
  default     = "mechanicshop"
}

variable "web_repository_name" {
  type        = string
  description = "Frontend repository name"
  default     = "mechanicshop-web"
}

variable "git_branch" {
  type        = string
  description = "Target deployment branch for OIDC federated credentials"
  default     = "main"
}

variable "github_token" {
  type        = string
  description = "GitHub Personal Access Token for GHCR pull secret"
  sensitive   = true
  default     = null
}
