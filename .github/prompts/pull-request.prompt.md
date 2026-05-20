---
description: "Prompt and workflow for creating high-quality pull requests using structured guidelines. Helps agents execute comprehensive PR creation, including writing PR titles, descriptions, and following best practices for code review, testing, and documentation. Supports both Azure DevOps and GitHub repositories."
agent: "agent"
tools: ["microsoft/azure-devops-mcp/*", "github/*", "git/*", "edit", "execute", "read", "search", "todo"]
---

## AGENT RESPONSIBILITIES

**YOU MUST TAKE ACTION TO:**

1. Prepare the current working branch for pull request submission
2. Execute all git operations needed to ensure branch readiness
3. CREATE the actual pull request in GitHub (not just provide instructions)
4. Configure the pull request with proper reviewers, labels, and settings
5. Ensure compliance with all guidelines and requirements specified below
6. Report completion status and provide the created PR URL

**REQUIRED TOOLS:**
- **MUST use Git MCP tools** for git operations: status, branch, add, commit
- **Terminal fallbacks** required for: `git push` (MCP push not available), `git log` for commit history review
- **For Azure DevOps repositories**: MUST use Azure DevOps MCP tools for operations: create_pull_request, reply_to_comment, update_pull_request
- **For GitHub repositories**: MUST use GitHub MCP tools for operations: create_pull_request, add_issue_comment, update_pull_request
- Use `run_in_terminal` tool when MCP equivalents are not available

**THIS IS NOT A GUIDANCE DOCUMENT - YOU MUST EXECUTE THESE ACTIONS**

### Instructions

```xml
<description>This file contains a prompt template for creating comprehensive pull requests. It provides guidelines, structure, and best practices to help agents write clear, informative PRs that facilitate effective code review and collaboration. Supports both Azure DevOps and GitHub platforms.</description>
<note>You MUST execute this structured approach to prepare and submit a pull request. This is an action-oriented workflow - you are expected to take all necessary steps to create the PR on the appropriate platform (Azure DevOps or GitHub).</note>
```

### Workflow

**Execute these steps in order - you must take action to complete each:**

1. **Detect Platform**: Inspect the git remote URL (`git remote get-url origin`) to determine whether the repository is hosted on **Azure DevOps** (contains `dev.azure.com` or `visualstudio.com`) or **GitHub** (contains `github.com`). All subsequent platform-specific steps depend on this detection.
2. **Verify Branch Status**: Use git MCP tools to confirm you are working in a feature branch created from the latest main branch. If you are still on the main branch, create and switch to a new feature branch.
3. **Push Changes**: Use `run_in_terminal` with `git push -u origin <branch-name>` to push any commits on the local branch to the remote feature branch.
4. **Review Changes**: Use `run_in_terminal` with `git log main..<branch-name> --oneline` to review all changes in the git history
5. **Validate Tests**: Execute test commands to verify all tests pass locally
6. **Check Documentation**: Verify that documentation is updated if needed - make updates if required
7. **CREATE THE PULL REQUEST**:
   - **Azure DevOps**: Use `mcp_ado_repo_create_pull_request` with required parameters: repositoryId, sourceRefName, targetRefName, title, description
   - **GitHub**: Use `mcp_github_create_pull_request` with required parameters: owner, repo, title, head (source branch), base (target branch), body (description)
8. **Configure PR Settings**:
   - **Azure DevOps**: Use `mcp_ado_repo_update_pull_request` to add reviewers/labels and `mcp_ado_repo_create_pull_request_thread` to add status comments
   - **GitHub**: Use `mcp_github_update_pull_request` to add reviewers/labels and `mcp_github_add_issue_comment` to add status comments

**CRITICAL**: You are expected to EXECUTE these actions, not just provide instructions. The pull request must be created and configured according to these guidelines.

### Pull Request Structure

```xml
<pull-request>
	<title>type(scope): Clear, concise description of changes</title>
	<description>
		<summary>Brief overview of what this PR does</summary>
		<changes>
			<change>• Specific change 1</change>
			<change>• Specific change 2</change>
			<change>• Specific change 3</change>
		</changes>
		<motivation>Why this change is needed</motivation>
		<testing>
			<test>• Test description 1</test>
			<test>• Test description 2</test>
		</testing>
		<breaking-changes>(if any) Describe breaking changes and migration steps</breaking-changes>
		<checklist>
			<item>- [ ] Tests added/updated</item>
			<item>- [ ] Documentation updated</item>
			<item>- [ ] Breaking changes documented</item>
			<item>- [ ] Security implications reviewed</item>
		</checklist>
	</description>
	<reviewers>@username1, @username2</reviewers>
	<labels>enhancement, documentation, needs-review</labels>
</pull-request>
```

### Title Best Practices

