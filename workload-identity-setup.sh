#!/bin/bash

#Bind Kubernetes Service Account to GCP Service Account
gcloud iam service-accounts add-iam-policy-binding \
  --role roles/iam.workloadIdentityUser \
  --member "serviceAccount:$PROJECT_ID.svc.id.goog[$_GKE_NAMESPACE_NAME/$_KSA_NAME]" \
  $_GSA_NAME@$PROJECT_ID.iam.gserviceaccount.com

#Add annotation for Kubernetes for the service account
kubectl annotate serviceaccount \
  --namespace $_GKE_NAMESPACE_NAME\
  --overwrite \
  $_KSA_NAME \
  iam.gke.io/gcp-service-account=$_GSA_NAME@$PROJECT_ID.iam.gserviceaccount.com
