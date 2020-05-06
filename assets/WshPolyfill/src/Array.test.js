/* globals describe: false */
/* globals test: false */
/* globals expect: false */

// Shorthand
var _cb = function (fn/* , args */) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function () { fn.apply(null, args); };
};

describe('Array', function () {
  test('from', function () { // {{{
    var foo = Array.from('foo');
    expect(foo.length).toBe(3);
    expect(foo[0]).toBe('f');
    expect(foo[1]).toBe('o');
    expect(foo[2]).toBe('o');

    var wVals = Array.from([1, 2, 3], function (x) { return x + x; });
    expect(wVals.length).toBe(3);
    expect(wVals[0]).toBe(2);
    expect(wVals[1]).toBe(4);
    expect(wVals[2]).toBe(6);

    expect(Array.from({ a: 'A', b: 'B', c: 'C' })).toHaveLength(0);
    expect(Array.from({})).toHaveLength(0);
    expect(Array.from([])).toHaveLength(0);
    expect(Array.from('')).toHaveLength(0);
    expect(Array.from(NaN)).toHaveLength(0);
    expect(Array.from(Infinity)).toHaveLength(0);
    expect(Array.from(1)).toHaveLength(0);
    expect(Array.from(true)).toHaveLength(0);
    expect(Array.from(false)).toHaveLength(0);
    expect(_cb(Array.from, null)).toThrowError();
    expect(_cb(Array.from, undefined)).toThrowError();
  }); // }}}

  test('isArray', function () { // {{{
    // All following calls return ture
    expect(Array.isArray([])).toBe(true);
    expect(Array.isArray([1, 2, 3])).toBe(true);
    expect(Array.isArray(new Array())).toBe(true);
    expect(Array.isArray(Array.prototype)).toBe(true);
    // All following calls return false
    expect(Array.isArray()).toBe(false);
    expect(Array.isArray(undefined)).toBe(false);
    expect(Array.isArray(null)).toBe(false);
    expect(Array.isArray(17)).toBe(false);
    expect(Array.isArray('foobar')).toBe(false);
    expect(Array.isArray('Array')).toBe(false);
    expect(Array.isArray(true)).toBe(false);
    expect(Array.isArray(false)).toBe(false);
    expect(Array.isArray({})).toBe(false);
    expect(Array.isArray({ foo: 123 })).toBe(false);
    expect(Array.isArray(function () {})).toBe(false);
  }); // }}}

  test('indexOf', function () { // {{{
    var beasts = ['ant', 'bison', 'camel', 'duck', 'bison'];
    expect(beasts.indexOf('bison')).toBe(1);
    expect(beasts.indexOf('bison', 2)).toBe(4);
    expect(beasts.indexOf('giraffe')).toBe(-1);

    var nums = [2, 9, 9];
    expect(nums.indexOf(2)).toBe(0);
    expect(nums.indexOf(7)).toBe(-1);
    expect(nums.indexOf(9, 2)).toBe(2);
    expect(nums.indexOf(2, -1)).toBe(-1);
    expect(nums.indexOf(2, -3)).toBe(0);
  }); // }}}

  test('prototype filter', function () { // {{{
    var words = ['spray', 'limit', 'elite', 'exuberant', 'destruction', 'present'];
    var result = words.filter(function (word) { return word.length > 6; });
    expect(result.length).toBe(3);
    expect(result[0]).toBe('exuberant');
    expect(result[1]).toBe('destruction');
    expect(result[2]).toBe('present');

    var unmatched = words.filter(function (word) { return word.length > 99; });
    expect(unmatched.length).toBe(0);

    function isBigEnough (value) { return value >= 8; }
    var filtered = [12, 5, 8, 130, 44].filter(isBigEnough);
    expect(filtered.length).toBe(4);
    expect(filtered[0]).toBe(12);
    expect(filtered[1]).toBe(8);
    expect(filtered[2]).toBe(130);
    expect(filtered[3]).toBe(44);
  }); // }}}

  test('prototype find', function () { // {{{
    var array1 = [5, 12, 8, 130, 44];
    var found = array1.find(function (element) { return element > 10; });
    expect(found).toBe(12);

    var noFound = array1.find(function (element) { return element < 3; });
    expect(noFound).toBe(undefined);
  }); // }}}

  test('prototype findIndex', function () { // {{{
    var array1 = [5, 12, 8, 130, 44];
    var foundIdx = array1.findIndex(function (element) { return element > 13; });
    expect(foundIdx).toBe(3);

    var noFoundIdx = array1.findIndex(function (element) { return element < 3; });
    expect(noFoundIdx).toBe(-1);
  }); // }}}

  test('prototype forEach', function () { // {{{
    var array1 = ['val', null, 0, false];
    var array2 = [];

    array1.forEach(function (element) { array2.push(element); });
    expect(array2.length).toBe(4);
    expect(array2[0]).toBe('val');
    expect(array2[1]).toBe(null);
    expect(array2[2]).toBe(0);
    expect(array2[3]).toBe(false);

    // No operation for uninitialized values
    var arraySparse = [1, 3, undefined, 7];
    var arrayNew = [];
    var numCallbackRuns = 0;

    arraySparse.forEach(function (element) {
      arrayNew.push(element);
      numCallbackRuns++;
    });

    expect(arrayNew.length).toBe(3);
    expect(arrayNew[0]).toBe(1);
    expect(arrayNew[1]).toBe(3);
    expect(arrayNew[2]).toBe(7);
    expect(numCallbackRuns).toBe(3);
  }); // }}}

  test('prototype includes', function () { // {{{
    var array1 = [1, 2, 3, 4, 5];
    expect(array1.includes(2)).toBe(true);
    expect(array1.includes(2, 1)).toBe(true);
    expect(array1.includes(2, 2)).toBe(false);
    expect(array1.includes(4, -1)).toBe(false);
    expect(array1.includes(4, -2)).toBe(true);
    expect(array1.includes('2')).toBe(false);
    expect(array1.includes(NaN)).toBe(false);
    expect(array1.includes(null)).toBe(false);
    expect(array1.includes(null)).toBe(false);

    var pets = ['cat', 'dog', 'bat'];
    expect(pets.includes('cat')).toBe(true);
    expect(pets.includes('CAT')).toBe(false);
    expect(pets.includes('at')).toBe(false);
    expect(pets.includes('')).toBe(false);
    expect(pets.includes(null)).toBe(false);
  }); // }}}

  test('prototype indexOf', function () { // {{{
    var beasts = ['ant', 'bison', 'camel', 'duck', 'bison'];
    expect(beasts.indexOf('bison')).toBe(1);
    expect(beasts.indexOf('bison', 2)).toBe(4);
    expect(beasts.indexOf('giraffe')).toBe(-1);

    var array = [2, 9, 9];
    expect(array.indexOf(2)).toBe(0);
    expect(array.indexOf(7)).toBe(-1);
    expect(array.indexOf(9, 2)).toBe(2);
    expect(array.indexOf(2, -1)).toBe(-1);
    expect(array.indexOf(2, -3)).toBe(0);
  }); // }}}

  test('prototype map', function () { // {{{
    var array1 = [1, 4, 9, 16];
    var map1 = array1.map(function (x) { return x * 2; });
    expect(array1.length).toBe(4);
    expect(array1[0]).toBe(1);
    expect(array1[1]).toBe(4);
    expect(array1[2]).toBe(9);
    expect(array1[3]).toBe(16);
    expect(map1.length).toBe(4);
    expect(map1[0]).toBe(2);
    expect(map1[1]).toBe(8);
    expect(map1[2]).toBe(18);
    expect(map1[3]).toBe(32);

    var chars = ['a', 'b', 'c', 'd'];
    var filtered = chars.map(function (char, index) {
      if (index < 2) return char;
    });
    expect(filtered.length).toBe(4);
    expect(filtered[0]).toBe('a');
    expect(filtered[1]).toBe('b');
    expect(filtered[2]).toBe(undefined); // pushed undefined
    expect(filtered[3]).toBe(undefined);
  }); // }}}

  test('prototype reduce', function () { // {{{
    var array1 = [1, 2, 3, 4];
    var reducer = function (accumulator, currentValue) {
      return (accumulator + currentValue);
    };

    expect(array1.reduce(reducer)).toBe(10); // 1 + 2 + 3 + 4
    expect(array1.reduce(reducer, 5)).toBe(15); // 5 + 1 + 2 + 3 + 4
  }); // }}}

  test('prototype some', function () { // {{{
    var array = [1, 2, 3, 4, 5];
    var even = function (element) { return element % 2 === 0; };

    expect(array.some(even)).toBe(true);

    var isBiggerThan10 = function (element) { return element > 10; };

    expect([2, 5, 8, 1, 4].some(isBiggerThan10)).toBe(false);
    expect([12, 5, 8, 1, 4].some(isBiggerThan10)).toBe(true);

    var indexes = [];
    var isMatched = [1, 2, 3, 4, 5].some(function (element, i) {
      indexes.push(i);
      return element > 2;
    });

    expect(isMatched).toBe(true);
    expect(indexes.length).toBe(3);
    expect(indexes[0]).toBe(0);
    expect(indexes[1]).toBe(1);
    expect(indexes[2]).toBe(2);
  }); // }}}
});
