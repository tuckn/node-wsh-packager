/**
 * @updated 2019/11/27
 * @fileoverview Tuckn's utility functions for Node.js
 * @fileencodeing UTF-8[unix]
 * @links https://github.com/tuckn/tkn-node-util
 */

const path = require('path');
const fs = require('fs');
const chardet = require('chardet');
const iconv = require('iconv-lite');
const types = require('./types.js');
// Shorthand
const isEmp = types.isProbablyEmpty;

const ERR_TITLE = `Error in ${__filename}`;

/**
 * @function hasOwnProp {{{
 * @return {Boolean}
 */
function hasOwnProp(obj, prop) {
  if (obj && Object.prototype.hasOwnProperty.call(obj, prop)) return true;
  return false;
} // }}}
module.exports.hasOwnProp = hasOwnProp;

/**
 * @function deepClone {{{
 * @param {Object} obj
 * @return {Object}
 */
function deepClone(obj) {
  if (obj === null) return obj;

  if (types.isArray(obj)) {
    const rtnObj = obj.slice(0) || [];

    rtnObj.forEach((val, i) => {
      if ((typeof val === 'object' && val !== {}) || types.isArray(val)) {
        rtnObj[i] = deepClone(val);
      }
    });

    return rtnObj;
  }

  if (typeof obj === 'object') {
    const rtnObj = { ...obj };

    Object.keys(rtnObj).forEach((key) => {
      if (typeof rtnObj[key] === 'object' && rtnObj[key] !== {}) {
        rtnObj[key] = deepClone(rtnObj[key]);
      }
    });

    return rtnObj;
  }

  return obj;
} // }}}
module.exports.deepClone = deepClone;

/**
 * @function obtainPropVal {{{
 * @description Return a value of object.prop. If object is undefined, return defaultVal
 * @param {Object} obj
 * @param {String} propName 配列の場合、0,1などの数値を指定する
 * @param {} defaultVal 取得した値が''の時に返される値
 * @return {}
 */
function obtainPropVal(obj, propName, defaultVal) {
  let returnVal = null;

  if ((types.isObject(obj) || types.isArray(obj))
      && hasOwnProp(obj, propName)) {
    returnVal = obj[propName];
  }

  if (isEmp(returnVal) && !isEmp(defaultVal)) returnVal = defaultVal;

  return returnVal;
} // }}}
module.exports.obtainPropVal = obtainPropVal;

/**
* @function createDateStrAsIso8601 {{{
* @description create a date string.
* @param {String} [fmt="yyyyMMddTHHmmss"] Date Format
*   ex) yyyy-MM, yy-MM, yyMM, HH:mm:ss,
* @param {Date} [dateObj=new Date()]
* @return {String} ex: 20150204T065424+0900
*/
function createDateStrAsIso8601(fmt = 'yyyyMMddTHHmmss+hhmm', dateObj = new Date()) {
  let dataStr = fmt;

  // 日付文字列の生成
  // 01,12,20,などのゼロパディング(2桁表示)を行うため
  // '0'を加えて文字列にし、sliceで右から2桁目のみを取得している
  dataStr = dataStr.replace(/yyyy/i, dateObj.getFullYear())
    // getMonth関数は 0-11 を返す。月にするには+1が必要
    .replace(/MM/, (`0${dateObj.getMonth() + 1}`).slice(-2))
    .replace(/dd/, (`0${dateObj.getDate()}`).slice(-2))
    .replace(/HH/, (`0${dateObj.getHours()}`).slice(-2))
    .replace(/mm/, (`0${dateObj.getMinutes()}`).slice(-2))
    .replace(/ss/, (`0${dateObj.getSeconds()}`).slice(-2));

  if (/\+hh:?mm$/i.test(dataStr)) {
    const eqtTime = ((new Date()).getTimezoneOffset() / 60) * -1;
    const eqtTimeH = parseInt(eqtTime, 10);
    const eqtTimeM = eqtTime - eqtTimeH;
    let eqtTimeHHStr = String(eqtTimeH);
    let eqtTimeMMStr = String(eqtTimeM);

    if (eqtTimeHHStr.length === 1) eqtTimeHHStr = `0${eqtTimeHHStr}`;
    if (eqtTimeMMStr.length === 1) eqtTimeMMStr = `0${eqtTimeMMStr}`;

    dataStr = dataStr.replace(/\+(hh)/i, `+${eqtTimeHHStr}`)
      .replace(/mm$/i, eqtTimeMMStr);
  }

  return dataStr;
} // }}}
module.exports.createDateStrAsIso8601 = createDateStrAsIso8601;

/**
 * @function inArray {{{
 * @description Similar to jQuery.inArray
 * @param {value}
 * @param {Array}
 * @return {Number} index number of array. If no matching, return -1.
 */
function inArray(val, arr) {
  return arr.indexOf(val);
} // }}}
module.exports.inArray = inArray;

