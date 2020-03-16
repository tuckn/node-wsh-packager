/**
 * @updated 2019/11/28
 * @fileoverview Joins WSH scripts that are written on a job of a Windows Script File(.wsf)
 * @fileencodeing UTF-8[unix]
 * @links https://github.com/tuckn/tkn-MinifyWsf
 */

const path = require('path');
const fs = require('fs');
const xmlJs = require('xml-js');
const UglifyJS = require('uglify-js');
const tkn = require('./tkn-util/index.js');
// Shorthand
const pullVal = tkn.obtainPropVal;
const isEmp = tkn.types.isProbablyEmpty;
const isSameStr = tkn.types.isSameMeaning;

const ERR_TITLE = `Error in ${__filename}`;

const xml2jsOptions = {
  alwaysArray: true,
  attributesKey: 'attributes', // for Eslint(no-underscore-dangle)
  compact: true,
  ignoreDeclaration: true,
  ignoreCdata: true,
  ignoreComment: true,
  ignoreDoctype: true,
};
const minifyingJscriptOptions = { ie8: true, mangle: false };
const WSF_EOL = '\r\n';
const SCRIPTTAG_VBS = '<script language="VBScript">';
const SCRIPTTAG_JS = '<script language="JScript">';
const regScriptSrcTag = new RegExp('\\s*<script\\s+language\\s*=\\s*"(\\w+)"\\s+src="([^"]+)"\\s*></script\\s*>', 'gi');
// @TODO コード内に"</script>"が書かれていた場合を排除できてない…
const regInlineScript = new RegExp('\\s*<script\\s+language\\s*=\\s*"(\\w+)"\\s*>([\\s\\S]+)</script\\s*>', 'gi');

/**
 * @function minifyVbsCode {{{
 * @description Minify a VBS code
 * @param {String} code
 * @return {String}
 */
