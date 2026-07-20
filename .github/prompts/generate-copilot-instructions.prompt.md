---
description: "Generate or update a project's .github/copilot-instructions.md by analyzing the repository and producing a structured instructions file. Supports GitHub and Azure DevOps. Self-contained — no external template file required."
agent: "agent"
tools: ["github/*", "microsoft/azure-devops-mcp/*", "git/*", "edit", "read", "search", "execute", "todo"]
---

## AGENT RESPONSIBILITIES

**YOU MUST TAKE ACTION TO:**

1. Analyze the repository to gather accurate values for each section of the output structure
2. Verify the default branch and platform metadata — do NOT assume `main`
3. Generate a complete `copilot-instructions.md` at `.github/copilot-instructions.md`
4. Omit sections that do not apply to this project
5. Ensure all values are verified and accurate — no placeholders

**REQUIRED TOOLS:**

- **Git MCP tools** for branch inspection and repository metadata
- **GitHub MCP tools** (for GitHub repos) for verifying organization, repository name, default branch, and URL
- **Azure DevOps MCP tools** (for ADO repos) for verifying organization, project, repository name, default branch, and pipelines
- **File read/search tools** for analyzing project structure, dependencies, CI/CD, and configuration
- **Edit tools** for creating or updating the instructions file

**THIS IS NOT A GUIDANCE DOCUMENT — YOU MUST EXECUTE THESE ACTIONS**

---

## CRITICAL: DEFAULT BRANCH VERIFICATION

**NEVER assume the default branch is `main` or `master`.**

Many repositories use custom default branches (e.g., `develop`, `trunk`, `release`). You MUST verify the actual default branch using one of these methods, in order of preference:

### For GitHub repositories:
1. **GitHub MCP tools**: Query the repository metadata to get the default branch
2. **Git remote inspection**: Run `git remote show origin` and look for "HEAD branch"
3. **Existing copilot-instructions.md**: If updating, check the current value

### For Azure DevOps repositories:
1. **Azure DevOps MCP tools**: Use `repo_get_repo_by_name_or_id` to get the default branch from repository metadata
2. **Git remote inspection**: Run `git remote show origin` and look for "HEAD branch"
3. **Existing copilot-instructions.md**: If updating, check the current value

If multiple sources conflict, prefer the platform API response (GitHub or Azure DevOps) as the source of truth.

---

## WORKFLOW

Execute these steps in order:

### Phase 1: Gather Repository Metadata

1. **Determine source control platform**: Check git remote URL to identify GitHub (`github.com`) vs Azure DevOps (`dev.azure.com` or `visualstudio.com`)
2. **Verify repository metadata** using platform-appropriate tools:

   **If GitHub:**
   - Use GitHub MCP tools to confirm: organization/owner, repository name, **default branch**, repository URL

   **If Azure DevOps:**
   - Use Azure DevOps MCP tools to confirm: organization, project name, project ID, repository name, repository ID, **default branch**, repository URL
   - Also identify available pipelines using `pipelines_get_build_definitions`

   **For either platform:** The **default branch** is CRITICAL — do not guess.

3. **Check for existing instructions**: If `.github/copilot-instructions.md` exists, read it to understand what to preserve or update

### Phase 2: Analyze Project Structure

4. **Scan the workspace**: Examine the directory structure, looking for:
   - Source code directories and their languages/frameworks
   - Package manager files (`package.json`, `requirements.txt`, `go.mod`, `*.csproj`, etc.)
   - Docker/container files
   - CI/CD pipeline definitions
   - Infrastructure-as-code files (Terraform, Bicep, Kustomize, Helm, etc.)
   - Test directories and frameworks
   - Documentation
5. **Identify components**: Map out the major architectural components, their types, paths, purposes, and runtimes
6. **Determine build/run/test commands**: Check package.json scripts, Makefiles, or other build system configurations
7. **Identify cloud context**: Look for cloud-specific configuration (Azure, GCP, AWS) including regions, services, and deployment targets
8. **Identify integration patterns**: Determine how components communicate (REST, gRPC, WebSocket, message queues, etc.)

### Phase 3: Determine Development Guidelines