/**
 * @function assocToStr {{{
 * @description Convert a Associative Object to strings.
 * @param {Object} assoc
 * @param {String} [prefix="  "]
 * @param {String} [postfix="\n"]
 * @return {String}
 */
function assocToStr(assoc, prefix = '  ', postfix = '\n') {
  return Object.keys(assoc).reduce((acc, val) => `${acc}${prefix}${val}: ${assoc[val]}${postfix}`, '');
} // }}}
module.exports.assocToStr = assocToStr;

/**
 * @function conv2DArrayToAssocArray {{{
 * @description Convert a 2D-array to a associative-array.
 * @param {Array} arrays
 * @param {Associative Array} [options]
 *   {Number} [.beginRow=1]
 *   {Number} [.beginColumn=1]
 *   {Number} [.endRow=arrays.length]
 *   {Number} [.endColumn=arrays[beginRow].length]
 *   {Boolean} [.autoParse=false]] @TODO 日付とか数字とか変換したいよね
 * @return {Associative Array}
 */
function conv2DArrayToAssocArray(arrays, options) {
  const pullVal = obtainPropVal;
  const beginRowIdx = pullVal(options, 'beginRow', 1) - 1;
  const beginColIdx = pullVal(options, 'beginColumn', 1) - 1;
  const endRowIdx = pullVal(options, 'endRow', arrays.length);
  const endColIdx = pullVal(options, 'endColumn', arrays[beginRowIdx].length);

  // Set propaties
  const propNames = [];
  let propName = '';

  for (let col = beginColIdx; col < endColIdx; col += 1) {
    propName = String(arrays[beginRowIdx][col]).trim();

    if (propName === '') {
      propNames.push(`empty${col}`);
    } else if (propNames.indexOf(propName) === -1) {
      propNames.push(propName);
    } else {
      propNames.push(propName + col);
    }
  }

  // Set values
  const rtnAssoc = [];
  let tmpAry = [];
  let tmpObj = {};

  for (let row = beginRowIdx + 1; row < endRowIdx; row += 1) {
    tmpAry = arrays[row];
    tmpObj = {}; // Clear

    for (let col1 = 0, Col1 = propNames.length; col1 < Col1; col1 += 1) {
      if (beginColIdx + col1 < tmpAry.length) {
        tmpObj[propNames[col1]] = tmpAry[beginColIdx + col1];
      } else {
        tmpObj[propNames[col1]] = undefined;
      }
    }

    rtnAssoc.push(tmpObj);
  }

  return rtnAssoc;
} // }}}
module.exports.conv2DArrayToAssocArray = conv2DArrayToAssocArray;

/**
 * @function conv2DArrayToCsvStr {{{
 * @description 配列をCSV形式に変換。要素が複数の場合、改行(CRLF)で区切る
 * @param {Array} props
 * @param {String} [lineEnding="\r\n"] Splitting Character
 * @return {String}
 */
function conv2DArrayToCsvStr(props, lineEnding = '\r\n') {
  let items;
  let item;
  let csv = '';
  let keys = null;
  let line;
  let hasDoubleQuot = false;

  // プロパティ配列数分ループ
  for (let i = 0, I = props.length; i < I; i += 1) {
    items = props[i]; // １行分の要素取得

    if (keys === null) {
      keys = []; // 初期化

      // 要素のキー取得
      keys = items.map((key) => key);
      csv += keys.join(',') + lineEnding; // キーをヘッダに設定
    }

    line = []; // １行分のデータ

    // 要素数分ループ
    for (let j = 0, J = keys.length; j < J; j += 1) {
      item = items[keys[j]]; // 要素取得

      if (item !== null) {
        // 要素配列チェック
        if (item instanceof Array) {
          item = item.join(lineEnding); // 配列の場合、改行で連結
        } else {
          item = String(item); // 文字列化
        }

        hasDoubleQuot = false;

        // 要素にダブルコーテーションの存在チェック
        if (item.indexOf('"') >= 0) {
          hasDoubleQuot = true;
          item = item.replace(/"/g, '""'); // ダブルコーテーションを置き換え

        // 要素に「,」「CR」「LF」を持つ場合、"で囲む
        } else if (item.indexOf(',') >= 0 || item.indexOf('\r') >= 0 || item.indexOf('\n') >= 0) {
          hasDoubleQuot = true;
        }

        if (hasDoubleQuot) item = `"${item}"`;
      }

      line.push(item);
    }
    csv += line.join(',') + lineEnding; // １行分のデータを設定
  }

  return csv;
} // }}}
module.exports.conv2DArrayToCsvStr = conv2DArrayToCsvStr;

/**
 * @function readFileAsString {{{
 * @param {String} textPath
 * @return {Promise}
 *   resolve {String}
 *   reject {Error}
 */
function readFileAsString(textPath) {
  if (isEmp(textPath)) {
    throw new Error(`${ERR_TITLE} readFileAsString\n  A empty textPath`);
  }

  const filePath = path.resolve(textPath);

  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        reject(err);
      } else {
        const encoding = chardet.detect(data);
        const stringData = iconv.decode(data, encoding);
        resolve(stringData);
      }
    });
  });
} // }}}
module.exports.readFileAsString = readFileAsString;

