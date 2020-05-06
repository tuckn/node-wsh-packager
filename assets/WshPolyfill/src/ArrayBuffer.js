/**
 * @file [W.I.P] Add TypedArray classes to WSH (Windows Script Host {@link https://docs.microsoft.com/en-us/previous-versions//9bbdkx3k(v=vs.85)|Microsoft Docs}).
 * @requires wscript.exe/cscript.exe
 * @requires ./Function.js
 * @requires ./Object.js
 * @requires ./Array.js
 * @author Tuckn <tuckn333+github@gmail.com>
 * @license MIT
 * @see {@link https://github.com/tuckn/JScriptPolyfill|GitHub}
 */

// @ts-noCheck

// ArrayBuffer {{{
if (!ArrayBuffer) {
  var ArrayBuffer;

  (function () {
    var _protoTypeOf = console._protoTypeOf; // Shorthand

    /**
     * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer|MDN ArrayBuffer}
     * @name ArrayBuffer
     * @constructor
     * @param {number} [length]
     * @return {TypedArray}
     */
    ArrayBuffer = function (length) {
      // constructor
      this.BITS_PER_BYTE = 8;
      this.BYTES_PER_ELEMENT;
      this.byteLength = 0;
      this.length = 1;

      if (_protoTypeOf(length) !== 'Number') return;

      this.byteLength = length;
      this._bytes = [];
      for (var i = 0; i < this.length; i++) this._bytes[i] = 0;

      // _parseValToUdec {{{
      /**
       * Parse the value to unsigined decimal numbers.
       * @param {any} val
       * @param {number} elementWidth
       * @return {number}
       */
      this._parseValToUdec = function (val, elementWidth) {
        var parsedToUdec = parseInt(val, 10) % elementWidth;
        if (isNaN(parsedToUdec)) parsedToUdec = 0;
        return parsedToUdec;
      }; // }}}
    };
  }());
} // }}}

// TypedArray

// 8-bits Int

// Int8Array {{{
if (!Int8Array) {
  var Int8Array;

  (function () {
    var _protoTypeOf = console._protoTypeOf; // Shorthand

    /**
     * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int8Array|MDN Int8Array}
     * @name Int8Array
     * @constructor
     * @param {(number|number[])} [param] - length, typedArray, object, buffer
     * @return {Int8Array}
     */
    Int8Array = function (param) {
      // constructor
      var _length;
      if (_protoTypeOf(param) === 'Number') {
        _length = param;
      } else if (_protoTypeOf(param) === 'Array') {
        _length = param.length;
      }

      var _bytePerElement = 1;
      ArrayBuffer.call(this, _length * _bytePerElement); // super?

      this.length = _length;
      this.name = 'Int8Array';
      this.BYTES_PER_ELEMENT = _bytePerElement;

      var _ELEMENT_WIDTHS = Math.pow(2, this.BITS_PER_BYTE * this.BYTES_PER_ELEMENT);
      var _MAX_POSI_NUMS = _ELEMENT_WIDTHS / 2; // 128 (0x7f)

      // Initialize
      var parsedToDec;
      if (_protoTypeOf(param) === 'Array') {
        for (var i = 0; i < this.length; i++) {
          parsedToDec = this._parseValToUdec(param[i], _ELEMENT_WIDTHS);

          if (parsedToDec >= _MAX_POSI_NUMS) {
            parsedToDec = parsedToDec - _ELEMENT_WIDTHS;
          }

          this[i] = parsedToDec;
        }
      } else {
        for (i = 0; i < this.length; i++) this[i] = 0;
      }
    };

    // Add Array prototypes
    for (var v in Array.prototype) {
      if (Object.prototype.hasOwnProperty.call(Array.prototype, v)
          && !Object.prototype.hasOwnProperty.call(Int8Array.prototype, v)) {
        Int8Array.prototype[v] = Array.prototype[v];
      }
    }
  }());
} // }}}

// Uint8Array {{{
if (!Uint8Array) {
  var Uint8Array;

  (function () {
    var _protoTypeOf = console._protoTypeOf; // Shorthand

    /**
     * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array|MDN Uint8Array}
     * @name Uint8Array
     * @constructor
     * @param {(number|number[])} [param] - length, typedArray, object, buffer
     * @return {Uint8Array}
     */
    Uint8Array = function (param) {
      // constructor
      var _length;
      if (_protoTypeOf(param) === 'Number') {
        _length = param;
      } else if (_protoTypeOf(param) === 'Array') {
        _length = param.length;
      }

      var _bytePerElement = 1;
      ArrayBuffer.call(this, _length * _bytePerElement); // super?

      this.length = _length;
      this.name = 'Uint8Array';
      this.BYTES_PER_ELEMENT = _bytePerElement;

      var _ELEMENT_WIDTHS = Math.pow(2, this.BITS_PER_BYTE * this.BYTES_PER_ELEMENT);
      var _MAX_POSI_NUMS = _ELEMENT_WIDTHS; // 256 (0xff)

      // Initialize
      if (_protoTypeOf(param) === 'Array') {
        for (var i = 0; i < this.length; i++) {
          this[i] = this._parseValToUdec(param[i], _ELEMENT_WIDTHS);
        }
      } else {
        for (i = 0; i < this.length; i++) this[i] = 0;
      }
    };

    // Add Array prototypes
    for (var v in Array.prototype) {
      if (Object.prototype.hasOwnProperty.call(Array.prototype, v)
          && !Object.prototype.hasOwnProperty.call(Uint8Array.prototype, v)) {
        Uint8Array.prototype[v] = Array.prototype[v];
      }
    }
  }());
} // }}}

