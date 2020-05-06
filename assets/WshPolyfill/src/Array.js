/**
 * @file Polyfill to extend functions of Array for WSH (Windows Script Host {@link https://docs.microsoft.com/en-us/previous-versions//9bbdkx3k(v=vs.85)|Microsoft Docs}). I recommend that JScript File Encoding is UTF-8[BOM, dos]
 * @description JScript 5.8 is similar to ECMA-262 3rd edition and doesn't have many useful features that ES5 (ECMA-262 5.1 edition) and above have. This module adds those to JScript.
 * @requires wscript.exe/cscript.exe
 * @requires ./Function.js
 * @requires ./Object.js
 * @author Tuckn <tuckn333+github@gmail.com>
 * @license MIT
 * @see {@link https://github.com/tuckn/JScriptPolyfill|GitHub}
 */

/* eslint valid-typeof: "off" */

/** @namespace Array */

// Array.from {{{
// Production steps of ECMA-262, Edition 6, 22.1.2.1
if (!Array.from) {
  /**
   * Creates a new, shallow-copied Array instance from an array-like or iterable object. {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from|MDN}
   * @function from
   * @memberof Array
   * @param {*} arrayLike - An array-like or iterable object to convert to an array.
   * @return {array} A new Array instance.
   * @example
console.dir(Array.from('foo'));
// expected output: Array ["f", "o", "o"]

console.dir(Array.from([1, 2, 3], function (x) { return x + x; }));
// expected output: Array [2, 4, 6]
   * @endOfExamples
   */
  Array.from = (function () {
    var toStr = Object.prototype.toString;
    var isCallable = function (fn) {
      return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
    };
    var toInteger = function (value) {
      var number = Number(value);
      if (isNaN(number)) { return 0; }
      if (number === 0 || !isFinite(number)) { return number; }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };
    var maxSafeInteger = Math.pow(2, 53) - 1;
    var toLength = function (value) {
      var len = toInteger(value);
      return Math.min(Math.max(len, 0), maxSafeInteger);
    };

    // The length property of the from method is 1.
    return function from (arrayLike/* , mapFn, thisArg */) {
      // 1. Let C be the this value.
      var C = this;

      // 2. Let items be ToObject(arrayLike).
      // var items = Object(arrayLike);
      var items;
      if (typeof arrayLike === 'string') {
        items = arrayLike.split('');
      } else {
        items = Object(arrayLike);
      }

      // 3. ReturnIfAbrupt(items).
      if (arrayLike == null) {
        throw new Error('Array.from requires an array-like object - not null or undefined');
      }

      // 4. If mapfn is undefined, then let mapping be false.
      var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
      var T;
      if (typeof mapFn !== 'undefined') {
        // 5. else
        // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
        if (!isCallable(mapFn)) {
          throw new Error('Array.from: when provided, the second argument must be a function');
        }

        // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 2) {
          T = arguments[2];
        }
      }

      // 10. Let lenValue be Get(items, "length").
      // 11. Let len be ToLength(lenValue).
      var len = toLength(items.length);

      // 13. If IsConstructor(C) is true, then
      // 13. a. Let A be the result of calling the [[Construct]] internal method
      // of C with an argument list containing the single item len.
      // 14. a. Else, Let A be ArrayCreate(len).
      var A = isCallable(C) ? Object(new C(len)) : new Array(len);

      // 16. Let k be 0.
      var k = 0;
      // 17. Repeat, while k < len… (also steps a - h)
      var kValue;
      while (k < len) {
        kValue = items[k];

        if (mapFn) {
          A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
        } else {
          A[k] = kValue;
        }
        k += 1;
      }
      // 18. Let putStatus be Put(A, "length", len, true).
      A.length = len;
      // 20. Return A.
      return A;
    };
  }());
} // }}}

// Array.isArray {{{
if (!Array.isArray) {
  /**
   * Determines whether the passed value is an Array. {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray|MDN}
   * @function isArray
   * @memberof Array
   * @param {*} value - The value to be checked.
   * @return {boolean} - true if the value is an Array; otherwise, false.
   * @example
Array.isArray([1, 2, 3]);  // true
Array.isArray({ foo: 123 }); // false
Array.isArray('foobar');   // false
Array.isArray(undefined);  // false
   * @endOfExamples
   */
  Array.isArray = function (value) {
    return Object.prototype.toString.call(value) === '[object Array]';
  };
} // }}}

