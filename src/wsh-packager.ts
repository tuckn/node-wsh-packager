import * as fsh from '@tuckn/fs-hospitality';
import * as fs from 'fs';
import * as _ from 'lodash';
import * as path from 'path';
import * as UglifyJS from 'uglify-js';
import * as xmlJs from 'xml-js';

/** @namespace API */

/** @private */
const ARG_ERR = 'TypeError [ERR_INVALID_ARG_VALUE]: ';

/**
 * @private
 * @param {Function} fn - Function where the Error occurred
 * @returns {string} - Returns "  at ${Function.name} (${__filename})"
 */
const _errLoc = (fn: Function) => `\n    at ${fn.name} (${__filename})`;

const WSH_EOL = '\r\n';

/**
 * Minify JScript code
 *
 * @memberof API
 * @param {string} code - A code of JScript
 * @returns {string} - A minified JScript code
 */
export function minifyJsCode(code: string): string {
  const minifyingJscriptOptions = {
    ie8: true,
    mangle: false,
  };

  const minifiedObj = UglifyJS.minify(code, minifyingJscriptOptions);
  if (minifiedObj.error) throw minifiedObj.error;
  if (minifiedObj.warnings) console.warn(minifiedObj.warnings);

  return minifiedObj.code;
}

/**
 * Minify VBScript code
 *
 * @memberof API
 * @param {string} code - A code of VBScript
 * @returns {string} - A minified VBScript code
 */
