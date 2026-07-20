---
description: 'Perform a comprehensive architecture review of a Google Cloud project against the Google Cloud Well-Architected Framework (WAF). Analyzes source code, configuration, CI/CD pipelines, GKE workloads, and infrastructure to produce a structured review report with findings, severity ratings, an impact-vs-effort quadrant, and a prioritized remediation roadmap.'
agent: 'Google Cloud Consultant'
tools: ["gke-mcp/*", "google-developer-knowledge/*", "edit", "read", "search", "todo"]
---

## AGENT RESPONSIBILITIES

**YOU MUST TAKE ACTION TO:**

1. Explore the full workspace — source code, configuration, CI/CD pipelines, infrastructure, and documentation
2. Inspect the current state of GKE clusters, workloads, and GCP resources using MCP tools
3. Analyze all findings against the five Google Cloud Well-Architected Framework pillars
4. Classify each finding by severity and implementation effort
5. Generate a complete architecture review report in markdown format
6. Save the report to `documentation/architecture-review.md`

**THIS IS NOT A GUIDANCE DOCUMENT — YOU MUST EXECUTE THE FULL REVIEW AND PRODUCE THE REPORT**

**REQUIRED TOOLS:**

- **MUST use GKE-MCP tools** (`gke-mcp/*`) for cluster inspection, log queries, and recommendations on private GKE clusters
- **MUST use Google Cloud documentation tools** (`google-developer-knowledge/*`) to validate recommendations against current Google best practices
- Do NOT use direct `kubectl` commands against private clusters — they will hang
- Do NOT speculate about GCP resource state — use tools to confirm

---

## ROLE BOUNDARIES

- This review is advisory and assessment-focused.
- Do not implement workload or infrastructure changes unless explicitly requested.
- If implementation is needed, provide explicit handoff notes and acceptance criteria for the implementation agent (e.g., GKE Reliability Engineer).

## CLARIFICATION GATE (ASK BEFORE ASSUMING)

If any of these are missing from `copilot-instructions.md` or project documentation, ask targeted questions before concluding:

- Business-critical user journeys and priorities
- SLA/SLO and RTO/RPO targets
- Compliance/data residency constraints
- Budget and cost-optimization guardrails
- Traffic profile and scaling expectations
- Operational maturity (on-call, CI/CD, IaC, incident response)
- Known integration and migration constraints

---

## REVIEW METHODOLOGY

### Phase 1 — Discovery

Explore the workspace and GCP environment to build a complete understanding of the solution architecture:

1. **Project context**: Read `copilot-instructions.md` and any `gcp-config.yaml` to identify the GCP project ID, cluster names, regions, and namespaces
2. **Solution structure**: Identify all projects, services, frontends, APIs, databases, and their relationships
3. **Technology stack**: Frameworks, languages, package managers, major dependencies
4. **Hosting and infrastructure**: GCP services, regions, VPCs, GKE clusters, Cloud Run services
5. **Cluster health**: Use `gke-mcp/get_cluster` for each cluster to assess status, node pool configuration, and version currency
6. **Workload inspection**: Use `gke-mcp/get_k8s_resource` to inspect deployments, services, config maps, and secrets
7. **Log analysis**: Use `gke-mcp/get_k8s_logs` to check recent errors/warnings in production and development namespaces
8. **GCP recommendations**: Use `gke-mcp/list_k8s_events` to surface cluster events and issues
9. **CI/CD pipelines**: Cloud Build configs, triggers, steps, deployment targets
10. **Authentication and authorization**: IAM bindings, Workload Identity, service accounts, RBAC
11. **Data layer**: Cloud SQL, Firestore, BigQuery, connection management, query patterns
12. **Configuration**: App settings, secrets management (Secret Manager), environment-specific config
13. **Documentation**: Existing docs, READMEs, runbooks, architecture diagrams

### Phase 2 — Analysis

Evaluate findings against the **five Google Cloud Well-Architected Framework (WAF) pillars**:

| Pillar | Focus Areas |
|---|---|
| **Security** | IAM, Workload Identity, network policies, Secret Manager, encryption (CMEK), supply chain security, VPC Service Controls, container image provenance, RBAC, namespace isolation, pod security standards |
| **Reliability** | Multi-zone/region redundancy, failover, backup strategy, RTO/RPO, auto-healing, pod anti-affinity, node auto-repair, cluster autoscaler, Cloud SQL HA, PodDisruptionBudgets |
| **Operational Excellence** | Monitoring (Cloud Monitoring), logging (Cloud Logging), alerting, CI/CD pipelines (Cloud Build/Deploy), incident response, automation, health probes, resource quotas, rolling update strategy |
| **Performance Efficiency** | Right-sizing, autoscaling (HPA/VPA), caching (Memorystore), database optimization, latency, resource requests/limits, node pool sizing, Cloud SQL Proxy configuration, connection pooling |
| **Cost Optimization** | Resource utilization, committed use discounts, spot/preemptible nodes, idle resources, cluster autoscaler efficiency, over-provisioned pods, unused PVCs, right-sized node pools, billing alerts |

