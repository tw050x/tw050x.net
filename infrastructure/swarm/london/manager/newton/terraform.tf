terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 2.5.2"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0.6"
    }
  }
}

variable "digitalocean_admin_ssh_key_fingerprints" {
  description = "List of SSH key fingerprints to use for the droplet"
  type = list(string)
}

variable "digitalocean_infrastructure_project_id" {
  description = "The ID of the DigitalOcean project"
  type = string
}

variable "digitalocean_token" {
  description = "DigitalOcean API token"
  type = string
}

variable "join_token" {
  default = null
  description = "The join token for the swarm. If not provided then the node will initialise rather than join"
  type = string
}

provider "digitalocean" {
  token = var.digitalocean_token
}

data "digitalocean_vpc" "london" {
  name = "dckr-london-vpc--swrm"
}

data "local_sensitive_file" "public_key" {
  filename        = "../../../../.ssh/dckr-swrm-mngr.london-01.services.ED25519.pub"
}

module "manager" {
  source = "../../../../terraform/module/swarm-manager-standard"

  digitalocean_admin_ssh_key_fingerprints = var.digitalocean_admin_ssh_key_fingerprints
  digitalocean_infrastructure_droplet_name = "newton"
  digitalocean_infrastructure_droplet_configuration = {
    image   = "docker-20-04"
    primary = true
    size    = "s-1vcpu-1gb" # can handle up to 30 nodes
    tags    = [
      "name:newton",
      "role:manager"
    ]
  }
  digitalocean_infrastructure_droplet_metadata_url = "http://169.254.169.254/metadata/v1"
  digitalocean_infrastructure_region = "lon1"
  digitalocean_infrastructure_vpc_id = data.digitalocean_vpc.london.id
  digitalocean_infrastructure_vpc_ip_range = data.digitalocean_vpc.london.ip_range
  digitalocean_token = var.digitalocean_token

  join_token = var.join_token

  user_public_keys = {
    services = data.local_sensitive_file.public_key.content
  }
}

data "digitalocean_project" "infrastructure" {
  id = var.digitalocean_infrastructure_project_id
}

resource "digitalocean_project_resources" "infrastructure" {
  project = data.digitalocean_project.infrastructure.id
  resources = [
    module.manager.droplet_urn,
  ]
}