/**
 * @namespace Array.prototype
 * @memberof Array
 */

/**
 * @callback Array~requestCallback
 * @param {*} element - The current element being processed in the array.
 * @param {number} [index] - The index of the current element being processed in the array.
 * @param {array} [array] - The array function was called upon.
 */

// Array.prototype.filter {{{
if (!Array.prototype.filter) {
  /**
   * Creates a new array with all elements that pass the test implemented by the provided function. {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter|MDN}
   * @function filter
   * @memberof Array.prototype
   * @param {Array~requestCallback} callback - Function to execute on each value in the array, taking 3 arguments
   * @param {*} [thisArg] - Value to use as this when executing callback.
   * @return {array} A new array with the elements that pass the test
   * @example
var words = ['spray', 'limit', 'elite', 'exuberant', 'destruction', 'present'];
var result = words.filter((function (word) { return word.length > 6; }));
console.dir(result);
// expected output: Array ["exuberant", "destruction", "present"]
   * @endOfExamples
   */
  Array.prototype.filter = function (callback, thisArg) {
    'use strict';
    if (!((typeof callback === 'Function' || typeof callback === 'function') && this)) {
      throw new Error();
    }

    var len = this.length >>> 0;
    var res = new Array(len); // preallocate array
    var t = this, c = 0, i = -1;

    var kValue;
    if (thisArg === undefined) {
      while (++i !== len) {
        // checks to see if the key was set
        if (i in this) {
          kValue = t[i]; // in case t is changed in callback
          if (callback(t[i], i, t)) res[c++] = kValue;
        }
      }
    } else {
      while (++i !== len) {
        // checks to see if the key was set
        if (i in this) {
          kValue = t[i];
          if (callback.call(thisArg, t[i], i, t)) res[c++] = kValue;
        }
      }
    }

    res.length = c; // shrink down array to proper size
    return res;
  };
} // }}}

// Array.prototype.find {{{
// https://tc39.github.io/ecma262/#sec-array.prototype.find
if (!Array.prototype.find) {
  /**
   * Returns the value of the first element in the provided array that satisfies the provided testing function. From ECMAScript 2015 (6th Edition, ECMA-262). {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find|MDN}
   * @function find
   * @memberof Array.prototype
   * @param {Array~requestCallback} callback - Function to execute on each value in the array, taking 3 arguments
   * @param {*} [thisArg] - Value to use as this when executing callback.
   * @return {*} - The value of the first element in the array that satisfies the provided testing function. Otherwise, undefined is returned.
   * @example
var array1 = [5, 12, 8, 130, 44];

var found = array1.find(function (element) {
  return element > 10;
});

console.log(found); // expected output: 12
   * @endOfExamples
   */
  Array.prototype.find = function (callback) {
    // 1. Let O be ? ToObject(this value).
    if (this == null) {
      throw new Error('"this" is null or not defined');
    }

    var o = Object(this);

    // 2. Let len be ? ToLength(? Get(O, "length")).
    var len = o.length >>> 0;

    // 3. If IsCallable(callback) is false, throw a TypeError exception.
    if (typeof callback !== 'function') {
      throw new Error('callback must be a function');
    }

    // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
    var thisArg = arguments[1];

    // 5. Let k be 0.
    var k = 0;

    // 6. Repeat, while k < len
    while (k < len) {
      // a. Let Pk be ! ToString(k).
      // b. Let kValue be ? Get(O, Pk).
      // c. Let testResult be ToBoolean(? Call(callback, T, « kValue, k, O »)).
      // d. If testResult is true, return kValue.
      var kValue = o[k];
      if (callback.call(thisArg, kValue, k, o)) {
        return kValue;
      }
      // e. Increase k by 1.
      k++;
    }

    // 7. Return undefined.
    return undefined;
  };
} // }}}

