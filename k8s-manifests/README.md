# Kubernetes Manifests

This directory holds the Kubernetes manifests neccessary to deploy the DMSP AI Assistant application with [Kustomize](https://kubectl.docs.kubernetes.io/references/kustomize/).

## Directory Structure

### [base/ai-dmsp](./base/ai-dmsp)

Holds environment/deployment-agnostic configurations.

- [deployment.yaml](base/ai-dmsp/deployment.yaml) - The controller for the applicaion server workload. Manages one or more Pods running the Example container image with a Cloud SQL Proxy sidecar.
- [service.yaml](base/ai-dmsp/service.yaml) - Defines the Example service endpoint for the cluster.
- [kustomization.yaml](overlays/dev/kustomization.yaml) - This file tells Kustomize which manifests should be included.

### [overlays](./overlays)

Contains environment/deployment-specific configurations (e.g. an Ingress resource for the deployment). Each sub-directory represents an overlay. Kustomization files should include ```../../base/ai-dmsp``` in their resources list. It is also common to include some or all of the following Kustomizations to customize the environment.

```yaml
namespace: <namespace-name> # The namespace in which all resources will be created

namePrefix: <prefix>- # A string that will be prepended to all resource names.
nameSuffix: -<suffix> # A string that will be appended to all resource names.

commonLabels:   # A list of labels that will be applied to all resources.
  <label1-key>: <label1-value>
  <label2-key>: <label2-value>
commonAnnotations: # A list of annotations that will be applied to all resources
  <annotation1-key>: <annotation1-value>
  <annotation2-key>: <annotation2-value>

replicas: # The number of Pods to run for the deployment
- name: ai-dmsp-deployment
  count: <#>
```

For a full list of Kustomization options, refer to [https://kubectl.docs.kubernetes.io/references/kustomize/kustomization/](https://kubectl.docs.kubernetes.io/references/kustomize/kustomization/).

## TLS

The files ```tls.cert``` and ```tls.key``` that are referenced in the Kustomization file are copied in from Secret Manager during deployment. A secret in Secret Manager is needed for each the certificate and key file. The secret names are provided to the build process via the ```_SSL_CERT_SECRET_FILE``` and ```_SSL_KEY_SECRET_FILE``` Cloud Build substitution variables.

### Updating the Certificate

Since Secret Manager is used as the source of truth for the certificate files, all that needs to be done to change the certificate is add the new files to Secret Manager and re-deploy the application. This can be done with by adding the new certificate files as versions on existing secrets, or by creating new secrets and updating the substitution variable value in the Cloud Build trigger.
