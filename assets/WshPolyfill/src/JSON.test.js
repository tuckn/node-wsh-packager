/**
 * @file Test JSON.js
 * @requires ./Function.js
 * @requires ./Object.js
 */

/* globals describe: false */
/* globals test: false */
/* globals expect: false */

// Shorthand
var _cb = function (fn/* , args */) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function () { fn.apply(null, args); };
};

describe('JSON', function () {
  test('stringify', function () { // {{{
    // Stringify no JSON values
    var objNoJval = {
      undef: undefined, // Skip this
      nan: NaN,
      infinite: Infinity
    };

    var objNoJvalStr = JSON.stringify(objNoJval);
    expect(objNoJvalStr).toBe('{'
      + '"nan":null,'
      + '"infinite":null'
      + '}');

    // Stringify Date
    var date = new Date(2006, 0, 2, 15, 4, 5);
    var dateStr = JSON.stringify(date);
    expect(dateStr).toBe('"2006-01-02T06:04:05Z"');

    // Stringify Array
    var array = [0, 1, true, false, '四', null, undefined]; // undefined -> null
    var arrayStr = JSON.stringify(array);
    expect(arrayStr).toBe('[0,1,true,false,"四",null,null]');

    // Stringify Object
    var obj = {
      nu: null,
      num: 42,
      float: 3.14,
      str: 'Some string',
      b: false,
      obj: { a: 'A' },
      a: [1, 2, 3]
    };

    var objStr = JSON.stringify(obj);
    expect(objStr).toBe('{'
      + '"nu":null,'
      + '"num":42,'
      + '"float":3.14,'
      + '"str":"Some string",'
      + '"b":false,'
      + '"obj":{"a":"A"},'
      + '"a":[1,2,3]'
      + '}');

    // Use replacer, as a function
    function replacer (key, value) { // Filtering out properties
      if (typeof value === 'string') return undefined;
      return value;
    }

    var objB = { foundation: 'Mozilla', model: 'box', week: 45, transport: 'car', month: 7 };
    var replacedStr = JSON.stringify(objB, replacer);
    expect(replacedStr).toBe('{"week":45,"month":7}');

    // Use replacer, as an array
    var propFilteredStr = JSON.stringify(obj, ['num', 'str']);
    expect(propFilteredStr).toBe('{"num":42,"str":"Some string"}');

    // Use the space argument
    var objStrIndent2 = JSON.stringify(obj, null, 2);
    expect(objStrIndent2).toBe('{\n'
      + '  "nu": null,\n'
      + '  "num": 42,\n'
      + '  "float": 3.14,\n'
      + '  "str": "Some string",\n'
      + '  "b": false,\n'
      + '  "obj": {\n'
      + '    "a": "A"\n'
      + '  },\n'
      + '  "a": [\n'
      + '    1,\n'
      + '    2,\n'
      + '    3\n'
      + '  ]\n'
      + '}');

    // None JSON values
    var objJp = {
      strHira: 'あかさたなはまやらわんぁぃぅぇお',
      strKanji: '臨兵闘者皆陣烈在前',
      strRoma: 'ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ'
    };

    var objJpStr = JSON.stringify(objJp);
    expect(objJpStr).toBe('{'
      + '"strHira":"あかさたなはまやらわんぁぃぅぇお",'
      + '"strKanji":"臨兵闘者皆陣烈在前",'
      + '"strRoma":"ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ"'
      + '}');

  }); // }}}

  test('parse', function () { // {{{
    var testStr, parsedObj, objKeys;

    // Parse no JSON values
    expect(_cb(JSON.parse, '{ "nan": NaN }')).toThrowError();
    expect(_cb(JSON.parse, '{ "infinite": Infinity }')).toThrowError();

    // Object
    testStr = '{"result":true, "count":42}';
    parsedObj = JSON.parse(testStr);
    objKeys = Object.keys(parsedObj);
    expect(objKeys.length).toBe(2);
    expect(parsedObj.result).toBe(true);
    expect(parsedObj.count).toBe(42);
    // Empty
    parsedObj = JSON.parse('{}');
    expect(Object.keys(parsedObj).length).toBe(0);

    // Array
    testStr = '[false, "false", 5, "5"]';
    parsedObj = JSON.parse(testStr);
    expect(parsedObj.length).toBe(4);
    expect(parsedObj[0]).toBe(false);
    expect(parsedObj[1]).toBe('false');
    expect(parsedObj[2]).toBe(5);
    expect(parsedObj[3]).toBe('5');
    expect(parsedObj[3]).toBe('5');
    // Empty
    expect(JSON.parse('[]')).toEqual([]);

    // String, Number, null
    expect(JSON.parse('"foo"')).toBe('foo');
    expect(JSON.parse(32)).toBe(32);
    expect(JSON.parse('null')).toBe(null);

    // Includes : in a property name
    testStr = '{"hello:foo":"FOO", "hello:bar":"BAR"}';
    parsedObj = JSON.parse(testStr);
    objKeys = Object.keys(parsedObj);
    expect(objKeys.length).toBe(2);
    expect(parsedObj['hello:foo']).toBe('FOO');
    expect(parsedObj['hello:bar']).toBe('BAR');

    // Japanese String
    testStr = '{'
      + ' "strHira": "あかさたなはまやらわんぁぃぅぇお",'
      + ' "strKanji": "臨兵闘者皆陣烈在前",'
      + ' "strRoma": "ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ"'
      + '}';
    parsedObj = JSON.parse(testStr);
    expect(parsedObj.strHira).toBe('あかさたなはまやらわんぁぃぅぇお');
    expect(parsedObj.strKanji).toBe('臨兵闘者皆陣烈在前');
    expect(parsedObj.strRoma).toBe('ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ');

    // Throw a SyntaxError
    expect(_cb(JSON.parse, '{"foo" : 1, }')).toThrowError();
    expect(_cb(JSON.parse, '{\'foo\': 1}')).toThrowError();

    // Using the Reviver
    // @note Work on Object.
    var revedObj = JSON.parse('{"num": 5, "str": "5" }', function (key, value) {
      // return value * 2 for numbers
      // return everything else unchanged
      return (typeof value === 'number' ? value * 2 : value);
    });

    expect(Object.keys(revedObj).length).toBe(2);
    expect(revedObj.num).toBe(10);
    expect(revedObj.str).toBe('5');

    // @note Attention the last property in a reviver
    var propVals = [];
    JSON.parse('{ "1": 1, "2": 2, "3": {"4": 4, "5": {"6": 6}} }',
      function (key, value) {
        propVals.push(key); // log the current property name, the last is "".
        return value;     // return the unchanged property value.
      }
    );

    expect(propVals.length).toBe(7); // Add the last ""
    expect(propVals[0]).toBe('1');
    expect(propVals[1]).toBe('2');
    expect(propVals[2]).toBe('4');
    expect(propVals[3]).toBe('6');
    expect(propVals[4]).toBe('5');
    expect(propVals[5]).toBe('3');
    expect(propVals[6]).toBe(''); // <--- !!

    // @note !! Not work on Array. Return NaN
    var keys = [];
    var vals = [];
    var rtnNaN = JSON.parse('[1, 2, 3]', function (key, value) {
      keys.push(key);
      vals.push(value);
      return value * 2;
    });

    expect(rtnNaN).toBeNaN();

    expect(keys.length).toBe(4); // The length is incremented by 1
    expect(keys[0]).toBe('0');
    expect(keys[1]).toBe('1');
    expect(keys[2]).toBe('2');
    expect(keys[3]).toBe(''); // <--- !!

    expect(vals.length).toBe(4); // Plus 1
    expect(vals[0]).toBe(1);
    expect(vals[1]).toBe(2);
    expect(vals[2]).toBe(3);
    expect(vals[3][0]).toBe(2); // <--- Return the last is parsed obj?
    expect(vals[3][1]).toBe(4);
    expect(vals[3][2]).toBe(6);

    // @note !! Not work on Array. Return undefined
    var rtnUndefined = JSON.parse('[1, 2, 3]', function (key, value) {
      if (key) return value * 2;
    });

    expect(typeof rtnUndefined).toBe('undefined');
  }); // }}}

  test('parse problem @todo', function () { // {{{
    /*
     * The following parsing doesn't throw an error on the polyfill.
     * But ES5 throws
     */
    expect(_cb(JSON.parse, '[1, 2, 3, 4, ]')).toThrowError();
  }); // }}}
});