9. **Check coding standards**: Look for linter configs, formatter configs, TypeScript/language settings
10. **Check commit conventions**: Look for commitlint, husky, conventional commits configuration
11. **Check testing patterns**: Identify test frameworks, test directory structure, and coverage expectations
12. **Check secret management**: Identify how secrets are handled (environment variables, secret managers, gitignored directories)
13. **Check authentication patterns**: Identify auth mechanisms (OAuth, SAML, JWT, API keys)
14. **Check CI/CD pipelines**:
    - **GitHub**: Look for `.github/workflows/*.yml` (GitHub Actions)
    - **Azure DevOps**: Look for `azure-pipelines.yml`, pipeline YAML files, or use ADO MCP tools to list pipeline definitions
    - **Other**: Look for `cloudbuild.yaml`, `Jenkinsfile`, `.gitlab-ci.yml`, etc.

### Phase 4: Generate the Instructions File

15. **Compose the output** using the OUTPUT STRUCTURE below, filling in verified values
16. **Omit inapplicable sections**: Do not include sections that don't apply (e.g., skip Azure cloud context if the project uses GCP)
17. **Set platform-specific MCP guidance**:
    - **GitHub**: Include guidance to use GitHub MCP tools for issues/PRs/releases
    - **Azure DevOps**: Include guidance to use Azure DevOps MCP tools for work items, pipelines, and PRs
18. **Add project-specific guidance**: Include known constraints, risks, and operating guidance specific to this codebase
19. **Write the file**: Create or update `.github/copilot-instructions.md`

### Phase 5: Validate

20. **Verify accuracy**: Confirm that:
    - The default branch is correct (not assumed)
    - Build/test commands actually exist in the project
    - Referenced paths exist in the workspace
    - Cloud context matches actual project configuration
    - No placeholder values remain
    - The correct source control platform section is used (GitHub OR Azure DevOps, not both)
    - MCP tooling guidance matches the hosting platform
21. **Report completion**: Summarize what was generated and highlight any sections that need manual review

---

## OUTPUT STRUCTURE

The generated `.github/copilot-instructions.md` MUST follow this structure. Include only the sections that apply. Replace all values in `CAPS_WITH_UNDERSCORES` with verified data from the repository.

```markdown
# Copilot Agent Instructions for REPOSITORY_NAME

## Repository Context

### Source Control Platform

<!-- Use ONE of these sections, not both -->

<!-- For GitHub: -->
- **GitHub organization:** `ORG_NAME`
- **GitHub repository:** `REPO_NAME`
- **Default branch:** `VERIFIED_DEFAULT_BRANCH`
- **Repository URL:** `https://github.com/ORG_NAME/REPO_NAME`

<!-- For Azure DevOps: -->
- **Azure DevOps organization:** `ORG_NAME`
- **Azure DevOps project name:** `PROJECT_NAME`
- **Azure DevOps project ID:** `PROJECT_ID`
- **Azure DevOps repository name:** `REPO_NAME`
- **Azure DevOps repository ID:** `REPO_ID`
- **Azure DevOps repository URL:** `ADO_REPO_URL`

## Cloud Context

<!-- Include only relevant cloud provider(s) -->

### Azure (if applicable)

- **Azure tenant:** `TENANT_ID`
- **Azure subscription:** `SUBSCRIPTION_ID`
- **Primary region:** `REGION`
- **Primary resource group:** `RESOURCE_GROUP`

### GCP (if applicable)

- **GCP project(s):** `PROJECT_IDS`
- **Primary region:** `REGION`
- **Key services:** `LIST_SERVICES`

### AWS (if applicable)

- **AWS account(s):** `ACCOUNT_IDS`
- **Primary region:** `REGION`

### Other Environments (optional)

- **On-prem/environment notes:** `NOTES`

## Project Overview

DESCRIBE_WHAT_THE_REPOSITORY_DOES_IN_3_TO_6_SENTENCES.

- **Business purpose:** `WHAT_THIS_SYSTEM_ENABLES`
- **Primary users/consumers:** `WHO_USES_IT`
- **Core dependencies:** `KEY_INTERNAL_EXTERNAL_SYSTEMS`

## Solution Architecture

### Components

