
terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

variable "digitalocean_token" {
  type = string
}

provider "digitalocean" {
  token = var.digitalocean_token
}

resource "digitalocean_vpc" "london" {
  ip_range = "10.106.0.0/24"
  name     = "dckr-london-vpc--swrm"
  region   = "lon1"
}