// Array.prototype.findIndex {{{
// https://tc39.github.io/ecma262/#sec-array.prototype.find
if (!Array.prototype.findIndex) {
  /**
   * Returns the index of the first element in the array that satisfies the provided testing function. From ECMAScript 2015 (6th Edition, ECMA-262). {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex|MDN}
   * @function findIndex
   * @memberof Array.prototype
   * @param {Array~requestCallback} callback - A function to execute on each value in the array until the function returns true, indicating that the satisfying element was found. It takes three arguments
   * @param {*} [thisArg] - Optional object to use as this when executing callback.
   * @return {number} - The index of the first element in the array that passes the test. Otherwise, -1.
   * @example
var array1 = [5, 12, 8, 130, 44];

function findFirstLargeNumber(element) { return element > 13; }

console.log(array1.findIndex(findFirstLargeNumber)); // expected output: 3
   * @endOfExamples
   */
  Array.prototype.findIndex = function (callback) {
    if (this === null) {
      throw new Error('Array.prototype.findIndex called on null or undefined');
    }
    if (typeof callback !== 'function') {
      throw new Error('callback must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (callback.call(thisArg, value, i, list)) {
        return i;
      }
    }
    return -1;
  };
} // }}}

// Array.prototype.forEach {{{
// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
if (!Array.prototype.forEach) {
  /**
   * Executes a provided function once for each array element. From ECMA-262 5.1 edition. {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach|MDN}
   * @function forEach
   * @memberof Array.prototype
   * @param {Array~requestCallback} callback - Function to execute on each element. It accepts between one and three arguments.
   * @param {*} [thisArg] - Value to use as this when executing callback.
   * @return {void}
   * @example
var array1 = ['a', 'b', 'c'];

array1.forEach(function (element) { console.dir(element); });
// expected output: "a"
// expected output: "b"
// expected output: "c"
   * @endOfExamples
   */
  Array.prototype.forEach = function (callback/* , thisArg */) {
    var T, k;

    if (this == null) {
      throw new Error('this is null or not defined');
    }

    // 1. Let O be the result of calling toObject() passing the
    // |this| value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get() internal
    // method of O with the argument "length".
    // 3. Let len be toUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If isCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== 'function') {
      throw new Error(callback + ' is not a function');
    }

    // 5. If thisArg was supplied, let T be thisArg; else let
    // T be undefined.
    if (arguments.length > 1) {
      T = arguments[1];
    }

    // 6. Let k be 0.
    k = 0;

    // 7. Repeat while k < len.
    while (k < len) {

      var kValue;

      // a. Let Pk be ToString(k).
      //    This is implicit for LHS operands of the in operator.
      // b. Let kPresent be the result of calling the HasProperty
      //    internal method of O with argument Pk.
      //    This step can be combined with c.
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal
        // method of O with argument Pk.
        kValue = O[k];

        // ii. Call the Call internal method of callback with T as
        // the this value and argument list containing kValue, k, and O.
        callback.call(T, kValue, k, O);
      }
      // d. Increase k by 1.
      k++;
    }
    // 8. return undefined.
  };
} // }}}

// Array.prototype.includes {{{
if (!Array.prototype.includes) {
  /**
   * Determines whether an array includes a certain value among its entries. From ECMA-262 5.1 edition.{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes|MDN}
   * @function includes
   * @memberof Array.prototype
   * @param {*} valueToFind - The value to search for
   * @param {number} [fromIndex=0] - The position in this array at which to begin searching for valueToFind.
   * @return {boolean} which is true if the value valueToFind is found within the array
   * @example
var pets = ['cat', 'dog', 'bat'];
console.log(pets.includes('cat'));
// expected output: true
   * @endOfExamples
   */
  Object.defineProperty(Array.prototype, 'includes', {
    value: function (valueToFind, fromIndex) {

      // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new Error('"this" is null or not defined');
      }

      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If len is 0, return false.
      if (len === 0) {
        return false;
      }

      // 4. Let n be ? ToInteger(fromIndex).
      //    (If fromIndex is undefined, this step produces the value 0.)
      var n = fromIndex | 0;

      // 5. If n ≥ 0, then
      //  a. Let k be n.
      // 6. Else n < 0,
      //  a. Let k be len + n.
      //  b. If k < 0, let k be 0.
      var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

      function sameValueZero (x, y) {
        return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
      }

      // 7. Repeat, while k < len
      while (k < len) {
        // a. Let elementK be the result of ? Get(O, ! ToString(k)).
        // b. If SameValueZero(valueToFind, elementK) is true, return true.
        // c. Increase k by 1.
        if (sameValueZero(o[k], valueToFind)) {
          return true;
        }
        k++;
      }

      // 8. Return false
      return false;
    }
  });
} // }}}

