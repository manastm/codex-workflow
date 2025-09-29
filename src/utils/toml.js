const fs = require('fs-extra');
const path = require('path');
const toml = require('toml');
const os = require('os');
const { spawn } = require('child_process');
const { getBothCLIs } = require('./cli-detector');

async function registerMCPServer() {
  const availableCLIs = await getBothCLIs();

  if (availableCLIs.length === 0) {
    throw new Error('Neither Claude Code nor Codex CLI found. Please install one of them first.');
  }

  // Register with all available CLIs
  for (const cli of availableCLIs) {
    if (cli.name === 'claude') {
      await registerWithClaudeCode();
    } else if (cli.name === 'codex') {
      await registerWithCodexCLI();
    }
  }

  return availableCLIs;
}

async function registerWithClaudeCode() {
  const mcpServerPath = path.join(__dirname, '..', 'mcp-server.js');

  return new Promise((resolve, reject) => {
    const process = spawn('claude', ['mcp', 'add', 'workflow', 'node', mcpServerPath], {
      stdio: 'inherit'
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Failed to register MCP server with Claude Code (exit code: ${code})`));
      }
    });

    process.on('error', (error) => {
      reject(new Error(`Failed to register MCP server with Claude Code: ${error.message}`));
    });
  });
}

async function registerWithCodexCLI() {
  const codexConfigPath = path.join(os.homedir(), '.codex', 'config.toml');

  // Ensure .codex directory exists
  await fs.ensureDir(path.dirname(codexConfigPath));

  let config = {};

  // Read existing config if it exists
  if (await fs.pathExists(codexConfigPath)) {
    try {
      const configContent = await fs.readFile(codexConfigPath, 'utf8');
      config = toml.parse(configContent);
    } catch (error) {
      // If parsing fails, start with empty config
      console.warn('Warning: Could not parse existing config.toml, creating new one');
    }
  }

  // Ensure MCP structure exists
  if (!config.mcp) {
    config.mcp = {};
  }
  if (!config.mcp.servers) {
    config.mcp.servers = {};
  }

  // Get the path to our MCP server
  const mcpServerPath = path.join(__dirname, '..', 'mcp-server.js');

  // Add workflow server configuration
  config.mcp.servers.workflow = {
    command: 'node',
    args: [mcpServerPath]
  };

  // Write back to file
  const configString = tomlStringify(config);
  await fs.writeFile(codexConfigPath, configString);
}

// Simple TOML stringify function (since the toml package doesn't include stringify)
function tomlStringify(obj) {
  let result = '';

  function stringifyValue(value) {
    if (typeof value === 'string') {
      return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return value.toString();
    }
    if (Array.isArray(value)) {
      return '[' + value.map(stringifyValue).join(', ') + ']';
    }
    return value;
  }

  function stringifySection(obj, prefix = '') {
    let sectionResult = '';

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if (prefix) {
          sectionResult += `\n[${fullKey}]\n`;
        } else if (key !== 'mcp') {
          sectionResult += `[${key}]\n`;
        }
        sectionResult += stringifySection(value, fullKey);
      } else {
        if (prefix === '' && key === 'mcp') {
          // Handle mcp as a special case
          continue;
        }
        sectionResult += `${key} = ${stringifyValue(value)}\n`;
      }
    }

    return sectionResult;
  }

  // Handle top-level properties first
  for (const [key, value] of Object.entries(obj)) {
    if (key !== 'mcp' && (typeof value !== 'object' || Array.isArray(value))) {
      result += `${key} = ${stringifyValue(value)}\n`;
    }
  }

  // Handle MCP section
  if (obj.mcp) {
    result += '\n[mcp]\n';
    if (obj.mcp.servers) {
      for (const [serverName, serverConfig] of Object.entries(obj.mcp.servers)) {
        result += `\n[mcp.servers.${serverName}]\n`;
        for (const [configKey, configValue] of Object.entries(serverConfig)) {
          result += `${configKey} = ${stringifyValue(configValue)}\n`;
        }
      }
    }
  }

  return result;
}

module.exports = {
  registerMCPServer,
  registerWithClaudeCode,
  registerWithCodexCLI
};