/**
 * @updated 2019/11/10
 * @fileoverview Joins WSH scripts that are written on a job of a Windows Script File(.wsf)
 * @fileencodeing UTF-8[unix]
 * @links https://github.com/tuckn/tkn-MinifyWsf
 */

const path = require('path');
const fs = require('fs');
const UglifyJS = require('uglify-js');
const tkn = require('./tkn-util/index.js');
// Shorthand
const pullVal = tkn.obtainPropVal;
const isEmp = tkn.types.isEmptyObject;

const ERR_TITLE = `Error in ${__filename}`;

const WSF_EOL = '\r\n';
const SCRIPTTAG_VBS = '<script language="VBScript">';
const SCRIPTTAG_JS = '<script language="JScript">';

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
 * @param {String} wsfPath
 * @param {String} [dest]
 * @return {Promise}
 *   resolve {undefined}
 *   reject {Error}
 */
async function writeMinifiedWsf(wsfPath, dest = null, options = {}) {
  if (isEmp(wsfPath)) {
    throw new Error(`${ERR_TITLE} writeMinifiedWsf\n  The WSF path is Empty`);
  }

  const wsfFullPath = path.resolve(wsfPath);
  const wsfDir = pullVal(options, 'basedir', path.dirname(wsfFullPath));
  const srcWsfData = await tkn.readFileAsString(wsfFullPath);
  const minifyingOptions = { ie8: true, mangle: false };

  // Minify inline scripts
  const regInlineScript = new RegExp('\\s*<script\\s+language\\s*=\\s*"(\\w+)"\\s*>([\\s\\S]+)</script\\s*>', 'gi');
  const inlineConverter = (match, lang, body) => {
    if (/^vbscript$/i.test(lang)) {
      return `${WSF_EOL}${SCRIPTTAG_VBS}${WSF_EOL}${minifyVbsCode(body)}${WSF_EOL}</script>`;
    }

    const miniJs = UglifyJS.minify(body, minifyingOptions);
    if (miniJs.error) throw miniJs.error;
    if (miniJs.warnings) console.log(miniJs.warnings);

    return `${WSF_EOL}${SCRIPTTAG_JS}${WSF_EOL}${miniJs.code}${WSF_EOL}</script>`;
  };
  const minifiedWsf = srcWsfData.replace(regInlineScript, inlineConverter);

  // Joined the src files
  const regScriptSrcTag = new RegExp('\\s*<script\\s+language\\s*=\\s*"(\\w+)"\\s+src="([^"]+)"\\s*></script\\s*>', 'gi');

  const joiner = (match, lang, srcPath) => {
    const wshPath = path.join(wsfDir, srcPath);
    const srcWshData = tkn.readFileAsStringSync(wshPath);

    if (/^vbscript$/i.test(lang)) {
      return `${WSF_EOL}${SCRIPTTAG_VBS}${WSF_EOL}${minifyVbsCode(srcWshData)}${WSF_EOL}</script>`;
    }

    const miniJs = UglifyJS.minify(srcWshData, minifyingOptions);
    if (miniJs.error) throw miniJs.error;
    if (miniJs.warnings) console.log(miniJs.warnings);

    return `${WSF_EOL}${SCRIPTTAG_JS}${WSF_EOL}${miniJs.code}${WSF_EOL}</script>`;
  };
  const joinedWsfData = minifiedWsf.replace(regScriptSrcTag, joiner);

  // Save the minified WSF data
  let destPath = dest;
  if (isEmp(destPath)) {
    destPath = path.join(path.dirname(wsfPath), `${path.parse(wsfPath).name}-joined.wsf`);
  } else if (fs.existsSync(destPath) && fs.statSync(destPath).isDirectory()) {
    destPath = path.join(destPath, path.basename(wsfPath));
  }

  // Save as UTF-8[BOM]
  const writingOptions = {
    encoding: 'utf8',
    bom: true,
    removesWhiteSpace: 'all',
    eol: WSF_EOL,
  };
  await tkn.writeTextFile(destPath, joinedWsfData, writingOptions);
} // }}}
module.exports.writeMinifiedWsf = writeMinifiedWsf;

// vim:set foldmethod=marker commentstring=//%s :
