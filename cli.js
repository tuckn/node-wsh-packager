#!/usr/bin/env node

/**
 * @updated 2019/11/27
 * @fileoverview Command Line Interface (CLI)
 * @fileencodeing UTF-8[unix]
 * @links https://github.com/tuckn/tkn-MinifyWsf
 */

const cli = require('commander');
const chalk = require('chalk');
const minwsf = require('./index.js');

const mainCmds = {}; // 0: node.exe, 1: cli.js, 2: <mainCmds>
const ERR_TITLE = `Error in ${__filename}`;
const collect = (val, prev) => prev.concat([val]);

mainCmds.run = async () => { // {{{
  cli
    .version('0.0.2')
    .option('-w, --wsf-path <Path>', 'A path of WSH script')
    .option('-J, --job-id <String>', 'A Job ID')
    .option('-I, --ignores <String>', 'Ignoring filenames', collect, [])
    .option('-D, --dest <Path>', 'A destination file/folder path')
    .parse(process.argv);

  if (!cli.wsfPath) {
    console.error(chalk.red(`${ERR_TITLE}. An essential parameter is empty.`));
    cli.outputHelp();
    return;
  }

  try {
    await minwsf.writeMinifiedWsf(cli.wsfPath, {
      jobId: cli.jobId,
      ignoreFileNames: cli.ignores,
      destPath: cli.dest,
    });
  } catch (e) {
    console.error(chalk.red(e.toString()));
  }
}; // }}}

mainCmds.packScripts = async () => { // {{{
  cli
    .version('0.0.1')
    .description('Extract minified scripts as index.js/index.vbs')
    .option('-w, --wsf-path <Path>', 'A path of WSH script')
    .option('-J, --job-id <String>', 'A Job ID')
    .option('-I, --ignores <String>', 'Ignoring filenames', collect, [])
    .option('-D, --dest-dir <Path>', 'A destination folder path')
    .parse(process.argv);

  if (!cli.wsfPath) {
    console.error(chalk.red(`${ERR_TITLE}. An essential parameter is empty.`));
    cli.outputHelp();
    return;
  }

  try {
    await minwsf.packScripts(cli.wsfPath, {
      jobId: cli.jobId,
      ignoreFileNames: cli.ignores,
      destDir: cli.destDir,
    });
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

const matchedCmd = Object.keys(mainCmds).find((key) => mainCmd === key);

if (matchedCmd === undefined) {
  exitProcess();
} else {
  mainCmds[matchedCmd]();
}
