#!/usr/bin/env node

/**
 * @updated 2019/11/10
 * @fileoverview Command Line Interface (CLI)
 * @fileencodeing UTF-8[unix]
 * @links https://github.com/tuckn/tkn-MinifyWsf
 */

const cli = require('commander');
const chalk = require('chalk');
const minwsf = require('./index.js');

const mainCmds = {}; // 0: node.exe, 1: cli.js, 2: <mainCmds>
const ERR_TITLE = `Error in ${__filename}`;

mainCmds.run = async () => { // {{{
  cli
    .version('0.0.1')
    .option('-w, --wsf-path <Path>', 'A path of WSH script')
    .option('-D, --dest-path <Path>', 'A destination path. If empty, <name>-min.wsf')
    .parse(process.argv);

  if (!cli.wsfPath) {
    console.error(chalk.red(`${ERR_TITLE}. An essential parameter is empty.`));
    cli.outputHelp();
    return;
  }

  try {
    await minwsf.writeMinifiedWsf(cli.wsfPath, cli.destPath);
  } catch (e) {
    console.error(chalk.red(e.toString()));
  }
}; // }}}

const exitProcess = () => { // {{{
  const cmdlist = Object.keys(mainCmds).join(', ');

  console.error(chalk.red('ERROR: Set a command.'));
  console.log('where <command> is one of:');
  console.log(`    ${chalk.cyan(cmdlist)}`);
  console.log();
  console.log(`process.argv: [ ${process.argv.join(', ')} ]`);
  console.log();
  process.exit(1);
}; // }}}

// Set the main command specified by a user
let mainCmd;
if (process.argv.length >= 3 && process.argv[2].indexOf('-') === -1) {
  [, , mainCmd] = process.argv;
} else {
  mainCmd = 'run';
}

const matchedCmd = Object.keys(mainCmds).find(key => mainCmd === key);

if (matchedCmd === undefined) {
  exitProcess();
} else {
  mainCmds[matchedCmd]();
}
