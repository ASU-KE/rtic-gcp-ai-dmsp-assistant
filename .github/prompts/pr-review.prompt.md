---
description: "Perform a code review on a GitHub or Azure DevOps Pull Request. Use when: PR review, pull request review, code review, review PR, review pull request."
argument-hint: "Paste the GitHub or Azure DevOps PR link"
tools: [read, edit/createDirectory, edit/createFile, edit/editFiles, search, 'microsoft/azure-devops-mcp/*', 'microsoftdocs/mcp/*', 'opentofu/*', 'github/*', azure-mcp/search, com.microsoft/azure/search, 'google-developer-knowledge/*', todo]
---

# Pull Request Code Review

You are performing a thorough code review on a GitHub or Azure DevOps Pull Request.

## Prerequisites

**If no PR link is provided in the user's message, you MUST ask for the GitHub or Azure DevOps PR link before proceeding.** Do not attempt to guess or proceed without it.

Parse the PR link to extract the organization, project, repository, and pull request ID.

## Review Process

1. **Retrieve PR metadata** — Get the PR title, description, author, source/target branches, and status.
2. **Retrieve PR changes** — Get the full list of changed files and their diffs.
3. **Retrieve existing review threads** — Check for any existing comments or discussions.
4. **Review each changed file** for:
   - **Correctness**: Logic errors, bugs, edge cases
   - **Security**: Secrets exposure, injection risks, OWASP Top 10 concerns
   - **Terraform/IaC best practices**: Naming conventions, resource organization, state management, provider versioning
   - **Azure/Google Well-Architected Framework alignment**: Security, Reliability, Performance, Cost, Operational Excellence
   - **Code style**: Consistency with existing codebase patterns
   - **Documentation**: Missing or outdated comments, README updates needed
   - **Testing**: Missing test coverage for new functionality

## Output Format

Write the review to `documentation/pull-reviews/{date}_{pr-number}_{summary-title}.md` where:
- `{date}` is today's date in `YYYY-MM-DD` format
- `{pr-number}` is the PR number (e.g., `PR-42`)
- `{summary-title}` is a kebab-case short summary of the PR purpose

Structure the review document as follows:

```markdown
# PR Review: {PR Title}

| Field | Value |
|-------|-------|
| PR | #{number} |
| Author | {author} |
| Source Branch | {source} |
| Target Branch | {target} |
| Date Reviewed | {today's date} |
| Reviewer | GitHub Copilot |

## Summary

{Brief summary of what this PR does}

## Files Changed

{List of files with change type: Added/Modified/Deleted}

## Findings

### Critical

{Issues that must be fixed before merge}

### Warnings

{Issues that should be addressed but are not blocking}

### Suggestions

{Optional improvements and best practices}

## WAF Assessment

{Brief assessment against Azure or Google Well-Architected Framework pillars, if applicable}

## Recommendation

{APPROVE / REQUEST CHANGES / NEEDS DISCUSSION — with justification}
```