### Phase 3 — Classification

For **every finding**, assign:

#### Severity

| Score | Level | Criteria |
|---|---|---|
| **4** | **CRITICAL** | Actively exploitable vulnerability, data exposure risk, or complete absence of a fundamental security control |
| **3** | **HIGH** | Significant gap that materially impacts reliability, performance, or security posture; should be addressed promptly |
| **2** | **MEDIUM** | Notable concern that increases risk or degrades quality but is not immediately dangerous |
| **1** | **LOW** | Code hygiene, best-practice deviation, or minor improvement opportunity |

#### Ease of Implementation (Effort Score)

| Score | Label | Criteria |
|---|---|---|
| **1** | Minimal | Configuration change or minor code update; little to no downtime or coordination |
| **2** | Low | Targeted changes with limited scope; may require testing but no significant redesign |
| **3** | Moderate | Multiple components, cross-team coordination, or partial redesign |
| **4** | High | Major architecture change, significant development work, or extended migration |

#### Impact vs. Effort Quadrant Placement

Derive placement from severity and effort:

| | **Low Effort** (1–2) | **High Effort** (3–4) |
|---|---|---|
| **High Impact** (CRITICAL/HIGH) | **Quick Wins — Do First** | **Major Projects** |
| **Low Impact** (MEDIUM/LOW) | **Fill-Ins** | **Deprioritize** |

### Anti-Pattern Checklist

During analysis, check for these common Google Cloud anti-patterns:

```xml
<anti-patterns>
	<check id="IAM-01">Over-privileged IAM: Service accounts with roles/editor or roles/owner instead of least-privilege custom roles</check>
	<check id="IAM-02">Missing Workload Identity: Pods using exported service account keys instead of Workload Identity Federation</check>
	<check id="SEC-01">Hardcoded secrets: Credentials in code, env vars, or ConfigMaps instead of Secret Manager references</check>
	<check id="SEC-02">Unencrypted data paths: Data in transit without TLS or at rest without CMEK</check>
	<check id="SEC-03">Missing network isolation: Resources without VPC Service Controls, network policies, or private access</check>
	<check id="REL-01">Single-zone deployments: Production workloads without cross-zone redundancy or failover strategy</check>
	<check id="REL-02">No health probes: GKE workloads or Cloud Run services without configured liveness/readiness probes</check>
	<check id="OPS-01">Missing observability: No Cloud Monitoring dashboards, diagnostic settings, or structured logging configured</check>
	<check id="OPS-02">No IaC: Infrastructure provisioned manually via Console instead of Terraform, Deployment Manager, or Config Connector</check>
	<check id="PERF-01">Missing autoscaling: Fixed-scale deployments without HPA/VPA or cluster autoscaler configuration</check>
	<check id="COST-01">No cost governance: Missing billing alerts, resource labels, budget constraints, or idle/orphaned resources</check>
	<check id="DR-01">No disaster recovery plan: No documented RTO/RPO, backup strategy, or failover procedures</check>
</anti-patterns>
```

### Evidence Standard (Mandatory)

For every material finding, include:

- **Why**: business/risk driver
- **What**: exact architectural change needed
- **Impact**: expected effect across WAF pillars (benefits and risks)
- **Confidence**: High | Medium | Low
- **Evidence**: documentation reference plus observed environment evidence when available

If evidence is incomplete, state assumptions explicitly and what additional data would change the recommendation.

### Examples

```xml
<examples>
	<example>
		<finding>Connection strings with Cloud SQL credentials embedded in ConfigMaps</finding>
		<pillar>Security</pillar>
		<severity>CRITICAL</severity>
		<effort>2</effort>
		<recommendation>Migrate to Workload Identity + Cloud SQL Auth Proxy with IAM authentication; move remaining secrets to Secret Manager</recommendation>
	</example>
	<example>
		<finding>Production namespace missing resource quotas and limit ranges</finding>
		<pillar>Reliability</pillar>
		<severity>HIGH</severity>
		<effort>1</effort>
		<recommendation>Add ResourceQuota and LimitRange to production namespace to prevent unbounded resource consumption</recommendation>
	</example>
	<example>
		<finding>No pod disruption budget defined for production deployments</finding>
		<pillar>Reliability</pillar>
		<severity>HIGH</severity>
		<effort>1</effort>
		<recommendation>Add PodDisruptionBudget with minAvailable to ensure availability during node maintenance and upgrades</recommendation>
	</example>
	<example>
		<finding>Cloud SQL Proxy running as sidecar without connection pooling configuration</finding>
		<pillar>Performance Efficiency</pillar>
		<severity>MEDIUM</severity>
		<effort>2</effort>
		<recommendation>Configure max-connections and enable connection draining on Cloud SQL Proxy sidecar</recommendation>
	</example>
</examples>
```

