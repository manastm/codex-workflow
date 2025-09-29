#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { createHash } = require('crypto');

class WorkflowMCPServer {
  constructor() {
    this.tools = {
      'workflow.init_session': this.initSession.bind(this),
      'workflow.update_board': this.updateBoard.bind(this),
      'workflow.wrap_up': this.wrapUp.bind(this),
      'workflow.get_context': this.getContext.bind(this),
      'workflow.log_decision': this.logDecision.bind(this)
    };
  }

  async initSession({ objective, type = 'feature' }) {
    const timestamp = new Date().toISOString().split('T')[0];
    const slug = objective.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30);

    const sessionFile = `docs/sessions/${timestamp}-${slug}.md`;

    // Ensure docs/sessions directory exists
    await fs.ensureDir('docs/sessions');

    const sessionContent = `# ${objective}

**Date**: ${new Date().toISOString()}
**Type**: ${type}
**Status**: Active

## Objective
${objective}

## Plan
_[Codex will fill this in during planning]_

## Implementation Notes
_[Log key decisions and changes here]_

## Outcomes
_[Final summary and results]_

## Next Steps
_[Follow-up tasks or considerations]_
`;

    await fs.writeFile(sessionFile, sessionContent);

    // Update status board
    await this.updateBoard({
      objective,
      sessionFile,
      status: 'Active'
    });

    return {
      sessionFile,
      message: `Session started: ${sessionFile}`
    };
  }

  async updateBoard({ objective, sessionFile, status = 'Active' }) {
    const boardFile = 'docs/status/board.md';
    await fs.ensureDir('docs/status');

    let boardContent = '';
    if (await fs.pathExists(boardFile)) {
      boardContent = await fs.readFile(boardFile, 'utf8');
    } else {
      boardContent = `# Status Board

| Status | Objective | Session | Date |
|--------|-----------|---------|------|
`;
    }

    const date = new Date().toISOString().split('T')[0];
    const sessionLink = sessionFile ? `[Session](../../${sessionFile})` : '';
    const newRow = `| ${status} | ${objective} | ${sessionLink} | ${date} |`;

    // Check if this objective already exists in the board
    const lines = boardContent.split('\n');
    const existingRowIndex = lines.findIndex(line =>
      line.includes(objective) && line.includes('|')
    );

    if (existingRowIndex > -1) {
      // Update existing row
      lines[existingRowIndex] = newRow;
      boardContent = lines.join('\n');
    } else {
      // Add new row
      boardContent += `\n${newRow}`;
    }

    await fs.writeFile(boardFile, boardContent);
    return { message: `Board updated with status: ${status}` };
  }

  async wrapUp({ sessionFile, summary, nextSteps }) {
    if (!await fs.pathExists(sessionFile)) {
      throw new Error(`Session file not found: ${sessionFile}`);
    }

    let content = await fs.readFile(sessionFile, 'utf8');

    // Update outcomes section
    content = content.replace(
      '_[Final summary and results]_',
      summary || 'Session completed'
    );

    // Update next steps section
    if (nextSteps) {
      content = content.replace(
        '_[Follow-up tasks or considerations]_',
        nextSteps
      );
    }

    await fs.writeFile(sessionFile, content);

    // Update board status to "Review"
    const objective = path.basename(sessionFile, '.md').split('-').slice(1).join(' ');
    await this.updateBoard({
      objective,
      sessionFile,
      status: 'Review'
    });

    return { message: 'Session wrapped up successfully' };
  }

  async getContext() {
    const context = {};

    // Read AGENTS.md if it exists
    if (await fs.pathExists('AGENTS.md')) {
      context.agents = await fs.readFile('AGENTS.md', 'utf8');
    }

    // Read CODING_AGENT.md if it exists
    if (await fs.pathExists('CODING_AGENT.md')) {
      context.codingAgent = await fs.readFile('CODING_AGENT.md', 'utf8');
    }

    // Read architecture doc if it exists
    if (await fs.pathExists('docs/ARCHITECTURE.md')) {
      context.architecture = await fs.readFile('docs/ARCHITECTURE.md', 'utf8');
    }

    return context;
  }

  async logDecision({ sessionFile, decision, reasoning }) {
    if (!await fs.pathExists(sessionFile)) {
      throw new Error(`Session file not found: ${sessionFile}`);
    }

    let content = await fs.readFile(sessionFile, 'utf8');

    const timestamp = new Date().toISOString();
    const logEntry = `\n### Decision: ${decision}\n**Time**: ${timestamp}\n**Reasoning**: ${reasoning}\n`;

    // Insert before "## Outcomes" section
    content = content.replace(
      '## Outcomes',
      `${logEntry}\n## Outcomes`
    );

    await fs.writeFile(sessionFile, content);
    return { message: 'Decision logged successfully' };
  }

  // MCP Protocol Implementation
  async handleRequest(request) {
    const { method, params } = request;

    if (method === 'tools/list') {
      return {
        tools: Object.keys(this.tools).map(name => ({
          name,
          description: this.getToolDescription(name)
        }))
      };
    }

    if (method === 'tools/call') {
      const { name, arguments: args } = params;
      if (this.tools[name]) {
        try {
          const result = await this.tools[name](args);
          return { content: [{ type: 'text', text: JSON.stringify(result) }] };
        } catch (error) {
          return {
            content: [{ type: 'text', text: `Error: ${error.message}` }],
            isError: true
          };
        }
      }
    }

    throw new Error(`Unknown method: ${method}`);
  }

  getToolDescription(name) {
    const descriptions = {
      'workflow.init_session': 'Initialize a new workflow session with documentation',
      'workflow.update_board': 'Update the status board with current progress',
      'workflow.wrap_up': 'Complete session with summary and next steps',
      'workflow.get_context': 'Get current project context (AGENTS.md, architecture)',
      'workflow.log_decision': 'Log important decisions with reasoning'
    };
    return descriptions[name] || 'Workflow tool';
  }
}

// Start MCP server if run directly
if (require.main === module) {
  const server = new WorkflowMCPServer();

  // Simple stdio-based MCP protocol
  process.stdin.on('data', async (data) => {
    try {
      const request = JSON.parse(data.toString());
      const response = await server.handleRequest(request);
      process.stdout.write(JSON.stringify(response) + '\n');
    } catch (error) {
      process.stdout.write(JSON.stringify({
        error: error.message
      }) + '\n');
    }
  });

  console.log('Workflow MCP Server started');
}

module.exports = WorkflowMCPServer;