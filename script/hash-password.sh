#!/bin/bash

# Simple script to generate bcrypt hashed password

if [ -z "$1" ]; then
  echo "Usage: ./hash-password.sh <password>"
  exit 1
fi

PASSWORD="$1"

# Use htpasswd with bcrypt (-B flag)
HASH=$(htpasswd -bnBC 10 "" "$PASSWORD" | tr -d ':\n')
echo "Hashed password: $HASH"
