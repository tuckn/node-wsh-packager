/**
 * @updated 2019/10/19
 * @fileoverview Utility functions for Node.js
 * @fileencodeing UTF-8[unix]
 * @requirements node.exe
 * @license MIT
 * @links https://github.com/tuckn/tkn-node-util.git
 * @author Tuckn
 * @email tuckn333+github@gmail.com
 */

const tknUtil = {};

/**
 * @function hasOwnProp {{{
 * @return {Boolean}
 */
tknUtil.hasOwnProp = (obj, prop) => {
  if (obj && Object.prototype.hasOwnProperty.call(obj, prop)) return true;
  return false;
}; // }}}

/**
 * @function deepClone {{{
 * @param {Object} obj
 * @return {Object}
 */
tknUtil.deepClone = (obj) => {
  let node;

  if (obj === null) {
    node = obj;
  } else if (tknUtil.types.isArray(obj)) {
    node = obj.slice(0) || [];
    node.forEach((n) => {
      if ((typeof n === 'object' && n !== {}) || tknUtil.types.isArray(n)) {
        n = tknUtil.deepClone(n);
      }
    });
  } else if (typeof obj === 'object') {
    node = Object.assign({}, obj);
    Object.keys(node).forEach((key) => {
      if (typeof node[key] === 'object' && node[key] !== {}) {
        node[key] = tknUtil.deepClone(node[key]);
      }
    });
  } else {
    node = obj;
  }

  return node;
}; // }}}

/**
 * @function obtainPropVal {{{
 * @description Return a value of object.prop. If object is undefined, return defVal
 * @param {Object} obj
 * @param {String} propName 配列の場合、0,1などの数値を指定する
 * @param {} defVal 取得した値が''の時に返される値
 * @return {}
 */
tknUtil.obtainPropVal = (obj, propName, defVal) => {
  const isEmp = tknUtil.types.isProbablyEmpty;
  let rtn = null;

  if ((tknUtil.types.isObject(obj) || tknUtil.types.isArray(obj))
      && tknUtil.hasOwnProp(obj, propName)) {
    rtn = obj[propName];
  }

  if (isEmp(rtn) && !isEmp(defVal)) rtn = defVal;

  return rtn;
}; // }}}

/**
* @function createDateStrAsIso8601 {{{
* @description create a date string.
* @param {String} [fmt="yyyyMMddTHHmmss"] Date Format
*   ex) yyyy-MM, yy-MM, yyMM, HH:mm:ss,
* @param {Date} [dateObj=new Date()]
* @return {String} ex: 20150204T065424+0900
*/
tknUtil.createDateStrAsIso8601 = (fmt = 'yyyyMMddTHHmmss+hhmm', dateObj = new Date()) => {
  let dataStr = fmt;

  // 日付文字列の生成
  // 01,12,20,などのゼロパディング(2桁表示)を行うため
  // '0'を加えて文字列にし、sliceで右から2桁目のみを取得している
  dataStr = dataStr.replace(/yyyy/, dateObj.getFullYear())
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
}; // }}}

/**
 * @function inArray {{{
 * @description Similar to jQuery.inArray
 * @param {value}
 * @param {Array}
 * @return {Number} index number of array. If no matching, return -1.
 */
tknUtil.inArray = (val, arr) => arr.indexOf(val);
// }}}

/**
 * @function assocToStr {{{
 * @description Convert a Associative Object to strings.
 * @param {Object} assoc
 * @param {String} [prefix="  "]
 * @param {String} [postfix="\n"]
 * @return {String}
 */
tknUtil.assocToStr = (assoc, prefix = '  ', postfix = '\n') => Object.keys(assoc).reduce((acc, val) => `${acc}${prefix}${val}: ${assoc[val]}${postfix}`, '');
// }}}

/**
 * @function convErrToStr {{{
 * @description Convert a Error Object to strings.
 * @param {Error Object} e
 * @param {String} [spChr="\n"] Splitting Character
 * @return {String}
 */