// @todo Uint8ClampedArray {{{
if (!Uint8ClampedArray) {
  var Uint8ClampedArray;

  (function () {
    /** W.I.P */
  }());
} // }}}

// 16-bits Int (signed  -> Short, unsigned -> Word)

// Int16Array {{{
if (!Int16Array) {
  var Int16Array;

  (function () {
    var _protoTypeOf = console._protoTypeOf; // Shorthand

    /**
     * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int16Array|MDN Int16Array}
     * @name Int16Array
     * @constructor
     * @param {any} [param] - length, typedArray, object, buffer
     * @return {Int16Array}
     */
    Int16Array = function (param) {
      // constructor
      var _length;
      if (_protoTypeOf(param) === 'Number') {
        _length = param;
      } else if (_protoTypeOf(param) === 'Array') {
        _length = param.length;
      }

      var _bytePerElement = 2;
      ArrayBuffer.call(this, _length * _bytePerElement); // super?

      this.length = _length;
      this.name = 'Int16Array';
      this.BYTES_PER_ELEMENT = _bytePerElement;

      var _ELEMENT_WIDTHS = Math.pow(2, this.BITS_PER_BYTE * this.BYTES_PER_ELEMENT);
      var _MAX_POSI_NUMS = _ELEMENT_WIDTHS / 2; // 32768 (0x7fff)

      // Initialize
      var parsedToDec;
      if (_protoTypeOf(param) === 'Array') {
        for (var i = 0; i < this.length; i++) {
          parsedToDec = this._parseValToUdec(param[i], _ELEMENT_WIDTHS);

          if (parsedToDec >= _MAX_POSI_NUMS) {
            parsedToDec = parsedToDec - _ELEMENT_WIDTHS;
          }

          this[i] = parsedToDec;
        }
      } else {
        for (i = 0; i < this.length; i++) this[i] = 0;
      }
    };

    // Add Array prototypes
    for (var v in Array.prototype) {
      if (Object.prototype.hasOwnProperty.call(Array.prototype, v)
          && !Object.prototype.hasOwnProperty.call(Int16Array.prototype, v)) {
        Int16Array.prototype[v] = Array.prototype[v];
      }
    }
  }());
} // }}}

// Uint16Array {{{
if (!Uint16Array) {
  var Uint16Array;

  (function () {
    var _protoTypeOf = console._protoTypeOf; // Shorthand

    /**
     * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint16Array|MDN Uint16Array}
     * @name Uint16Array
     * @constructor
     * @param {any} [param] - length, typedArray, object, buffer
     * @return {Uint16Array}
     */
    Uint16Array = function (param) {
      // constructor
      var _length;
      if (_protoTypeOf(param) === 'Number') {
        _length = param;
      } else if (_protoTypeOf(param) === 'Array') {
        _length = param.length;
      }

      var _bytePerElement = 2;
      ArrayBuffer.call(this, _length * _bytePerElement); // super?

      this.length = _length;
      this.name = 'Uint16Array';
      this.BYTES_PER_ELEMENT = _bytePerElement;

      var _ELEMENT_WIDTHS = Math.pow(2, this.BITS_PER_BYTE * this.BYTES_PER_ELEMENT);
      var _MAX_POSI_NUMS = _ELEMENT_WIDTHS; // 65535 (0xffff)

      // Initialize
      var parsedToDec;
      if (_protoTypeOf(param) === 'Array') {
        for (var i = 0; i < this.length; i++) {
          parsedToDec = this._parseValToUdec(param[i], _ELEMENT_WIDTHS);
          this[i] = parsedToDec;
        }
      } else {
        for (i = 0; i < this.length; i++) this[i] = 0;
      }
    };

    // Add Array prototypes
    for (var v in Array.prototype) {
      if (Object.prototype.hasOwnProperty.call(Array.prototype, v)
          && !Object.prototype.hasOwnProperty.call(Uint16Array.prototype, v)) {
        Uint16Array.prototype[v] = Array.prototype[v];
      }
    }
  }());
} // }}}