---

## REPORT FORMAT

Generate the report as a single markdown document with the following structure. Every section is **required**.

### Report Header

```markdown
# {Project Name} — GCP Architecture Review

**Date:** {current date}
**Scope:** Full solution review against Google Cloud Well-Architected Framework (WAF)
**GCP Project ID:** {project ID}
**Hosting:** {hosting environment and region(s)}
```

### Scale Legend

Include the following scale definitions near the top of the report so all severity and effort ratings are immediately interpretable:

| Scale | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| **Severity** | Low | Medium | High | Critical |
| **Effort** | Minimal | Low | Moderate | High |

### How to Use This Report

Provide a numbered guide (4 steps) explaining how to navigate the report:
1. Start with Executive Summary and At-a-Glance Metrics
2. Use Impact vs. Effort Quadrant for prioritization
3. Review pillar sections for full findings
4. Execute from the Prioritized Remediation Roadmap

### At-a-Glance Metrics

A summary table with:
- Total Findings
- Count by severity level (Critical, High, Medium, Low)

### Table of Contents

Linked TOC to all major sections including each WAF pillar section, the quadrant, roadmap, and directory layout.

### Executive Summary

A concise narrative description of what the solution is and how it's structured, followed by these **required elements**:

- **Finding counts by severity** in bold (e.g., "**2 Critical**, **5 High**, **8 Medium**, **3 Low**")
- **Overall Risk Posture** rating in bold (e.g., "**Overall Risk Posture: HIGH**") with a one-sentence justification
- **Top 3 Immediate Actions** as a numbered list, each prefixed with the finding ID (e.g., "[SEC-01]") and a brief explanation

### Project / Environment Context

Structured tables summarizing the inspected environment:

- **GCP Environment**: Project ID, region(s), VPC(s), hosting services (GKE, Cloud Run, App Engine, etc.), cluster SKU (Standard/Autopilot), release channel, networking configuration
- **Solution Components**: Table of component name, technology, hosting target, database, and authentication method
- **Key Services**: Bullet list of GCP services in use (e.g., Cloud SQL, Cloud Storage, Memorystore, Pub/Sub, Cloud Build, Artifact Registry, Secret Manager) with specific details
- **Tools Used for Inspection**: List each MCP/gcloud tool used and what it was used for

### Impact vs. Effort Quadrant

A 2×2 matrix table organized as described in the Classification phase. Each cell lists findings as internal links with their effort score in brackets. Sort items within each cell by effort score ascending.

Include an interpretation guide explaining each quadrant:
- **Quick Wins — Do First:** Highest return with lowest effort
- **Major Projects:** High-value but requires planning
- **Fill-Ins:** Useful when capacity is available
- **Deprioritize:** Lower near-term return

### WAF Pillar Sections (1–5)

One numbered top-level section per pillar:
1. SECURITY
2. RELIABILITY
3. OPERATIONAL EXCELLENCE
4. PERFORMANCE EFFICIENCY
5. COST OPTIMIZATION

Each pillar section MUST include:

- **Risk Level** rating: CRITICAL | HIGH | MEDIUM | LOW
- **Current State** with bullet points for positive aspects (✅) and concerns (⚠️)
- **Findings table** with columns: ID, Finding, Severity, Effort

#### Finding ID Scheme

Each finding gets a **pillar-prefixed ID** for cross-referencing throughout the report:

| Pillar | Prefix | Example |
|---|---|---|
| Security | SEC-xx | SEC-01, SEC-02 |
| Reliability | REL-xx | REL-01, REL-02 |
| Operational Excellence | OPS-xx | OPS-01, OPS-02 |
| Performance Efficiency | PERF-xx | PERF-01, PERF-02 |
| Cost Optimization | COST-xx | COST-01, COST-02 |

Each pillar section then contains detailed subsection findings (e.g., `### SEC-01: Finding Title`).

#### Individual Finding Format

Every finding MUST include:

