---
description: "Prompt and workflow for generating conventional commit messages using a structured XML format. Helps agents execute standardized, descriptive commits in line with the Conventional Commits specification, including instructions, examples, and validation."
agent: "agent"
tools: ["git/*", "edit", "read", "search", "todo"]
---

## AGENT RESPONSIBILITIES

**YOU MUST TAKE ACTION TO:**
1. Review and analyze all pending changes in the repository
2. Stage appropriate files for commit
3. Generate a properly formatted conventional commit message
4. EXECUTE the actual commit using git MCP tools
5. Ensure the commit follows the Conventional Commits specification
6. Report the commit status and SHA upon completion

**REQUIRED TOOLS:**

- **MUST use Git MCP tools** (`git/*`) for all git operations (status, add, commit)
- Do NOT use terminal git commands - use the MCP tools exclusively

**THIS IS NOT A GUIDANCE DOCUMENT - YOU MUST EXECUTE THESE ACTIONS**

### Instructions

```xml
<description>This file contains a prompt template for generating conventional commit messages. It provides instructions, examples, and formatting guidelines to help agents execute standardized, descriptive commits in accordance with the Conventional Commits specification.</description>
<note>You MUST execute this structured approach to create and commit changes. This is an action-oriented workflow - you are expected to take all necessary steps to complete the commit.</note>
```

### Workflow

**Execute these steps in order - you must take action to complete each:**

1. **Review Changes**: Use git MCP tools to review changed files and repository state.
2. **Inspect Changes**: Use git MCP tools to inspect the actual changes (equivalent to `git diff`).
3. **Stage Changes**: Use git MCP tools with action="add" to stage your changes.
4. **Construct Message**: Generate your commit message using the XML structure below following Conventional Commits specification.
5. **EXECUTE COMMIT**: You MUST use git MCP tools to create the commit with your generated message.
6. **Report Status**: Confirm the commit was successful and provide the commit SHA.

**CRITICAL**: You are expected to EXECUTE these git operations using MCP tools, not provide terminal commands.

### Commit Message Structure

```xml
<commit-message>
	<type>feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert</type>
	<scope>()</scope>
	<description>A short, imperative summary of the change</description>
	<body>(optional: more detailed explanation)</body>
	<footer>(optional: e.g. BREAKING CHANGE: details, or issue references)</footer>
</commit-message>
```

### Examples

```xml
<examples>
	<example>feat(parser): add ability to parse arrays</example>
	<example>fix(ui): correct button alignment</example>
	<example>docs: update README with usage instructions</example>
	<example>refactor: improve performance of data processing</example>
	<example>chore: update dependencies</example>
	<example>feat!: send email on registration (BREAKING CHANGE: email service required)</example>
</examples>
```

### Validation

```xml
<validation>
	<type>Must be one of the allowed types. See <reference>https://www.conventionalcommits.org/en/v1.0.0/#specification</reference></type>
	<scope>Optional, but recommended for clarity.</scope>
	<description>Required. Use the imperative mood (e.g., "add", not "added").</description>
	<body>Optional. Use for additional context.</body>
	<footer>Use for breaking changes or issue references.</footer>
</validation>
```

### Final Step

**MANDATORY ACTION - Execute this step:**

```xml
<final-step>
	<execute>EXECUTE: Use git MCP tools and your constructed conventional commit message</execute>
	<verify>VERIFY: Confirm commit was successful and report the commit SHA</verify>
	<format>FORMAT: Use full conventional commit format including body and footer if needed</format>
</final-step>
```

**POST-COMMIT REQUIREMENTS:**
- Confirm the commit was successfully created
- Verify the commit message follows Conventional Commits specification
- Report the commit SHA and summary of changes committed
