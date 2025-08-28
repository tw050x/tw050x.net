# tw050x.net/platform

Welcome to the Kiel Capital platform repository. This repository contains the code for the entire Kiel Capital platform. This file will get you started on running the platform locally. For high level platform documentation. see the documentation directory.

## Installation

You should be running node `v23.6.1` or higher to run this server. Using `nvm` is recommended.

```bash
nvm use
```

> Install `nvm` from [here](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating)

Once that is completed you will be able to install the dependencies. We use `Yarn` as our package manager. Install the dependencies using:

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
docker buildx bake --builder tw050x.net.builder --file bake.hcl --load
docker compose up --detach
```

> The build command could take a while. Go make a drink. Take a walk.

> Running `docker compose up` without first running the build will likely crash the process due to a lack of available resources. the `up` command will run unlimited parallel processes which cannot be configured. The `build` command above will only build 1 service at a time.
