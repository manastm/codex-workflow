const fs = require('fs-extra');
const path = require('path');

async function createTemplateFiles() {
  const templateDir = path.join(__dirname, '..', '..', 'templates');

  // Create AGENTS.md (only if it doesn't exist or append workflow section)
  await createOrAppendAgents(templateDir);

  // Create CODING_AGENT.md (only if it doesn't exist)
  await createCodingAgent(templateDir);

  // Create docs structure and status board
  await createDocsStructure(templateDir);

  // Create PR template if it doesn't exist
  await createPRTemplate();
}

async function createOrAppendAgents(templateDir) {
  const agentsPath = 'AGENTS.md';
  const templatePath = path.join(templateDir, 'AGENTS.md');
  const templateContent = await fs.readFile(templatePath, 'utf8');

  if (await fs.pathExists(agentsPath)) {
    // Check if workflow section already exists
    const existingContent = await fs.readFile(agentsPath, 'utf8');
    if (!existingContent.includes('Codex Workflow tool')) {
      // Append workflow section
      const workflowSection = `\n\n<!-- CODEX-WORKFLOW-START -->\n${templateContent}\n<!-- CODEX-WORKFLOW-END -->`;
      await fs.appendFile(agentsPath, workflowSection);
    }
  } else {
    // Create new AGENTS.md
    await fs.writeFile(agentsPath, templateContent);
  }
}

async function createCodingAgent(templateDir) {
  const codingAgentPath = 'CODING_AGENT.md';
  const templatePath = path.join(templateDir, 'CODING_AGENT.md');

  if (!await fs.pathExists(codingAgentPath)) {
    const templateContent = await fs.readFile(templatePath, 'utf8');
    await fs.writeFile(codingAgentPath, templateContent);
  }
}

async function createDocsStructure(templateDir) {
  // Create docs directories
  await fs.ensureDir('docs/sessions');
  await fs.ensureDir('docs/status');
  await fs.ensureDir('docs/templates');

  // Create status board
  const statusBoardPath = 'docs/status/board.md';
  if (!await fs.pathExists(statusBoardPath)) {
    const templatePath = path.join(templateDir, 'status-board.md');
    const templateContent = await fs.readFile(templatePath, 'utf8');
    await fs.writeFile(statusBoardPath, templateContent);
  }

  // Create session template
  const sessionTemplatePath = 'docs/templates/session-template.md';
  if (!await fs.pathExists(sessionTemplatePath)) {
    const sessionTemplate = `# Session Template

**Date**: {{date}}
**Type**: {{type}}
**Status**: {{status}}

## Objective
{{objective}}

## Plan
_[Detail the implementation approach]_

## Implementation Notes
_[Log key decisions and changes]_

## Outcomes
_[Final summary and results]_

## Next Steps
_[Follow-up tasks or considerations]_
`;
    await fs.writeFile(sessionTemplatePath, sessionTemplate);
  }
}

async function createPRTemplate() {
  const prTemplatePath = '.github/pull_request_template.md';

  if (!await fs.pathExists(prTemplatePath)) {
    await fs.ensureDir('.github');
    const prTemplate = `## Summary
Brief description of changes made.

## Session Documentation
Link to the session document that planned/tracked this work:
- Session: [Link to docs/sessions/...]

## Testing
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated (if needed)
- [ ] No new warnings or errors introduced

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
`;
    await fs.writeFile(prTemplatePath, prTemplate);
  }
}

module.exports = {
  createTemplateFiles
};