#cloud-config

# Run commands
runcmd:
  - mkdir /root/acme
  - ufw allow from ${swarm_ip_range} to any port 2377 proto tcp
  - ufw allow from ${swarm_ip_range} to any port 4789 proto udp
  - ufw allow from ${swarm_ip_range} to any port 7946 proto udp
  - ufw allow from ${swarm_ip_range} to any port 7946 proto tcp
  - docker swarm init --advertise-addr $(curl ${metadata_url}/interfaces/private/0/ipv4/address)

# Add custom users
users:
  - name: services
    ssh-authorized-keys:
      - ${services_public_key}
    groups: docker