```xml
<title-guidelines>
	<format>type(scope): description</format>
	<types>feat|fix|docs|style|refactor|perf|test|build|ci|chore|security</types>
	<length>Keep under 72 characters</length>
	<tone>Use imperative mood (e.g., "Add", "Fix", "Update")</tone>
	<specificity>Be specific about what changed, not just where</specificity>
</title-guidelines>
```

### Examples

```xml
<examples>
	<good-titles>
		<example>feat(api): add user authentication endpoints</example>
		<example>fix(ui): resolve mobile navigation menu overflow</example>
		<example>docs(deployment): update GCP setup instructions</example>
		<example>refactor(database): optimize query performance for user search</example>
		<example>security(auth): implement rate limiting for login attempts</example>
		<example>test(integration): add end-to-end tests for checkout flow</example>
	</good-titles>

	<good-descriptions>
		<example>
## Summary
Implements user authentication system with JWT tokens and refresh token rotation.

## Changes
• Add JWT token generation and validation middleware
• Implement refresh token rotation mechanism
• Add user login/logout endpoints
• Update database schema for token storage

## Motivation
Users need a secure way to authenticate and maintain sessions. Current basic auth is insufficient for production use.

## Testing
• Unit tests for token generation/validation
• Integration tests for auth endpoints
• Manual testing of token rotation flow

## Security Considerations
• Tokens expire after 15 minutes
• Refresh tokens are single-use and rotate
• Rate limiting applied to auth endpoints

## Checklist
- [x] Tests added and passing
- [x] Documentation updated
- [x] Security review completed
- [ ] Performance testing (in progress)
		</example>
	</good-descriptions>
</examples>
```

### Description Template

```xml
<template>
## Summary
[Brief overview of changes - 1-2 sentences]

## Changes
• [Specific change 1]
• [Specific change 2]
• [Specific change 3]

## Motivation
[Why this change is needed - business/technical justification]

## Testing
• [How you tested this]
• [What test cases were added]
• [Manual testing performed]

## Breaking Changes (if any)
[Description of breaking changes and migration steps]

## Screenshots/Recordings (if UI changes)
[Include visuals for UI changes]

## Additional Context
[Any other relevant information]

## Checklist
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Breaking changes documented
- [ ] Security implications considered
- [ ] Performance impact assessed
</template>
```

### Validation Checklist

```xml
<validation>
	<title>
		<check>Uses conventional commit format</check>
		<check>Under 72 characters</check>
		<check>Descriptive and specific</check>
		<check>Uses imperative mood</check>
	</title>
	<description>
		<check>Includes clear summary</check>
		<check>Lists specific changes</check>
		<check>Explains motivation</check>
		<check>Describes testing approach</check>
		<check>Documents breaking changes if any</check>
	</description>
	<code>
		<check>All tests pass</check>
		<check>Code follows style guidelines</check>
		<check>No merge conflicts</check>
		<check>Branch is up to date</check>
	</code>
	<review>
		<check>Appropriate reviewers assigned</check>
		<check>Relevant labels applied</check>
		<check>Linked to related issues</check>
		<check>Size is reasonable for review</check>
	</review>
</validation>
```

### Best Practices

```xml
<best-practices>
	<size>Keep PRs small and focused (< 400 lines when possible)</size>
	<commits>Use meaningful commit messages and consider squashing</commits>
	<documentation>Update docs, README, and inline comments as needed</documentation>
	<tests>Include tests for new functionality and bug fixes</tests>
	<security>Consider security implications and get security review if needed</security>
	<backwards-compatibility>Avoid breaking changes when possible</backwards-compatibility>
	<reviews>Respond to feedback promptly and professionally</reviews>
	<self-review>Review your own PR first to catch obvious issues</self-review>
</best-practices>
```

### Final Steps

**MANDATORY ACTIONS - Execute each step based on detected platform:**

```xml
<final-steps platform="azure-devops">
	<create>EXECUTE: Use `mcp_ado_repo_create_pull_request` with repositoryId, sourceRefName, targetRefName, title, description parameters</create>
	<comment>EXECUTE: Use `mcp_ado_repo_create_pull_request_thread` to add PR status and summary comment</comment>
	<configure>EXECUTE: Use `mcp_ado_repo_update_pull_request` for reviewers/labels if repository has them configured</configure>
</final-steps>

<final-steps platform="github">
	<create>EXECUTE: Use `mcp_github_create_pull_request` with owner, repo, title, head, base, body parameters</create>
	<comment>EXECUTE: Use `mcp_github_add_issue_comment` to add PR status and summary comment</comment>
	<configure>EXECUTE: Use `mcp_github_update_pull_request` for reviewers/labels if repository has them configured</configure>
</final-steps>
```

**POST-CREATION REQUIREMENTS:**
- Confirm the pull request was successfully created on the target platform (Azure DevOps or GitHub)
- Verify all required fields are populated according to the template
- Ensure reviewers and labels are properly assigned
- Report the PR URL and summary of actions taken