tknUtil.convErrToStr = (e, spChr = '\n') => {
  let rtnStr = `Error: {${spChr}`;

  for (const p in e) {
    if (Number.isNaN(e[p])) {
      rtnStr += `  ${p}: ${e[p]}${spChr}`;

    // 数値の場合、16進数に変換（多分エラーコード
    // @FIXME 10進数のエラーコード、-2146825284を
    // FFFFFFFF800A0BBC で表示させたいけどうまくいかん！
    // Windowsが出すエラーは800A0BBCの部分みたい
    // -2146825284をビット反転すればいけそうだが…
    } else {
      rtnStr += `  ${p}: ${e[p]}${spChr}`;
    }
  }
  rtnStr += `}${spChr}`;

  return rtnStr;
}; // }}}

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
tknUtil.conv2DArrayToAssocArray = (arrays, options) => {
  const pullVal = tknUtil.obtainPropVal;
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
}; // }}}

/**
 * @function conv2DArrayToCsvStr {{{
 * @description 配列をCSV形式に変換。要素が複数の場合、改行(CRLF)で区切る
 * @param {Array} props
 * @param {String} [lineEnding="\r\n"] Splitting Character
 * @return {String}
 */
tknUtil.conv2DArrayToCsvStr = (props, lineEnding = '\r\n') => {
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
      keys = items.map(key => key);
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
}; // }}}

tknUtil.types = {};

/**
 * @function types.typeOf {{{
 * @description Return a trimmed Object.prototype.toString
 *   Javascriptはtypeofだと殆どobjectになるため
 * @return {String}
 */
tknUtil.types.typeOf = (val) => {
  if (val === undefined) return 'undefined';
  if (val === null) return 'null';
  return Object.prototype.toString.call(val).slice(8, -1);
}; // }}}

/**
 * @function types.isEmptyObject {{{
 * @description {} -> true, [] -> true, '' -> true, undefined -> true
 * @return {Boolean}
 */
tknUtil.types.isEmptyObject = (obj) => {
  for (const p in obj) return false;
  return true;
}; // }}}

/**
 * @function types.isProbablyEmpty {{{
 * @return {Boolean}
 */
tknUtil.types.isProbablyEmpty = (val) => {
  try {
    if (val === undefined || val === null || val === ''
      || (tknUtil.types.typeOf(val) === 'Object' && tknUtil.types.isEmptyObject(val))
      || (tknUtil.types.typeOf(val) === 'Array' && val.length === 0)) {
      return true;
    }
    return false;
  } catch (e) {
    return true;
  }
}; // }}}

/**
 * @function types.isBoolean {{{
 * @return {Boolean}
 */
tknUtil.types.isBoolean = (val) => {
  try {
    if (val === undefined || val === null) return false;
    if (tknUtil.types.typeOf(val) === 'Boolean') return true;
    return false;
  } catch (e) {
    return false;
  }
}; // }}}

/**
 * @function types.isFunction {{{
 * @description
 * @return {Boolean}
 */
tknUtil.types.isFunction = (val) => {
  try {
    if (val === undefined || val === null) return false;
    if (tknUtil.types.typeOf(val) === 'Function') return true;
    return false;
  } catch (e) {
    return false;
  }
}; // }}}

/**
 * @function types.isNumber {{{
 * @ref "JavaScript:The Good Parts"
 * @return {Boolean}
 */
tknUtil.types.isNumber = (val) => {
  try {
    return typeof val === 'number' && Number.isFinite(val);
  } catch (e) {
    return false;
  }
}; // }}}

/**
 * @function types.isString {{{
 * @return {Boolean}
 */
tknUtil.types.isString = (val) => {
  try {
    if (val === undefined || val === null) return false;
    if (tknUtil.types.typeOf(val) === 'String') return true;
    return false;
  } catch (e) {
    return false;
  }
}; // }}}

/**
 * @function types.isNotFalselike {{{
 * @description Determines that a argument is not falselike
 * @return {Boolean} similar true is true.
 */
tknUtil.types.isNotFalselike = (val) => {
  if (val === false || val === '' || val === 0
      || (tknUtil.types.isString(val) && val.toUpperCase() === 'FALSE')) {
    return false;
  }
  return true; // undefined, null
}; // }}}

