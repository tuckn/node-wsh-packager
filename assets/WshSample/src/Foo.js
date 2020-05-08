/**
 * @file Test code Foo
 * @author Tuckn <tuckn333+github@gmail.com>
 */

if (!Foo) {
  var Foo = {}; // global

  Foo.func = function (user) {
    return '"Foo.js" called from "' + user + '"';
  };
}
