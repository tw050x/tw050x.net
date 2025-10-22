# AWS EU West 1 Infrastructure

Welcome to the AWS EU West 1 infrastructure project. This project creates all necessary AWS resources within a single EU West 1. This project uses the region terraform module located in `./terraform/modules/region`.

## Prerequisites

You will need to install `terraform` before you can use this project. Please refer to the [Terraform installation guide](https://developer.hashicorp.com/terraform/install) for instructions.

## Intallation

You can run the following commands to initialize and apply the Terraform configuration:

```bash
source infrastructure/eu-west-1/.env
terraform -chdir=infrastructure/eu-west-1 init
```

## Usage

To create the AWS resources defined in this project, run the following command:

```bash
terraform -chdir=infrastructure/eu-west-1 apply
```
