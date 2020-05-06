/**
 * @file Polyfill to extend functions of Object for WSH (Windows Script Host {@link https://docs.microsoft.com/en-us/previous-versions//9bbdkx3k(v=vs.85)|Microsoft Docs}). I recommend that JScript File Encoding is UTF-8[BOM, dos]
 * @description JScript 5.8 is similar to ECMA-262 3rd edition and doesn't have many useful features that ES5 (ECMA-262 5.1 edition) and above have. This module adds those to JScript.
 * @requires wscript.exe/cscript.exe
 * @requires ./Function.js
 * @author Tuckn <tuckn333+github@gmail.com>
 * @license MIT
 * @see {@link https://github.com/tuckn/JScriptPolyfill|GitHub}
 */

/* eslint no-prototype-builtins: "off" */

/** @namespace Object */

// Object.keys {{{
if (!Object.keys) {
  /**
   * Returns an array of a given object's own enumerable property names, in the same order as we get with a normal loop. {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys|MDN}
   * @function keys
   * @memberof Object
   * @param {Object} object
   * @return {string[]} - An array of strings
   * @example
var object1 = { a: 'somestring', b: 42, c: false };

console.dir(Object.keys(object1)); // expected output: Array ["a", "b", "c"]
   * @endOfExamples
   */
  Object.keys = (function () {
    'use strict';
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString');
    var dontEnums = [
      'toString',
      'toLocaleString',
      'valueOf',
      'hasOwnProperty',
      'isPrototypeOf',
      'propertyIsEnumerable',
      'constructor'
    ];
    var dontEnumsLength = dontEnums.length;

    return function (obj) {
      if (typeof obj !== 'object'
          && (typeof obj !== 'function' || obj === null)) {
        throw new Error('Object.keys called on non-object');
      }

      var result = [], prop, i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }

      return result;
    };
  }());
} // }}}

/*
 * https://github.com/es-shims/es5-shim
 * @license es5-shim Copyright 2009-2015 by contributors, MIT License
   see https://github.com/es-shims/es5-shim/blob/master/LICENSE
 */
