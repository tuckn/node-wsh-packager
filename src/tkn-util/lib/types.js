/**
 * @updated 2019/11/28
 * @fileoverview Identify the type of a val
 * @fileencodeing UTF-8[unix]
 * @links https://github.com/tuckn/tkn-node-util
 */

/**
 * @function typeOf {{{
 * @description Return a trimmed Object.prototype.toString
 *   Javascriptはtypeofだと殆どobjectになるため
 * @return {String}
 */
function typeOf(val) {
  if (val === undefined) return 'undefined';
  if (val === null) return 'null';
  return Object.prototype.toString.call(val).slice(8, -1);
} // }}}
module.exports.typeOf = typeOf;

/**
 * @function isArray {{{
 * @return {Boolean}
 */
function isArray(val) {
  try {
    if (typeOf(val) === 'Array') return true;
    return false;
  } catch (e) {
    return false;
  }
} // }}}
module.exports.isArray = isArray;

/**
 * @function isBoolean {{{
 * @return {Boolean}
 */
function isBoolean(val) {
  try {
    if (typeOf(val) === 'Boolean') return true;
    return false;
  } catch (e) {
    return false;
  }
} // }}}
module.exports.isBoolean = isBoolean;

/**
 * @function isFunction {{{
 * @description
 * @return {Boolean}
 */
function isFunction(val) {
  try {
    if (typeOf(val) === 'Function') return true;
    return false;
  } catch (e) {
    return false;
  }
} // }}}
module.exports.isFunction = isFunction;
/**
 * @function isNumber {{{
 * @ref "JavaScript:The Good Parts"
 * @return {Boolean}
 */
function isNumber(val) {
  try {
    return typeof val === 'number' && Number.isFinite(val);
  } catch (e) {
    return false;
  }
} // }}}
module.exports.isNumber = isNumber;

/**
 * @function isObject {{{
 * @return {Boolean}
 */
function isObject(val) {
  try {
    if (typeOf(val) === 'Object') return true;
    return false;
  } catch (e) {
    return false;
  }
} // }}}
module.exports.isObject = isObject;

/**
 * @function isString {{{
 * @return {Boolean}
 */
function isString(val) {
  try {
    if (typeOf(val) === 'String') return true;
    return false;
  } catch (e) {
    return false;
  }
} // }}}
module.exports.isString = isString;

/**
 * @function isFalsy {{{
 * @return {Boolean}
 */
function isFalsy(val) {
  if (!val) return true;
  if (isString(val) && val.toUpperCase() === 'FALSE') return true;

  return false;
} // }}}
module.exports.isFalsy = isFalsy;

/**
 * @function isTruthy {{{
 * @return {Boolean}
 */
function isTruthy(val) {
  return !isFalsy(val);
} // }}}
module.exports.isTruthy = isTruthy;


/**
 * @function isEmptyArray {{{
 * @description [] -> true
 * @return {Boolean}
 */
function isEmptyArray(val) {
  if (isArray(val) && val.length === 0) return true;
  return false;
} // }}}
module.exports.isEmptyArray = isEmptyArray;

/**
 * @function isEmptyObject {{{
 * @description {} -> true
 * @return {Boolean}
 */
function isEmptyObject(val) {
  if (isObject(val) && Object.keys(val).length === 0) return true;
  return false;
} // }}}
module.exports.isEmptyObject = isEmptyObject;

/**
 * @function isSameMeaning {{{
 * @return {Boolean}
 */
function isSameMeaning(str1, str2) {
  try {
    return str1.toUpperCase() === str2.toUpperCase();
  } catch (e) {
    return false;
  }
} // }}}
module.exports.isSameMeaning = isSameMeaning;

/**
 * @function isProbablyEmpty {{{
 * @return {Boolean}
 */
function isProbablyEmpty(val) {
  try {
    if (val === undefined || val === null || val === '') return true;
    if (isEmptyObject(val)) return true;
    if (isEmptyArray(val)) return true;

    return false;
  } catch (e) {
    return true;
  }
} // }}}
module.exports.isProbablyEmpty = isProbablyEmpty;

/**
 * @function isPhoneNumerInJapan {{{
 * @description 日本国内の電話番号。携帯番号も含む
 * @param {String} str
 * @return {Boolean}
 */
function isPhoneNumerInJapan(str) {
  try {
    return (String(/^(0([1-9]{1}-?[1-9]\d{3}|[1-9]{2}-?\d{3}|[1-9]{2}\d{1}-?\d{2}|[1-9]{2}\d{2}-?\d{1})-?\d{4}|0[789]0-?\d{4}-?\d{4}|050-?\d{4}-?\d{4})$/i).test(str));
  } catch (e) {
    return false;
  }
} // }}}
module.exports.isPhoneNumerInJapan = isPhoneNumerInJapan;

/**
 * @function isProbablyPhoneNumberInJapan {{{
 * @description 最後の一桁足りないけど、おそらく日本国内の電話番号
 * @param {String} str
 * @return {Boolean}
 */
function isProbablyPhoneNumberInJapan(str) {
  try {
    return (String(/^(0([1-9]{1}-?[1-9]\d{3}|[1-9]{2}-?\d{3}|[1-9]{2}\d{1}-?\d{2}|[1-9]{2}\d{2}-?\d{1})-?\d{3}|0[789]0-?\d{4}-?\d{3}|050-?\d{4}-?\d{3})\d?$/i).test(str));
  } catch (e) {
    return false;
  }
} // }}}
module.exports.isProbablyPhoneNumberInJapan = isProbablyPhoneNumberInJapan;

/**
 * @function isJapaneseName {{{
 * @description 日本人の名前
 * @param {String} str
 * @return {Boolean}
 */
function isJapaneseName(s) {
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
} // }}}
module.exports.isJapaneseName = isJapaneseName;

/**
 * @function isMailAddress {{{
 * @return {Boolean}
 */
function isMailAddress(val) {
  try {
    return String(/[\x00-\x7f]+@[\x00-\x7f]+/i).test(val);
  } catch (e) {
    return false;
  }
} // }}}
module.exports.isMailAddress = isMailAddress;

/**
 * @function isWellKnownFileExtion {{{
 * @return {Boolean}
 */
function isWellKnownFileExtion(val) {
  try {
    return String(/\.(ahk|bat|bmp|doc|dxf|cmd|com|exe|js|jpg|pdf|png|ppf|ppt|tif|txt|iges|igs|mi|vsd|xls)/i).test(val);
  } catch (e) {
    return false;
  }
} // }}}
module.exports.isWellKnownFileExtion = isWellKnownFileExtion;

// vim:set foldmethod=marker commentstring=//%s :
