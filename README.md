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

Each service directory defines an `.env.example` file that contains the environment variables required for that service. You should create a copy of this file named `.env.<service-name>` in the root directory and fill in the necessary values before running the development servers.

## Running the development servers

First you will need to create a custom builder instance using the config in the root directory.

```bash
docker buildx create --name tw050x.net.builder --driver docker-container --config ./buildkitd.toml
```

Then to run the servers locally use `docker compose`.

```bash
yarn build:docker
docker compose up --detach
```

> The build command could take a while. Go make a drink. Take a walk.

You will also need to run `tsc` on your machine for the proiject you are working on.

```bash
# Services
yarn workspace @tw050x.net.service/administration tsc --build
yarn workspace @tw050x.net.service/authentication tsc --build
yarn workspace @tw050x.net.service/marketing tsc --build

# Libraries
yarn workspace @tw050x.net/database tsc --build
yarn workspace @tw050x.net.library/logger tsc --build
yarn workspace @tw050x.net.library/middleware tsc --build
yarn workspace @tw050x.net.library/service tsc --build
yarn workspace @tw050x.net.library/uikit tsc --build

# Databases
yarn workspace @tw050x.net.database/authentication tsc --build
```

This should run compilation for that project and all dependencies. In turn that should restart the server in the docker container (assuming you used `docker compose up` as described above).
