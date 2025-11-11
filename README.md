# tw050x.net/platform

Welcome to the unnamed ecommerce platform repository. This repository contains the code for the entire unnamed ecommerce platform. This file will get you started on running the platform locally. For high level platform documentation. see the documentation directory.

## Installation

You should be running node `v23.6.1` or higher to run this server. Using `nvm` is recommended.

```bash
nvm use
```

> Install `nvm` from [here](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating)

Once you have the correct version of Node installed you will be able to install the dependencies. We use `Yarn` as our package manager. Install the dependencies using:

```bash
yarn install
```

> Install `yarn` from [here](https://yarnpkg.com/getting-started/install).

For local development you will also need to install Docker. Check the [getting started guide](https://docs.docker.com/get-docker/) for details on how to install for your system.

## Environment files

See the [ENVIRONMENT.md](./ENVIRONMENT.md) file for details on the environment variables used in this project.

## Running the development servers

First you will need to create a custom builder instance using the config in the root directory.

```bash
docker buildx create --name tw050x.net.builder --driver docker-container --config ./buildkitd.toml
```

> You can use `yarn build:docker` as a replacement for the above command.

Then to run the servers locally use `docker compose`.

```bash
docker compose up --detach
```

> The build command could take a while. Go make a drink. Take a walk.

You will also need to run `tsc` on your machine for the proiject you are working on.

```bash
# Services
yarn workspace @tw050x.net.service/marketing tsc --build
yarn workspace @tw050x.net.service/navigation tsc --build
yarn workspace @tw050x.net.service/portal tsc --build
yarn workspace @tw050x.net.service/user tsc --build

# Libraries
yarn workspace @tw050x.net.library/database tsc --build
yarn workspace @tw050x.net.library/logger tsc --build
yarn workspace @tw050x.net.library/middleware tsc --build
yarn workspace @tw050x.net.library/service tsc --build
yarn workspace @tw050x.net.library/uikit tsc --build
yarn workspace @tw050x.net.library/utility tsc --build

# Databases
yarn workspace @tw050x.net.database/user tsc --build
```

This should run compilation for that project and all dependencies. In turn that should restart the server in the docker container (assuming you used `docker compose up` as described above).

## Setup MongoDB Replica Set

This repo requires a MongoDB replica set to be running. The `docker compose` file will create the necessary containers for you. However you will need to connect to the primary instance and run the replica set initiation command.

> You should only have to do this once. Unless you delete the volume directories in the `./service/mongo/data` directory.

```bash

# Read the environment variables from the .env.mongo file
set -a
source .env.mongo
set +a

# Connect to the primary MongoDB instance
docker exec -it master-mongo-primary-1 mongosh --username root --password password --authenticationDatabase admin
```

Once connected run the following command to initiate the replica set:

```js
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongo-primary:27017", priority: 2 },
    { _id: 1, host: "mongo-secondary-a:27017", priority: 1 }
  ]
})
```

> You should notice the prompt change to include the replica set name.

You can check the status of the replica set using:

```js
rs.status()
```

To add more instances to the replica set, connect to the primary instance (shown above) and run `rs.add("mongo-secondary-b:27017")`.

Be sure to add the DNS names of the new instances to you hosts file:

```
127.0.0.1 mongo-primary mongo-primary-a
```

> This is necessary as connectiong via Compass will start with `localhost` but will be redirected to the replica set members DNS names. If you cannot access those replica sets via the DNS names used on the docker network, the connection will fail.

You can now connect to the replica set using the following connection string formats:

#### Compass

```
mongodb://root:password@localhost:27017,localhost:27018/?replicaSet=rs0&authSource=admin
```

#### Docker

This should be used in the `.env.<service-name>` files for the services that need to connect to MongoDB.

```
mongodb://root:password@mongo-primary:27017,mongo-secondary-a:27017/?replicaSet=rs0&authSource=admin
```

## Setup SSL Certificates

This repo requires SSL certificates to be used for local development. You can use the certificate tool located in the `tool/certificate` directory to create a local Certificate Authority (CA) and issue SSL certificates for the services.

Begin by installing the tool's dependencies:

```bash
yarn install
```

### Setting up a certificate for a local domain

Create a Certificate Authority:

```bash
yarn certificate create-ca --dir="./ca/traefik"
```

> Ensure you follow the instructions to install/trust the CA on your system. This should be printed as output of the `create-ca` command

Next, create SSL certificates:

```bash
yarn certificate create-cert --ca-dir="./ca/traefik" --cert-dir="./certificates/traefik" --name="development" --domains="tw050x.dev,*.tw050x.dev"
```

You should now have certificates for traefik to use in local development. Traefik is already setup to use the above certificate.

### Setting up a certificate for service to authorisation service communication

Create a Certificate Authority:

```bash
yarn certificate create-ca --dir="./ca/authorisation"
```

> Ensure you follow the instructions to install/trust the CA on your system. This should be printed as output of the `create-ca` command

Next, create SSL certificates:

```bash
yarn certificate create-cert --ca-dir="./ca/authorisation" --cert-dir="./certificates/authorisation" --name="development"
```
