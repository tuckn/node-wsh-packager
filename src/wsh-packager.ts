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

const WSF_EOL = '\r\n';

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
    .replace(/\s*\r?\n\s*\r?\n/g, '\r\n') // Removes white spaces
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
export function bundleJScripts(
  scriptPaths: string[],
  options: {
    baseDir?: string;
    minifies?: boolean;
    ignoreSrc?: string | RegExp;
  },
): string {
  if (!scriptPaths) {
    throw new Error(`${ARG_ERR}scriptPaths is empty.${_errLoc(Function)}`);
  }

  const baseDir = _.get(options, 'baseDir', '.');
  const minifies = _.get(options, 'minifies', true);
  const ignoreSrc = _.get(options, 'ignoreSrc', '');

  let bundledCode = '';

  scriptPaths.forEach((srcPath) => {
    const wshPath = path.resolve(baseDir, srcPath);

    if (ignoreSrc) {
      let ingnoreRegExp: RegExp;

      if (_.isRegExp(ignoreSrc)) {
        ingnoreRegExp = ignoreSrc;
      } else {
        ingnoreRegExp = new RegExp(ignoreSrc, 'i');
      }

      if (ingnoreRegExp.test(wshPath)) return;
    }

    const wshCode = fsh.readAsTextSync(wshPath);

    if (minifies) {
      bundledCode += `${minifyJsCode(wshCode)}${WSF_EOL}`;
    } else {
      bundledCode += `${wshCode}${WSF_EOL}`;
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
export function bundleVBScripts(
  scriptPaths: string[],
  options: {
    baseDir?: string;
    minifies?: boolean;
    ignoreSrc?: string | RegExp;
  },
): string {
  if (!scriptPaths) {
    throw new Error(`${ARG_ERR}scriptPaths is empty.${_errLoc(Function)}`);
  }

  const baseDir = _.get(options, 'baseDir', '.');
  const minifies = _.get(options, 'minifies', true);
  const ignoreSrc = _.get(options, 'ignoreSrc', '');

  let bundledCode = '';

  scriptPaths.forEach((srcPath) => {
    const wshPath = path.resolve(baseDir, srcPath);

    if (ignoreSrc) {
      let ingnoreRegExp: RegExp;

      if (_.isRegExp(ignoreSrc)) {
        ingnoreRegExp = ignoreSrc;
      } else {
        ingnoreRegExp = new RegExp(ignoreSrc, 'i');
      }

      if (ingnoreRegExp.test(wshPath)) return;
    }

    const wshCode = fsh.readAsTextSync(wshPath);

    if (minifies) {
      bundledCode += `${minifyVbsCode(wshCode)}${WSF_EOL}`;
    } else {
      bundledCode += `${wshCode}${WSF_EOL}`;
    }
  });

  return bundledCode;
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
  options: {
    baseDir?: string;
    minifies?: boolean;
    ignoreSrc?: string | RegExp;
  },
): string {
  if (!wshObjs) {
    throw new Error(`${ARG_ERR}wshObjs is empty.${_errLoc(Function)}`);
  }

  const baseDir = _.get(options, 'baseDir', '.');
  const minifies = _.get(options, 'minifies', true);
  const ignoreSrc = _.get(options, 'ignoreSrc', '');

  let bundledCode = `<package>${WSF_EOL}<job id = run>${WSF_EOL}`;

  wshObjs.forEach((wshObj) => {
    const wshPath = path.resolve(baseDir, wshObj.attributes.src);

    if (ignoreSrc) {
      let ingnoreRegExp: RegExp;

      if (_.isRegExp(ignoreSrc)) {
        ingnoreRegExp = ignoreSrc;
      } else {
        ingnoreRegExp = new RegExp(ignoreSrc, 'i');
      }

      if (ingnoreRegExp.test(wshPath)) return;
    }

    const wshCode = fsh.readAsTextSync(wshPath);
    const lang = wshObj.attributes.language;

    if (/^vbscript$/i.test(lang)) {
      if (minifies) {
        bundledCode += `<script language="VBScript">${WSF_EOL}${minifyVbsCode(
          wshCode,
        )}${WSF_EOL}`;
      } else {
        bundledCode += `<script language="VBScript">${WSF_EOL}${wshCode}${WSF_EOL}`;
      }
    } else if (/^jscript$/i.test(lang)) {
      if (minifies) {
        bundledCode += `<script language="JScript">${WSF_EOL}${minifyJsCode(
          wshCode,
        )}${WSF_EOL}</script>`;
      } else {
        bundledCode += `<script language="JScript">${WSF_EOL}${wshCode}${WSF_EOL}</script>`;
      }
    }
  });

  return `${bundledCode}</job>${WSF_EOL}</package>${WSF_EOL}`;
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
 * @param {string} [options.jobId]
 * @param {string} [options.baseDir] - Default is the directory of Package.wsf
 * @param {string|RegExp} [options.ignoreSrc]
 * @returns {Promise} { resolve:undefined, reject:Error }
 */
export async function bundleWshFiles(
  dirPath: string,
  options: {
    jobId?: string;
    baseDir?: string;
    ignoreSrc?: string | RegExp;
  },
): Promise<void> {
  if (!dirPath) {
    throw new Error(`${ARG_ERR}dirPath is empty.${_errLoc(Function)}`);
  }

  const srcWsfPath = _setWsfPath(dirPath);
  const srcWsfCode = await fsh.readAsText(srcWsfPath);

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
  if (!packageObj) {
    throw new Error(
      `[ContentError] The package tag is not defined in "${srcWsfPath}".${_errLoc(
        Function,
      )}`,
    );
  }

  const jobObjs = _.get(packageObj[0], 'job', []) as any[];
  if (!jobObjs) {
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
    eol: WSF_EOL,
    bom: true,
    encoding: 'utf8',
  };

  await Promise.all(
    jobObjs.map(async (jobObj) => {
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
          bundledCode = bundleJScripts(scriptPaths, { baseDir, ignoreSrc });
        } else if (/\.vbs/i.test(extName)) {
          bundledCode = bundleVBScripts(scriptPaths, { baseDir, ignoreSrc });
        }
      }

      await fsh.writeAsText(destWshPath, bundledCode, writingOptions);
    }),
  );
}
