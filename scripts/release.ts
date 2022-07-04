import * as AdmZip from 'adm-zip';
import * as fse from 'fs-extra';
import * as path from 'path';
import * as pkg from 'pkg';

import { bin, version } from '../package.json';

async function release() {
  // Set source .js
  const dirNpmBin = path.resolve(__dirname, '..', 'dist', 'bin');
  const pathNpmBin = path.join(dirNpmBin, 'index.js');

  // Create the directory for packaging
  const dirAssets = path.resolve(__dirname, '..', 'assets');
  const dirAssetsBin = path.join(dirAssets, 'bin');
  await fse.remove(dirAssetsBin); // Clear
  await fse.ensureDir(dirAssetsBin);

  const exeName = Object.keys(bin)[0]; // The exe name = package.json.bin

  // Package the bin-JS into an executable
  const releases = [
    {
      target: 'latest-win-x64',
      srcPath: pathNpmBin,
      output: path.join(dirAssetsBin, `${exeName}.exe`),
      zipPath: path.join(dirAssetsBin, `${exeName}_v${version}_win-x64.zip`),
    },
    {
      /*
       * @NOTICE With pkg v5.7.0, conversion to win-x86 fails.
       * The solution is using pkg 4.4.0. it works.
       */
      target: 'latest-win-x86',
      srcPath: pathNpmBin,
      output: path.join(dirAssetsBin, `${exeName}.exe`),
      zipPath: path.join(dirAssetsBin, `${exeName}_v${version}_win-x86.zip`),
    },
  ];

  // Async funcs in sequential
  for (const o of releases) {
    await pkg.exec(['--target', o.target, '--output', o.output, o.srcPath]);

    // Zipping the directory
    const zip = new (AdmZip as any)();
    zip.addLocalFile(o.output);
    zip.writeZip(o.zipPath);
    await fse.remove(o.output); // Clear
  }
}

release();
