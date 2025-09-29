const { spawn } = require('child_process');
const chalk = require('chalk');
const ora = require('ora');
const path = require('path');
const fs = require('fs-extra');
const { detectAvailableCLI } = require('../utils/cli-detector');

async function startCommand(objective) {
  const spinner = ora('Starting workflow session...').start();

  try {
    // 1. Detect which CLI is available
    const cli = await detectAvailableCLI();
    spinner.text = `Using ${cli.name.toUpperCase()} CLI...`;

    // 2. Verify setup was done
    if (cli.name === 'codex') {
      const codexConfigPath = path.join(process.env.HOME, '.codex', 'config.toml');
      if (!await fs.pathExists(codexConfigPath)) {
        spinner.fail('Codex config not found');
        console.log(chalk.yellow('Run: npx cw init first'));
        return;
      }
    }

    // 2. Start the MCP server in background
    spinner.text = 'Starting MCP server...';
    const mcpServerPath = path.join(__dirname, '..', 'mcp-server.js');
    const mcpProcess = spawn('node', [mcpServerPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      detached: false
    });

    // Give MCP server time to start
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 3. Create kickoff prompt
    const kickoffPrompt = `I'm starting a new workflow session with this objective: "${objective}"

Please call workflow.init_session with this objective to create the session documentation and update the status board.

Then call workflow.get_context to understand the project's workflow rules and architecture.

Once you have the context, create a detailed plan for achieving this objective, following the guidelines in AGENTS.md and CODING_AGENT.md.

Let's begin!`;

    spinner.text = `Launching ${cli.name.toUpperCase()} CLI...`;

    // 4. Launch the appropriate CLI with the kickoff prompt
    let cliProcess;
    if (cli.name === 'claude') {
      cliProcess = spawn('claude', [kickoffPrompt], {
        stdio: 'inherit',
        cwd: process.cwd()
      });
    } else if (cli.name === 'codex') {
      cliProcess = spawn('codex', ['--prompt', kickoffPrompt], {
        stdio: 'inherit',
        cwd: process.cwd()
      });
    }

    spinner.succeed('Session started!');

    console.log(chalk.green(`🚀 ${cli.name.toUpperCase()} is now running with workflow automation`));
    console.log(chalk.blue(`📝 Objective: ${objective}`));
    console.log(chalk.yellow(`💡 ${cli.name.toUpperCase()} will automatically:`));
    console.log('   • Create session documentation');
    console.log('   • Update status board');
    console.log('   • Follow your workflow rules');
    console.log('   • Log decisions and outcomes');

    // Wait for CLI to finish
    cliProcess.on('close', (code) => {
      console.log(chalk.green('\n✅ Session completed'));
      mcpProcess.kill();
    });

    // Handle Ctrl+C gracefully
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n🛑 Stopping session...'));
      cliProcess.kill();
      mcpProcess.kill();
      process.exit(0);
    });

  } catch (error) {
    spinner.fail('Failed to start session');
    throw error;
  }
}

module.exports = startCommand;