// 32-bits Int (Long)

// Int32Array {{{
if (!Int32Array) {
  var Int32Array;

  (function () {
    var _protoTypeOf = console._protoTypeOf; // Shorthand

    /**
     * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int32Array|MDN Int32Array}
     * @name Int32Array
     * @constructor
     * @param {any} [param] - length, typedArray, object, buffer
     * @return {Int32Array}
     */
    Int32Array = function (param) {
      // constructor
      var _length;
      if (_protoTypeOf(param) === 'Number') {
        _length = param;
      } else if (_protoTypeOf(param) === 'Array') {
        _length = param.length;
      }

      var _bytePerElement = 4;
      ArrayBuffer.call(this, _length * _bytePerElement); // super?

      this.length = _length;
      this.name = 'Int32Array';
      this.BYTES_PER_ELEMENT = _bytePerElement;

      var _ELEMENT_WIDTHS = Math.pow(2, this.BITS_PER_BYTE * this.BYTES_PER_ELEMENT);
      var _MAX_POSI_NUMS = _ELEMENT_WIDTHS / 2; // 2147483648 (0x7fffffff)

      // Initialize
      var parsedToDec;
      if (_protoTypeOf(param) === 'Array') {
        for (var i = 0; i < this.length; i++) {
          parsedToDec = this._parseValToUdec(param[i], _ELEMENT_WIDTHS);

          if (parsedToDec >= _MAX_POSI_NUMS) {
            parsedToDec = parsedToDec - _ELEMENT_WIDTHS;
          }

          this[i] = parsedToDec;
        }
      } else {
        for (i = 0; i < this.length; i++) this[i] = 0;
      }
    };

    // Add Array prototypes
    for (var v in Array.prototype) {
      if (Object.prototype.hasOwnProperty.call(Array.prototype, v)
          && !Object.prototype.hasOwnProperty.call(Int32Array.prototype, v)) {
        Int32Array.prototype[v] = Array.prototype[v];
      }
    }
  }());
} // }}}

// Uint32Array {{{
if (!Uint32Array) {
  var Uint32Array;

  (function () {
    var _protoTypeOf = console._protoTypeOf; // Shorthand

    /**
     * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint32Array|MDN Uint32Array}
     * @name Uint32Array
     * @constructor
     * @param {any} [param] - length, typedArray, object, buffer
     * @return {Uint32Array}
     */
    Uint32Array = function (param) {
      // constructor
      var _length;
      if (_protoTypeOf(param) === 'Number') {
        _length = param;
      } else if (_protoTypeOf(param) === 'Array') {
        _length = param.length;
      }

      var _bytePerElement = 4;
      ArrayBuffer.call(this, _length * _bytePerElement); // super?

      this.length = _length;
      this.name = 'Uint32Array';
      this.BYTES_PER_ELEMENT = _bytePerElement;

      var _ELEMENT_WIDTHS = Math.pow(2, this.BITS_PER_BYTE * this.BYTES_PER_ELEMENT);
      var _MAX_POSI_NUMS = _ELEMENT_WIDTHS; // 4294967295 (0xffffffff)

      // Initialize
      var parsedToDec;
      if (_protoTypeOf(param) === 'Array') {
        for (var i = 0; i < this.length; i++) {
          parsedToDec = this._parseValToUdec(param[i], _ELEMENT_WIDTHS);
          this[i] = parsedToDec;
        }
      } else {
        for (i = 0; i < this.length; i++) this[i] = 0;
      }
    };

    // Add Array prototypes
    for (var v in Array.prototype) {
      if (Object.prototype.hasOwnProperty.call(Array.prototype, v)
          && !Object.prototype.hasOwnProperty.call(Uint32Array.prototype, v)) {
        Uint32Array.prototype[v] = Array.prototype[v];
      }
    }
  }());
} // }}}

// 32-bits Float

// @todo Float32Array {{{
if (!Float32Array) {
  var Float32Array;

  (function () {
    /** W.I.P */
  }());
} // }}}

// 64-bits Float (Double)

// @todo Float64Array {{{
if (!Float64Array) {
  var Float64Array;

  (function () {
    /** W.I.P */
  }());
} // }}}

// DataView

// DataView {{{
if (!DataView) {
  var DataView;

  (function () {
    var _protoTypeOf = console._protoTypeOf; // Shorthand

    /**
     * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView|MDN DataView}
     * @name DataView
     * @constructor
     * @param {number} [length]
     * @return {TypedArray}
     */
    DataView = function (length) {
      // constructor
      this.BITS_PER_BYTE = 8;
      this.BYTES_PER_ELEMENT;
      this.byteLength = 0;
      this.length = 1;

      if (_protoTypeOf(length) !== 'Number') return;

      this.byteLength = length;
    };
  }());
} // }}}

// vim:set foldmethod=marker commentstring=//%s :
