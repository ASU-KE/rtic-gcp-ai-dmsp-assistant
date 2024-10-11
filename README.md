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

## Server Hosting Overview

This application is in Google Cloud, running on a Kubernetes cluster. This is what allows us to provide you with a self-repairing service. If the web application crashes or if a breaking software error is saved into the repository, when the application stops working, the service will automatically relaunch and rollback to the last working version of the application.

To access this applicaiton:

<strong>Development URLs</strong><br>
https://dmsp-ai.dev.rtd.asu.edu (requires ASU VPN)<br>
https://api.dmsp-ai.dev.rtd.asu.edu (requires ASU VPN and authentication with the API service)

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
