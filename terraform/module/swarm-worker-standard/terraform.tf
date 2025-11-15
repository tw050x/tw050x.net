
terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

variable "digitalocean_admin_ssh_key_fingerprints" {
  type = list(string)
}

variable "digitalocean_infrastructure_droplet_configuration" {
  type = object({
    image  = string
    size   = string
    tags   = list(string)
  })
}

variable "digitalocean_infrastructure_droplet_name" {
  description = "The ID of the worker node"
  type = string
}

variable "digitalocean_infrastructure_region" {
  type = string

  validation {
    condition = contains(["lon1"], var.digitalocean_infrastructure_region)
    error_message = "Value must be a valid region"
  }
}

variable "digitalocean_infrastructure_vpc_id" {
  type = string
}

variable "digitalocean_infrastructure_vpc_ip_range" {
  type = string
}

variable "digitalocean_token" {
  type = string
}

variable "join_token" {
  default = null
  description = "The join token for the swarm. This is only needed for secondary nodes."
  type = string
}

variable "manager_advertise_ip" {
  description = "The IP address of the manager node to advertise to the worker node"
  type = string
}

resource "digitalocean_droplet" "infrastructure_worker" {
  lifecycle {
    create_before_destroy = true
  }

  name   = "dckr-swrm-wrkr-${var.digitalocean_infrastructure_droplet_configuration.size}--${var.digitalocean_infrastructure_droplet_name}"
  image  = var.digitalocean_infrastructure_droplet_configuration.image
  region = var.digitalocean_infrastructure_region
  size   = var.digitalocean_infrastructure_droplet_configuration.size

  vpc_uuid = var.digitalocean_infrastructure_vpc_id

  droplet_agent = true // Explicitly setting true ensures an error if the agent fails to install
  monitoring    = true

  ssh_keys = flatten([
    [for fingerprint in var.digitalocean_admin_ssh_key_fingerprints: fingerprint],
  ])
  user_data = templatefile("${path.module}/wrkr.join.yaml.tpl", {
    manager__worker_join_token = var.join_token
    manager_ip                 = var.manager_advertise_ip
    manager_port               = 2377
    swarm_ip_range             = var.digitalocean_infrastructure_vpc_ip_range
  })

  tags = var.digitalocean_infrastructure_droplet_configuration.tags
}

output "droplet_urn" {
  value = digitalocean_droplet.infrastructure_worker.urn
}