- Component: `COMPONENT_NAME`
  Type: `Web UI | REST API | Service | Worker | Database | Infrastructure`
  Path: `path/to/component`
  Purpose: `what it does`
  Runtime: `language/framework/platform`

<!-- Repeat for each major component -->

### Integration and Data Flow

- `DESCRIBE_CALL_FLOWS_BETWEEN_COMPONENTS`
- `DESCRIBE_AUTH_FLOW`
- `DESCRIBE_EVENT_OR_DATA_PIPELINE_FLOWS`

## Build, Run, and Test

- **Install dependencies:** `COMMAND`
- **Run app locally:** `COMMAND`
- **Run tests:** `COMMAND`
- **Lint/format:** `COMMAND`
- **Build:** `COMMAND`

<!-- Only include commands that actually exist in the project -->

## CI/CD Pipelines

- Pipeline: `PIPELINE_NAME`
  File: `path/to/pipeline.yml`
  Trigger: `BRANCH_OR_EVENT`

Notes:

- `BRANCH_CONVENTIONS_ENVIRONMENT_PROMOTION_RULES_APPROVAL_GATES`

## Development Guidelines

- **Language/framework standards:** `VERSION_AND_KEY_CONVENTIONS`
- **Monorepo structure:** `IF_APPLICABLE_DESCRIBE_WORKSPACE_LAYOUT`
- **Commit conventions:** `CONVENTIONAL_COMMITS_OR_OTHER_STANDARD`
- **Testing expectations:** `UNIT_INTEGRATION_E2E_REQUIREMENTS`
- **Database change process:** `MIGRATION_FRAMEWORK_AND_COMMANDS`
- **Configuration and secrets:** Never commit secrets. `DESCRIBE_SECRET_MANAGEMENT_APPROACH`
- **Authentication:** `DESCRIBE_AUTH_MECHANISM`
- **API patterns:** `DESCRIBE_ROUTING_AND_VALIDATION_PATTERNS`

## Copilot Operating Guidance

- Prefer changes that are minimal, focused, and aligned with existing patterns.
- Reference existing modules before introducing new abstractions.
- When recommending commands, prefer repository-documented workflows.
- Always consider security, privacy, and secret handling implications.
- `ADD_PROJECT_SPECIFIC_GUIDANCE_HERE`

### MCP and Tooling Guidance

<!-- For GitHub repos: -->
- This project uses **GitHub** — use GitHub tools for issues/PRs/releases where available.

<!-- For Azure DevOps repos: -->
- This project uses **Azure DevOps** — check Azure DevOps MCP tools first for work item, pipeline, and PR tasks.

<!-- Add cloud-specific tooling guidance as applicable -->

## Known Constraints and Risks

- `DOCUMENT_CONSTRAINTS_COPILOT_SHOULD_ACCOUNT_FOR`

## Environments (optional)

| Environment | Domain | Notes |
|---|---|---|
| `ENV_NAME` | `DOMAIN_OR_URL` | `NOTES` |
```

---

## OUTPUT GUIDELINES

- Use actual values — no placeholders, `TODO` markers, or `CAPS_WITH_UNDERSCORES` in the final output
- Include the correct default branch (verified, not assumed)
- Document only what exists in the repository today
- Be concise and actionable — this file is loaded into Copilot's context on every interaction
- Omit entire sections rather than leaving them empty or speculative

---

## UPDATING EXISTING INSTRUCTIONS

If `.github/copilot-instructions.md` already exists:

1. Read the existing file first
2. Preserve any manually-added guidance that is still accurate
3. Update sections where the project has changed (new components, updated commands, etc.)
4. Verify the default branch and other metadata are still correct
5. Do NOT remove custom guidance sections unless they are clearly outdated

---

## COMMON PITFALLS TO AVOID

- **Wrong default branch**: The #1 error. Always verify. Many repos use `develop`, `trunk`, or other custom branches.
- **Stale build commands**: Verify commands exist in package.json/Makefile before documenting them.
- **Missing secrets guidance**: Always document how secrets are managed — this prevents accidental commits.
- **Over-documenting**: Only include sections that provide actionable value to Copilot. Skip empty or speculative sections.
- **Guessing cloud configuration**: If cloud details aren't clearly documented in config files, ask rather than guess.
