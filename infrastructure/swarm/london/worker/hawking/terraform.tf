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

variable "manager_advertise_ip" {
  description = "The IP address of the manager node to advertise to the worker node"
  type = string
}

provider "digitalocean" {
  token = var.digitalocean_token
}

data "digitalocean_vpc" "london" {
  name = "dckr-london-vpc--swrm"
}

module "worker" {
  source = "../../../../terraform/module/swarm-worker-standard"

  digitalocean_admin_ssh_key_fingerprints = var.digitalocean_admin_ssh_key_fingerprints
  digitalocean_infrastructure_droplet_configuration = {
    image   = "docker-20-04"
    primary = true
    size    = "s-1vcpu-1gb" # can handle up to 30 nodes
    tags    = [
      "name:hawking",
      "requires:database",
      "role:worker"
    ]
  }
  digitalocean_infrastructure_region = "lon1"
  digitalocean_infrastructure_vpc_id = data.digitalocean_vpc.london.id
  digitalocean_infrastructure_vpc_ip_range = data.digitalocean_vpc.london.ip_range
  digitalocean_token = var.digitalocean_token

  join_token = var.join_token
  manager_advertise_ip = var.manager_advertise_ip
  digitalocean_infrastructure_droplet_name = "hawking"
}

data "digitalocean_project" "infrastructure" {
  id = var.digitalocean_infrastructure_project_id
}

resource "digitalocean_project_resources" "infrastructure" {
  project = data.digitalocean_project.infrastructure.id
  resources = [
    module.worker.droplet_urn
  ]
}