export function minifyVbsCode(code: string): string {
  const replaced = code
    .replace(/(^|\r?\n)([^'"]*)(\s*'[^\n]*)/g, '$1$2')
    .replace(/(\r?\n)\s+/g, '$1') // Trim lines
    .replace(/\s+(\r?\n)/g, '$1')
    .replace(/(\r?\n)\r?\n/g, '$1') // Removes blank lines
    .replace(/\s+_\r?\n\s*/g, ' '); // Removes VB CR _

  return replaced;
}

/**
 * Bundles JScripts
 *
 * @memberof API
 * @param {string[]} scriptPaths - JScript src paths
 * @param {object} options - Optional parameters
 * @param {string} [options.baseDir='.']
 * @param {boolean} [options.minifies=true]
 * @param {(string|RegExp)[]} [options.ignoreSrc]
 * @returns {string} - A bundled JScript code
 */
export function bundleJScriptSrcs(
  scriptPaths: string[],
  options?: {
    baseDir?: string;
    minifies?: boolean;
    ignoreSrc?: string | RegExp;
  },
): string {
  if (_.isEmpty(scriptPaths)) {
    throw new Error(`${ARG_ERR}scriptPaths is empty.${_errLoc(Function)}`);
  }

  const baseDir = _.get(options, 'baseDir', '.');
  const minifies = _.get(options, 'minifies', true);
  const ignoreSrc = _.get(options, 'ignoreSrc', '');

  let bundledCode = '';

  scriptPaths.forEach((srcPath) => {
    const wshPath = path.resolve(baseDir, srcPath);

    if (ignoreSrc) {
      let ignoreRegExp: RegExp;

      if (_.isRegExp(ignoreSrc)) {
        ignoreRegExp = ignoreSrc;
      } else {
        ignoreRegExp = new RegExp(ignoreSrc, 'i');
      }

      if (ignoreRegExp.test(wshPath)) return;
    }

    const wshCode = fsh.readAsTextSync(wshPath);

    if (minifies) {
      bundledCode += `${minifyJsCode(wshCode)}${WSH_EOL}`;
    } else {
      bundledCode += `${wshCode}${WSH_EOL}`;
    }
  });

  return bundledCode;
}

/**
 * Bundles VBScripts
 *
 * @memberof API
 * @param {string[]} scriptPaths - VBScript src paths
 * @param {object} options - Optional parameters
 * @param {string} [options.baseDir='.']
 * @param {boolean} [options.minifies=true]
 * @param {string|RegExp} [options.ignoreSrc]
 * @returns {string} - A bundled JScript code
 */
export function bundleVBScriptSrcs(
  scriptPaths: string[],
  options?: {
    baseDir?: string;
    minifies?: boolean;
    ignoreSrc?: string | RegExp;
  },
): string {
  if (_.isEmpty(scriptPaths)) {
    throw new Error(`${ARG_ERR}scriptPaths is empty.${_errLoc(Function)}`);
  }

  const baseDir = _.get(options, 'baseDir', '.');
  const minifies = _.get(options, 'minifies', true);
  const ignoreSrc = _.get(options, 'ignoreSrc', '');

  let bundledCode = '';

  scriptPaths.forEach((srcPath) => {
    const wshPath = path.resolve(baseDir, srcPath);

    if (ignoreSrc) {
      let ignoreRegExp: RegExp;

      if (_.isRegExp(ignoreSrc)) {
        ignoreRegExp = ignoreSrc;
      } else {
        ignoreRegExp = new RegExp(ignoreSrc, 'i');
      }

      if (ignoreRegExp.test(wshPath)) return;
    }

    const wshCode = fsh.readAsTextSync(wshPath);

    if (minifies) {
      bundledCode += `${minifyVbsCode(wshCode)}${WSH_EOL}`;
    } else {
      bundledCode += `${wshCode}${WSH_EOL}`;
    }
  });

  // Remove the duplicating "Option Explicit" lines
  if (/Option Explicit/i.test(bundledCode)) {
    bundledCode = bundledCode.replace(/Option Explicit\r?\n/gi, ''); // Remove all
    bundledCode = `Option Explicit${WSH_EOL}${bundledCode}`;
  }

  return bundledCode;
}

/**
 * Surrounds A WSH code with script tag
 *
 * @memberof API
 * @param {string} wshCode - WSH code string
 * @param {string} lang - A value of language attribute. JScript of VBScript
 * @returns {string} - A code surrounded
 */
export function surroundWshCode(wshCode: string, lang: string): string {
  if (!wshCode) {
    throw new Error(`${ARG_ERR}wshCode is empty.${_errLoc(Function)}`);
  }

  if (!lang) {
    throw new Error(`${ARG_ERR}lang is empty.${_errLoc(Function)}`);
  }

  return `<script language="${lang}">${WSH_EOL}${wshCode}${WSH_EOL}</script>${WSH_EOL}`;
}

/**
 * Surrounds WSH contents with package and job tags for .wsf file. The "job id" will be "run".
 *
 * @memberof API
 * @param {string} content
 * @returns {string} - A code surrounded
 */
export function surroundWithPackageJob(content: string): string {
  if (!content) {
    throw new Error(`${ARG_ERR}content is empty.${_errLoc(Function)}`);
  }

  return `<package>${WSH_EOL}<job id = run>${WSH_EOL}${content}${WSH_EOL}</job>${WSH_EOL}</package>${WSH_EOL}`;
}

/**
 * Bundles the job of .wsf into a .wsf file
 *
 * @memberof API
 * @param {object[]} wshObjs
 * @param {object} options - Optional parameters
 * @param {string} [options.baseDir='.']
 * @param {boolean} [options.minifies=true]
 * @param {string|RegExp} [options.ignoreSrc]
 * @returns {string} - A code bundled
 */
export function bundleWsfJob(
  wshObjs: any[],
  options?: {
    baseDir?: string;
    minifies?: boolean;
    ignoreSrc?: string | RegExp;
  },
): string {
  if (_.isEmpty(wshObjs)) {
    throw new Error(`${ARG_ERR}wshObjs is empty.${_errLoc(Function)}`);
  }

  const baseDir = _.get(options, 'baseDir', '.');
  const minifies = _.get(options, 'minifies', true);
  const ignoreSrc = _.get(options, 'ignoreSrc', '');

  let bundledCode = '';

  wshObjs.forEach((wshObj) => {
    const wshPath = path.resolve(baseDir, wshObj.attributes.src);

    if (ignoreSrc) {
      let ignoreRegExp: RegExp;

      if (_.isRegExp(ignoreSrc)) {
        ignoreRegExp = ignoreSrc;
      } else {
        ignoreRegExp = new RegExp(ignoreSrc, 'i');
      }

      if (ignoreRegExp.test(wshPath)) return;
    }

    const wshCode = fsh.readAsTextSync(wshPath);
    const lang = wshObj.attributes.language;

    if (/^vbscript$/i.test(lang)) {
      if (minifies) {
        bundledCode += surroundWshCode(minifyVbsCode(wshCode), 'VBScript');
      } else {
        bundledCode += surroundWshCode(wshCode, 'VBScript');
      }
    } else if (/^jscript$/i.test(lang)) {
      if (minifies) {
        bundledCode += surroundWshCode(minifyJsCode(wshCode), 'JScript');
      } else {
        bundledCode += surroundWshCode(wshCode, 'JScript');
      }
    }
  });

  return surroundWithPackageJob(bundledCode);
}

/**
 * @private
 * @param {string} source - A directory path or .wsf path
 * @returns {string} - .wsf path
 */
export function _setWsfPath(source: string): string {
  if (!source) {
    throw new Error(`${ARG_ERR}source is empty.${_errLoc(Function)}`);
  }

  const absPath = path.resolve(source);
  const srcStat = fs.statSync(absPath);

  if (srcStat.isDirectory()) return path.join(absPath, 'Package.wsf');

  if (srcStat.isFile()) return absPath;

  throw new Error(`${ARG_ERR}Invalid source "${source}".${_errLoc(Function)}`);
}

/**
 * Bundles .wsf jobs defined in Package.wsf
 *
 * @memberof API
 * @param {string} dirPath - A directory path where Package.wsf is located
 * @param {object} [options] - Optional parameters
 * @param {string} [options.jobId] - A job id name in .wsf (Default: all jobs)
 * @param {string} [options.baseDir] - Default is the directory of Package.wsf
 * @param {string|RegExp} [options.ignoreSrc] - Ex. "test\\.js$"
 * @returns {void}
 * @example
const { bundleWshFiles } = require('@tuckn/wsh-packager');
 
// Ex1.
// [File structure]
// D:\MyWshFolder\
// ├─ Package.wsf
// └─ src\
//     ├─ Function.js
//     ├─ Object.js
//     └─ JSON.js

// [The content of Package.wsf]
// <package>
//   <job id = "./dist/JSON.min.js">
//     <script language="JScript" src="./src/Function.js"></script>
//     <script language="JScript" src="./src/Object.js"></script>
//     <script language="JScript" src="./src/JSON.js"></script>
//   </job>
// </package>
 
bundleWshFiles('D:\\MyWshFolder');
// [The result]
// D:\MyWshFolder\
// ├─ Package.wsf
// ├─ dist\
// │  └─ JSON.min.js
// └─ src\
//     ├─ Function.js
//     ├─ Object.js
//     └─ JSON.js
 
// Ex2.
// [File structure]
// D:\MyWshFolder\
// ├─ Package.wsf
// └─ src\
//     ├─ CLI.js
//     ├─ Excel.vbs
//     ├─ Function.js
//     ├─ Object.js
//     ├─ JSON.js
//     └─ Util.vbs

// [The content of Package.wsf]
// <package>
//   <job id = "./dist/MyModule.vbs">
//     <script language="VBScript" src="./src/Util.vbs"></script>
//     <script language="VBScript" src="./src/Excel.vbs"></script>
//   </job>
//   <job id = "./dist/JSON.min.js">
//     <script language="JScript" src="./src/Function.js"></script>
//     <script language="JScript" src="./src/Object.js"></script>
//     <script language="JScript" src="./src/JSON.js"></script>
//   </job>
//   <job id = "./dist/Run.wsf">
//     <script language="JScript" src="./src/Function.js"></script>
//     <script language="VBScript" src="./src/Excel.vbs"></script>
//     <script language="JScript" src="./src/CLI.js"></script>
//   </job>
// </package>
 
bundleWshFiles('D:\\MyWshFolder');
// [The result]
// D:\MyWshFolder\
// ├─ Package.wsf
// ├─ dist\
// │  ├─ JSON.min.js
// │  ├─ MyModule.vbs
// │  └─ Run.wsf
// └─ src\
//     ├─ CLI.js
//     ├─ Excel.vbs
//     ├─ Function.js
//     ├─ Object.js
//     ├─ JSON.js
//     └─ Util.vbs
 */
export function bundleWshFiles(
  dirPath: string,
  options?: {
    jobId?: string;
    baseDir?: string;
    ignoreSrc?: string | RegExp;
  },
): void {
  if (!dirPath) {
    throw new Error(`${ARG_ERR}dirPath is empty.${_errLoc(Function)}`);
  }

  const srcWsfPath = _setWsfPath(dirPath);
  const srcWsfCode = fsh.readAsTextSync(srcWsfPath);

  // Parsing
  const xml2jsOptions = {
    alwaysArray: true,
    attributesKey: 'attributes', // for Eslint(no-underscore-dangle)
    compact: true,
    ignoreDeclaration: true,
    ignoreCdata: true,
    ignoreComment: true,
    ignoreDoctype: true,
  };
  const wsfObj = xmlJs.xml2js(srcWsfCode, xml2jsOptions);
  const packageObj = _.get(wsfObj, 'package', []) as any[];
  if (_.isEmpty(packageObj)) {
    throw new Error(
      `[ContentError] The package tag is not defined in "${srcWsfPath}".${_errLoc(
        Function,
      )}`,
    );
  }

  const jobObjs = _.get(packageObj[0], 'job', []) as any[];
  if (_.isEmpty(jobObjs)) {
    throw new Error(
      `[ContentError] The job tag is not defined in "${srcWsfPath}".${_errLoc(
        Function,
      )}`,
    );
  }

  // Bundling
  const baseDir = _.get(options, 'destDir', path.dirname(srcWsfPath));
  const ignoreSrc = _.get(options, 'ignoreSrc', '');
  const specifiedJobId = _.get(options, 'specifiedJobId', '');
  const writingOptions = {
    trim: 'end',
    eol: WSH_EOL,
    bom: true,
    encoding: 'utf8',
  };

  jobObjs.forEach(async (jobObj) => {
    let bundledCode = '';
    const jobId = jobObj.attributes.id;
    if (specifiedJobId && specifiedJobId !== jobObj.attributes.id) return;

    const destWshPath = path.resolve(baseDir, jobId);
    const extName = path.extname(destWshPath);
    const scriptObjs = jobObj.script as any[];

    if (/\.wsf/i.test(extName)) {
      bundledCode = bundleWsfJob(scriptObjs, { baseDir, ignoreSrc });
    } else {
      const scriptPaths = scriptObjs.map((o) => o.attributes.src);

      if (/\.js$/i.test(extName)) {
        bundledCode = bundleJScriptSrcs(scriptPaths, { baseDir, ignoreSrc });
      } else if (/\.vbs/i.test(extName)) {
        bundledCode = bundleVBScriptSrcs(scriptPaths, { baseDir, ignoreSrc });
      } else {
        return;
      }
    }

    fsh.writeAsTextSync(destWshPath, bundledCode, writingOptions);
  });
}