/**
 * @function types.isArray {{{
 * @return {Boolean}
 */
tknUtil.types.isArray = (val) => {
  try {
    if (val === undefined || val === null) return false;
    if (tknUtil.types.typeOf(val) === 'Array') return true;
    return false;
  } catch (e) {
    return false;
  }
}; // }}}

/**
 * @function types.isObject {{{
 * @return {Boolean}
 */
tknUtil.types.isObject = (val) => {
  try {
    if (val === undefined || val === null) return false;
    if (tknUtil.types.typeOf(val) === 'Object') return true;
    return false;
  } catch (e) {
    return false;
  }
}; // }}}

/**
 * @function types.isPhoneNumerInJapan {{{
 * @description 日本国内の電話番号。携帯番号も含む
 * @param {String} str
 * @return {Boolean}
 */
tknUtil.types.isPhoneNumerInJapan = (str) => {
  try {
    return (String(/^(0([1-9]{1}-?[1-9]\d{3}|[1-9]{2}-?\d{3}|[1-9]{2}\d{1}-?\d{2}|[1-9]{2}\d{2}-?\d{1})-?\d{4}|0[789]0-?\d{4}-?\d{4}|050-?\d{4}-?\d{4})$/i).test(str));
  } catch (e) {
    return false;
  }
}; // }}}

/**
 * @function types.isProbablyPhoneNumberInJapan {{{
 * @description 最後の一桁足りないけど、おそらく日本国内の電話番号
 * @param {String} str
 * @return {Boolean}
 */
tknUtil.types.isProbablyPhoneNumberInJapan = (str) => {
  try {
    return (String(/^(0([1-9]{1}-?[1-9]\d{3}|[1-9]{2}-?\d{3}|[1-9]{2}\d{1}-?\d{2}|[1-9]{2}\d{2}-?\d{1})-?\d{3}|0[789]0-?\d{4}-?\d{3}|050-?\d{4}-?\d{3})\d?$/i).test(str));
  } catch (e) {
    return false;
  }
}; // }}}

/**
 * @function types.isJapaneseName {{{
 * @description 日本人の名前
 * @param {String} str
 * @return {Boolean}
 */
tknUtil.types.isJapaneseName = (s) => {
  try {
  // すべて全角文字で２文字以上
    return (String(/^[^\x00-\x7F]+[(\p{blank})\s]*[^\x00-\x7F]+$/).test(s)
        // 全部英字の場合なら、
        || (String(/^[a-z]+\s*[a-z]+$/i).test(s)
          // ローマ字にない特定の英字を含まない
          && String(/^[^lqvx]+$/i).test(s)
          // 子音が連続しない
          && String(/[^(bb|cc|dd|ff|gg|hh|jj|kk|ll|pp|rr|ss|tt|ww|yy|xx)]/i).test(s)
          // 母音→母音か子音→母音を含む（ヘボン式
          && String(/([aiueonkstnhfmyrwngzjdbp]|sh|ch|ts|ky|sh|ch|ny|hy|my|ry|gy|by|py)[aiueonmh]$/i).test(s)));
  } catch (e) {
    return false;
  }
}; // }}}

/**
 * @function types.isMailAddress {{{
 * @return {Boolean}
 */
tknUtil.types.isMailAddress = (val) => {
  try {
    return String(/[\x00-\x7f]+@[\x00-\x7f]+/i).test(val);
  } catch (e) {
    return false;
  }
}; // }}}

/**
 * @function types.isWellKnownFileExtion {{{
 * @return {Boolean}
 */
tknUtil.types.isWellKnownFileExtion = (val) => {
  try {
    return String(/\.(ahk|bat|bmp|doc|dxf|cmd|com|exe|js|jpg|pdf|png|ppf|ppt|tif|txt|iges|igs|mi|vsd|xls)/i).test(val);
  } catch (e) {
    return false;
  }
}; // }}}

module.exports = tknUtil;

// vim:set foldmethod=marker commentstring=//%s :