// Array.prototype.indexOf {{{
// Production steps of ECMA-262, Edition 5, 15.4.4.14
// Reference: http://es5.github.io/#x15.4.4.14
if (!Array.prototype.indexOf) {
  /**
   * Returns the first index at which a given element can be found in the array. From ECMA-262 5.1 edition.{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf|MDN}
   * @function indexOf
   * @memberof Array.prototype
   * @param {*} searchElement - Element to locate in the array.
   * @param {number} [fromIndex=0] - The index to start the search at.
   * @return {number} - The first index of the element in the array; -1 if not found.
   * @example
var array = [2, 9, 9];
array.indexOf(2);     // 0
array.indexOf(7);     // -1
   * @endOfExamples
   */
  Array.prototype.indexOf = function (searchElement, fromIndex) {
    'use strict';
    var k;

    // 1. ToObject に this 値を引数として渡した結果を
    // o とします。
    if (this == null) {
      throw new Error('"this" is null or not defined');
    }

    var o = Object(this);

    // 2. "length" を引数として o の Get 内部メソッドを呼んだ結果を
    //    lenValue とします。
    // 3. ToUint32(lenValue) を len とします。
    var len = o.length >>> 0;

    // 4. len が 0 の場合、-1 を返します。
    if (len === 0) {
      return -1;
    }

    // 5. n を fromIndex 引数が存在する場合は ToInteger(fromIndex) と、
    //    存在しない場合は 0 とします。
    var n = fromIndex | 0;

    // 6. n が len 以上の場合 -1 を返します。
    if (n >= len) {
      return -1;
    }

    // 7. n が 0 以上の場合 k を n とします。
    // 8. n が 0 未満の場合 k を len - abs(n) とします。
    //    k が 0 未満の場合 k を 0 とします。
    k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

    // 9. k が len 未満の間は以下を繰り返します。
    for (; k < len; k++) {
      // a. Pk を ToString(k) とします。
      //   これは暗黙的に in 演算子の左辺値です。
      // b. kPresent を Pk を引数として o の
      //    HasProperty 内部メソッドを呼んだ結果とします。
      //   このステップは c と組み合わせることができます。
      // c. kPresent が真の場合
      //    i.  elementK を ToString(k) を引数として
      //        o の [[Get]] 内部メソッドを呼んだ結果とします。
      //   ii.  same を searchElement と elementK で
      //        厳密な同一比較アルゴリズムを行った結果とします。
      //  iii.  same が真の場合 k を返します。
      if (k in o && o[k] === searchElement) return k;
    }
    return -1;
  };
} // }}}

// Array.prototype.map {{{
// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.io/#x15.4.4.19
if (!Array.prototype.map) {
  /**
   * Creates a new array populated with the results of calling a provided function on every element in the calling array. From ECMA-262 5.1 edition. {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map|MND}
   * @function map
   * @memberof Array.prototype
   * @param {Array~requestCallback} callback - Function that is called for every element of the array. Each time callback executes, the returned value is added to the new array.
   * @param {*} [thisArg] - Value to use as this when executing callback.
   * @return {array} - A new array with each element being the result of the callback function.
   * @example
var array1 = [1, 4, 9, 16];
var map1 = array1.map(function (x) { return x * 2; });
console.dir(map1); // expected output: Array [2, 8, 18, 32]
   * @endOfExamples
   */
  Array.prototype.map = function (callback/* , thisArg */) {
    var T, A, k;

    if (this == null) {
      throw new Error('this is null or not defined');
    }

    // 1. Let O be the result of calling ToObject passing the |this|
    //    value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal
    //    method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== 'function') {
      throw new Error(callback + ' is not a function');
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (arguments.length > 1) {
      T = arguments[1];
    }

    // 6. Let A be a new array created as if by the expression new Array(len)
    //    where Array is the standard built-in constructor with that name and
    //    len is the value of len.
    A = new Array(len);

    // 7. Let k be 0
    k = 0;

    // 8. Repeat, while k < len
    while (k < len) {
      var kValue, mappedValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal
      //    method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal
        //    method of O with argument Pk.
        kValue = O[k];

        // ii. Let mappedValue be the result of calling the Call internal
        //     method of callback with T as the this value and argument
        //     list containing kValue, k, and O.
        mappedValue = callback.call(T, kValue, k, O);

        // iii. Call the DefineOwnProperty internal method of A with arguments
        // Pk, Property Descriptor
        // { Value: mappedValue,
        //   Writable: true,
        //   Enumerable: true,
        //   Configurable: true },
        // and false.

        // In browsers that support Object.defineProperty, use the following:
        // Object.defineProperty(A, k, {
        //   value: mappedValue,
        //   writable: true,
        //   enumerable: true,
        //   configurable: true
        // });

        // For best browser support, use the following:
        A[k] = mappedValue;
      }
      // d. Increase k by 1.
      k++;
    }

    // 9. return A
    return A;
  };
} // }}}

