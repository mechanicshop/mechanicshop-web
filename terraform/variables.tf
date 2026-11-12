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

variable "custom_domains" {
  type        = list(string)
  description = "Custom domain names to bind to the client Container App"
  default     = ["mechanicshop.tech", "www.mechanicshop.tech"]
}

variable "enable_custom_domain" {
  type        = bool
  description = "Set to true after configuring DNS records (A, CNAME, and asuid TXT) in the get.tech dashboard"
  default     = true
}
