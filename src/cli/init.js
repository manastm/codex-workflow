const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const { registerMCPServer } = require('../utils/toml');
const { createTemplateFiles } = require('../utils/templates');

async function initCommand() {
  const spinner = ora('Setting up workflow...').start();

  try {
    // 1. Create template files in current directory
    spinner.text = 'Creating workflow templates...';
    await createTemplateFiles();

    // 2. Register MCP server globally
    spinner.text = 'Registering MCP server...';
    const registeredCLIs = await registerMCPServer();

    spinner.succeed('Workflow setup complete!');

    console.log('\n' + chalk.green('✅ Success! You can now use:'));
    console.log(chalk.blue('   npx cw "your objective here"'));
    console.log('\n' + chalk.yellow('📁 Files created:'));
    console.log('   • AGENTS.md (workflow rules)');
    console.log('   • CODING_AGENT.md (coding guidelines)');
    console.log('   • docs/templates/ (session templates)');
    console.log('   • docs/status/board.md (progress tracking)');

    console.log('\n' + chalk.yellow('🔧 MCP server registered with:'));
    registeredCLIs.forEach(cli => {
      console.log(`   • ${cli.name.toUpperCase()} CLI`);
    });

  } catch (error) {
    spinner.fail('Setup failed');
    throw error;
  }
}

module.exports = initCommand;