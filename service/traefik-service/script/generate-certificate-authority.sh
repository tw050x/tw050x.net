#!/bin/bash

echo "Setting up local development certificate authority..."

# Create directory structure
mkdir -p ./certificate-authorities/public
mkdir -p ./certificate-authorities/private

# Generate Root CA key
openssl genrsa -out ./certificate-authorities/private/root-certificate-authority.key 4096

# Create a configuration file for Root CA
cat > ./certificate-authorities/openssl-certificate-authority.cnf << EOF
[req]
distinguished_name = req_distinguished_name
prompt = no
x509_extensions = v3_ca

[req_distinguished_name]
C = US
ST = State
L = City
O = tw050x.dev
OU = Development
CN = tw050x.dev Local Development CA

[v3_ca]
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always,issuer:always
basicConstraints = critical, CA:true
keyUsage = critical, digitalSignature, cRLSign, keyCertSign
EOF

# Generate Root CA certificate
openssl req -x509 -new -nodes -key ./certificate-authorities/private/root-certificate-authority.key \
  -sha256 -days 3650 -out ./certificate-authorities/public/root-certificate-authority.crt \
  -config ./certificate-authorities/openssl-certificate-authority.cnf

# Output instructions based on platform
if [[ "$OSTYPE" == "darwin"* ]]; then
  echo "
=== macOS Instructions ===
Add the Root CA to your system keychain:
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ./certificate-authorities/public/root-certificate-authority.crt
"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
  echo "
=== Windows Instructions ===
Add the Root CA to your trusted root certificates:
certutil -addstore -f \"ROOT\" certificate-authorities\\public\\root-certificate-authority.crt
"
else
  echo "
=== Linux Instructions ===
Add the Root CA to your trusted certificates:
sudo cp ./certificate-authorities/public/root-certificate-authority.crt /usr/local/share/ca-certificates/
sudo update-ca-certificates
"
fi

echo "Certificate Authority setup complete!"
