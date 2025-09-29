const { spawn } = require('child_process');
const { promisify } = require('util');

async function detectAvailableCLI() {
  const clis = [
    { name: 'claude', command: 'claude', configPath: '~/.claude/', mcpCommand: 'claude mcp add' },
    { name: 'codex', command: 'codex', configPath: '~/.codex/config.toml', mcpCommand: 'toml-edit' }
  ];

  for (const cli of clis) {
    if (await isCommandAvailable(cli.command)) {
      return cli;
    }
  }

  throw new Error('Neither Claude Code nor Codex CLI found. Please install one of them first.');
}

async function isCommandAvailable(command) {
  return new Promise((resolve) => {
    const child = spawn('which', [command], { stdio: 'ignore' });
    child.on('close', (code) => {
      resolve(code === 0);
    });
    child.on('error', () => {
      resolve(false);
    });
  });
}

async function getBothCLIs() {
  const available = [];

  if (await isCommandAvailable('claude')) {
    available.push({
      name: 'claude',
      command: 'claude',
      configPath: '~/.claude/',
      mcpCommand: 'claude mcp add'
    });
  }

  if (await isCommandAvailable('codex')) {
    available.push({
      name: 'codex',
      command: 'codex',
      configPath: '~/.codex/config.toml',
      mcpCommand: 'toml-edit'
    });
  }

  return available;
}

module.exports = {
  detectAvailableCLI,
  getBothCLIs,
  isCommandAvailable
};