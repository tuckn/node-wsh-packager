/* globals describe: false */
/* globals test: false */
/* globals expect: false */

describe('Function', function () {
  test('bind', function () { // {{{
    var module = {
      x: 42,
      getX: function () { return this.x; }
    };

    var unboundGetX = module.getX;
    expect(unboundGetX()).toBeUndefined();

    var boundGetX = unboundGetX.bind(module);
    expect(boundGetX()).toBe(42);
  }); // }}}

  test('bind A preset argument', function () { // {{{
    function addArguments (arg1, arg2) { return arg1 + arg2; }

    expect(addArguments(1, 2)).toBe(3);

    var addThirtySeven = addArguments.bind(null, 37);
    expect(addThirtySeven()).toBeNaN(); // 37 + undefined = NaN
    expect(addThirtySeven(5)).toBe(42); // 37 + 5 = 42
    expect(addThirtySeven(5, 10)).toBe(42); // 37 + 5 = 42
  }); // }}}
});
