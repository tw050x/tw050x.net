#cloud-config

# Run commands
runcmd:
  - mkdir /root/acme
  - ufw allow from ${swarm_ip_range} to any port 2377 proto tcp 
  - ufw allow from ${swarm_ip_range} to any port 4789 proto udp
  - ufw allow from ${swarm_ip_range} to any port 7946 proto udp
  - ufw allow from ${swarm_ip_range} to any port 7946 proto tcp
