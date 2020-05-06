/* globals describe: false */
/* globals test: false */
/* globals expect: false */

describe('String', function () {
  test('trim', function () { // {{{
    expect('   Hello world!   '.trim()).toBe('Hello world!');
    expect('Hello world!   '.trim()).toBe('Hello world!');
    expect('   Hello world!'.trim()).toBe('Hello world!');
    expect('\tHello world!\t'.trim()).toBe('Hello world!');
    expect('　Hello world!　'.trim()).toBe('　Hello world!　');
  }); // }}}

  test('includes', function () { // {{{
    var str = 'To be, or not to be, that is the question.';

    expect(str.includes('To be')).toBe(true);
    expect(str.includes('question')).toBe(true);
    expect(str.includes('nonexistent')).toBe(false);
    expect(str.includes('To be', 1)).toBe(false);
    expect(str.includes('TO BE')).toBe(false);
    expect(str.includes('')).toBe(true);
  }); // }}}

  test('startsWith', function () { // {{{
    var str = 'To be, or not to be, that is the question.';

    expect(str.startsWith('To be')).toBe(true);
    expect(str.startsWith('not to be')).toBe(false);
    expect(str.startsWith('not to be', 10)).toBe(true);
  }); // }}}

  test('endsWith', function () { // {{{
    var str = 'To be, or not to be, that is the question.';

    expect(str.endsWith('question.')).toBe(true);
    expect(str.endsWith('to be')).toBe(false);
    expect(str.endsWith('to be', 19)).toBe(true);
  }); // }}}
});
