# ASU DMSP AI Assistant in Kubernetes with Cloud Build trigger

![Org unit](https://img.shields.io/badge/Org%20unit-KE-blue)

![Admin contact](https://img.shields.io/badge/Admin%20contact-rtshelp%40asu.edu-blue)

![Security contact](https://img.shields.io/badge/Security%20contact-hacker%40asu.edu-blue)

![Technical contact](https://img.shields.io/badge/Technical%20contact-ndrollin%40asu.edu-blue)

<br>
<br>

## Overview

This repository contains the necessary resources and configurations to host the prototype ASU Data Management Sharing Plan (DMSP) AI Assistant in a Kubernetes cluster.

<br>
<br>

## Table of Contents

- [ASU DMSP AI Assistant in Kubernetes with Cloud Build trigger](#asu-dmsp-ai-assistant-in-kubernetes-with-cloud-build-trigger)
  - [Overview](#overview)
  - [Table of Contents](#table-of-contents)
  - [Local Development Instructions](#local-development-instructions)
    - [API server setup](#api-server-setup)
    - [React application setup](#react-application-setup)
    - [Creating a GitHub Personal Access Token (Classic)](#creating-a-github-personal-access-token-classic)
    - [Generate local SSL cert for testing](#generate-local-ssl-cert-for-testing)
    - [Build and launch application stack](#build-and-launch-application-stack)
    - [Database Migrations](#database-migrations)
  - [Server Hosting Overview](#server-hosting-overview)
  - [Procedure to Update](#procedure-to-update)
  - [Infrastructure Notes](#infrastructure-notes)
    - [Repository Structure](#repository-structure)
      - [\> api](#-api)
      - [\> react](#-react)
      - [\> k8s-manifests](#-k8s-manifests)
      - [\> Dockerfile](#-dockerfile)
      - [\> cloudbuild.yaml](#-cloudbuildyaml)
      - [\> workload-identity-setup.sh](#-workload-identity-setupsh)
    - [Cloud Build Variables](#cloud-build-variables)
  - [Commit Message Guidelines](#commit-message-guidelines)
    - [How to Commit](#how-to-commit)
  - [First-Time Launch Instructions (Local Setup)](#first-time-launch-instructions-local-setup)

<br>
<br>


## Local Development Instructions

This application stack uses Docker Compose ([compose.yml](compose.yml)) to launch the necessary containers on a local workstation. Local development requires:

Prerequisite: Install the latest release version of Docker: [Get Docker](https://docs.docker.com/get-started/get-docker/).

### API server setup

Copy [api/.env.example](api/.env.example) to `api/.env`. Fill in token and access keys with values stored in ASU Stache:

* ROLLBAR_TOKEN
* DMPTOOL_CLIENT_ID
* DMPTOOL_CLIENT_SECRET
* LLM_ACCESS_SECRET

### React application setup

1. Create a GitHub personal access token (classic) with "read:packages" permission (see below). Save token value for use later.
2. Copy [secrets/db_password.example](secrets/db_password.example) into a new secret file: `secrets/db_password`
3. (Optional) Change the local db password in `secrets/db_password`.

### Creating a GitHub Personal Access Token (Classic)

1. Sign in to your GitHub account and navigate to your account settings.
2. Select "Developer settings" at the bottom of the settings sidebar.
3. Expand "Personal access tokens" and select "Tokens (classic)".
4. Click "Generate new token" button and select "Generate new token (classic)"
5. Select desired expiration.
6. Check box "read:packages".
7. Click "Generate token".
8. Save the displayed token in your password manager to use next.

### Generate local SSL cert for testing

In order for ASU SSO authentication to work, the React web app must be accessible through a secured HTTPS connection and using a `*.asu.edu` domain. For the purposes of local development, the React app will be hosted at `dmsp.local.asu.edu`. We will be using a free CLI tool, `mkcert`, to generate our testing SSL certificate and registering it in our local workstation so it will be automatically trusted by our browser.

MacOS instructions follow:

From the project root folder, install `mkcert` and `nss` (for Firefox users) and generate the SSL certificate in `secrets/certs`:

```
brew install mkcert
brew install nss # if you use Firefox

mkcert -key-file secrets/certs/key.pem -cert-file secrets/certs/cert.pem "*.local.asu.edu"
mkcert -install # to make certificate be trusted automatically
```

You must also add the dev domain, `dmsp.local.asu.edu` to your machine's `/etc/hosts` file:

```
sudo echo "\n127.0.0.1 dmsp.local.asu.edu\n" >> /etc/hosts
```


### Build and launch application stack

In order to build the application container images and launch the application, you must insert the GitHub Personal Access Token into the command line: `docker compose build --build-arg NPM_TOKEN=TOKEN_VALUE`, and then launch the application: `docker compose up`.

The React frontend application can be accessed at: [https://dmsp.local.asu.edu](https://dmsp.local.asu.edu).

THe API server can be accessed using Postman or other API clients at [http://localhost:3001](http://localhost:3001).

### Database Migrations

Whenever the database schema changes, a migration must be performed and committed into the code repository. For now, this must be done on the comand-line after the application stack is running, and must be performed within the API application container.

In a new terminal window, located in the application root folder, run the following commands:

```
docker compose exec api bash
```

You will be logged into the container terminal, in the root folder of the application, where you can run NPM commands and scripts. The following DB migration-related scripts are available:

* Run migrations: `npm run migration:run`
* Generate migration: `npm run migration:generate --name=NameOfMigration` - Name the migration for the change to be performed, e.g. `--name=CreateUserTable`
* Create new migration: `npm run migration:create --name=NameOfMigration`
* Revert last migration: `npm run migration:revert`

## Server Hosting Overview

This application is in Google Cloud, running on a Kubernetes cluster. This is what allows us to provide you with a self-repairing service. If the web application crashes or if a breaking software error is saved into the repository, when the application stops working, the service will automatically relaunch and rollback to the last working version of the application.

To access this applicaiton:

<strong>Development URLs</strong><br>
https://dmsp.dev.rtd.asu.edu (requires ASU VPN)<br>
https://dmsp.dev.api.rtd.asu.edu (requires ASU VPN and authentication with the API service)

<br>
<br>

## Procedure to Update

1. Create new Feature branch from `development`. Name it for the task or feature you are adding or updating. e.g. `asurite-fix-auth-error`.
2. Commit your work into your feature branch.
3. When you are ready to push your changes to the DEV environment, create a GitHub Pull Request to merge your branch into `development`.
4. Wait a few minutes for the updated `development` build to complete and load on the service.
5. Test your changes on the DEV site.

<br>
<br>

## Infrastructure Notes

Most information in this section is for the RTIC infrastructure engineers, so they have the notes they need for any longer-term maintenance.

### Repository Structure

#### > [api](./api)

This directory holds the application files for the NodeJS API server.

#### > [react](./react)

This directory holds the application files for the ReactJS frontend applicaiton.

#### > [k8s-manifests](./k8s-manifests/README.md)

This directory holds the Kubernetes manifests neccessary to deploy Kaiteki with a CloudSQL Proxy sidecar with [Kustomize](https://kubectl.docs.kubernetes.io/references/kustomize/).

#### > [Dockerfile](./Dockerfile)

This Dockerfile defines the software image used to run the Kaiteki application. The Docker image is based on php:7.4-apache-bullseye.

#### > [cloudbuild.yaml](./cloudbuild.yaml)

Google's Cloud Build file configures the instructions to build and push the Kaiteki application (and related components) into the Google Container Image Registry (GCR), and to deploy the Kaiteki container into KE's server cluster (GKE).

#### > [workload-identity-setup.sh](./workload-identity-setup.sh)

The script is used in the Cloud Build steps to ensure that the correct permissions for Workload Identity are established in both IAM and on the GKE cluster.

### Cloud Build Variables

| Name                    | Description                                                                                                                                                                                                                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `_KUSTOMIZE_VERSION`    | The version of Kustomize to use. Must have a kustomize image in the project's Container Registry tagged with the same version (e.g. `v3.8.9`). Refer the to the [kustomize cloud builder](https://github.com/GoogleCloudPlatform/cloud-builders-community/tree/master/kustomize) for more information. |
| `_KUST_BUILD_DIR`       | The location of an overlay directory relative to the `k8s-manifests` directory (e.g. `overlays/dev`).                                                                                                                                                                                                  |
| `_KUST_SECRET_FILE`     | The name of a Secret Manager secret containing a `secretGenerator` with the application secrets.                                                                                                                                                                                                       |
| `_GKE_LOCATION`         | The zone or region of the GKE cluster being deployed to (e.g. `us-west1-a`).                                                                                                                                                                                                                           |
| `_GKE_CLUSTER`          | The name of the GKE cluster being deployed to (e.g. `websvcs-cluster-1`).                                                                                                                                                                                                                              |
| `_SSL_CERT_SECRET_FILE` | The name of a Secret Manager secret containing the SSL certificate for the instance.                                                                                                                                                                                                                   |
| `_SSL_KEY_SECRET_FILE`  | The name of a Secret Manager secret containing the SSL private key for the instance.                                                                                                                                                                                                                   |
| `_GSA_NAME`             | The name of the Google IAM Service Account which will be used for Workload Identity.                                                                                                                                                                                                                   |
| `_KSA_NAME`             | The name of the Kubernetes Service Account that the workloads will run under in the cluster. This defaults to `example` plus any prefix or suffix defined in the overlay `kustomization.yaml` file.                                                                                                    |
| `_GKE_NAMESPACE_NAME`   | The name of the namespace on the GKE cluster where the instance is being deployed.                                                                                                                                                                                                                     |
## Commit Message Guidelines

We use [Commitizen](https://commitizen-tools.github.io/commitizen/) to standardize commit messages.

### How to Commit

Run the following command from the root of the repo to create a properly formatted commit message:

```bash
npm run commit
```

## First-Time Launch Instructions (Local Setup)

If you are setting up the application for the first time, follow these steps to ensure that your containers and database are initialized correctly.

1. **Clean up existing containers and volumes (recommended for fresh setup)**

   Before building, remove any previously created containers or volumes to avoid conflicts:
   ```bash
   docker compose down -v
   docker system prune -f
2. **Build the application containers**

   Run this command from the project root, replacing `<YOUR_GITHUB_TOKEN>` with your GitHub Personal Access Token:

   ```bash
   docker compose build --build-arg NPM_TOKEN=<YOUR_GITHUB_TOKEN>
   ```

3. **Start the containers**

   Once the build completes successfully, launch the full application stack:

   ```bash
   docker compose up -d
   ```

   This will start the API server, React frontend, and database containers in the background.

4. **Run database migrations**

   After the containers are running, open a terminal inside the API container and execute the migration command to initialize the database schema:

   ```bash
   docker compose exec api bash
   npm run migration:run
   ```

   Once migrations complete, your local environment is fully set up and the application is ready to run.
