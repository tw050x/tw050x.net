# Repository

This repository contains the source code and documentation for the unnamed eCommerce platform. It includes various modules, services, and configurations necessary to run and maintain the platform.

## Install

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

## Setup Development Certificates

This repo requires SSL certificates to be used for local development. You can use the certificate tool located in the `tool/certificate` directory to create a local Certificate Authority (CA) and issue SSL certificates for the services.

Begin by installing the tool's dependencies:

```bash
yarn install
```

### Local Domain Certificate

This certificate is used for local development with the `tw050x.dev` domain. This allows you to run the platform locally with HTTPS.

Create a Certificate Authority:

```bash
yarn certificate create-ca --dir="./ca/traefik"
```

> Ensure you follow the instructions to install/trust the CA on your system. This should be printed as output of the `create-ca` command

Next, create SSL certificates:

```bash
yarn certificate create-cert --ca-dir="./ca/traefik" --cert-dir="./certificates" --name="traefik" --domains="tw050x.dev,*.tw050x.dev"
```

You will also need to add an entry to your platforms _hosts_ file.

```
127.0.0.1 tw050x.dev traefik.tw050x.dev
```

You should now have a certificate for traefik to use in local development. Traefik is already setup to use the above certificate.

### Service To Service Certificates

These certificates are used for service to service communication only. You need to create a separate Certificate Authority and certificates for each service.

> Certificates are assumed to be in the `./certificates` directory and are loaded automatically by each service.

Create a Certificate Authority:

```bash
yarn certificate create-ca --dir="./ca/authorisation"
yarn certificate create-ca --dir="./ca/error"
yarn certificate create-ca --dir="./ca/marketing"
yarn certificate create-ca --dir="./ca/navigation"
yarn certificate create-ca --dir="./ca/portal"
yarn certificate create-ca --dir="./ca/user"
```

> Ensure you follow the instructions to install/trust the CA on your system. This should be printed as output of the `create-ca` command

Next, create SSL certificates:

```bash
yarn certificate create-cert --ca-dir="./ca/authorisation" --cert-dir="./certificates" --name="authorisation" --domains="authorisation.service.internal"
yarn certificate create-cert --ca-dir="./ca/error" --cert-dir="./certificates" --name="error" --domains="error.service.internal"
yarn certificate create-cert --ca-dir="./ca/marketing" --cert-dir="./certificates" --name="marketing" --domains="marketing.service.internal"
yarn certificate create-cert --ca-dir="./ca/navigation" --cert-dir="./certificates" --name="navigation" --domains="navigation.service.internal"
yarn certificate create-cert --ca-dir="./ca/portal" --cert-dir="./certificates" --name="portal" --domains="portal.service.internal"
yarn certificate create-cert --ca-dir="./ca/user" --cert-dir="./certificates" --name="user" --domains="user.service.internal"
```

## Setup MongoDB Replica Set

This repo requires a MongoDB replica set to be running. The `docker compose` file will create the necessary containers for you. However you will need to connect to the primary instance and run the replica set initiation command.

> You should only have to do this once. Unless you delete the volume directories in the `./service/mongo/data` directory.

```bash

# Read the environment variables from the .env.mongo file
set -a
source .env.mongo
set +a

# Connect to the primary MongoDB instance
docker exec -it master-mongo-service-primary-1 mongosh --username root --password password --authenticationDatabase admin
```

Once connected run the following command to initiate the replica set:

```js
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongo-service-primary:27017", priority: 2 },
    { _id: 1, host: "mongo-service-secondary-a:27017", priority: 1 }
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
127.0.0.1 mongo-service-primary mongo-service-primary-a
```

> This is necessary as connectiong via Compass will start with `localhost` but will be redirected to the replica set members DNS names. If you cannot access those replica sets via the DNS names used on the docker network, the connection will fail.

### Connections

You can now connect to the replica set using the following connection string formats:

#### Compass

```
mongodb://root:password@localhost:27017,localhost:27018/?replicaSet=rs0&authSource=admin
```

#### Docker

This should be used in the `.env.<type>.mongo-client` file for the services that need to connect to MongoDB.

```
mongodb://mongo-service-primary:27017,mongo-service-secondary-a:27017
```

## Development Servers

First you will need to create a custom builder instance using the config in the root directory.

```bash
yarn docker:build
```

> This build command will take a while. Go make a drink. Take a walk.

Then to run the servers locally use `docker compose`.

```bash
docker compose up --detach
```

> The build command could take a while. Go make a drink. Take a walk.

### Typescript

You will also need to run `tsc` on your machine for the proiject you are working on.

```bash
yarn tsc --build
```

This should run compilation for that project and all dependencies. In turn that should restart the server in the docker container (assuming you used `docker compose up` as described above).

### Styles

The web applications use `tailwindcss` for styling. You will need to run the tailwind compiler to generate the css files used by the applications.

```bash
yarn workspace @tw050x.net.service/assets @tailwindcss/cli \
  --input ./service/assets/style.css \
  --output ./service/assets/public/assets/stylesheet.css
```

## VSCode Usage

This repo assume usage of vscode. Infact we do not support other IDEs within the repo.

### Tasks

The `.vscode/tasks.json` file contains tasks to help with development. The above `tsc` command has an equivalent that can be run from within vscode.

1. Open the command palette (`Cmd+Shift+P` or `Ctrl+Shift+P`)
2. Search for `Tasks: Run Task`
3. Select `tsc: build` or `tsc: watch` as needed.
4. Select `tailwindcss: build` or `tailwindcss: watch` as needed.

### Launch Configurations

You will also find launch configurations in the `.vscode/launch.json` file. These can be used to debug the services directly from within vscode.

Each service is setup and configured to allow debugging. Simply select the desired service from the debug panel and start debugging.

## Environment files

See the [environment.md](./documentation/environment.md) file for details on the environment variables used in this project.

## Configs

See the [configs.md](./documentation/configs.md) file for details on the configuration files used in this project.

## Secrets

See the [secrets.md](./documentation/secrets.md) file for details on managing secrets in this project.
