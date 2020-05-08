/**
 * @file Test code Bar
 * @author Tuckn <tuckn333+github@gmail.com>
 */

/* eslint-disable no-undef */

if (!Bar) {
  var Bar = {}; // global

  Bar.func = function (user) {
    var rtnFoo = Foo.func('Bar.js');
    return rtnFoo + ', Bar.js called from "' + user + '"';
  };
}
