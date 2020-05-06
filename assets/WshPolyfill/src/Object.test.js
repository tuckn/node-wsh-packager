/* globals describe: false */
/* globals test: false */
/* globals expect: false */

describe('Object', function () {
  test('assign', function () { // {{{
    var objA = { b: false, num: 1, ary: [0, 1, 2] };
    var objB = { b: true, num: 2, val: 'valueB' };
    var objAB = Object.assign(objA, objB);

    expect(objAB.b).toBe(true);
    expect(objAB.num).toBe(2);
    expect(objAB.val).toBe('valueB');
    expect(objAB.ary[2]).toBe(2);

    objAB.ary.push(3);
    expect(objAB.ary[3]).toBe(3);
    expect(objA.ary[3]).toBe(3); // it only copies that reference value
  }); // }}}

  test('create', function () { // {{{
    var person = {
      isHuman: false,
      printIntroduction: function () {
        return 'My name is ' + this.name + '. Am I human? ' + this.isHuman;
      }
    };

    var me = Object.create(person);

    me.name = 'Matthew';
    me.isHuman = true;
    expect(me.printIntroduction()).toBe('My name is Matthew. Am I human? true');
  }); // }}}

  test('defineProperty', function () { // {{{
    var object1 = {};

    Object.defineProperty(object1, 'property1', { value: 42, writable: false });

    expect(object1.property1).toBe(42);
    /** @todo throws an error in strict mode */
    expect(function () { object1.property1 = 77; }).toThrowError();
  }); // }}}

  test('setPrototypeOf', function () { // {{{
    var arrayLike = { length: 3, 0: 'a', 1: 'b', 2: 'c' };
    expect(arrayLike.forEach).toBeUndefined();

    Object.setPrototypeOf(arrayLike, Array.prototype);
    expect(arrayLike.forEach).toBeDefined();
  }); // }}}

  test('is', function () { // {{{
    expect(Object.is('foo', 'foo')).toBe(true);
    expect(Object.is('foo', 'bar')).toBe(false);
    expect(Object.is(NaN, NaN)).toBe(true);
    expect(Object.is([1], [1])).toBe(false);

    var foo = { a: 1 };
    var bar = { a: 1 };
    expect(Object.is(foo, foo)).toBe(true); // The same reference values
    expect(Object.is(foo, bar)).toBe(false);
  }); // }}}

  test('keys', function () { // {{{
    var object1 = {
      str: 'Some string',
      num: 42,
      b: false,
      obj: {},
      a: [],
      fn: function () { return; }
    };

    var keys = Object.keys(object1);
    expect(keys[0]).toBe('str');
    expect(keys[1]).toBe('num');
    expect(keys[2]).toBe('b');
    expect(keys[3]).toBe('obj');
    expect(keys[4]).toBe('a');
    expect(keys[5]).toBe('fn');

    // prototype
    var Constractor = function () { this.a = 'A'; this.b = 'B'; };
    Constractor.prototype.c = 'C';

    var instance = new Constractor();
    keys = Object.keys(instance);
    expect(keys.length).toBe(2); // Ignore the prototype
    expect(keys[0]).toBe('a');
    expect(instance[keys[0]]).toBe('A');
    expect(keys[1]).toBe('b');
    expect(instance[keys[1]]).toBe('B');
  }); // }}}

  test('values', function () { // {{{
    var object1 = {
      str: 'Some string',
      num: 42,
      b: false,
      obj: { a: 'A' },
      a: [1, 2, 3],
      fn: function () { return 99; }
    };

    var vals = Object.values(object1);
    expect(vals[0]).toBe('Some string');
    expect(vals[1]).toBe(42);
    expect(vals[2]).toBe(false);
    expect(vals[3].a).toBe('A');
    expect(vals[4][1]).toBe(2);
    expect(vals[5]()).toBe(99);

    // prototype
    var Constractor = function () { this.a = 'A'; this.b = 'B'; };
    Constractor.prototype.c = 'C';

    var instance = new Constractor();
    vals = Object.values(instance);
    expect(vals.length).toBe(2); // Ignore the prototype
    expect(vals[0]).toBe('A');
    expect(vals[1]).toBe('B');
  }); // }}}
});
