terraform {
  required_providers {
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

resource "tls_private_key" "swarm_manager__london_01" {
  algorithm = "ED25519"
}

resource "local_sensitive_file" "private_key" {
  content         = tls_private_key.swarm_manager__london_01.private_key_openssh
  filename        = "../../.ssh/dckr-swrm-mngr.london-01.services.ED25519"
  file_permission = "0600"
}

resource "local_sensitive_file" "public_key" {
  content         = tls_private_key.swarm_manager__london_01.public_key_openssh
  filename        = "../../.ssh/dckr-swrm-mngr.london-01.services.ED25519.pub"
  file_permission = "0600"
}
