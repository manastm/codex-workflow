#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const path = require('path');

// Import CLI commands
const initCommand = require('../src/cli/init');
const startCommand = require('../src/cli/start');

program
  .name('cw')
  .description('Automatic workflow and documentation for Codex CLI')
  .version('0.1.0');

// npx cw init
program
  .command('init')
  .description('Set up workflow templates and MCP server registration')
  .action(async () => {
    try {
      await initCommand();
    } catch (error) {
      console.error(chalk.red('Error during init:'), error.message);
      process.exit(1);
    }
  });

// npx cw "objective" (default command for any non-init argument)
program
  .argument('[objective]', 'Session objective to start with Codex')
  .action(async (objective) => {
    if (!objective) {
      console.log(chalk.yellow('Usage: npx cw "your objective here"'));
      console.log(chalk.yellow('   or: npx cw init'));
      return;
    }

    try {
      await startCommand(objective);
    } catch (error) {
      console.error(chalk.red('Error starting session:'), error.message);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();