/**
 * @function readFileAsStringSync {{{
 * @param {String} textPath
 * @return {String}
 */
function readFileAsStringSync(textPath) {
  if (isEmp(textPath)) {
    throw new Error(`${ERR_TITLE} readFileAsStringSync\n  A empty textPath`);
  }

  const filePath = path.resolve(textPath);

  const data = fs.readFileSync(filePath);
  const encoding = chardet.detect(data);
  const stringData = iconv.decode(data, encoding);
  return stringData;
} // }}}
module.exports.readFileAsStringSync = readFileAsStringSync;

/**
 * @function removeWhiteSpaces {{{
 * @param {String} strData
 * @param {String} [option] "all" -> include beginning white spaces
 * @return {String}
 */
function removeWhiteSpaces(strData = '', option = '') {
  if (isEmp(strData)) {
    throw new Error(`${ERR_TITLE} removeWhiteSpaces\n  A empty strData`);
  }

  if (option.toUpperCase() === 'ALL') {
    return strData.replace(/\s*(\r?\n|\r)\s*/g, '$1');
  }

  return strData.replace(/\s+(\r?\n|\r)/g, '$1');
} // }}}
module.exports.removeWhiteSpaces = removeWhiteSpaces;

/**
 * @function convLineBreakTypes {{{
 * @param {String} eol
 * @return {String}
 */
function convLineBreakTypes(strData = '', eol = '') {
  if (isEmp(strData)) {
    throw new Error(`${ERR_TITLE} convLineBreakTypes\n  A empty strData`);
  }

  return strData.replace(/(\r?\n|\r)/g, eol);
} // }}}
module.exports.convLineBreakTypes = convLineBreakTypes;

/**
 * @function writeTextFile {{{
 * @param {String} destPath
 * @param {String} strData
 * @param {Associative Array} [options]
 *   [.encoding="utf8"] {String}
 *   [.bom] {Boolean}
 *   [.removesWhiteSpace] {String} "all" -> remove beginning too
 *   [.eol] {String}
 * @return {Promise}
 *   reject {Error}
 */
function writeTextFile(destPath, strData = '', options = {}) {
  if (isEmp(destPath)) {
    throw new Error(`${ERR_TITLE} writeTextFile\n  A empty destPath`);
  }

  const filePath = path.resolve(destPath);
  const encoding = obtainPropVal(options, 'encoding', 'utf8');
  const addsBom = obtainPropVal(options, 'bom', false);
  // @NOTE Node.jsは文字列をUTF16で扱う。そのため、最終的にはUTF8で保存するが、コード内では0xFEFFを付与する
  let writtenData = addsBom ? `\uFEFF${strData}` : strData;

  const removesWhiteSpace = obtainPropVal(options, 'removesWhiteSpace', null);
  if (removesWhiteSpace) {
    writtenData = removeWhiteSpaces(writtenData, removesWhiteSpace);
  }

  const eol = obtainPropVal(options, 'eol', null);
  if (eol) writtenData = convLineBreakTypes(writtenData, eol);

  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, iconv.encode(writtenData, encoding), (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
} // }}}
module.exports.writeTextFile = writeTextFile;

/**
 * @function writeTextFileSync {{{
 * @param {String} destPath
 * @param {String} strData
 * @param {Associative Array} [options]
 *   [.encoding="utf8"] {String}
 *   [.bom] {Boolean}
 *   [.removesWhiteSpace] {String} "all" -> remove beginning too
 *   [.eol] {String}
 */
function writeTextFileSync(destPath, strData = '', options = {}) {
  if (isEmp(destPath)) {
    throw new Error(`${ERR_TITLE} writeTextFileSync\n  A empty destPath`);
  }

  const filePath = path.resolve(destPath);
  const encoding = obtainPropVal(options, 'encoding', 'utf8');
  const addsBom = obtainPropVal(options, 'bom', false);
  let writtenData = addsBom ? `\uFEFF${strData}` : strData;

  const removesWhiteSpace = obtainPropVal(options, 'removesWhiteSpace', null);
  if (removesWhiteSpace) {
    writtenData = removeWhiteSpaces(writtenData, removesWhiteSpace);
  }

  const eol = obtainPropVal(options, 'eol', null);
  if (eol) writtenData = convLineBreakTypes(writtenData, eol);

  return fs.writeFileSync(filePath, iconv.encode(writtenData, encoding));
} // }}}
module.exports.writeTextFileSync = writeTextFileSync;

// vim:set foldmethod=marker commentstring=//%s :
