/* globals ArrayBuffer: false */
/* globals Int8Array: false */
/* globals Uint8Array: false */
/* globals Uint8ClampedArray: false */
/* globals Int16Array: false */
/* globals Uint16Array: false */
/* globals Int32Array: false */
/* globals Uint32Array: false */
/* globals Float32Array: false */
/* globals Float32Array: false */
/* globals Float64Array: false */

/* globals describe: false */
/* globals test: false */
/* globals expect: false */


var testName;

describe('ArrayBuffer', function () {
  testName = 'ArrayBuffer';
  test(testName, function () { // {{{
    var buf = new ArrayBuffer(4);
    expect(buf.byteLength).toBe(4);
    expect(buf[0]).toBe(undefined);
    expect(buf[1]).toBe(undefined);
    expect(buf[2]).toBe(undefined);
    expect(buf[3]).toBe(undefined);
    // expect(ArrayBuffer.length).toBE(1); @todo
  }); // }}}
});

describe('TypedArray', function () {
  var testName;

  // 8-bits Int

  testName = 'Int8Array';
  test(testName, function () { // {{{
    var bytesSize = 1;
    var buf, i, len;

    // Initialize with Number
    var elementNums = 4;
    buf = new Int8Array(elementNums); // 8bit (1Byte) * 4
    expect(buf.name).toBe('Int8Array');
    expect(buf.BYTES_PER_ELEMENT).toBe(bytesSize);
    expect(buf.length).toBe(elementNums);
    expect(buf.byteLength).toBe(bytesSize * elementNums);

    for (i = 0; i < elementNums; i++) {
      expect(buf[i]).toBe(0);
    }
    expect(buf[elementNums]).toBeUndefined();

    // Initialize with Array
    var expectedPairs = [
      { val: 1, parsed: 1 },
      { val: 0x0A, parsed: 10 },
      { val: 127, parsed: 127 },
      { val: 128, parsed: -128 },
      { val: 255, parsed: -1 },
      { val: 0xff, parsed: -1 },
      { val: 256, parsed: 0 },
      { val: 'A', parsed: 0 },
      { val: 'foo', parsed: 0 }
    ];

    buf = new Int8Array(expectedPairs.map(function (obj) { return obj.val; }));
    expect(buf.name).toBe('Int8Array');
    expect(buf.BYTES_PER_ELEMENT).toBe(bytesSize);
    expect(buf.length).toBe(expectedPairs.length);
    expect(buf.byteLength).toBe(bytesSize * expectedPairs.length);

    for (i = 0, len = expectedPairs.length; i < len; i++) {
      expect(buf[i]).toBe(expectedPairs[i].parsed);
    }
    expect(buf[expectedPairs.length]).toBeUndefined();
  }); // }}}

  testName = 'Uint8Array';
  test(testName, function () { // {{{
    var bytesSize = 1;
    var buf, i, len;

    // Initialize with Number
    var elementNums = 4;
    buf = new Uint8Array(elementNums); // 8bit (1Byte) * 4
    expect(buf.name).toBe('Uint8Array');
    expect(buf.BYTES_PER_ELEMENT).toBe(bytesSize);
    expect(buf.length).toBe(elementNums);
    expect(buf.byteLength).toBe(bytesSize * elementNums);

    for (i = 0; i < elementNums; i++) {
      expect(buf[i]).toBe(0);
    }
    expect(buf[elementNums]).toBeUndefined();

    // Initialize with Array
    var expectedPairs = [
      { val: 1, parsed: 1 },
      { val: 0x0A, parsed: 10 },
      { val: 127, parsed: 127 },
      { val: 128, parsed: 128 },
      { val: 255, parsed: 255 },
      { val: 0xff, parsed: 255 },
      { val: 256, parsed: 0 },
      { val: 'A', parsed: 0 },
      { val: 'foo', parsed: 0 }
    ];

    buf = new Uint8Array(expectedPairs.map(function (obj) { return obj.val; }));
    expect(buf.name).toBe('Uint8Array');
    expect(buf.BYTES_PER_ELEMENT).toBe(bytesSize);
    expect(buf.length).toBe(expectedPairs.length);
    expect(buf.byteLength).toBe(bytesSize * expectedPairs.length);

    for (i = 0, len = expectedPairs.length; i < len; i++) {
      expect(buf[i]).toBe(expectedPairs[i].parsed);
    }
    expect(buf[expectedPairs.length]).toBeUndefined();
  }); // }}}

  testName = 'Uint8ClampedArray';
  test(testName, function () { // {{{
    expect('@todo').toBe('passed');
  }); // }}}

  // 16-bits Int (signed  -> Short, unsigned -> Word)

  testName = 'Int16Array';
  test(testName, function () { // {{{
    var bytesSize = 2;
    var buf, i, len;

    // Initialize with Number
    var elementNums = 4;
    buf = new Int16Array(4); // 16bit (2Byte) * 4
    expect(buf.name).toBe('Int16Array');
    expect(buf.BYTES_PER_ELEMENT).toBe(bytesSize);
    expect(buf.length).toBe(elementNums);
    expect(buf.byteLength).toBe(bytesSize * elementNums);

    for (i = 0; i < elementNums; i++) {
      expect(buf[i]).toBe(0);
    }
    expect(buf[elementNums]).toBeUndefined();

    // Initialize with Array
    var expectedPairs = [
      { val: 1, parsed: 1 },
      { val: 255, parsed: 255 },
      { val: 0x0A, parsed: 10 },
      { val: 0xff, parsed: 255 },
      { val: 256, parsed: 256 },
      { val: 0x7fff, parsed: 32767 },
      { val: 0x8000, parsed: -32768 },
      { val: 0xffff, parsed: -1 },
      { val: 0x10000, parsed: 0 },
      { val: 'foo', parsed: 0 }
    ];

    buf = new Int16Array(expectedPairs.map(function (obj) { return obj.val; }));
    expect(buf.name).toBe('Int16Array');
    expect(buf.BYTES_PER_ELEMENT).toBe(bytesSize);
    expect(buf.length).toBe(expectedPairs.length);
    expect(buf.byteLength).toBe(bytesSize * expectedPairs.length);

    for (i = 0, len = expectedPairs.length; i < len; i++) {
      expect(buf[i]).toBe(expectedPairs[i].parsed);
    }
    expect(buf[expectedPairs.length]).toBeUndefined();
  }); // }}}

  testName = 'Uint16Array';
  test(testName, function () { // {{{
    var bytesSize = 2;
    var buf, i, len;

    // Initialize with Number
    var elementNums = 4;
    buf = new Uint16Array(4); // 16bit (2Byte) * 4
    expect(buf.name).toBe('Uint16Array');
    expect(buf.BYTES_PER_ELEMENT).toBe(bytesSize);
    expect(buf.length).toBe(elementNums);
    expect(buf.byteLength).toBe(bytesSize * elementNums);

    for (i = 0; i < elementNums; i++) {
      expect(buf[i]).toBe(0);
    }
    expect(buf[elementNums]).toBeUndefined();

    // Initialize with Array
    var expectedPairs = [
      { val: 1, parsed: 1 },
      { val: 255, parsed: 255 },
      { val: 0x0A, parsed: 10 },
      { val: 0xff, parsed: 255 },
      { val: 256, parsed: 256 },
      { val: 0x7fff, parsed: 32767 },
      { val: 0x8000, parsed: 32768 },
      { val: 0xffff, parsed: 65535 },
      { val: 0x10000, parsed: 0 },
      { val: 'foo', parsed: 0 }
    ];

    buf = new Uint16Array(expectedPairs.map(function (obj) { return obj.val; }));
    expect(buf.name).toBe('Uint16Array');
    expect(buf.BYTES_PER_ELEMENT).toBe(bytesSize);
    expect(buf.length).toBe(expectedPairs.length);
    expect(buf.byteLength).toBe(bytesSize * expectedPairs.length);

    for (i = 0, len = expectedPairs.length; i < len; i++) {
      expect(buf[i]).toBe(expectedPairs[i].parsed);
    }
    expect(buf[expectedPairs.length]).toBeUndefined();
  }); // }}}

  // 32-bits Int (Long)

  testName = 'Int32Array';
  test(testName, function () { // {{{
    var bytesSize = 4;
    var buf, i, len;

    // Initialize with Number
    var elementNums = 4;
    buf = new Int32Array(4); // 32bit (4Byte) * 4
    expect(buf.name).toBe('Int32Array');
    expect(buf.BYTES_PER_ELEMENT).toBe(bytesSize);
    expect(buf.length).toBe(elementNums);
    expect(buf.byteLength).toBe(bytesSize * elementNums);

    for (i = 0; i < elementNums; i++) {
      expect(buf[i]).toBe(0);
    }
    expect(buf[elementNums]).toBeUndefined();

    // Initialize with Array
    var expectedPairs = [
      { val: 1, parsed: 1 },
      { val: 255, parsed: 255 },
      { val: 0x0A, parsed: 10 },
      { val: 0xff, parsed: 255 },
      { val: 256, parsed: 256 },
      { val: 0x7fff, parsed: 32767 },
      { val: 0x8000, parsed: 32768 },
      { val: 0xffff, parsed: 65535 },
      { val: 0x10000, parsed: 65536 },
      { val: 0x7fffffff, parsed: 2147483647 },
      { val: 0x80000000, parsed: -2147483648 },
      { val: 0xffffffff, parsed: -1 },
      { val: 0x100000000, parsed: 0 },
      { val: 'foo', parsed: 0 }
    ];

    buf = new Int32Array(expectedPairs.map(function (obj) { return obj.val; }));
    expect(buf.name).toBe('Int32Array');
    expect(buf.BYTES_PER_ELEMENT).toBe(bytesSize);
    expect(buf.length).toBe(expectedPairs.length);
    expect(buf.byteLength).toBe(bytesSize * expectedPairs.length);

    for (i = 0, len = expectedPairs.length; i < len; i++) {
      expect(buf[i]).toBe(expectedPairs[i].parsed);
    }
    expect(buf[expectedPairs.length]).toBeUndefined();
  }); // }}}

  testName = 'Uint32Array';
  test(testName, function () { // {{{
    var bytesSize = 4;
    var buf, i, len;

    // Initialize with Number
    var elementNums = 4;
    buf = new Uint32Array(4); // 32bit (4Byte) * 4
    expect(buf.name).toBe('Uint32Array');
    expect(buf.BYTES_PER_ELEMENT).toBe(bytesSize);
    expect(buf.length).toBe(elementNums);
    expect(buf.byteLength).toBe(bytesSize * elementNums);

    for (i = 0; i < elementNums; i++) {
      expect(buf[i]).toBe(0);
    }
    expect(buf[elementNums]).toBeUndefined();

    // Initialize with Array
    var expectedPairs = [
      { val: 1, parsed: 1 },
      { val: 255, parsed: 255 },
      { val: 0x0A, parsed: 10 },
      { val: 0xff, parsed: 255 },
      { val: 256, parsed: 256 },
      { val: 0x7fff, parsed: 32767 },
      { val: 0x8000, parsed: 32768 },
      { val: 0xffff, parsed: 65535 },
      { val: 0x10000, parsed: 65536 },
      { val: 0x7fffffff, parsed: 2147483647 },
      { val: 0x80000000, parsed: 2147483648 },
      { val: 0xffffffff, parsed: 4294967295 },
      { val: 0x100000000, parsed: 0 },
      { val: 'foo', parsed: 0 }
    ];

    buf = new Uint32Array(expectedPairs.map(function (obj) { return obj.val; }));
    expect(buf.name).toBe('Uint32Array');
    expect(buf.BYTES_PER_ELEMENT).toBe(bytesSize);
    expect(buf.length).toBe(expectedPairs.length);
    expect(buf.byteLength).toBe(bytesSize * expectedPairs.length);

    for (i = 0, len = expectedPairs.length; i < len; i++) {
      expect(buf[i]).toBe(expectedPairs[i].parsed);
    }
    expect(buf[expectedPairs.length]).toBeUndefined();
  }); // }}}

  // 32-bits Float

  testName = 'Float32Array';
  test(testName, function () { // {{{
    expect('@todo').toBe('passed');
  }); // }}}

  // 64-bits Float (Double)

  testName = 'Float64Array';
  test(testName, function () { // {{{
    expect('@todo').toBe('passed');
  }); // }}}
});
