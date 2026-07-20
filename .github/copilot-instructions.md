# Copilot Agent Instructions for rtic-gcp-ai-dmsp-assistant

## Repository Context

### Source Control Platform

- **GitHub organization:** `ASU-KE`
- **GitHub repository:** `rtic-gcp-ai-dmsp-assistant`
- **Default branch:** `develop`
- **Repository URL:** `https://github.com/ASU-KE/rtic-gcp-ai-dmsp-assistant`

## Cloud Context

### GCP

- **Primary region:** `us-west4`
- **Container registry:** `us-west4-docker.pkg.dev/$PROJECT_ID/ai-dmsp-api-repo` and `us-west4-docker.pkg.dev/$PROJECT_ID/ai-dmsp-react-repo`
- **Database:** Cloud SQL (MySQL), accessed via Cloud SQL Proxy sidecar in GKE
- **Kubernetes:** GKE with Workload Identity Federation
- **CI/CD:** Cloud Build (`cloudbuild.yaml`)
- **Secrets:** Google Secret Manager (copied into k8s secrets during build)

## Project Overview

The ASU Data Management Sharing Plan (DMSP) AI Assistant is a web application that helps researchers create and manage data management and sharing plans. It integrates with an LLM backend and the DMPTool API to provide AI-assisted plan generation and evaluation against rubrics (e.g., NSF requirements).

- **Business purpose:** Assist ASU researchers in creating compliant data management and sharing plans using AI
- **Primary users/consumers:** ASU researchers and research administrators
- **Core dependencies:** DMPTool API, LLM service (external), ASU SAML IdP for authentication

## Solution Architecture

### Components

- Component: `React Frontend`
  Type: `Web UI (SPA)`
  Path: `react/`
  Purpose: `User interface for DMP creation, submission, and AI-assisted feedback`
  Runtime: `React 18, Vite, served via nginx in production`

- Component: `Express API`
  Type: `REST API + WebSocket`
  Path: `api/`
  Purpose: `Authentication, DMP orchestration, LLM queries, rubric evaluation, user/submission management`
  Runtime: `Node.js, TypeScript, Express, TypeORM`

- Component: `Database`
  Type: `Cloud SQL (MySQL)`
  Path: `api/src/entities/` and `api/src/migrations/`
  Purpose: `Persistent storage for users, sessions, submissions, and rubrics`
  Runtime: `MySQL via Cloud SQL Proxy`

- Component: `Kubernetes Manifests`
  Type: `Infrastructure (Kustomize)`
  Path: `k8s-manifests/`
  Purpose: `GKE deployment configuration with dev/prod overlays`
  Runtime: `GKE`

### Integration and Data Flow

- React SPA → Express API (REST + WebSocket) → LLM service for AI-powered plan generation
- Express API → DMPTool API for DMP retrieval and metadata
- ASU SAML IdP → Express API (passport-saml) for SSO authentication
- Cloud SQL Proxy sidecar → Cloud SQL MySQL instance

## Build, Run, and Test

- **Install dependencies:** `npm install` (uses npm workspaces for api/ and react/)
- **Run app locally:** `docker compose up` (launches api, react, db, traefik, adminer)
- **Run API in watch mode:** `cd api && npm run start:watch`
- **Build API:** `cd api && npm run build`
- **Run React dev server:** `cd react && npm start`
- **Build React:** `cd react && npm run build`
- **Lint API:** `cd api && npm run lint:check`
- **Lint React:** `cd react && npm run lint`
- **Format check:** `cd api && npm run format:check`
- **Run migrations:** `cd api && npm run migration:run`
- **Generate migration:** `cd api && npm run migration:generate --name=MigrationName`
- **Seed database:** `cd api && npm run seed:dev`

## CI/CD Pipelines

- Pipeline: `Cloud Build`
  File: `cloudbuild.yaml`
  Trigger: `Branch push (configured in GCP Cloud Build triggers per environment)`

Notes:

- Substitution variable `_ENVIRONMENT` controls dev/prod image tagging and kustomize overlay
- Substitution variable `_APP_BACKEND_DOMAIN` sets the API domain for the React build
- Substitution variable `_KUST_BUILD_DIR` selects the kustomize overlay directory
- Images are pushed to Artifact Registry in `us-west4`
- Kubernetes secrets are loaded from Google Secret Manager during the build step
- Kustomize overlays in `k8s-manifests/overlays/dev/` and `k8s-manifests/overlays/prod/`

## Development Guidelines

- **Language/framework standards:** TypeScript (strict), Node.js, Express 4, React 18, TypeORM
- **Monorepo structure:** npm workspaces with `api/` and `react/` as workspace packages
- **Commit conventions:** Conventional Commits enforced via commitlint + husky. Use `npm run commit` (commitizen) to create properly formatted commits.
- **Testing expectations:** Tests located in `api/test/`
- **Database change process:** Use TypeORM migrations (`npm run migration:generate`). Never modify the database schema directly.
- **Configuration and secrets:** Never commit secrets. Local secrets in `secrets/` directory (gitignored). Production secrets in Google Secret Manager.
- **Authentication:** SAML (ASU IdP) in production, local passport strategy available for development
- **API patterns:** Route files in `api/src/routes/`, controllers and services in `api/src/modules/`, schema validation via AJV middleware

## Copilot Operating Guidance

- Prefer changes that are minimal, focused, and aligned with existing patterns.
- Reference existing modules before introducing new abstractions.
- When recommending commands, prefer repository-documented workflows.
- Always consider security, privacy, and secret handling implications.
- Use TypeScript strict mode conventions in the API.
- Follow the existing entity/migration/module/route pattern when adding new features.
- Use the existing middleware patterns (`is-authenticated`, `check-permission`, `schema-validation`) for new routes.
- For React components, follow the existing structure in `react/src/components/` and `react/src/pages/`.

### MCP and Tooling Guidance

- This project uses **GitHub** — use GitHub tools for issues/PRs/releases where available.
- For GKE operations, use `gke-mcp/*` tools.
- For GCP documentation, use `google-developer-knowledge/*` tools.

## Known Constraints and Risks

- Cloud SQL Proxy runs as a sidecar container — database connectivity depends on Workload Identity being properly configured.
- SAML authentication requires valid ASU IdP metadata and SP certificates. Certificate rotation must be coordinated.
- The React frontend requires specific build-time environment variables (`APP_BACKEND_DOMAIN`, `APP_FRONTEND_AUTH`, etc.) baked into the Docker image.
- The `secrets/` directory must not be committed. It contains local development credentials and certificates.
- npm packages from `@asu/*` scope require a GitHub Personal Access Token with `read:packages` permission.

## Environments

| Environment | Domain | Namespace | Notes |
|---|---|---|---|
| Development (local) | `dmsp.dev.rtd.asu.edu` | N/A | Docker Compose with Traefik |
| Development (GKE) | `dmsp.dev.rtd.asu.edu` | `dev-default` | Kustomize overlay: `k8s-manifests/overlays/dev/` |
| Production (GKE) | `dmsp.ai.rto.asu.edu` | `prod-default` | Kustomize overlay: `k8s-manifests/overlays/prod/` |