- **Severity:** CRITICAL | HIGH | MEDIUM | LOW
- **Description:** What the issue is, where it exists (file paths, resource names, namespace), and why it matters
- **Current state** (when applicable): Include the relevant config snippet, manifest, or resource description in a fenced code block
- **Primary WAF Pillar:** Which pillar is most affected
- **Trade-offs:** What introducing the fix would cost (complexity, effort, dependencies)
- **Impact:**
  - **Benefits:** Concrete improvements from remediation
  - **Risks:** Potential negative consequences or challenges from the fix
- **Ease of Implementation:** Score (1–4) with brief justification
- **Recommendation:** Specific, actionable fix with GCP service/product names
- **Confidence:** High | Medium | Low
- **Evidence:** Observed environment data (tool output, resource state) plus documentation reference
- **Reference:** Link to relevant Google Cloud documentation

### Anti-Patterns Identified

A table checking each anti-pattern from the checklist defined in the Review Methodology:

| Check ID | Anti-Pattern | Status | Severity | Details |
|---|---|---|---|---|

Status indicators:
- ✅ **Not present** — Anti-pattern not found; good practice in place
- ❌ **FOUND** — Anti-pattern confirmed present; requires remediation
- ⚠️ **Partial / Needs review** — Partially mitigated or cannot be fully assessed with available tools

### Prioritized Remediation Roadmap

A table with columns:

| Priority | Finding | WAF Pillar | Effort | Recommendation |
|----------|---------|------------|--------|----------------|

Priority levels:
- **P0** — Address immediately (CRITICAL findings)
- **P1** — Address in the next sprint (HIGH findings or high-impact quick wins)
- **P2** — Plan for near-term (MEDIUM findings with moderate effort)
- **P3** — Backlog (LOW findings or medium findings with low urgency)
- **P4** — Long-term / strategic (HIGH effort, lower relative urgency)

Include the effort scale legend after the table:
1. Minimal — Configuration change or minor update
2. Low — Targeted changes with limited scope
3. Moderate — Multiple components, cross-team coordination
4. High — Major architecture change or extended migration

### Technical Debt Inventory

Organized by architectural domain (e.g., Security Domain, Data Architecture Domain, Operational Excellence Domain):

| Item | Priority (P1/P2/P3) | Effort | Impact if Unaddressed |
|---|---|---|---|

Include a **Prioritized Remediation Roadmap (Phased)** subsection:

| Phase | Timeframe | Focus | Items |
|---|---|---|---|
| Phase 1 — Immediate | 1–2 weeks | Low-effort, high-impact items (Effort 1) | Finding IDs with brief descriptions |
| Phase 2 — Short-term | 2–4 weeks | Mixed effort items (Effort 2–3) addressing critical gaps | Finding IDs with brief descriptions |
| Phase 3 — Medium-term | 1–2 months | Higher-effort items (Effort 3) requiring design or testing | Finding IDs with brief descriptions |
| Phase 4 — Ongoing | Continuous | Lower-priority optimizations and improvements | Finding IDs with brief descriptions |

### Solution Directory Layout

A tree diagram (`code block`) showing the project's directory structure with inline comments explaining the purpose of each major directory and project.

### Resources and Services Inspected

A checklist confirming every GCP resource, GKE cluster, namespace, and service that was inspected. Each item prefixed with ✅ showing the resource/service name, region, and what was inspected (e.g., "cluster config, node pools, network policies" or "error logs (24h), deployment manifests, resource quotas").

Include confirmation of GCP Recommender findings review.

### Documentation References

Consolidated list of all Google Cloud documentation links referenced throughout the report, formatted as markdown links with descriptive labels.

### Assumptions and Open Questions

Explicitly list assumptions made during assessment and unresolved questions that affect confidence or prioritization. Include what additional data would change recommendations.

### Implementation Handoff Notes

For recommendations requiring implementation, provide concise handoff details:
- Acceptance criteria
- Validation checks (commands or expected state)
- Rollback considerations
- Suggested owner/agent (e.g., GKE Reliability Engineer)

---

### Cross-Referencing

Throughout the report, use cross-references to connect related content:
- Executive Summary Top 3 actions reference finding IDs (e.g., **[SEC-01]**)
- Impact vs. Effort Quadrant findings link to their WAF pillar sections via markdown anchors
- Remediation Roadmap references finding IDs with effort scores
- Anti-Pattern Details column references related finding IDs where applicable
- Technical Debt items reference the original finding IDs

---

## EXECUTION RULES

