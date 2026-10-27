# ASU DMSP AI Assistant — GCP Architecture Review

**Date:** May 20, 2026  
**Scope:** Full solution review against Google Cloud Well-Architected Framework (WAF)  
**GCP Project ID:** `asu-ke-rto-web-svcs`  
**Hosting:** GKE Private Clusters (Standard tier) in `us-west4`, Cloud SQL (MySQL)

---

## Scale Legend

| Scale | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| **Severity** | Low | Medium | High | Critical |
| **Effort** | Minimal | Low | Moderate | High |

---

## How to Use This Report

1. **Start with the Executive Summary and At-a-Glance Metrics** to understand overall risk posture and the top priority actions.
2. **Use the Impact vs. Effort Quadrant** to identify quick wins and plan major projects.
3. **Review each WAF pillar section** for detailed findings, evidence, and specific remediation steps.
4. **Execute from the Prioritized Remediation Roadmap** which sequences all findings into actionable phases.

---

## At-a-Glance Metrics

| Metric | Count |
|---|---|
| **Total Findings** | **15** |
| Critical (4) | 2 |
| High (3) | 5 |
| Medium (2) | 5 |
| Low (1) | 3 |

---

## Table of Contents

- [Executive Summary](#executive-summary)
- [Project / Environment Context](#project--environment-context)
- [Impact vs. Effort Quadrant](#impact-vs-effort-quadrant)
- [1. SECURITY](#1-security)
- [2. RELIABILITY](#2-reliability)
- [3. OPERATIONAL EXCELLENCE](#3-operational-excellence)
- [4. PERFORMANCE EFFICIENCY](#4-performance-efficiency)
- [5. COST OPTIMIZATION](#5-cost-optimization)
- [Anti-Patterns Identified](#anti-patterns-identified)
- [Prioritized Remediation Roadmap](#prioritized-remediation-roadmap)
- [Technical Debt Inventory](#technical-debt-inventory)
- [Solution Directory Layout](#solution-directory-layout)
- [Resources and Services Inspected](#resources-and-services-inspected)
- [Documentation References](#documentation-references)
- [Assumptions and Open Questions](#assumptions-and-open-questions)
- [Implementation Handoff Notes](#implementation-handoff-notes)

---

## Executive Summary

The ASU DMSP AI Assistant is a two-tier web application (React SPA + Express API) deployed to GKE private clusters with Cloud SQL (MySQL) as the persistent data store. It uses SAML SSO via ASU's Identity Provider and integrates with an external LLM service and the DMPTool API for AI-assisted data management plan generation.

The architecture uses Workload Identity Federation, private GKE nodes, Cloud Armor security policies, and HTTPS-only ingress — demonstrating a solid security foundation. However, the review identified several significant gaps that materially impact production reliability and security posture.

**Finding counts by severity: **2 Critical**, **5 High**, **5 Medium**, **3 Low****

**Overall Risk Posture: HIGH** — Production workloads run on preemptible (spot) nodes in a single availability zone with containers executing as root, creating compounding reliability and security risks.

**Top 3 Immediate Actions:**

1. **[SEC-01]** API container runs as root (`runAsUser: 0`) — violates container security best practices and enables privilege escalation if the container is compromised.
2. **[REL-01]** Production node pool uses preemptible VMs in a single zone (`us-west4-a`) — Google can terminate these nodes with only 30 seconds notice, causing service disruption.
3. **[SEC-02]** Cloud SQL Auth Proxy is critically outdated (v1.17 from ~2020) — missing 5+ years of security patches, performance improvements, and IAM authentication support.

---

## Project / Environment Context

### GCP Environment

| Property | Value |
|---|---|
| Project ID | `asu-ke-rto-web-svcs` |
| Region | `us-west4` |
| VPC | `websvcs-vpc` |
| Subnet | `subnet-01` |
| Dev Cluster | `websvcs-diverse-stack-gke-private-dev` |
| Prod Cluster | `websvcs-diverse-stack-gke-private-prod` |
| Cluster SKU | Standard |
| Release Channel | STABLE |
| Kubernetes Version | 1.33.10-gke.1115000 |
| Private Nodes | Yes (both clusters) |
| Network Policy | Calico (enabled) |
| Cloud SQL Instance | `websvcs-sql-private-aede29ce` |

### Solution Components

| Component | Technology | Hosting Target | Database | Authentication |
|---|---|---|---|---|
| React Frontend | React 18 + Vite + nginx | GKE (nginx:1.28-alpine) | N/A | SAML SSO (ASU IdP) |
| Express API | Node.js 22 + TypeScript + Express 4 | GKE (node:22.16-bookworm-slim) | Cloud SQL MySQL | SAML + passport-saml |
| Cloud SQL Proxy | gce-proxy:1.17 (sidecar) | GKE sidecar | N/A | Workload Identity |
| Database | MySQL (Cloud SQL) | Cloud SQL Private IP | N/A | Username/password |

### Key Services

- **GKE** — Private clusters (Standard tier) with Workload Identity, Cloud Armor, and Calico network policies
- **Cloud SQL** — MySQL instance with private IP (`websvcs-sql-private-aede29ce`)
- **Artifact Registry** — Container images at `us-west4-docker.pkg.dev/asu-ke-rto-web-svcs/ai-dmsp-api-repo` and `ai-dmsp-react-repo`
- **Cloud Build** — CI/CD pipeline (`cloudbuild.yaml`) for build, push, and deploy
- **Secret Manager** — Stores NPM token, Kubernetes secrets kustomization, SSL certs
- **Cloud Armor** — Security policies (`websvcs-diverse-stack-dev-policy`, `websvcs-diverse-stack-prod-policy`)
- **Cloud Load Balancing** — GCE Ingress with HTTPS redirect and static IPs
- **Managed Prometheus** — Enabled on both clusters for metrics collection

### Tools Used for Inspection

| Tool | Purpose |
|---|---|
| `gke-mcp/list_clusters` | Listed all clusters in project, inspected node pools, autoscaling, versions |
| `gke-mcp/query_logs` | Queried container logs (24h) for errors in dev and prod namespaces |
| `gke-mcp/list_recommendations` | Retrieved GCP Recommender findings for cost and reliability |
| `google-developer-knowledge/search_documents` | Validated recommendations against current Google Cloud documentation |
| Workspace file analysis | Inspected all k8s manifests, Dockerfiles, CI/CD configs, and application code |

---

## Impact vs. Effort Quadrant

| | **Low Effort (1–2)** | **High Effort (3–4)** |
|---|---|---|
| **High Impact (CRITICAL/HIGH)** | **Quick Wins — Do First**<br>• [SEC-01](#sec-01-api-container-runs-as-root) [Effort: 1]<br>• [REL-02](#rel-02-no-liveness-probe-on-api-deployment) [Effort: 1]<br>• [REL-03](#rel-03-no-poddisruptionbudget-defined) [Effort: 1]<br>• [SEC-02](#sec-02-critically-outdated-cloud-sql-auth-proxy) [Effort: 2]<br>• [REL-04](#rel-04-replica-count-hardcoded-to-1-overriding-hpa) [Effort: 1] | **Major Projects**<br>• [REL-01](#rel-01-production-on-preemptible-single-zone-nodes) [Effort: 3]<br>• [SEC-03](#sec-03-no-egress-network-policy) [Effort: 3] |
| **Low Impact (MEDIUM/LOW)** | **Fill-Ins**<br>• [OPS-01](#ops-01-no-structured-logging-configuration) [Effort: 2]<br>• [PERF-01](#perf-01-hpa-uses-deprecated-api-version) [Effort: 1]<br>• [OPS-02](#ops-02-no-ssl-policy-on-load-balancer) [Effort: 1]<br>• [PERF-02](#perf-02-react-deployment-missing-resource-limits) [Effort: 1]<br>• [COST-01](#cost-01-using-latest-tag-for-production-images) [Effort: 1] | **Deprioritize**<br>• [SEC-04](#sec-04-database-encryption-at-rest-uses-google-managed-keys) [Effort: 3]<br>• [COST-02](#cost-02-no-billing-alerts-or-budget-constraints-visible) [Effort: 3]<br>• [OPS-03](#ops-03-no-infrastructure-as-code-for-gke-clusters) [Effort: 4] |

**Interpretation:**
- **Quick Wins — Do First:** Highest return with lowest effort. Address these in the current or next sprint.
- **Major Projects:** High-value but requires planning, cross-team coordination, or staged rollout.
- **Fill-Ins:** Useful improvements when capacity is available between higher-priority work.
- **Deprioritize:** Lower near-term return relative to effort; plan for medium-term roadmap.

---

## 1. SECURITY

**Risk Level: HIGH**

**Current State:**

- ✅ Workload Identity Federation configured and enforced via Cloud Build pipeline
- ✅ Private GKE nodes with private endpoint enforcement
- ✅ Cloud Armor security policies applied to both dev and prod ingress
- ✅ HTTPS redirect enforced via FrontendConfig
- ✅ Secrets sourced from Google Secret Manager (injected via Kubernetes secrets at build time)
- ✅ Shielded Nodes enabled on both clusters
- ✅ Secure Boot enabled on workload node pools
- ⚠️ API container runs as root (uid 0)
- ⚠️ Cloud SQL Auth Proxy is critically outdated (v1.17)
- ⚠️ No egress network policies — pods can reach any external endpoint
- ⚠️ Database encryption at rest uses Google-managed keys (not CMEK)
- ⚠️ Insecure kubelet readonly port enabled cluster-wide

**Findings Table:**

| ID | Finding | Severity | Effort |
|---|---|---|---|
| SEC-01 | API container runs as root | CRITICAL | 1 |
| SEC-02 | Critically outdated Cloud SQL Auth Proxy (v1.17) | HIGH | 2 |
| SEC-03 | No egress network policy | HIGH | 3 |
| SEC-04 | Database encryption uses Google-managed keys | MEDIUM | 3 |

---

### SEC-01: API Container Runs as Root

**Severity:** CRITICAL  
**Primary WAF Pillar:** Security

**Description:** The `api-web` container in both `dev.deployment.yaml` and `prod.deployment.yaml` explicitly sets `runAsNonRoot: false`, `runAsUser: 0`, and `runAsGroup: 0`. This means the Express.js application runs with full root privileges inside the container. If an attacker exploits a vulnerability in the application (e.g., via a dependency like `pdf-parse` or `xlsx`), they gain root access within the container, making container escape significantly easier.

**Current state:**
```yaml
securityContext:
  runAsNonRoot: false
  runAsUser: 0
  runAsGroup: 0
```

**Trade-offs:** Switching to a non-root user requires verifying the application doesn't write to system paths. The current Dockerfile uses `node:22.16-bookworm-slim` which includes a `node` user (uid 1000).

**Impact:**
- **Benefits:** Eliminates privilege escalation risk; aligns with Pod Security Standards (Restricted profile); satisfies compliance requirements
- **Risks:** Minor — requires testing that file writes (e.g., temp files for PDF parsing) use appropriate paths

**Ease of Implementation:** 1 — Minimal. Change three lines in the deployment manifest and verify the app starts correctly.

**Recommendation:** Set `runAsNonRoot: true`, `runAsUser: 1000`, `runAsGroup: 1000` in the container securityContext. Add `allowPrivilegeEscalation: false` and `readOnlyRootFilesystem: true` (with emptyDir for `/tmp`). Update the Dockerfile production stage to `USER node`.

**Confidence:** High  
**Evidence:** Observed in `k8s-manifests/overlays/dev/dev.deployment.yaml` lines 109-111 and `k8s-manifests/overlays/prod/prod.deployment.yaml` lines 109-111. The Dockerfile production stage does not set a USER directive, defaulting to root.  
**Reference:** https://cloud.google.com/kubernetes-engine/docs/how-to/hardening-your-cluster#use_least_privilege

---

### SEC-02: Critically Outdated Cloud SQL Auth Proxy

**Severity:** HIGH  
**Primary WAF Pillar:** Security

**Description:** Both dev and prod deployments use `gcr.io/cloudsql-docker/gce-proxy:1.17`, released approximately in 2020. The current version is 2.x (Cloud SQL Auth Proxy v2). Version 1.17 is missing 5+ years of security patches, performance improvements, connection health checks, structured logging, and IAM database authentication support.

**Current state:**
```yaml
- name: cloud-sql-proxy
  image: gcr.io/cloudsql-docker/gce-proxy:1.17
  command:
  - "/cloud_sql_proxy"
  - "-ip_address_types=PRIVATE"
  - "-instances=$(CLOUDSQL_INSTANCE_NAME)=tcp:3306"
```

**Trade-offs:** Upgrading to v2 changes the CLI flags and image path. The new image is `gcr.io/cloud-sql-connectors/cloud-sql-proxy:2.x`. Command flags change from `-instances=` to `--port` and positional instance argument.

**Impact:**
- **Benefits:** Security patches, automatic IAM authentication, connection health checks, structured logging, reduced memory footprint, graceful shutdown support
- **Risks:** Requires testing the new CLI syntax; brief downtime during rollout (mitigated by rolling update)

**Ease of Implementation:** 2 — Low. Update image reference and adjust command flags. Requires testing but no architectural changes.

**Recommendation:** Upgrade to `gcr.io/cloud-sql-connectors/cloud-sql-proxy:2.14.3` (or latest 2.x). Update command to: `["cloud-sql-proxy", "--private-ip", "--port=3306", "INSTANCE_CONNECTION_NAME"]`. Add `--health-check` flag and a liveness probe on port 9801.

**Confidence:** High  
**Evidence:** Image reference observed in both deployment manifests. Production logs show certificate refresh messages indicating the proxy is functioning but using legacy behavior: `"ephemeral certificate for instance asu-ke-rto-web-svcs:us-west4:websvcs-sql-private-aede29ce will expire soon, refreshing now."`  
**Reference:** https://cloud.google.com/sql/docs/mysql/connect-kubernetes-engine

---

### SEC-03: No Egress Network Policy

**Severity:** HIGH  
**Primary WAF Pillar:** Security

**Description:** The base kustomization includes a default-deny ingress policy (`np.default-deny-ingress.yaml`) and selective allow policies, but there is no egress network policy. This means all pods can initiate outbound connections to any IP address, which enables data exfiltration if a container is compromised.

**Current state:**
```yaml
# np.default-deny-ingress.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress
spec:
  podSelector: {}
  policyTypes:
    - Ingress
```

No egress policies exist in `k8s-manifests/base/ai-dmsp/` or overlay directories.

**Trade-offs:** Egress policies require knowing all legitimate outbound destinations (Cloud SQL Proxy to private IP, LLM API at `apiws-main-beta.aiml.asu.edu`, DMPTool API, Rollbar). This requires careful enumeration and may need updates when new integrations are added.

**Impact:**
- **Benefits:** Blocks unauthorized outbound communication; limits blast radius of container compromise; defense-in-depth
- **Risks:** May break integrations if destinations are not fully enumerated; requires maintenance when adding new external services

**Ease of Implementation:** 3 — Moderate. Requires enumerating all legitimate egress targets (LLM service, DMPTool API, Rollbar, GCP metadata server) and creating explicit allow rules.

**Recommendation:** Add a default-deny egress NetworkPolicy and selective allow policies for: (1) DNS (kube-dns, port 53), (2) Cloud SQL via private IP range, (3) Known external APIs via FQDN-based policies or IP ranges, (4) GCP metadata server (169.254.169.254).

**Confidence:** High  
**Evidence:** No files matching `*egress*` or containing `policyTypes: - Egress` found in the k8s-manifests directory.  
**Reference:** https://cloud.google.com/kubernetes-engine/docs/how-to/network-policy

---

### SEC-04: Database Encryption at Rest Uses Google-Managed Keys

**Severity:** MEDIUM  
**Primary WAF Pillar:** Security

**Description:** Both GKE clusters show `databaseEncryption.state: "DECRYPTED"` (meaning Google-managed default encryption), and the Cloud SQL instance likely uses Google-managed encryption as well. While Google-managed encryption provides encryption at rest, it does not give the organization control over key rotation, key access auditing, or key revocation.

**Trade-offs:** CMEK requires Cloud KMS key management, adds operational complexity, and introduces a dependency on key availability. If the CMEK key is accidentally disabled/destroyed, data becomes unrecoverable.

**Impact:**
- **Benefits:** Key rotation control, audit trail for key usage, ability to revoke access, compliance with data governance requirements
- **Risks:** Operational overhead of key management; risk of data loss if keys are mismanaged

**Ease of Implementation:** 3 — Moderate. Requires creating a Cloud KMS keyring, provisioning keys, and recreating the cluster with CMEK enabled (cannot be changed in-place for GKE etcd encryption).

**Recommendation:** For the GKE cluster, evaluate whether compliance requirements mandate CMEK. For Cloud SQL, enable CMEK via instance configuration update. Implement key rotation schedules and alerting on key state changes.

**Confidence:** Medium — Cannot confirm Cloud SQL encryption state without direct API query; GKE state confirmed via cluster inspection.  
**Evidence:** GKE cluster API response: `"databaseEncryption": {"state": "DECRYPTED"}` for both clusters.  
**Reference:** https://cloud.google.com/kubernetes-engine/docs/how-to/encrypting-secrets

---

## 2. RELIABILITY

**Risk Level: CRITICAL**

**Current State:**

- ✅ GKE clusters on STABLE release channel with auto-upgrade and auto-repair
- ✅ Cluster autoscaler enabled on workload node pools (1–3 nodes)
- ✅ HPA defined for both API and React deployments
- ✅ Readiness probes configured on both API and React containers
- ✅ Multi-zone default node pools (us-west4-a, b, c)
- ⚠️ Production workload pool is single-zone with preemptible VMs
- ⚠️ No liveness probes on any deployment
- ⚠️ No PodDisruptionBudget defined
- ⚠️ Kustomize overlay hardcodes replicas to 1, overriding HPA
- ⚠️ Cloud SQL Proxy sidecar has no health check or liveness probe

**Findings Table:**

| ID | Finding | Severity | Effort |
|---|---|---|---|
| REL-01 | Production on preemptible single-zone nodes | CRITICAL | 3 |
| REL-02 | No liveness probe on API deployment | HIGH | 1 |
| REL-03 | No PodDisruptionBudget defined | HIGH | 1 |
| REL-04 | Replica count hardcoded to 1, overriding HPA | HIGH | 1 |

---

### REL-01: Production on Preemptible Single-Zone Nodes

**Severity:** CRITICAL  
**Primary WAF Pillar:** Reliability

**Description:** The production node pool (`prod-pool-058b`) is configured with `preemptible: true` and runs only in `us-west4-a`. Preemptible VMs are terminated by Google after a maximum of 24 hours and can be preempted at any time with only 30 seconds notice. Combined with single-zone placement, this means a zone-level event or preemption cascade will terminate all production workloads simultaneously with no failover path.

**Current state (from cluster API):**
```json
{
  "name": "prod-pool-058b",
  "config": {
    "machineType": "n2-standard-8",
    "preemptible": true
  },
  "locations": ["us-west4-a"],
  "autoscaling": {
    "enabled": true,
    "minNodeCount": 1,
    "maxNodeCount": 3
  }
}
```

**Trade-offs:** Moving to on-demand or Spot VMs (with multi-zone distribution) increases cost. On-demand n2-standard-8 in us-west4 costs ~$0.3881/hr vs ~$0.1164/hr for preemptible. However, right-sizing may offset this (current workloads likely don't need 8 vCPUs).

**Impact:**
- **Benefits:** Eliminates forced termination risk; enables cross-zone redundancy; improves SLA achievability
- **Risks:** Higher compute cost (~3.3x per node if staying with n2-standard-8); requires careful right-sizing to manage budget impact

**Ease of Implementation:** 3 — Moderate. Requires creating a new node pool with multi-zone placement and on-demand/standard VMs, migrating workloads, and draining the old pool. Consider right-sizing to a smaller machine type.

**Recommendation:** Create a new production node pool with: (1) `spot: false` (on-demand), (2) multiple zones (`us-west4-a`, `us-west4-b`), (3) right-sized machine type (e2-standard-4 or n2-standard-4 based on actual utilization), (4) cluster autoscaler enabled with minNodeCount: 2.

**Confidence:** High  
**Evidence:** Cluster API response confirms `"preemptible": true` and `"locations": ["us-west4-a"]` on `prod-pool-058b`. GCP Recommender shows workloads are underprovisioned on CPU, indicating workload is actively running on these nodes.  
**Reference:** https://cloud.google.com/kubernetes-engine/docs/concepts/spot-vms

---

### REL-02: No Liveness Probe on API Deployment

**Severity:** HIGH  
**Primary WAF Pillar:** Reliability

**Description:** The API deployment defines a `readinessProbe` (HTTP GET on `/api/healthz`) but no `livenessProbe`. If the Express application enters a deadlock, infinite loop, or unrecoverable error state (e.g., database connection pool exhaustion), Kubernetes will not restart the container. It will remain in a Running state but unable to serve traffic, and the readiness probe may still pass if the health endpoint doesn't check downstream dependencies.

**Trade-offs:** A poorly configured liveness probe can cause unnecessary restarts (restart storms). The probe must be carefully tuned with appropriate `initialDelaySeconds`, `periodSeconds`, and `failureThreshold`.

**Impact:**
- **Benefits:** Auto-recovery from hung or deadlocked application states; improved availability
- **Risks:** Misconfigured probe could cause restart loops; probe endpoint must not have expensive checks

**Ease of Implementation:** 1 — Minimal. Add a `livenessProbe` section to the deployment manifest referencing the existing health endpoint.

**Recommendation:** Add a liveness probe to the API container:
```yaml
livenessProbe:
  httpGet:
    port: 8080
    path: /api/healthz
  initialDelaySeconds: 30
  periodSeconds: 15
  failureThreshold: 3
```

**Confidence:** High  
**Evidence:** Both `dev.deployment.yaml` and `prod.deployment.yaml` only define `readinessProbe`; no `livenessProbe` key exists. React deployment also lacks a liveness probe.  
**Reference:** https://cloud.google.com/blog/products/containers-kubernetes/kubernetes-best-practices-setting-up-health-checks-with-readiness-and-liveness-probes

---

### REL-03: No PodDisruptionBudget Defined

**Severity:** HIGH  
**Primary WAF Pillar:** Reliability

**Description:** No PodDisruptionBudget (PDB) is defined for either the API or React deployments. During node upgrades, cluster autoscaler scale-down, or node maintenance, Kubernetes may evict all pods simultaneously without honoring availability requirements. This is especially critical given the single-replica configuration.

**Trade-offs:** A PDB is only effective when replicas > 1. Since current production runs with 1 replica (see REL-04), a PDB with `minAvailable: 1` would block all voluntary evictions (including upgrades). This finding should be addressed alongside REL-04.

**Impact:**
- **Benefits:** Protects availability during planned disruptions (upgrades, maintenance, autoscaler events)
- **Risks:** With single replica, `minAvailable: 1` blocks cluster upgrades; must be paired with increased replica count

**Ease of Implementation:** 1 — Minimal. Add a PDB manifest to the base kustomization.

**Recommendation:** After increasing replicas (REL-04), add PodDisruptionBudgets:
```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: ai-dmsp-api-pdb
spec:
  minAvailable: 1
  selector:
    matchLabels:
      app.kubernetes.io/name: ai-dmsp-api
```

**Confidence:** High  
**Evidence:** No PDB files in `k8s-manifests/base/ai-dmsp/` or any overlay directory. `kustomization.yaml` does not reference any PDB resource.  
**Reference:** https://cloud.google.com/kubernetes-engine/docs/concepts/pod-disruption-budget

---

### REL-04: Replica Count Hardcoded to 1, Overriding HPA

**Severity:** HIGH  
**Primary WAF Pillar:** Reliability

**Description:** Both dev and prod `kustomization.yaml` files set `replicas: count: 1` for both deployments. This overrides the HPA's `minReplicas` at deploy time, effectively making the application single-instance. A single replica means any pod restart, node preemption, or OOM kill results in complete service downtime until a replacement pod is scheduled and passes readiness checks.

**Current state (prod kustomization.yaml):**
```yaml
replicas:
  - count: 1
    name: ai-dmsp-api-deployment
  - count: 1
    name: ai-dmsp-react-deployment
```

**Trade-offs:** Running 2+ replicas increases resource consumption proportionally. With current resource requests (100m CPU, 64Mi memory for API), doubling replicas adds only 100m CPU and 64Mi memory.

**Impact:**
- **Benefits:** Zero-downtime during pod restarts, node maintenance, or deployments; enables PDB protection; improves load distribution
- **Risks:** Minimal cost increase; requires session affinity consideration (already handled via external session store)

**Ease of Implementation:** 1 — Minimal. Change `count: 1` to `count: 2` in production kustomization, or remove the `replicas` field entirely to let HPA manage scaling.

**Recommendation:** For production, set `count: 2` minimum or remove the `replicas` override to let HPA manage. Ensure the HPA `minReplicas` is set to 2 for production. For dev, keeping 1 replica is acceptable.

**Confidence:** High  
**Evidence:** `k8s-manifests/overlays/prod/kustomization.yaml` lines 17-20 explicitly set `count: 1`. The HPA in base defines `maxReplicas: 10` but the kustomize `replicas` field overrides the deployment's `.spec.replicas`, resetting the effective minimum on each deploy.  
**Reference:** https://cloud.google.com/kubernetes-engine/docs/concepts/horizontalpodautoscaler

---

## 3. OPERATIONAL EXCELLENCE

**Risk Level: MEDIUM**

**Current State:**

- ✅ Cloud Build CI/CD pipeline with environment-specific builds and deployments
- ✅ Cloud Logging enabled for system components and workloads
- ✅ Managed Prometheus enabled for metrics collection
- ✅ Rollbar integration for application error tracking
- ✅ Health endpoints (`/api/healthz`, `/healthz`) for monitoring
- ✅ Conventional Commits enforced via commitlint + husky
- ⚠️ Application logs output to stdout without structured JSON formatting
- ⚠️ No custom SSL policy on the load balancer (commented out)
- ⚠️ No visible IaC for GKE cluster provisioning (Terraform referenced by service account names but not in repo)

**Findings Table:**

| ID | Finding | Severity | Effort |
|---|---|---|---|
| OPS-01 | No structured logging configuration | MEDIUM | 2 |
| OPS-02 | No SSL policy on load balancer | MEDIUM | 1 |
| OPS-03 | No infrastructure-as-code for GKE clusters | LOW | 4 |

---

### OPS-01: No Structured Logging Configuration

**Severity:** MEDIUM  
**Primary WAF Pillar:** Operational Excellence

**Description:** The Express API uses `morgan('common')` for HTTP request logging, which outputs unstructured text. Application logs use `console.log`/`console.error`. This makes Cloud Logging queries difficult, prevents automatic severity detection, and limits the ability to correlate traces, filter by request attributes, or set up log-based alerts.

**Current state (`server.ts`):**
```typescript
app.use(morgan('common'));
```

Production logs observed in Cloud Logging show the severity field incorrectly set to ERROR for normal INFO-level messages (nginx notices, health checks), confirming that Cloud Logging cannot properly parse the log severity from unstructured output.

**Trade-offs:** Structured logging libraries (like `pino` or `@google-cloud/logging-winston`) add a dependency and change log format, which may affect local development readability.

**Impact:**
- **Benefits:** Proper severity classification in Cloud Logging; enables log-based metrics and alerting; supports distributed tracing correlation
- **Risks:** Minor development experience change (JSON logs are less human-readable without tooling)

**Ease of Implementation:** 2 — Low. Replace `morgan` with a structured logger (pino with pino-http) and configure JSON output in production.

**Recommendation:** Adopt `pino` with `pino-http` middleware for structured JSON logging. Configure the output format to match Cloud Logging's expected JSON structure (`severity`, `message`, `timestamp`, `httpRequest` fields). Keep human-readable output for local development.

**Confidence:** High  
**Evidence:** Production Cloud Logging output shows misclassified severity (ERROR for INFO-level nginx notices). `server.ts` uses `morgan('common')` and `console.log` for application output.  
**Reference:** https://cloud.google.com/logging/docs/structured-logging

---

### OPS-02: No SSL Policy on Load Balancer

**Severity:** MEDIUM  
**Primary WAF Pillar:** Operational Excellence (cross-cuts Security)

**Description:** The FrontendConfig for both dev and prod has the `sslPolicy` field commented out. Without an explicit SSL policy, the GCP load balancer uses the default SSL policy which may allow older TLS versions (TLS 1.0, 1.1) and weaker cipher suites.

**Current state (`prod.frontendconfig.yaml`):**
```yaml
spec:
  redirectToHttps:
    enabled: true
    responseCodeName: MOVED_PERMANENTLY_DEFAULT
  # sslPolicy: example-ssl-policy-name
```

**Trade-offs:** A restrictive SSL policy (e.g., `MODERN` profile with TLS 1.2+ only) may exclude clients with very old browsers/OS, though this is extremely rare for a university research application.

**Impact:**
- **Benefits:** Enforces TLS 1.2+ minimum; eliminates weak cipher suites; improves security scan results
- **Risks:** Negligible — modern browsers and API clients universally support TLS 1.2+

**Ease of Implementation:** 1 — Minimal. Create a GCP SSL policy resource and reference it in the FrontendConfig.

**Recommendation:** Create a Cloud Load Balancing SSL policy with `MODERN` profile (TLS 1.2+, modern ciphers) and reference it in both FrontendConfig manifests.

**Confidence:** High  
**Evidence:** Both `dev.frontendconfig.yaml` and `prod.frontendconfig.yaml` have `sslPolicy` commented out.  
**Reference:** https://cloud.google.com/load-balancing/docs/use-ssl-policies

---

### OPS-03: No Infrastructure-as-Code for GKE Clusters

**Severity:** LOW  
**Primary WAF Pillar:** Operational Excellence

**Description:** The GKE cluster node pool service accounts (`tf-gke-websvcs-diverse-6l13`, `tf-gke-websvcs-diverse-13c1`) suggest Terraform was used for initial provisioning, but no Terraform files exist in this repository. The cluster configuration is not version-controlled alongside the application, making it difficult to audit changes, reproduce environments, or recover from misconfiguration.

**Trade-offs:** IaC for shared clusters may be managed in a separate platform/infra repository. This finding may not apply if Terraform state exists elsewhere.

**Impact:**
- **Benefits:** Auditable cluster configuration; reproducible environments; drift detection
- **Risks:** May duplicate existing IaC if managed in a separate repository

**Ease of Implementation:** 4 — High if starting from scratch. If existing Terraform exists in another repo, this is informational only.

**Recommendation:** Confirm whether Terraform configuration for these clusters exists in a separate infrastructure repository. If not, create one using `terraform import` for existing resources. At minimum, document the cluster configuration decisions and rationale.

**Confidence:** Medium — Service account naming convention suggests Terraform exists elsewhere.  
**Evidence:** Service account names `tf-gke-websvcs-diverse-6l13` and `tf-gke-websvcs-diverse-13c1` follow Terraform naming patterns. No `.tf` files in this repository.  
**Reference:** https://cloud.google.com/docs/terraform/best-practices-for-terraform

---

## 4. PERFORMANCE EFFICIENCY

**Risk Level: MEDIUM**

**Current State:**

- ✅ HPA configured for both API and React deployments (target 50% CPU)
- ✅ Cluster autoscaler enabled on workload node pools
- ✅ Cloud SQL Proxy uses private IP (low-latency path)
- ✅ Node pool uses n2-standard-8 (adequate compute for current workload)
- ⚠️ HPA uses deprecated `autoscaling/v1` API
- ⚠️ React deployment has no resource requests or limits defined
- ⚠️ Cloud SQL Proxy has no connection pooling configuration
- ⚠️ No memory-based HPA metric (only CPU)

**Findings Table:**

| ID | Finding | Severity | Effort |
|---|---|---|---|
| PERF-01 | HPA uses deprecated autoscaling/v1 API | MEDIUM | 1 |
| PERF-02 | React deployment missing resource limits | MEDIUM | 1 |
| PERF-03 | Cloud SQL Proxy lacks connection management | LOW | 2 |

---

### PERF-01: HPA Uses Deprecated autoscaling/v1 API

**Severity:** MEDIUM  
**Primary WAF Pillar:** Performance Efficiency

**Description:** The HPA manifests use `autoscaling/v1` which only supports CPU-based scaling. The `autoscaling/v2` API (stable since Kubernetes 1.23) supports multiple metrics (CPU, memory, custom metrics), scaling behavior controls (scale-up/down rate), and stabilization windows.

**Current state (`horizontalpodautoscaler.yaml`):**
```yaml
apiVersion: autoscaling/v1
kind: HorizontalPodAutoscaler
spec:
  maxReplicas: 10
  targetCPUUtilizationPercentage: 50
```

**Trade-offs:** `autoscaling/v2` is fully stable and supported. Migration is straightforward but changes the manifest structure.

**Impact:**
- **Benefits:** Enables memory-based scaling (important for Node.js); configurable scale-down behavior to prevent flapping; more granular control
- **Risks:** None — v2 is GA and backwards compatible in behavior

**Ease of Implementation:** 1 — Minimal. Rewrite the HPA manifest to use `autoscaling/v2` format.

**Recommendation:** Migrate to `autoscaling/v2` and add memory metric alongside CPU. Configure `behavior.scaleDown.stabilizationWindowSeconds` to prevent aggressive scale-down.

**Confidence:** High  
**Evidence:** `k8s-manifests/base/ai-dmsp/horizontalpodautoscaler.yaml` uses `apiVersion: autoscaling/v1`.  
**Reference:** https://cloud.google.com/kubernetes-engine/docs/concepts/horizontalpodautoscaler

---

### PERF-02: React Deployment Missing Resource Limits

**Severity:** MEDIUM  
**Primary WAF Pillar:** Performance Efficiency

**Description:** The React (nginx) deployment has no `resources` block defined — no requests or limits for CPU or memory. Without resource requests, the scheduler cannot make optimal placement decisions, and the pod may be evicted under resource pressure as a BestEffort QoS pod. Without limits, a misbehaving pod could consume unbounded node resources.

**Current state (`dev.deployment.yaml` / `prod.deployment.yaml` for react):**
```yaml
containers:
  - name: react-web
    image: ai-dmsp-react-image
    imagePullPolicy: Always
    ports:
      - containerPort: 80
    readinessProbe:
      httpGet:
        port: 80
        path: /healthz
    # No resources block
```

**Trade-offs:** Setting limits too low could cause OOM kills for the nginx container during traffic spikes.

**Impact:**
- **Benefits:** Predictable scheduling; prevents resource starvation of co-located pods; enables accurate HPA decisions
- **Risks:** Over-restrictive limits could cause premature OOM kills

**Ease of Implementation:** 1 — Minimal. Add a resources block with conservative requests/limits for nginx.

**Recommendation:** Add resource requests and limits appropriate for an nginx static-serving container:
```yaml
resources:
  requests:
    cpu: 25m
    memory: 32Mi
  limits:
    cpu: 200m
    memory: 128Mi
```

**Confidence:** High  
**Evidence:** Neither dev nor prod deployment YAML for the React container includes a `resources` field.  
**Reference:** https://cloud.google.com/kubernetes-engine/docs/concepts/plan-pod-resources

---

### PERF-03: Cloud SQL Proxy Lacks Connection Management

**Severity:** LOW  
**Primary WAF Pillar:** Performance Efficiency

**Description:** The Cloud SQL Proxy sidecar runs with no explicit `--max-connections` flag, no connection draining timeout, and no health check endpoint. Under load, the proxy may exhaust Cloud SQL connection limits without backpressure. The outdated v1.17 proxy also lacks the connection pool management improvements in v2.x.

**Trade-offs:** Connection limits must be set below the Cloud SQL instance's maximum connections to leave headroom for maintenance connections.

**Impact:**
- **Benefits:** Prevents connection exhaustion; enables graceful shutdown during pod termination; visibility into proxy health
- **Risks:** Setting max-connections too low could throttle application requests during peaks

**Ease of Implementation:** 2 — Low. Addressed concurrently with SEC-02 (proxy upgrade). The v2 proxy supports `--max-connections`, `--max-sigterm-delay`, and health-check flags.

**Recommendation:** Address as part of SEC-02. When upgrading to Cloud SQL Auth Proxy v2, add `--max-connections=100`, `--max-sigterm-delay=30s`, and `--health-check` flags.

**Confidence:** Medium  
**Evidence:** Current proxy command shows no connection management flags. Related to SEC-02 (outdated proxy version).  
**Reference:** https://cloud.google.com/sql/docs/mysql/connect-kubernetes-engine#run_the_in_a_sidecar_pattern

---

## 5. COST OPTIMIZATION

**Risk Level: LOW**

**Current State:**

- ✅ Cluster autoscaler enabled (prevents idle node cost)
- ✅ Preemptible/Spot nodes used for cost reduction (but inappropriate for production — see REL-01)
- ✅ Resource requests defined for API pod (enables bin-packing)
- ✅ HPA defined (scales down during low traffic)
- ⚠️ Using `:latest` tag for production images (deployment reliability concern)
- ⚠️ No billing alerts or budget constraints visible in this configuration
- ⚠️ GCP Recommender shows workloads are over-provisioned on CPU

**Findings Table:**

| ID | Finding | Severity | Effort |
|---|---|---|---|
| COST-01 | Using `:latest` tag for production images | LOW | 1 |
| COST-02 | No billing alerts or budget constraints visible | LOW | 3 |

---

### COST-01: Using `:latest` Tag for Production Images

**Severity:** LOW  
**Primary WAF Pillar:** Cost Optimization (cross-cuts Reliability)

**Description:** Both dev and prod kustomizations use `newTag: latest` for container images. While Cloud Build pushes both a build-specific tag and `:latest`, referencing `:latest` in the kustomization means the actual deployed version is ambiguous. This affects cost optimization because failed deployments and rollback scenarios become harder to diagnose, potentially leading to extended incident response time (which has operational cost).

**Current state (`prod/kustomization.yaml`):**
```yaml
images:
  - name: ai-dmsp-api-image
    newName: us-west4-docker.pkg.dev/asu-ke-rto-web-svcs/ai-dmsp-api-repo/prod/ai-dmsp-api-image
    newTag: latest
```

The `cloudbuild.yaml` does push with `$BUILD_ID` tag, and the `rollout restart` forces a pull — so in practice the latest image is pulled. However, the kustomize manifests don't reflect the actual deployed version.

**Trade-offs:** Using build-specific tags in kustomization requires either automated tag updates in the manifest or a templating approach.

**Impact:**
- **Benefits:** Auditable deployments; deterministic rollback; clear image provenance
- **Risks:** Requires CI/CD pipeline modification to update tag reference

**Ease of Implementation:** 1 — Minimal. Use `kustomize edit set image` in the Cloud Build pipeline to stamp the exact `$BUILD_ID` tag.

**Recommendation:** Modify the Cloud Build pipeline to run `kustomize edit set image ai-dmsp-api-image=.../$BUILD_ID` before `kubectl apply`. This makes deployments deterministic and rollback trivial.

**Confidence:** High  
**Evidence:** Both kustomization files reference `newTag: latest`. Cloud Build uses `rollout restart` which forces a pull, but the deployed tag is not recorded in any manifest.  
**Reference:** https://cloud.google.com/kubernetes-engine/docs/concepts/kubernetes-engine-overview#container_images

---

### COST-02: No Billing Alerts or Budget Constraints Visible

**Severity:** LOW  
**Primary WAF Pillar:** Cost Optimization

**Description:** No Cloud Billing budget alerts or resource labels for cost allocation are visible in the deployment configuration. While these may be configured at the organization or project level outside this repository, their absence means there's no visible cost governance.

**Trade-offs:** Budget alerts are typically configured at the project/billing account level, not in application-level manifests. This may be a false positive if configured elsewhere.

**Impact:**
- **Benefits:** Early warning on cost spikes; accountability via resource labels; budget enforcement
- **Risks:** None — purely additive

**Ease of Implementation:** 3 — Moderate. Requires coordination with billing administrators to set up budgets and alerts.

**Recommendation:** Verify billing alerts are configured at the project level. Add resource labels to GKE workloads (e.g., `cost-center`, `team`, `environment`) for cost allocation reporting.

**Confidence:** Low — Cannot verify billing configuration from this repository alone.  
**Evidence:** No `resourceLabels` or billing-related configuration in cluster or namespace manifests. Cluster `labelFingerprint` exists but no labels visible.  
**Reference:** https://cloud.google.com/billing/docs/how-to/budgets

---

## Anti-Patterns Identified

| Check ID | Anti-Pattern | Status | Severity | Details |
|---|---|---|---|---|
| IAM-01 | Over-privileged IAM: Service accounts with roles/editor or roles/owner | ⚠️ Partial / Needs review | — | Service accounts (`tf-gke-websvcs-diverse-*`) scope unknown; node pools have `cloud-platform` scope which is broad but standard for GKE with Workload Identity |
| IAM-02 | Missing Workload Identity: Pods using exported service account keys | ✅ Not present | — | Workload Identity configured and enforced. Cloud Build pipeline runs `workload-identity-setup.sh` |
| SEC-01 | Hardcoded secrets: Credentials in code or ConfigMaps | ✅ Not present | — | Secrets sourced from Secret Manager; `.gitignore` excludes `secrets/`; Kubernetes secrets generated during build |
| SEC-02 | Unencrypted data paths | ✅ Not present | — | TLS enforced via HTTPS redirect; internal Cloud SQL connection via private IP proxy |
| SEC-03 | Missing network isolation | ⚠️ Partial / Needs review | HIGH | Ingress policies present but overly broad (0.0.0.0/0); no egress policies. See [SEC-03](#sec-03-no-egress-network-policy) |
| REL-01 | Single-zone deployments | ❌ **FOUND** | CRITICAL | Production node pool `prod-pool-058b` in `us-west4-a` only. See [REL-01](#rel-01-production-on-preemptible-single-zone-nodes) |
| REL-02 | No health probes | ⚠️ Partial / Needs review | HIGH | Readiness probes present; liveness probes missing. See [REL-02](#rel-02-no-liveness-probe-on-api-deployment) |
| OPS-01 | Missing observability | ⚠️ Partial / Needs review | MEDIUM | Cloud Logging + Managed Prometheus enabled; structured logging missing. See [OPS-01](#ops-01-no-structured-logging-configuration) |
| OPS-02 | No IaC | ⚠️ Partial / Needs review | LOW | K8s manifests are IaC; GKE cluster Terraform likely exists in separate repo. See [OPS-03](#ops-03-no-infrastructure-as-code-for-gke-clusters) |
| PERF-01 | Missing autoscaling | ✅ Not present | — | HPA and cluster autoscaler both configured (though HPA is overridden by replica count) |
| COST-01 | No cost governance | ⚠️ Partial / Needs review | LOW | Autoscaler provides some governance; billing alerts cannot be verified. See [COST-02](#cost-02-no-billing-alerts-or-budget-constraints-visible) |
| DR-01 | No disaster recovery plan | ❌ **FOUND** | MEDIUM | No documented RTO/RPO, backup strategy, or failover procedures in repository |

---

## Prioritized Remediation Roadmap

| Priority | Finding | WAF Pillar | Effort | Recommendation |
|---|---|---|---|---|
| **P0** | [SEC-01](#sec-01-api-container-runs-as-root) | Security | 1 | Set `runAsNonRoot: true`, `runAsUser: 1000` in pod securityContext |
| **P0** | [REL-01](#rel-01-production-on-preemptible-single-zone-nodes) | Reliability | 3 | Create new multi-zone on-demand node pool for production |
| **P1** | [SEC-02](#sec-02-critically-outdated-cloud-sql-auth-proxy) | Security | 2 | Upgrade to Cloud SQL Auth Proxy v2.x |
| **P1** | [REL-02](#rel-02-no-liveness-probe-on-api-deployment) | Reliability | 1 | Add liveness probes to API and React deployments |
| **P1** | [REL-03](#rel-03-no-poddisruptionbudget-defined) | Reliability | 1 | Add PodDisruptionBudgets for both deployments |
| **P1** | [REL-04](#rel-04-replica-count-hardcoded-to-1-overriding-hpa) | Reliability | 1 | Increase prod replica count to 2 or remove override |
| **P2** | [SEC-03](#sec-03-no-egress-network-policy) | Security | 3 | Implement default-deny egress with selective allow rules |
| **P2** | [OPS-01](#ops-01-no-structured-logging-configuration) | Operational Excellence | 2 | Adopt pino for structured JSON logging |
| **P2** | [OPS-02](#ops-02-no-ssl-policy-on-load-balancer) | Operational Excellence | 1 | Create and attach MODERN SSL policy |
| **P2** | [PERF-01](#perf-01-hpa-uses-deprecated-api-version) | Performance Efficiency | 1 | Migrate HPA to autoscaling/v2 |
| **P2** | [PERF-02](#perf-02-react-deployment-missing-resource-limits) | Performance Efficiency | 1 | Add resource requests/limits to React container |
| **P3** | [COST-01](#cost-01-using-latest-tag-for-production-images) | Cost Optimization | 1 | Use build-specific image tags in kustomization |
| **P3** | [PERF-03](#perf-03-cloud-sql-proxy-lacks-connection-management) | Performance Efficiency | 2 | Address with SEC-02 proxy upgrade |
| **P4** | [SEC-04](#sec-04-database-encryption-at-rest-uses-google-managed-keys) | Security | 3 | Evaluate CMEK requirement based on compliance needs |
| **P4** | [COST-02](#cost-02-no-billing-alerts-or-budget-constraints-visible) | Cost Optimization | 3 | Configure billing budgets and resource labels |
| **P4** | [OPS-03](#ops-03-no-infrastructure-as-code-for-gke-clusters) | Operational Excellence | 4 | Verify/create Terraform for cluster configuration |

**Effort Scale:**
1. Minimal — Configuration change or minor update
2. Low — Targeted changes with limited scope
3. Moderate — Multiple components, cross-team coordination
4. High — Major architecture change or extended migration

---

## Technical Debt Inventory

### Security Domain

| Item | Priority | Effort | Impact if Unaddressed |
|---|---|---|---|
| Container running as root ([SEC-01](#sec-01-api-container-runs-as-root)) | P0 | 1 | Privilege escalation if container compromised; compliance failure |
| Outdated Cloud SQL Proxy ([SEC-02](#sec-02-critically-outdated-cloud-sql-auth-proxy)) | P1 | 2 | Unpatched vulnerabilities; missing security features |
| Missing egress policies ([SEC-03](#sec-03-no-egress-network-policy)) | P2 | 3 | Data exfiltration possible if container compromised |
| Google-managed encryption keys ([SEC-04](#sec-04-database-encryption-at-rest-uses-google-managed-keys)) | P4 | 3 | Non-compliance with strict data governance requirements |

### Reliability Domain

| Item | Priority | Effort | Impact if Unaddressed |
|---|---|---|---|
| Preemptible single-zone production ([REL-01](#rel-01-production-on-preemptible-single-zone-nodes)) | P0 | 3 | Unplanned downtime on preemption or zone outage |
| Missing liveness probes ([REL-02](#rel-02-no-liveness-probe-on-api-deployment)) | P1 | 1 | Hung processes remain running, serving errors |
| No PodDisruptionBudget ([REL-03](#rel-03-no-poddisruptionbudget-defined)) | P1 | 1 | Complete downtime during node maintenance |
| Single replica production ([REL-04](#rel-04-replica-count-hardcoded-to-1-overriding-hpa)) | P1 | 1 | Zero redundancy; any pod failure = outage |

### Operational Excellence Domain

| Item | Priority | Effort | Impact if Unaddressed |
|---|---|---|---|
| Unstructured logging ([OPS-01](#ops-01-no-structured-logging-configuration)) | P2 | 2 | Slow incident diagnosis; missed alerts |
| Missing SSL policy ([OPS-02](#ops-02-no-ssl-policy-on-load-balancer)) | P2 | 1 | Potential weak TLS negotiation |
| No visible cluster IaC ([OPS-03](#ops-03-no-infrastructure-as-code-for-gke-clusters)) | P4 | 4 | Configuration drift; difficult disaster recovery |

### Prioritized Remediation Roadmap (Phased)

| Phase | Timeframe | Focus | Items |
|---|---|---|---|
| **Phase 1 — Immediate** | 1–2 weeks | Low-effort, high-impact fixes (Effort 1) | SEC-01: Non-root container; REL-02: Liveness probes; REL-03: PDBs; REL-04: Increase replicas to 2 |
| **Phase 2 — Short-term** | 2–4 weeks | Critical gaps requiring testing (Effort 2–3) | SEC-02: Proxy upgrade to v2; REL-01: New prod node pool (multi-zone, on-demand); OPS-02: SSL policy; PERF-01: HPA v2; PERF-02: React resources |
| **Phase 3 — Medium-term** | 1–2 months | Network hardening and observability (Effort 2–3) | SEC-03: Egress network policies; OPS-01: Structured logging; COST-01: Deterministic image tags |
| **Phase 4 — Ongoing** | Continuous | Strategic improvements | SEC-04: CMEK evaluation; COST-02: Billing governance; OPS-03: IaC consolidation; PERF-03: Connection management |

---

## Solution Directory Layout

```
rtic-gcp-ai-dmsp-assistant/
├── api/                          # Express.js API (TypeScript)
│   ├── Dockerfile                # Multi-stage build (builder → dev → production)
│   ├── src/
│   │   ├── index.ts              # Server entry point + WebSocket setup
│   │   ├── server.ts             # Express app configuration + middleware
│   │   ├── config/               # App config, data source, passport strategies
│   │   ├── entities/             # TypeORM entity definitions (User, Session, Submission, Rubric)
│   │   ├── middlewares/          # Auth, permission, and validation middleware
│   │   ├── migrations/           # TypeORM database migrations
│   │   ├── modules/              # Business logic (auth, dmp, rubrics, submissions, users)
│   │   ├── routes/               # Express route definitions
│   │   └── rubrics/              # Rubric definitions (NSF)
│   └── test/                     # API test files
├── react/                        # React SPA (Vite)
│   ├── Dockerfile                # Multi-stage build (dev → builder → nginx production)
│   ├── nginx.conf                # Production nginx configuration
│   └── src/                      # React source (components, pages, hooks, context)
├── k8s-manifests/                # Kubernetes deployment configuration
│   ├── base/ai-dmsp/            # Shared resources (SA, Service, HPA, NetworkPolicies)
│   └── overlays/
│       ├── dev/                  # Dev environment (namespace, deployment, ingress)
│       └── prod/                 # Prod environment (namespace, deployment, ingress)
├── proxy/                        # Local Traefik reverse proxy config
├── secrets/                      # Local development secrets (gitignored)
├── cloudbuild.yaml              # Cloud Build CI/CD pipeline
├── compose.yaml                 # Docker Compose for local development
├── workload-identity-setup.sh   # Workload Identity binding script
└── package.json                 # Root package.json (npm workspaces)
```

---

## Resources and Services Inspected

- ✅ **GKE Cluster: `websvcs-diverse-stack-gke-private-dev`** (us-west4) — cluster config, node pools (default-pool, dev-pool-c72b), network policies, autoscaling, Workload Identity, release channel
- ✅ **GKE Cluster: `websvcs-diverse-stack-gke-private-prod`** (us-west4) — cluster config, node pools (default-pool, prod-pool-058b), preemptible status, single-zone configuration
- ✅ **Cloud SQL Instance:** `websvcs-sql-private-aede29ce` (us-west4) — referenced in proxy logs and deployment manifests
- ✅ **Artifact Registry:** `us-west4-docker.pkg.dev/asu-ke-rto-web-svcs/ai-dmsp-api-repo` and `ai-dmsp-react-repo` — referenced in kustomization image overrides
- ✅ **Cloud Build pipeline:** `cloudbuild.yaml` — full step analysis (build, push, secrets, deploy, rollout, workload identity)
- ✅ **Secret Manager:** Referenced in `cloudbuild.yaml` for NPM token and kustomization secrets
- ✅ **Cloud Armor:** Policies `websvcs-diverse-stack-dev-policy` and `websvcs-diverse-stack-prod-policy` referenced in BackendConfig
- ✅ **Container logs (24h):** Queried ERROR+ severity for both `dev-default` and `prod-default` namespaces
- ✅ **GCP Recommender:** Reviewed workload provisioning recommendations (overprovisioned/underprovisioned CPU)
- ✅ **Kubernetes manifests:** All base and overlay resources (deployments, services, HPA, network policies, ingress, frontend/backend configs)
- ✅ **Application source:** API server configuration, database connection, authentication setup, Dockerfiles

---

## Documentation References

- [GKE: Hardening your cluster](https://cloud.google.com/kubernetes-engine/docs/how-to/hardening-your-cluster#use_least_privilege) — Container security, non-root execution
- [Cloud SQL: Connect from GKE](https://cloud.google.com/sql/docs/mysql/connect-kubernetes-engine) — Auth Proxy sidecar pattern and v2 migration
- [GKE: Network Policy](https://cloud.google.com/kubernetes-engine/docs/how-to/network-policy) — Ingress/egress policy configuration
- [GKE: Encrypting secrets at the application layer](https://cloud.google.com/kubernetes-engine/docs/how-to/encrypting-secrets) — CMEK for etcd encryption
- [GKE: Spot VMs](https://cloud.google.com/kubernetes-engine/docs/concepts/spot-vms) — Spot/preemptible node lifecycle and limitations
- [GKE: Configure health checks](https://cloud.google.com/blog/products/containers-kubernetes/kubernetes-best-practices-setting-up-health-checks-with-readiness-and-liveness-probes) — Liveness and readiness probe patterns
- [GKE: Pod Disruption Budget](https://cloud.google.com/kubernetes-engine/docs/concepts/pod-disruption-budget) — Protecting availability during disruptions
- [GKE: Horizontal Pod Autoscaler](https://cloud.google.com/kubernetes-engine/docs/concepts/horizontalpodautoscaler) — HPA configuration and API versions
- [Cloud Logging: Structured logging](https://cloud.google.com/logging/docs/structured-logging) — JSON log format for Cloud Logging
- [Cloud Load Balancing: SSL policies](https://cloud.google.com/load-balancing/docs/use-ssl-policies) — TLS version and cipher management
- [Terraform best practices for Google Cloud](https://cloud.google.com/docs/terraform/best-practices-for-terraform) — IaC patterns
- [GKE: Plan pod resources](https://cloud.google.com/kubernetes-engine/docs/concepts/plan-pod-resources) — Resource requests and limits
- [Cloud Billing: Budgets](https://cloud.google.com/billing/docs/how-to/budgets) — Budget alerts and cost governance
- [GKE: Optimize workload resource utilization](https://cloud.google.com/kubernetes-engine/docs/how-to/optimize-workload-resource-utilization) — Right-sizing guidance

---

## Assumptions and Open Questions

### Assumptions Made

1. **GKE cluster Terraform exists in a separate infrastructure repository** — based on service account naming pattern `tf-gke-websvcs-diverse-*`. If this is incorrect, OPS-03 should be elevated to HIGH severity.
2. **Cloud SQL instance uses default (Google-managed) encryption** — inferred from GKE cluster encryption state; direct Cloud SQL API query not available.
3. **Cloud Armor policies provide adequate WAF protection** — policy rules not inspected (would require Cloud Armor API query).
4. **SLA target is ~99.5% (3.65 hours/month downtime tolerable)** — inferred from academic research use case. If SLA is higher, REL-01 urgency increases.
5. **Traffic patterns are low-to-moderate** — based on single-replica configuration and academic audience.

### Open Questions

| Question | Impact on Recommendations |
|---|---|
| What is the defined SLA/SLO for production? | Determines urgency of REL-01 and whether preemptible cost savings are justified |
| Is there a separate Terraform repository for GKE cluster management? | Determines severity of OPS-03 |
| What are the compliance requirements for research data (FERPA, export control, etc.)? | Determines necessity of SEC-04 (CMEK) |
| What is the budget for infrastructure improvements? | Determines feasibility of REL-01 (moving off preemptible nodes) |
| Are Cloud Billing budgets configured at the organization/folder level? | May resolve COST-02 as already addressed |
| What is the Cloud SQL HA configuration (single-zone vs regional)? | May reveal additional reliability gap |
| Is there a documented incident response/on-call process? | Affects operational excellence assessment |

---

## Implementation Handoff Notes

### Phase 1 Implementation (SEC-01, REL-02, REL-03, REL-04)

**Owner:** GKE Reliability Engineer / DevOps  
**Acceptance Criteria:**
- API pods run as uid 1000 (verified via `kubectl exec -- id`)
- Liveness probes trigger restart after 3 consecutive failures
- PDB prevents all pods from being evicted simultaneously
- Prod runs minimum 2 API replicas

**Validation Checks:**
```bash
# Verify non-root
kubectl exec -n prod-default deploy/prod-ai-dmsp-api-deployment -c api-web -- id
# Expected: uid=1000(node) gid=1000(node)

# Verify probes
kubectl describe pod -n prod-default -l app.kubernetes.io/name=ai-dmsp-api | grep -A5 "Liveness:"

# Verify PDB
kubectl get pdb -n prod-default

# Verify replicas
kubectl get deploy -n prod-default prod-ai-dmsp-api-deployment -o jsonpath='{.spec.replicas}'
# Expected: 2
```

**Rollback:** Revert kustomize overlay changes and re-apply. Previous container image continues to function as root.

---

### Phase 2 Implementation (SEC-02, REL-01)

**Owner:** GKE Reliability Engineer / Platform Team  
**Acceptance Criteria:**
- Cloud SQL Auth Proxy running v2.x with health check endpoint
- Production workloads on on-demand multi-zone node pool
- Old node pool cordoned and drained

**Validation Checks:**
```bash
# Verify proxy version
kubectl get pod -n prod-default -l app.kubernetes.io/name=ai-dmsp-api -o jsonpath='{.items[*].spec.containers[?(@.name=="cloud-sql-proxy")].image}'
# Expected: gcr.io/cloud-sql-connectors/cloud-sql-proxy:2.x

# Verify node pool
kubectl get nodes -o custom-columns="NAME:.metadata.name,POOL:.metadata.labels.cloud\.google\.com/gke-nodepool"
# Expected: nodes in new multi-zone pool
```

**Rollback:**
- Proxy: Revert image tag in deployment manifest
- Node pool: Keep old pool available until new pool is validated; drain and delete old pool only after 48h observation

**Risks:**
- Cloud SQL Proxy v2 has different CLI syntax — test thoroughly in dev first
- Node pool migration requires workload rescheduling (brief disruption if PDB and replicas are in place from Phase 1)