(function () {
  var call = Function.call;
  var prototypeOfObject = Object.prototype;
  var owns = call.bind(prototypeOfObject.hasOwnProperty);
  var isEnumerable = call.bind(prototypeOfObject.propertyIsEnumerable);
  var toStr = call.bind(prototypeOfObject.toString);

  // If JS engine supports accessors creating shortcuts.
  var defineGetter;
  var defineSetter;
  var lookupGetter;
  var lookupSetter;
  var supportsAccessors = owns(prototypeOfObject, '__defineGetter__');
  if (supportsAccessors) {
    /* eslint-disable no-underscore-dangle, no-restricted-properties */
    defineGetter = call.bind(prototypeOfObject.__defineGetter__);
    defineSetter = call.bind(prototypeOfObject.__defineSetter__);
    lookupGetter = call.bind(prototypeOfObject.__lookupGetter__);
    lookupSetter = call.bind(prototypeOfObject.__lookupSetter__);
    /* eslint-enable no-underscore-dangle, no-restricted-properties */
  }

  var isPrimitive = function isPrimitive (o) {
    return o == null || (typeof o !== 'object' && typeof o !== 'function');
  };

  // Object.getPrototypeOf {{{
  // ES5 15.2.3.2
  // http://es5.github.com/#x15.2.3.2
  if (!Object.getPrototypeOf) {
    // https://github.com/es-shims/es5-shim/issues#issue/2
    // http://ejohn.org/blog/objectgetprototypeof/
    // recommended by fschaefer on github
    //
    // sure, and webreflection says ^_^
    // ... this will nerever possibly return null
    // ... Opera Mini breaks here with infinite loops

    /**
     * From ECMA-262 5.1 edition {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf|MDN}
     * @function getPrototypeOf
     * @memberof Object
     * @param {Object} obj - The object whose prototype is to be returned.
     * @return {(true|null)} - The prototype of the given object. If there are no inherited properties, null is returned.
     * @example
var prototype1 = {};
var object1 = Object.create(prototype1);

console.log(Object.getPrototypeOf(object1) === prototype1);
// expected output: true
     * @endOfExamples
     */
    Object.getPrototypeOf = function getPrototypeOf (obj) {
      // eslint-disable-next-line no-proto
      var proto = obj.__proto__;
      if (proto || proto === null) {
        return proto;
      } else if (toStr(obj.constructor) === '[object Function]') {
        return obj.constructor.prototype;
      } else if (obj instanceof Object) {
        return prototypeOfObject;
      } else {
        // Correctly return null for Objects created with `Object.create(null)`
        // (shammed or native) or `{ __proto__: null}`.  Also returns null for
        // cross-realm objects on browsers that lack `__proto__` support (like
        // IE <11), but that's the best we can do.
        return null;
      }
    };
  } // }}}

  // Object.getOwnPropertyDescriptor {{{
  // ES5 15.2.3.3
  // http://es5.github.com/#x15.2.3.3
  var doesGetOwnPropertyDescriptorWork = function doesGetOwnPropertyDescriptorWork (object) {
    try {
      object.sentinel = 0;
      return Object.getOwnPropertyDescriptor(object, 'sentinel').value === 0;
    } catch (exception) {
      return false;
    }
  };

  // check whether getOwnPropertyDescriptor works if it's given. Otherwise, shim partially.
  if (Object.defineProperty) {
    var getOwnPropertyDescriptorWorksOnObject = doesGetOwnPropertyDescriptorWork({});
    var getOwnPropertyDescriptorWorksOnDom = typeof document === 'undefined'
        || doesGetOwnPropertyDescriptorWork(document.createElement('div'));
    if (!getOwnPropertyDescriptorWorksOnDom || !getOwnPropertyDescriptorWorksOnObject) {
      var getOwnPropertyDescriptorFallback = Object.getOwnPropertyDescriptor;
    }
  }

  if (!Object.getOwnPropertyDescriptor || getOwnPropertyDescriptorFallback) {
    var ERR_NON_OBJECT = 'Object.getOwnPropertyDescriptor called on a non-object: ';

    /**
     * From ECMAScript 5.1 ECMA-262 {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor|MDN}
     * @function getOwnPropertyDescriptor
     * @memberof Object
     * @param {Object} obj - The object in which to look for the property.
     * @param {string} prop - The name or Symbol of the property whose description is to be retrieved.
     * @return {*} - A property descriptor of the given property if it exists on the object, undefined otherwise.
     * @example
var object1 = { property1: 42 };
var descriptor1 = Object.getOwnPropertyDescriptor(object1, 'property1');

console.log(descriptor1.configurable); // expected output: true
console.log(descriptor1.value); // expected output: 42
     * @endOfExamples
     */
    /* eslint-disable no-proto */
    Object.getOwnPropertyDescriptor = function getOwnPropertyDescriptor (obj, prop) {
      if (isPrimitive(obj)) {
        throw new Error(ERR_NON_OBJECT + obj);
      }

      // make a valiant attempt to use the real getOwnPropertyDescriptor
      // for I8's DOM elements.
      if (getOwnPropertyDescriptorFallback) {
        try {
          return getOwnPropertyDescriptorFallback.call(Object, obj, prop);
        } catch (exception) {
          // try the shim if the real one doesn't work
        }
      }

      var descriptor;

      // If object does not owns property return undefined immediately.
      if (!owns(obj, prop)) {
        return descriptor;
      }

      // If object has a property then it's for sure `configurable`, and
      // probably `enumerable`. Detect enumerability though.
      descriptor = {
        enumerable: isEnumerable(obj, prop),
        configurable: true
      };

      // If JS engine supports accessor properties then property may be a
      // getter or setter.
      if (supportsAccessors) {
        // Unfortunately `__lookupGetter__` will return a getter even
        // if object has own non getter property along with a same named
        // inherited getter. To avoid misbehavior we temporary remove
        // `__proto__` so that `__lookupGetter__` will return getter only
        // if it's owned by an object.
        var prototype = obj.__proto__;
        var notPrototypeOfObject = obj !== prototypeOfObject;
        // avoid recursion problem, breaking in Opera Mini when
        // Object.getOwnPropertyDescriptor(Object.prototype, 'toString')
        // or any other Object.prototype accessor
        if (notPrototypeOfObject) {
          obj.__proto__ = prototypeOfObject;
        }

        var getter = lookupGetter(obj, prop);
        var setter = lookupSetter(obj, prop);

        if (notPrototypeOfObject) {
          // Once we have getter and setter we can put values back.
          obj.__proto__ = prototype;
        }

        if (getter || setter) {
          if (getter) {
            descriptor.get = getter;
          }
          if (setter) {
            descriptor.set = setter;
          }
          // If it was accessor property we're done and return here
          // in order to avoid adding `value` to the descriptor.
          return descriptor;
        }
      }

      // If we got this far we know that object has an own property that is
      // not an accessor so we set it as a value and return descriptor.
      descriptor.value = obj[prop];
      descriptor.writable = true;
      return descriptor;
    };
    /* eslint-enable no-proto */
  } // }}}

  // Object.getOwnPropertyNames {{{
  // ES5 15.2.3.4
  // http://es5.github.com/#x15.2.3.4
  if (!Object.getOwnPropertyNames) {
    /**
     * Returns an array of all properties (including non-enumerable properties except for those which use Symbol) found directly in a given object. {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyNames|MDN}
     * @function getOwnPropertyNames
     * @memberof Object
     * @param {Object} obj - The object whose enumerable and non-enumerable properties are to be returned.
     * @return {string[]} - An array of strings that corresponds to the properties found directly in the given object.
     * @example
var object1 = { a: 1, b: 2, c: 3 };
console.dir(Object.getOwnPropertyNames(object1));
// expected output: Array ["a", "b", "c"]
     */
    Object.getOwnPropertyNames = function getOwnPropertyNames (obj) {
      return Object.keys(obj);
    };
  } // }}}

  // Object.create {{{
  // ES5 15.2.3.5
  // http://es5.github.com/#x15.2.3.5
  if (!Object.create) {
    // Contributed by Brandon Benvie, October, 2012
    var createEmpty;
    var supportsProto = !({ __proto__: null } instanceof Object);
    // the following produces false positives
    // in Opera Mini => not a reliable check
    // Object.prototype.__proto__ === null

    // Check for document.domain and active x support
    // No need to use active x approach when document.domain is not set
    // see https://github.com/es-shims/es5-shim/issues/150
    // variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
    var shouldUseActiveX = function shouldUseActiveX () {
      // return early if document.domain not set
      if (!document.domain) {
        return false;
      }

      try {
        return !!new ActiveXObject('htmlfile');
      } catch (exception) {
        return false;
      }
    };

    // This supports IE8 when document.domain is used
    // see https://github.com/es-shims/es5-shim/issues/150
    // variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
    var getEmptyViaActiveX = function getEmptyViaActiveX () {
      var empty;
      var xDoc;

      xDoc = new ActiveXObject('htmlfile');

      var script = 'script';
      xDoc.write('<' + script + '></' + script + '>');
      xDoc.close();

      empty = xDoc.parentWindow.Object.prototype;
      xDoc = null;

      return empty;
    };

    // The original implementation using an iframe
    // before the activex approach was added
    // see https://github.com/es-shims/es5-shim/issues/150
    var getEmptyViaIFrame = function getEmptyViaIFrame () {
      var iframe = document.createElement('iframe');
      var parent = document.body || document.documentElement;
      var empty;

      iframe.style.display = 'none';
      parent.appendChild(iframe);
      // eslint-disable-next-line no-script-url
      iframe.src = 'javascript:';

      empty = iframe.contentWindow.Object.prototype;
      parent.removeChild(iframe);
      iframe = null;

      return empty;
    };

    /* global document */
    if (supportsProto || typeof document === 'undefined') {
      createEmpty = function () {
        return { __proto__: null };
      };
    } else {
      // In old IE __proto__ can't be used to manually set `null`, nor does
      // any other method exist to make an object that inherits from nothing,
      // aside from Object.prototype itself. Instead, create a new global
      // object and *steal* its Object.prototype and strip it bare. This is
      // used as the prototype to create nullary objects.
      createEmpty = function () {
        // Determine which approach to use
        // see https://github.com/es-shims/es5-shim/issues/150
        var empty = shouldUseActiveX() ? getEmptyViaActiveX() : getEmptyViaIFrame();

        delete empty.constructor;
        delete empty.hasOwnProperty;
        delete empty.propertyIsEnumerable;
        delete empty.isPrototypeOf;
        delete empty.toLocaleString;
        delete empty.toString;
        delete empty.valueOf;

        var Empty = function Empty () {};
        Empty.prototype = empty;
        // short-circuit future calls
        createEmpty = function () {
          return new Empty();
        };
        return new Empty();
      };
    }

    /**
     * Creates a new object, using an existing object as the prototype of the newly created object. {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create|MDN}
     * @function create
     * @memberof Object
     * @param {Object} proto - The object which should be the prototype of the newly-created object.
     * @param {Object} [properties]
     * @return {Object} A new object with the specified prototype object and properties.
     * @example
var person = {
  isHuman: false,
  printIntroduction: function () {
    console.log('My name is ' + this.name + '. Am I human? ' + this.isHuman);
  }
};

var me = Object.create(person);

me.name = 'Matthew'; // "name" is a property set on "me", but not on "person"
me.isHuman = true; // inherited properties can be overwritten
me.printIntroduction();
// expected output: "My name is Matthew. Am I human? true"
     * @endOfExamples
     */
    Object.create = function create (proto, properties) {
      var object;
      var Type = function Type () {}; // An empty constructor.

      if (proto === null) {
        object = createEmpty();
      } else {
        if (proto !== null && isPrimitive(proto)) {
          // In the native implementation `parent` can be `null`
          // OR *any* `instanceof Object`  (Object|Function|Array|RegExp|etc)
          // Use `typeof` tho, b/c in old IE, DOM elements are not `instanceof Object`
          // like they are in modern browsers. Using `Object.create` on DOM elements
          // is...err...probably inappropriate, but the native version allows for it.
          throw new Error('Object prototype may only be an Object or null'); // same msg as Chrome
        }
        Type.prototype = proto;
        object = new Type();
        // IE has no built-in implementation of `Object.getPrototypeOf`
        // neither `__proto__`, but this manually setting `__proto__` will
        // guarantee that `Object.getPrototypeOf` will work as expected with
        // objects created using `Object.create`
        // eslint-disable-next-line no-proto
        object.__proto__ = proto;
      }

      if (properties !== void 0) {
        Object.defineProperties(object, properties);
      }

      return object;
    };
  } // }}}

  // ES5 15.2.3.6
  // http://es5.github.com/#x15.2.3.6

  // Patch for WebKit and IE8 standard mode
  // Designed by hax <hax.github.com>
  // related issue: https://github.com/es-shims/es5-shim/issues#issue/5
  // IE8 Reference:
  //     http://msdn.microsoft.com/en-us/library/dd282900.aspx
  //     http://msdn.microsoft.com/en-us/library/dd229916.aspx
  // WebKit Bugs:
  //     https://bugs.webkit.org/show_bug.cgi?id=36423

  var doesDefinePropertyWork = function doesDefinePropertyWork (object) {
    try {
      Object.defineProperty(object, 'sentinel', {});
      return 'sentinel' in object;
    } catch (exception) {
      return false;
    }
  };

  // check whether defineProperty works if it's given. Otherwise,
  // shim partially.
  if (Object.defineProperty) {
    var definePropertyWorksOnObject = doesDefinePropertyWork({});
    var definePropertyWorksOnDom = typeof document === 'undefined'
        || doesDefinePropertyWork(document.createElement('div'));
    if (!definePropertyWorksOnObject || !definePropertyWorksOnDom) {
      var definePropertyFallback = Object.defineProperty;
      var definePropertiesFallback = Object.defineProperties;
    }
  }

  // Object.defineProperty {{{
  if (!Object.defineProperty || definePropertyFallback) {
    var ERR_NON_OBJECT_DESCRIPTOR = 'Property description must be an object: ';
    var ERR_NON_OBJECT_TARGET = 'Object.defineProperty called on non-object: ';
    var ERR_ACCESSORS_NOT_SUPPORTED = 'getters & setters can not be defined on this javascript engine';

    /**
     * Defines a new property directly on an object, or modifies an existing property on an object, and returns the object. {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty|MDN}
     * @function defineProperty
     * @memberof Object
     * @param {Object} obj - The object on which to define the property.
     * @param {string} prop - The name or Symbol of the property to be defined or modified.
     * @param {Object} descriptor - The descriptor for the property being defined or modified.
     * @return {Object} The object that was passed to the function.
     * @example
var object1 = {};

Object.defineProperty(object1, 'property1', {
  value: 42,
  writable: false
});

object1.property1 = 77; // throws an error in strict mode
console.log(object1.property1); // expected output: 42
     * @endOfExamples
     */
    Object.defineProperty = function defineProperty (obj, prop, descriptor) {
      if (isPrimitive(obj)) {
        throw new Error(ERR_NON_OBJECT_TARGET + obj);
      }
      if (isPrimitive(descriptor)) {
        throw new Error(ERR_NON_OBJECT_DESCRIPTOR + descriptor);
      }
      // make a valiant attempt to use the real defineProperty
      // for I8's DOM elements.
      if (definePropertyFallback) {
        try {
          return definePropertyFallback.call(Object, obj, prop, descriptor);
        } catch (exception) {
          // try the shim if the real one doesn't work
        }
      }

      // If it's a data property.
      if ('value' in descriptor) {
        // fail silently if 'writable', 'enumerable', or 'configurable'
        // are requested but not supported
        /*
        // alternate approach:
        if ( // can't implement these features; allow false but not true
          ('writable' in descriptor && !descriptor.writable) ||
          ('enumerable' in descriptor && !descriptor.enumerable) ||
          ('configurable' in descriptor && !descriptor.configurable)
        ))
          throw new RangeError(
            'This implementation of Object.defineProperty does not support configurable, enumerable, or writable.'
          );
        */

        if (supportsAccessors && (lookupGetter(obj, prop) || lookupSetter(obj, prop))) {
          // As accessors are supported only on engines implementing
          // `__proto__` we can safely override `__proto__` while defining
          // a property to make sure that we don't hit an inherited
          // accessor.
          /* eslint-disable no-proto */
          var prototype = obj.__proto__;
          obj.__proto__ = prototypeOfObject;
          // Deleting a property anyway since getter / setter may be
          // defined on obj itself.
          delete obj[prop];
          obj[prop] = descriptor.value;
          // Setting original `__proto__` back now.
          obj.__proto__ = prototype;
          /* eslint-enable no-proto */
        } else {
          obj[prop] = descriptor.value;
        }
      } else {
        var hasGetter = 'get' in descriptor;
        var hasSetter = 'set' in descriptor;
        if (!supportsAccessors && (hasGetter || hasSetter)) {
          throw new Error(ERR_ACCESSORS_NOT_SUPPORTED);
        }
        // If we got that far then getters and setters can be defined !!
        if (hasGetter) {
          defineGetter(obj, prop, descriptor.get);
        }
        if (hasSetter) {
          defineSetter(obj, prop, descriptor.set);
        }
      }
      return obj;
    };
  } // }}}

  // Object.defineProperties {{{
  // ES5 15.2.3.7
  // http://es5.github.com/#x15.2.3.7
  if (!Object.defineProperties || definePropertiesFallback) {
    /**
     * Defines new or modifies existing properties directly on an object, returning the object. {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperties|MDN}
     * @function defineProperties
     * @memberof Object
     * @param {Object} obj - The object on which to define or modify properties.
     * @param {Object} props - An object whose keys represent the names of properties to be defined or modified and whose values are objects describing those properties.
     * @return {Object} The object that was passed to the function.
     * @example
var object1 = {};

Object.defineProperties(object1, {
  property1: { value: 42, writable: true },
  property2: {}
});

console.log(object1.property1); // expected output: 42
     * @endOfExamples
     */
    Object.defineProperties = function defineProperties (obj, props) {
      // make a valiant attempt to use the real defineProperties
      if (definePropertiesFallback) {
        try {
          return definePropertiesFallback.call(Object, obj, props);
        } catch (exception) {
          // try the shim if the real one doesn't work
        }
      }

      Object.keys(props).forEach(function (property) {
        if (property !== '__proto__') {
          Object.defineProperty(obj, property, props[property]);
        }
      });
      return obj;
    };
  } // }}}

  // ES5 15.2.3.8
  // http://es5.github.com/#x15.2.3.8
  if (!Object.seal) {
    Object.seal = function seal (object) {
      if (Object(object) !== object) {
        throw new Error('Object.seal can only be called on Objects.');
      }
      // this is misleading and breaks feature-detection, but
      // allows "securable" code to "gracefully" degrade to working
      // but insecure code.
      return object;
    };
  }

  // Object.freeze {{{
  // ES5 15.2.3.9
  // http://es5.github.com/#x15.2.3.9
  if (!Object.freeze) {
    /**
     * Freezes an object. A frozen object can no longer be changed. {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze|MDN}
     * @function freeze
     * @memberof Object
     * @param {Object} obj - The object to freeze.
     * @return {Object} The object that was passed to the function.
     * @example
var obj = { prop: 42 };

Object.freeze(obj);

obj.prop = 33; // Throws an error in strict mode
console.log(obj.prop); // expected output: 42
     * @endOfExamples
     */
    Object.freeze = function freeze (obj) {
      if (Object(obj) !== obj) {
        throw new Error('Object.freeze can only be called on Objects.');
      }
      // this is misleading and breaks feature-detection, but
      // allows "securable" code to "gracefully" degrade to working
      // but insecure code.
      return obj;
    };
  }

  // detect a Rhino bug and patch it
  try {
    Object.freeze(function () {});
  } catch (exception) {
    Object.freeze = (function (freezeObject) {
      return function freeze (object) {
        if (typeof object === 'function') {
          return object;
        } else {
          return freezeObject(object);
        }
      };
    }(Object.freeze));
  } // }}}

  // ES5 15.2.3.10
  // http://es5.github.com/#x15.2.3.10
  if (!Object.preventExtensions) {
    Object.preventExtensions = function preventExtensions (object) {
      if (Object(object) !== object) {
        throw new Error('Object.preventExtensions can only be called on Objects.');
      }
      // this is misleading and breaks feature-detection, but
      // allows "securable" code to "gracefully" degrade to working
      // but insecure code.
      return object;
    };
  }

  // ES5 15.2.3.11
  // http://es5.github.com/#x15.2.3.11
  if (!Object.isSealed) {
    Object.isSealed = function isSealed (object) {
      if (Object(object) !== object) {
        throw new Error('Object.isSealed can only be called on Objects.');
      }
      return false;
    };
  }

  // ES5 15.2.3.12
  // http://es5.github.com/#x15.2.3.12
  if (!Object.isFrozen) {
    Object.isFrozen = function isFrozen (object) {
      if (Object(object) !== object) {
        throw new Error('Object.isFrozen can only be called on Objects.');
      }
      return false;
    };
  }

  // ES5 15.2.3.13
  // http://es5.github.com/#x15.2.3.13
  if (!Object.isExtensible) {
    Object.isExtensible = function isExtensible (object) {
      // 1. If Type(O) is not Object throw a TypeError exception.
      if (Object(object) !== object) {
        throw new Error('Object.isExtensible can only be called on Objects.');
      }
      // 2. Return the Boolean value of the [[Extensible]] internal property of O.
      var name = '';
      while (owns(object, name)) {
        name += '?';
      }
      object[name] = true;
      var returnValue = owns(object, name);
      delete object[name];
      return returnValue;
    };
  }
})();

