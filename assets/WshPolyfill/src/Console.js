/**
 * @file Add functions of Console to WSH (Windows Script Host {@link https://docs.microsoft.com/en-us/previous-versions//9bbdkx3k(v=vs.85)|Microsoft Docs}). I recommend that JScript File Encoding is UTF-8[BOM, dos]
 * @description JScript 5.8 is similar to ECMA-262 3rd edition. But it doesn't have console Object. This module adds it to JScript.
 * @requires wscript.exe/cscript.exe
 * @author Tuckn <tuckn333+github@gmail.com>
 * @license MIT
 * @see {@link https://github.com/tuckn/JScriptPolyfill|GitHub}
 */

if (!console) {
  /**
   * @global
   * @namespace
   * @type {Object}
   */
  var console = {}; /* eslint no-redeclare: "off" */

  (function () {
    var _protoTypeOf = function (val) {
      if (val === undefined) return 'undefined';
      if (val === null) return 'null';
      return Object.prototype.toString.call(val).slice(8, -1);
    };

    var _toDirString = function (val, indent) {
      indent = indent || '';
      var newIndent = '  ' + indent;
      var type = _protoTypeOf(val);
      var r = '';
      var i, I, p;

      if (type === 'undefined' || type === 'null') {
        r = type;
      } else if (val === true) {
        r = 'true';
      } else if (val === false) {
        r = 'false';
      } else if (val === Infinity) {
        r = 'Infinity';
      } else if (typeof(val) === 'unknown') { /* eslint valid-typeof: "off" */
        r = val;
      } else if (type === 'String') {
        r = '"' + val + '"';
      } else if (type === 'Number') {
        r = isNaN(val) ? 'NaN' : String(val);
      } else if (type === 'Object') {
        r = '{\n';

        for (p in Object(val)) {
          r += newIndent + p + ': ' + _toDirString(val[p], newIndent) + ',\n';
        }

        r = r.replace(/,\n$/, '\n');
        r += indent + '}';
      } else if (type === 'Array') {
        r = '[\n';

        for (i = 0, I = val.length; i < I; i++) {
          r += newIndent + i + ': ' + _toDirString(val[i], newIndent) + ',\n';
        }

        r = r.replace(/,\n$/, '\n');
        r += indent + ']';

      /** .toString()は"[object Error]"しか表示しないので、ちゃんと表示されるようにする。 {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/toString|MDN} */
      } else if (type === 'Error') {
        r = (!val.name ? 'Error' : String(val.name)) + ': ';

        /**
         * @todo 10進数のエラーコードを16進数に変換した方が良い？？
         * (e.g. -2146825284 -> FFFFFFFF800A0BBC -> 800A0BBC)
         * (e.number & 0xFFFF)でできる？
         * Windowsが出すエラーは800A0BBCの部分みたい
         * -2146825284をビット反転すればできる？
         */
        r += '[' + (!val.number ? '' : String(val.number)) + '] ';
        r += !val.message ? '' : val.message;
      } else {
        // @todo for Buffer
        r = String(val);
      }

      return r;
    };

    console._protoTypeOf = _protoTypeOf; // Shorthand
    console._toDirString = _toDirString;

    // console.log {{{
    /**
     * @function log
     * @memberof console
     * @param {*} val
     * @return {void}
     */
    console.log = function (val) {
      WScript.Echo(val);
    }; // }}}

    // console.dir {{{
    /**
     * Output parsed val as StdOut
     * @function dir
     * @memberof console
     * @param {*} val
     * @return {void}
     */
    console.dir = function (val) {
      WScript.Echo(_toDirString(val));
    }; // }}}

    // console.info {{{
    /**
     * Output val as StdOut
     * @function info
     * @memberof console
     * @param {*} val
     * @return {void}
     */
    console.info = function (val) {
      WScript.StdOut.Write(val + '\r\n');
    }; // }}}

    // console.error {{{
    /**
     * Output val as StdErr
     * @function error
     * @memberof console
     * @param {*} val
     * @return {void}
     */
    console.error = function (val) {
      WScript.StdErr.Write(val + '\r\n');
    }; // }}}

    // console.debug {{{
    /**
     * Only display If WSH_ENV=development defining in process.env. Require {@link Wsh.OS}
     * @function debug
     * @memberof console
     * @param {*} val
     * @return {void}
     */
    console.debug = function (val) {
      Object.keys(Wsh.OS._envVars).some(function (envName) {
        if (envName !== 'WSH_ENV') return false;
        if (Wsh.OS._envVars[envName] !== 'development') return false;
        WScript.Echo(_toDirString(val));
        return true;
      });
    }; // }}}

    // console.assert {{{
    /**
     * If ok is true, output val as StdErr
     * @function assert
     * @memberof console
     * @param {boolean} ok
     * @param {*} val
     * @return {void}
     */
    console.assert = function (ok, val) {
      if (!ok) console.error(val);
    }; // }}}

    // console.popup {{{
    /**
     * Popup a window
     * @function popup
     * @memberof console
     * @param {*} val
     * @param {number} [dispSec=0]
     * @param {number} [btnCode=0]
     * @param {number} [icoCode=64] - Icon Type. 16: Stop, 32: Question, 48: Exclamation, 64: Information
     * @return {void}
     */
    console.popup = function (val, dispSec, btnCode, icoCode) {
      if (_protoTypeOf(dispSec) !== 'Number') dispSec = 0;
      if (_protoTypeOf(btnCode) !== 'Number') btnCode = 0;
      if (_protoTypeOf(icoCode) !== 'Number') icoCode = 64;

      Wsh.Shell.Popup(_toDirString(val), (dispSec, 10), 'JScriptExtension', parseInt(btnCode, 10) + parseInt(icoCode, 10));
    }; // }}}
  })();
}

// vim:set foldmethod=marker commentstring=//%s :