// Array.prototype.reduce {{{
if (!Array.prototype.reduce) {
  /**
   * Executes a reducer function (that you provide) on each element of the array, resulting in a single output value. From ECMA-262 5.1 edition. {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce|MDN}
   * @function reduce
   * @memberof Array.prototype
   * @param {reducerCallback} callback - A function to execute on each element in the array (except for the first, if no initialValue is supplied).
   * @param {*} [initialValue] - Value to use as this when executing callback.
   * @return {*} - The single value that results from the reduction.
   * @example
var array1 = [1, 2, 3, 4];
var reducer = function (accumulator, currentValue) {
  return accumulator + currentValue;
}

// 1 + 2 + 3 + 4
console.log(array1.reduce(reducer)); // expected output: 10

// 5 + 1 + 2 + 3 + 4
console.log(array1.reduce(reducer, 5)); // expected output: 15
   * @endOfExamples
   */
  Array.prototype.reduce = function reduce (callback) {
    /**
     * @typedef {Object} reducerCallback
     * @property {*} accumulator - The accumulator accumulates callback's return values. It is the accumulated value previously returned in the last invocation of the callback—or initialValue, if it was supplied
     * @property {*} element - The current element being processed in the array.
     * @property {number} [index] - The index of the current element being processed in the array.
     * @property {array} [array] - The array function was called upon.
     */

    if (this === null || this === undefined) {
      throw new Error('Object is null or undefined');
    }

    var i = 0, l = this.length >> 0, curr;

    // ES5 : 'If IsCallable (callbackfn) is false, throw a TypeError exception.'
    if (typeof callback !== 'function') {
      throw new Error('First argument is not callable');
    }

    if (arguments.length < 2) {
      if (l === 0) {
        throw new Error('Array length is 0 and no second argument');
      }

      curr = this[0];
      i = 1; // start accumulating at the second element
    } else {
      curr = arguments[1];
    }

    while (i < l) {
      if (i in this) curr = callback.call(undefined, curr, this[i], i, this);
      ++i;
    }

    return curr;
  };
} // }}}

// Array.prototype.some {{{
// Production steps of ECMA-262, Edition 5, 15.4.4.17
// Reference: http://es5.github.io/#x15.4.4.17
if (!Array.prototype.some) {
  /**
   * Method tests whether at least one element in the array passes the test implemented by the provided function. From ECMA-262 5.1 edition. {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some|MDN}
   * @function some
   * @memberof Array.prototype
   * @param {Array~requestCallback} callback - Function to execute on each value in the array, taking 3 arguments
   * @param {*} [thisArg] - Value to use as this when executing callback.
   * @return {boolean} - true if the callback function returns a truthy value for at least one element in the array. Otherwise, false.
   * @example
var array = [1, 2, 3, 4, 5];
var even = function (element) {
  return element % 2 === 0; // checks whether an element is even
};

console.log(array.some(even)); // expected output: true
   * @endOfExamples
   */
  Array.prototype.some = function (fun/* , thisArg */) {
    'use strict';

    if (this == null) {
      throw new Error('Array.prototype.some called on null or undefined');
    }

    if (typeof fun !== 'function') {
      throw new Error();
    }

    var t = Object(this);
    var len = t.length >>> 0;

    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
    for (var i = 0; i < len; i++) {
      if (i in t && fun.call(thisArg, t[i], i, t)) {
        return true;
      }
    }

    return false;
  };
} // }}}

// vim:set foldmethod=marker commentstring=//%s :
