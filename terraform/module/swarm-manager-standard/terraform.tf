
terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

variable "digitalocean_admin_ssh_key_fingerprints" {
  description = "List of SSH key fingerprints to use for the droplet"
  type = list(string)
}

variable "digitalocean_infrastructure_droplet_configuration" {
  description = "Configuration for the droplet"
  type = object({
    image   = string
    primary = optional(bool, false)
    size    = string
    tags    = list(string)
  })
}

variable "digitalocean_infrastructure_droplet_name" {
  description = "The name suffix for the droplet"
  type = string
}

variable "digitalocean_infrastructure_droplet_metadata_url" {
  description = "The URL to the metadata service for the droplet"
  type = string
}

variable "digitalocean_infrastructure_region" {
  description = "The region to create the droplet in"
  type = string

  validation {
    condition = contains(["lon1"], var.digitalocean_infrastructure_region)
    error_message = "Value must be a valid region"
  }
}

variable "digitalocean_infrastructure_vpc_id" {
  description = "The ID of the VPC to use for the droplet"
  type = string
}

variable "digitalocean_infrastructure_vpc_ip_range" {
  description = "The IP range of the VPC in CIDR notation"
  type = string
}

variable "digitalocean_token" {
  description = "DigitalOcean API token"
  type = string
}

variable "join_token" {
  default = null
  description = "The join token for the swarm. This is only needed for secondary nodes."
  type = string
}

variable "user_public_keys" {
  description = "Public keys for the user on the droplet. Needed for deployments via SSH"
  type = object({
    services  = string
  })
}

resource "digitalocean_droplet" "infrastructure_manager" {
  lifecycle {
    create_before_destroy = true
  }

  name   = "dckr-swrm-mngr-${var.digitalocean_infrastructure_droplet_configuration.size}--${var.digitalocean_infrastructure_droplet_name}"
  image  = var.digitalocean_infrastructure_droplet_configuration.image
  region = var.digitalocean_infrastructure_region
  size   = var.digitalocean_infrastructure_droplet_configuration.size

  vpc_uuid = var.digitalocean_infrastructure_vpc_id

  droplet_agent = true // Explicitly setting true ensures an error if the agent fails to install
  monitoring    = true

  ssh_keys = [
    for fingerprint in var.digitalocean_admin_ssh_key_fingerprints : fingerprint
  ]
  user_data = templatefile(
    var.join_token == null
      ? "${path.module}/mngr.initialise.remote.yaml.tpl"
      : "${path.module}/mngr.join.remote.yaml.tpl",
    {
      metadata_url        = var.digitalocean_infrastructure_droplet_metadata_url
      # The public keys does not apply to the root user, so needs to be passed in via user_data.
      # Keep in mind that these are "public keys" and so its not a security risk to pass them in this way
      services_public_key = var.user_public_keys.services
      swarm_ip_range      = var.digitalocean_infrastructure_vpc_ip_range
    }
  )

  tags = var.digitalocean_infrastructure_droplet_configuration.tags
}

output "droplet_ipv4_address" {
  value = digitalocean_droplet.infrastructure_manager.ipv4_address
}

output "droplet_urn" {
  value = digitalocean_droplet.infrastructure_manager.urn
}