1. **Read before judging.** Open and read every file you reference. Do not speculate about file contents or resource state.
2. **Use MCP tools.** All cluster and resource queries MUST use GKE-MCP or gcloud tools, not direct kubectl.
3. **Be specific.** Include file paths, resource names, namespaces, and config snippets for every finding.
4. **No false positives.** Only report issues you can confirm from the source code or tool output. If something looks suspicious but you cannot confirm it, note the uncertainty.
5. **Reference Google docs.** Every finding should link to at least one relevant Google Cloud documentation page.
6. **Do not fix code.** This is an advisory review. Document findings and recommendations — do not modify source files.
7. **Single output file.** Write the complete report to `documentation/architecture-review.md`.
8. **Cover all pillars.** Every WAF pillar must have at least a brief assessment, even if no significant findings exist (state "No significant findings" with rationale).
9. **Cross-reference findings.** When findings relate to each other (e.g., missing Workload Identity + hardcoded secrets), note the relationship.
10. **Validate against docs.** Each recommendation MUST be validated against Google Cloud documentation using `google-developer-knowledge/*` tools.

---

## VALIDATION

```xml
<validation>
	<context>Project context MUST be loaded from copilot-instructions.md before any cluster queries</context>
	<tools>All cluster and resource queries MUST use GKE-MCP tools or gcloud; all recommendations MUST be validated against Google Cloud documentation</tools>
	<completeness>All 5 WAF pillars MUST be assessed, even if no issues are found</completeness>
	<actionable>Every finding MUST include concrete, actionable remediation steps with specific GCP services named</actionable>
	<prioritized>Findings MUST be prioritized by severity and implementation effort</prioritized>
	<evidence>Each major finding MUST include Why, What, Impact, Confidence, and Evidence</evidence>
	<tradeoffs>High-impact findings MUST include option trade-offs</tradeoffs>
	<formatting>
		<rule>Document MUST include header metadata (date, scope, project ID, hosting)</rule>
		<rule>Document MUST include Scale Legend defining severity and effort scales</rule>
		<rule>Document MUST include table of contents with working anchor links</rule>
		<rule>Executive Summary MUST include total finding counts in bold, Overall Risk Posture rating, and Top 3 Immediate Actions with finding IDs</rule>
		<rule>Project/Environment Context MUST include GCP Environment, Solution Components, Key Services, and Tools Used tables</rule>
		<rule>Impact vs. Effort Quadrant MUST map ALL findings into the 2×2 matrix</rule>
		<rule>Each WAF pillar MUST show Risk Level, Current State (positive/concerns), and Findings table with pillar-prefixed IDs</rule>
		<rule>Anti-Patterns table MUST use status icons (✅ ❌ ⚠️) for each check</rule>
		<rule>Technical Debt MUST be organized by domain with a phased Remediation Roadmap</rule>
		<rule>Report MUST include Resources and Services Inspected checklist and consolidated Documentation References</rule>
		<rule>Report MUST include Assumptions and Open Questions section</rule>
		<rule>Report MUST include Implementation Handoff Notes for findings requiring delivery work</rule>
		<rule>Cross-references MUST connect finding IDs across Executive Summary, Quadrant, Roadmap, and Anti-Patterns</rule>
	</formatting>
</validation>
```

---

## FINAL STEP

**MANDATORY ACTION — Execute this step:**

```xml
<final-step>
	<execute>EXECUTE: Compile all findings into the structured report format above</execute>
	<verify>VERIFY: Ensure all 5 WAF pillars are covered, all anti-patterns are checked, and recommendations are prioritized</verify>
	<verify>VERIFY: Confirm the Impact vs. Effort Quadrant accounts for every finding and quadrant counts are correct</verify>
	<verify>VERIFY: Confirm all cross-references (finding IDs, section anchors) are consistent throughout the document</verify>
	<verify>VERIFY: Confirm each major finding includes Why, What, Impact, Confidence, and Evidence</verify>
	<format>FORMAT: Use the full report structure with all required sections, tables, status icons, severity ratings, effort scores, and actionable next steps</format>
	<write>WRITE: Save the complete architecture review report to `documentation/architecture-review.md`</write>
</final-step>
```

**POST-REVIEW REQUIREMENTS:**
- Confirm all clusters, namespaces, and resources were inspected (✅ checklist in report)
- Verify recommendations are backed by Google Cloud documentation references (consolidated in Documentation References section)
- Report total findings count by severity level (At-a-Glance Metrics table)
- Identify the top 3 highest-priority items for immediate attention (in Executive Summary)
- Verify the Impact vs. Effort Quadrant counts sum to total findings
- Verify the Remediation Roadmap covers all finding IDs
- Include assumptions, open questions, and confidence levels so stakeholders can decide quickly when to proceed versus gather more data
