/* globals describe: false */
/* globals test: false */
/* globals expect: false */

describe('console', function () {
  test('_toDirString', function () { // {{{
    expect(console._toDirString(undefined)).toBe('undefined');
    expect(console._toDirString(null)).toBe('null');
    expect(console._toDirString(true)).toBe('true');
    expect(console._toDirString(false)).toBe('false');
    expect(console._toDirString(NaN)).toBe('NaN');
    expect(console._toDirString(Infinity)).toBe('Infinity');
    expect(console._toDirString('Hello world!')).toBe('"Hello world!"');
    expect(console._toDirString('  ')).toBe('"  "');
    expect(console._toDirString([1, NaN, '3'])).toBe('[\n'
      + '  0: 1,\n'
      + '  1: NaN,\n'
      + '  2: "3"\n'
      + ']');
    expect(console._toDirString({ a: [1, 2], b: true, o: { c: 'C' } })).toBe('{\n'
      + '  a: [\n'
      + '    0: 1,\n'
      + '    1: 2\n'
      + '  ],\n'
      + '  b: true,\n'
      + '  o: {\n'
      + '    c: "C"\n'
      + '  }\n'
      + '}');
  }); // }}}

  test('log', function () { // {{{
    expect('@todo').toBe('passed');
  }); // }}}

  test('dir', function () { // {{{
    expect('@todo').toBe('passed');
  }); // }}}

  test('info', function () { // {{{
    expect('@todo').toBe('passed');
  }); // }}}

  test('error', function () { // {{{
    expect('@todo').toBe('passed');
  }); // }}}

  test('debug', function () { // {{{
    expect('@todo').toBe('passed');
  }); // }}}

  test('assert', function () { // {{{
    expect('@todo').toBe('passed');
  }); // }}}

  test('popup', function () { // {{{
    expect('@todo').toBe('passed');
  }); // }}}
});
