# Infrastructure

This document outlines the infrastructure setup and architecture for the @tw050x.net platform. The infrastructure uses a docker swarm cluster to manage and deploy services efficiently. This avoids vendor lock-in and allows for flexibility in scaling and maintaining the services. We are also able to deploy on various cloud providers or on-premises hardware as needed.

## Projects

The infrastructure is divided into multiple terraform projects. Each project is responsible for a specific part of the infrastructure.

### Network

Networks are required in each region/data center and we have to be able to manage them independently. The following projects handle the network configurations in regions/data centers:

* __infrastructure/network/london__ - _Manages the network infrastructure for the London data center._

### Secrets

Secrets management is crucial for maintaining the security of the infrastructure. The following project handles the secrets management:

* __infrastructure/secrets__ - _Manages the secrets for the entire infrastructure._

> Note: This project create the secret keys for the infrastructure. It does not use backend and instead relies on local state management. Ensure to back up the state file securely.

### Swarm

Each node in the swarm cluster is setup via an independent project. The following projects handle the swarm nodes in regions/data centers:

* __infrastructure/swarm/london/manager/newton__ - _Handles the Docker Swarm `manager` node for the __London__ data center._
* __infrastructure/swarm/london/worker/hawking__ - _Manages the Docker Swarm `worker` node for the __London__ data center._
* __infrastructure/swarm/london/worker/turing__ - _Manages the second Docker Swarm `worker` node for the __London__ data center._

The historical figures names are only to differentiate between multiple nodes of the same type in a given region/data center. And generally you won't have a need to keep a specific node around. Therefore if you need to scale down then remove any node you think appropriate. Running services should auto rescale to other nodes in the swarm.

Names should be sought from the region of the infrastructure. For Example, using a London based datacenter should use historical figures from England. Historical figures should be from various fields such as exploration, science, engineering, and medicine.

* __Newton__ - Sir Isaac Newton, English mathematician and physicist
* __Darwin__ - Charles Darwin, English naturalist
* __Hawking__ - Stephen Hawking, English theoretical physicist
* __Faraday__ - Michael Faraday, English scientist
* __Turing__ - Alan Turing, English mathematician and computer scientist
* __Brunel__ - Isambard Kingdom Brunel, English engineer
* __Babbage__ - Charles Babbage, English polymath
* __Jenner__ - Edward Jenner, English physician
* __Fleming__ - Alexander Fleming, Scottish bacteriologist

> Do not use political or military figures.

## Usage

Begin by installing [Terraform](https://developer.hashicorp.com/terraform/install). Once Terraform is installed, you will need to set the terraform backend credentials in a `terraform.backend` file. See the example file below.

```
address=https://gitlab.com/api/v4/projects/xxxxxxxx/terraform/state/<state-name>
lock_address=https://gitlab.com/api/v4/projects/xxxxxxxx/terraform/state/<state-name>/lock
unlock_address=https://gitlab.com/api/v4/projects/xxxxxxxx/terraform/state/<state-name>/lock
lock_method=POST
unlock_method=DELETE
username=user
password=glpat-XxXxxXXXXXXxXxXXxXXX
```

The `<state-name>` value should follow this format:

```
<cloud provider>--<project>--<region>
<cloud provider>--<project>--<sub>--<region>
```

The `<sub>` value is optional and allows differentiation between many groupings in a project. Each section should be separated by double dashes `--`. You cannot use slashes `/` in the state name.

### Initializing a Project

Navigate to the respective project directory and run the following commands:

```bash
terraform -chdir=./infrastructure/network/london init --backend-config=./terraform.tfbackend
```

> Note: You can change the path to the desired project directory as needed.

### Applying Configuration

After initializing, you can apply the configuration with:

```bash
terraform -chdir=./infrastructure/network/london apply
```
