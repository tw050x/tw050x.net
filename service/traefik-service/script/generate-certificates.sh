#!/bin/bash

echo "Setting up local development certificates..."

# Check for root certificate authority
if [ ! -f ./certificate-authorities/private/root-certificate-authority.key ] || [ ! -f ./certificate-authorities/public/root-certificate-authority.crt ]; then
  echo "Error: Root certificate authority not found. Please generate it first."
  exit 1
fi

# Check if certificates already exist and back them up
if [ -f ./certificates/localhost.crt ] || [ -f ./certificates/localhost.key ]; then
  echo "Certificates already exist. Creating a backup..."
  timestamp=$(date +%Y%m%d%H%M%S)
  zip -r "certificates_backup_${timestamp}.zip" ./certificates/localhost.crt ./certificates/localhost.key
  echo "Backup created: certificates_backup_${timestamp}.zip"
  rm -f ./certificates/localhost.crt ./certificates/localhost.key
fi

# Create directory structure
mkdir -p ./certificates

# Clean up existing CA database to avoid duplicate certificate errors
rm -f ./certificates/index.txt
rm -f ./certificates/index.txt.attr
rm -f ./certificates/index.txt.old
rm -f ./certificates/serial
rm -f ./certificates/serial.old

# Create fresh index and serial
touch ./certificates/index.txt
echo '01' > ./certificates/serial

# Create CSR config for wildcard cert
cat > ./certificates/openssl-csr.cnf << EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = US
ST = State
L = City
O = tw050x.dev
OU = Development
CN = *.tw050x.dev

[v3_req]
basicConstraints = CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = tw050x.dev
DNS.2 = *.tw050x.dev
EOF

# Generate domain key and CSR
openssl genrsa -out ./certificates/localhost.key 2048
openssl req -new -key ./certificates/localhost.key \
  -out ./certificates/localhost.csr \
  -config ./certificates/openssl-csr.cnf

# Create signing config
cat > ./certificates/openssl-signing.cnf << EOF
[ca]
default_ca = CA_default

[CA_default]
dir = ./certificates
certs = ./certificate-authorities/public
new_certs_dir = ./certificates
database = ./certificates/index.txt
serial = ./certificates/serial
private_key = ./certificate-authorities/private/root-certificate-authority.key
certificate = ./certificate-authorities/public/root-certificate-authority.crt
default_md = sha256
default_days = 3650
policy = policy_anything
copy_extensions = copy

[policy_anything]
countryName = optional
stateOrProvinceName = optional
localityName = optional
organizationName = optional
organizationalUnitName = optional
commonName = supplied
emailAddress = optional

[server_cert]
basicConstraints = CA:FALSE
nsCertType = server
nsComment = "OpenSSL Generated Server Certificate"
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid,issuer:always
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
EOF

# Sign the certificate
openssl ca -batch -config ./certificates/openssl-signing.cnf \
  -extensions server_cert -notext -md sha256 \
  -in ./certificates/localhost.csr \
  -out ./certificates/localhost.crt

echo "
Don't forget to update your hosts file:
127.0.0.1    dashboard.traefik.localhost other-domains.localhost
"

echo "Certificate setup complete!"