function minifyVbsCode(code) {
  const replaced = code.replace(/(^|\r?\n)([^'"]*)(\s*'[^\n]*)/g, '$1$2')
    .replace(/\s*\r?\n\s*\r?\n/g, '\r\n') // 空行を削除
    .replace(/\s+_\r?\n\s*/g, ' '); // Remove VB CR _
  return replaced;
} // }}}
module.exports.minifyVbsCode = minifyVbsCode;

/**
 * @function writeMinifiedWsf {{{
 * @description Write a minified .wsf to a file
 * @param {utring} wsfPath
 * @param {Object} [options]
 * @param {string} [options.destPath]
 * @param {string} [options.jobId='run']
 * @param {array} [options.ignoreFileNames]
 * @return {Promise} - { resolve:undefined, reject:Error }
 */
async function writeMinifiedWsf(wsfPath, options = {}) {
  if (isEmp(wsfPath)) {
    throw new Error(`${ERR_TITLE} ${Function.name}\n`
      + 'The WSF path is Empty');
  }

  const wsfFullPath = path.resolve(wsfPath);
  const wsfDir = pullVal(options, 'basedir', path.dirname(wsfFullPath));
  const srcWsfData = await tkn.readFileAsString(wsfFullPath);
  const wsfObj = xmlJs.xml2js(srcWsfData, xml2jsOptions);

  const packageObj = pullVal(wsfObj, 'package', null);
  if (isEmp(packageObj)) {
    throw new Error(`${ERR_TITLE} ${Function.name}\n`
        + 'No declare <package> tag');
  }

  const jobs = pullVal(packageObj[0], 'job', null);
  if (isEmp(jobs)) {
    throw new Error(`${ERR_TITLE} ${Function.name}\n`
        + 'No declare <job> tag');
  }

  const jobId = pullVal(options, 'jobId', 'run');
  const jobIdx = jobs.findIndex((job) => isSameStr(job.attributes.id, jobId));
  if (jobIdx === -1) {
    throw new Error(`${ERR_TITLE} ${Function.name}\n`
        + `'No declare <job id=${jobId}> tag`);
  }
  console.log(`The job to package is ${jobId}`);

  // Minify and packaging src script files
  const ignoreFileNames = pullVal(options, 'ignoreFileNames', []);
  const scripts = jobs[jobIdx].script;
  let packagedWsf = `<package>${WSF_EOL}<job id = run>${WSF_EOL}`;

  scripts.forEach((obj) => {
    const lang = obj.attributes.language;
    const srcPath = obj.attributes.src;
    const wshPath = path.join(wsfDir, srcPath);
    const wshFileName = path.basename(wshPath);

    if (ignoreFileNames.some((name) => name === wshFileName)) {
      return;
    }

    console.log(`Reading the script src: ${srcPath}`);
    const srcWshData = tkn.readFileAsStringSync(wshPath);

    if (/^vbscript$/i.test(lang)) {
      console.log('Packages as VBScript');
      packagedWsf += `${WSF_EOL}${SCRIPTTAG_VBS}${WSF_EOL}${minifyVbsCode(srcWshData)}${WSF_EOL}</script>`;
      return;
    }

    console.log('Packages as JScript');
    const miniJs = UglifyJS.minify(srcWshData, minifyingJscriptOptions);
    if (miniJs.error) throw miniJs.error;
    if (miniJs.warnings) console.log(miniJs.warnings);

    packagedWsf += `${WSF_EOL}${SCRIPTTAG_JS}${WSF_EOL}${miniJs.code}${WSF_EOL}</script>`;
  });

  packagedWsf += `</job>${WSF_EOL}</package>${WSF_EOL}`;

  // Save the packaged wsf
  let destPath = pullVal(options, 'destPath', null);
  if (isEmp(destPath)) {
    destPath = path.join(path.dirname(wsfPath), jobId);
  } else if (fs.existsSync(destPath) && fs.statSync(destPath).isDirectory()) {
    destPath = path.join(destPath, jobId);
  }

  if (path.extname(destPath) !== '.wsf') destPath += '.wsf';
  console.log(`The path of packaged WSF is ${destPath}`);

  // Save as UTF-8[BOM]
  const writingOptions = {
    encoding: 'utf8',
    bom: true,
    removesWhiteSpace: 'all',
    eol: WSF_EOL,
  };
  await tkn.writeTextFile(destPath, packagedWsf, writingOptions);
} // }}}
module.exports.writeMinifiedWsf = writeMinifiedWsf;

/**
 * @function packScripts {{{
 * @description Extract minified scripts as index.js/index.vbs
 * @param {string} wsfPath
 * @param {Object} [options]
 * @param {string} [options.destDir]
 * @param {string} [options.jobId='run']
 * @param {array} [options.ignoreFileNames]
 * @return {Promise} { resolve:undefined, reject:Error }
 */
async function packScripts(wsfPath, options = {}) {
  if (isEmp(wsfPath)) {
    throw new Error(`${ERR_TITLE} ${Function.name}\n`
        + 'The WSF path is empty');
  }

  const wsfFullPath = path.resolve(wsfPath);
  const wsfDir = pullVal(options, 'basedir', path.dirname(wsfFullPath));
  const srcWsfData = await tkn.readFileAsString(wsfFullPath);
  const wsfObj = xmlJs.xml2js(srcWsfData, xml2jsOptions);

  const packageObj = pullVal(wsfObj, 'package', null);
  if (isEmp(packageObj)) {
    throw new Error(`${ERR_TITLE} ${Function.name}\n`
        + 'No declare <package> tag');
  }

  const jobs = pullVal(packageObj[0], 'job', null);
  if (isEmp(jobs)) {
    throw new Error(`${ERR_TITLE} ${Function.name}\n`
        + 'No declare <job> tag');
  }

  const jobId = pullVal(options, 'jobId', 'run');
  const jobIdx = jobs.findIndex((job) => isSameStr(job.attributes.id, jobId));
  if (jobIdx === -1) {
    throw new Error(`${ERR_TITLE} ${Function.name}\n`
        + `'No declare <job id=${jobId}> tag`);
  }

  // Minify and unite the src files
  const ignoreFileNames = pullVal(options, 'ignoreFileNames', []);
  const scripts = jobs[jobIdx].script;
  let unitedJscripts = '';
  let unitedVbScripts = '';

  scripts.forEach((obj) => {
    const lang = obj.attributes.language;
    const srcPath = obj.attributes.src;
    const wshPath = path.join(wsfDir, srcPath);
    const wshFileName = path.basename(wshPath);

    if (ignoreFileNames.some((name) => name === wshFileName)) {
      return;
    }

    const srcWshData = tkn.readFileAsStringSync(wshPath);

    if (/^vbscript$/i.test(lang)) {
      unitedVbScripts += `${minifyVbsCode(srcWshData)}${WSF_EOL}`;
      return;
    }

    const miniJs = UglifyJS.minify(srcWshData, minifyingJscriptOptions);
    if (miniJs.error) throw miniJs.error;
    if (miniJs.warnings) console.log(miniJs.warnings);

    unitedJscripts += `${miniJs.code}${WSF_EOL}`;
  });

  // Save the minified JScript
  const destDir = pullVal(options, 'destDir', wsfDir);
  const destJsPath = path.join(destDir, 'index.js');
  const destVbsPath = path.join(destDir, 'index.vbs');

  // Save as UTF-8[BOM]
  const writingOptions = {
    encoding: 'utf8',
    bom: true,
    removesWhiteSpace: 'all',
    eol: WSF_EOL,
  };

  if (!isEmp(unitedJscripts)) {
    await tkn.writeTextFile(destJsPath, unitedJscripts, writingOptions);
  }

  if (!isEmp(unitedVbScripts)) {
    await tkn.writeTextFile(destVbsPath, unitedVbScripts, writingOptions);
  }
} // }}}
module.exports.packScripts = packScripts;

// vim:set foldmethod=marker commentstring=//%s :
