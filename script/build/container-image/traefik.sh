#!/bin/bash

# Source .env file from parent directory
ENV_FILE=".env"
if [ -f "$ENV_FILE" ]; then
    echo "Sourcing environment variables from $ENV_FILE"
    set -a
    source "$ENV_FILE"
    set +a
else
    echo "Error: Required $ENV_FILE file not found"
    exit 1
fi

echo "Build docker image"
docker build \
  --file container/service/traefik-socket/Dockerfile \
  --tag registry.gitlab.com/tw050x.net/platform/service/traefik-socket \
  .

echo "Push docker image to registry"
docker login \
  --username $ACCESS_TOKEN_USER \
  --password $ACCESS_TOKEN \
  registry.gitlab.com
docker push registry.gitlab.com/tw050x.net/platform/service/traefik-socket