// Object.setPrototypeOf {{{
if (!Object.setPrototypeOf) {
  /**
   * @todo Sets the prototype (i.e., the internal [[Prototype]] property) of a specified object to another object or null. {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf|MDN}
   * @function setPrototypeOf
   * @memberof Object
   * @param {*} obj - The object which is to have its prototype set.
   * @param {*} prototype - The object's new prototype (an object or null).
   * @return {Object}
   */
  Object.prototype.setPrototypeOf = function (obj, prototype) {
    var Fn = function () {
      for (var key in obj) {
        Object.defineProperty(this, key, { value: obj[key] });
      }
    };
    Fn.prototype = prototype;
    return new Fn();
  };
} // }}}

// Object.assign {{{
if (typeof Object.assign != 'function') {
  // Must be writable: true, enumerable: false, configurable: true
  /**
   * Copies all enumerable own properties from one or more source objects to a target object. {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign|MDN}
   * @function assign
   * @memberof Object
   * @param {Object} target - The target object — what to apply the sources’ properties to, which is returned after it is modified.
   * @param {...Object} sources - The source object(s) — objects containing the properties you want to apply.
   * @return {Object} The target object.
   * @example
var object1 = { a: 1, b: 2, c: 3 };
var object2 = Object.assign({ c: 4, d: 5 }, object1);

console.log(object2.c, object2.d); // expected output: 3 5
   * @endOfExamples
   */
  Object.defineProperty(Object, 'assign', {
    value: function assign (target/* , sources */) { // .length of function is 2
      'use strict';
      if (target == null) { // TypeError if undefined or null
        throw new Error('Cannot convert undefined or null to object');
      }

      var to = Object(target);

      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource != null) { // Skip over if undefined or null
          for (var nextKey in nextSource) {
            // Avoid bugs when hasOwnProperty is shadowed
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    },
    writable: true,
    configurable: true
  });
} // }}}

// Object.is {{{
if (!Object.is) {
  /**
   * Determines whether two values are the same value. {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is|MDN}
   * @function is
   * @memberof Object
   * @param {*} value1 - The first value to compare.
   * @param {*} value2 - The second value to compare.
   * @return {boolean} A Boolean indicating whether or not the two arguments are the same value.
   * @example
Object.is('foo', 'foo'); // true
Object.is('foo', 'bar'); // false
Object.is([], []);       // false
var foo = { a: 1 };
var bar = { a: 1 };
Object.is(foo, foo);     // true
Object.is(foo, bar);     // false
   * @endOfExamples
   */
  Object.is = function (value1, value2) {
    // SameValue algorithm
    if (value1 === value2) { // Steps 1-5, 7-10
      // Steps 6.b-6.e: +0 != -0
      return value1 !== 0 || 1 / value1 === 1 / value2;
    } else {
      // Step 6.a: NaN == NaN
      return value1 !== value1 && value2 !== value2;
    }
  };
} // }}}

// Object.values {{{
if (!Object.values) {
  /**
   * Returns an array of a given object's own enumerable property values, in the same order as that provided by a for...in loop (the difference being that a for-in loop enumerates properties in the prototype chain as well). {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values|MDN}
   * @function values
   * @memberof Object
   * @param {Object} obj - The object whose enumerable own property values are to be returned.
   * @return {array} An array containing the given object's own enumerable property values.
   * @example
const object1 = { a: 'somestring', b: 42, c: false };

console.dir(Object.values(object1));
// expected output: Array ["somestring", 42, false]
   * @endOfExamples
   */
  Object.values = (function () {
    'use strict';
    var hasProp = Object.prototype.hasOwnProperty;
    var hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString');
    var dontEnums = [
      'toString',
      'toLocaleString',
      'valueOf',
      'hasOwnProperty',
      'isPrototypeOf',
      'propertyIsEnumerable',
      'constructor'
    ];
    var dontEnumsLength = dontEnums.length;

    return function (obj) {
      if (typeof obj !== 'object'
          && (typeof obj !== 'function' || obj === null)) {
        throw new Error('Object.values called on non-object');
      }

      var result = [], prop, i;

      for (prop in obj) {
        if (hasProp.call(obj, prop)) {
          result.push(obj[prop]);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasProp.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }

      return result;
    };
  }());
} // }}}

// vim:set foldmethod=marker commentstring=//%s :
