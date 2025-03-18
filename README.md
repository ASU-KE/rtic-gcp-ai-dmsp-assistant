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
    - [Build and launch application stack](#build-and-launch-application-stack)
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

1. Create a GitHub personal access token (classic) with "read:packages" permission (see below).
2. Copy [secrets/npmrc.example](secrets/npmrc.example) into a new secret file: `secrets/npmrc`.
3. Insert GitHub personal access token into 'secrets/npmrc'.
4. Copy [secrets/db_password.example](secrets/db_password.example) into a new secret file: `secrets/db_password`
5. (Optional) Change the local db password in `secrets/db_password`.

### Creating a GitHub Personal Access Token (Classic)

1. Sign in to your GitHub account and navigate to your account settings.
2. Select "Developer settings" at the bottom of the settings sidebar.
3. Expand "Personal access tokens" and select "Tokens (classic)".
4. Click "Generate new token" button and select "Generate new token (classic)"
5. Select desired expiration.
6. Check box "read:packages".
7. Click "Generate token".
8. Save the displayed token in `secrets/npmrc`.


### Build and launch application stack

Build the application container images: `docker compose build`, and then launch the application: `docker compose up`.

The React frontend application can be accessed at: [http://localhost:3000](http://localhost:3000).

THe API server can be accessed using Postman or other API client at [http://localhost:3001](http://localhost:3001).

## Server Hosting Overview

This application is in Google Cloud, running on a Kubernetes cluster. This is what allows us to provide you with a self-repairing service. If the web application crashes or if a breaking software error is saved into the repository, when the application stops working, the service will automatically relaunch and rollback to the last working version of the application.

To access this applicaiton:

<strong>Development URLs</strong><br>
https://dmsp.ai.dev.rtd.asu.edu (requires ASU VPN)<br>
https://api.dmsp.ai.dev.rtd.asu.edu (requires ASU VPN and authentication with the API service)

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
