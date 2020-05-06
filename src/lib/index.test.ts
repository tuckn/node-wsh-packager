import * as fsh from '@tuckn/fs-hospitality';
import * as fse from 'fs-extra';
import * as path from 'path';

import * as wshPacker from './index';

// Hack to make iconv load the encodings module, otherwise jest crashes. Compare
// https://github.com/sidorares/node-mysql2/issues/489
require('@tuckn/fs-hospitality/node_modules/iconv-lite').encodingExists('foo');

const dirAssets = path.resolve(__dirname, '../../assets');
const dirWsh = path.join(dirAssets, 'WshPolyfill');
const jsArray = path.join(dirWsh, 'Array.js');

describe('wsh-packager', () => {
  test('minifyJsCode', () => {
    const jsCode = fsh.readAsTextSync(jsArray);

    const minifiedCode = wshPacker.minifyJsCode(jsCode);
    console.log(minifiedCode);
  });

  test('minifyVbsCode', () => {
    //
  });

  test('bundleJScripts', () => {
    //
  });

  test('bundleVBScripts', async (done) => {
    //
  });

  test('bundleWsfJob', async (done) => {
    //
  });

  test('_setWsfPath', async (done) => {
    //
  });

  test('bundleWshFiles', async (done) => {
    //
  });
});
