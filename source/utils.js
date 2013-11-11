// Generated by CoffeeScript 1.4.0

/*
These function are used throughout the library. Many provide cross-platform (server and browser)
support for frequently-used functions.
*/


(function() {
  var ValidationError, includes, interpolate, isEmpty, isEqual, strip, utils, _, _i,
    __slice = [].slice;

  if (typeof exports !== "undefined" && exports !== null) {
    _ = require("underscore");
  }

  _i = function(s) {
    return s;
  };

  interpolate = function(s, args) {
    /*
      simple string interpolation (thanks http:#djangosnippets.org/snippets/2074/)
      interpolate("%s %s", ["hello", "world"]) returns "hello world"
    */

    var i;
    i = 0;
    return s.replace(/%(?:\(([^)]+)\))?([%diouxXeEfFgGcrs])/g, function(match, v, t) {
      if (t === "%") {
        return "%";
      }
      return args[v || i++];
    });
  };

  ValidationError = function() {
    var args, code, message;
    message = arguments[0], code = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
    /*
      raised by fields during validation
       * `message`:  the default error message to display
       * `code`: the code used to look up an overriding message in the `errorMessages` hash
       * `args...`: arguments used for interpolation with the error message.
    */

    return {
      message: message,
      code: code,
      data: args
    };
  };

  includes = function(a, s) {
    return a.indexOf(s) > -1;
  };

  isEmpty = function(obj) {
    var i;
    for (i in obj) {
      return false;
    }
    return true;
  };

  isEqual = function(v1, v2) {
    /* a very naive comparison of two objects - will only work with the equivalent of json
    */

    var i, item, _j, _len;
    if (v1 instanceof Array) {
      if (!(v2 instanceof Array) || v1.length !== v2.length) {
        return false;
      }
      for (i = _j = 0, _len = v1.length; _j < _len; i = ++_j) {
        item = v1[i];
        if (!isEqual(item, v2[i])) {
          return false;
        }
      }
    } else if (v1 instanceof Object) {
      if (!(v2 instanceof Object)) {
        return false;
      }
      for (item in v1) {
        if (!isEqual(v1[item], v2[item])) {
          return false;
        }
      }
      for (item in v2) {
        if (v2[item] !== void 0 && v1[item] === void 0) {
          return false;
        }
      }
    } else if (v1 !== v2) {
      return false;
    }
    return true;
  };

  strip = function(str) {
    /* remove leading and trailing white space
    */
    return String(str).replace(/^\s*|\s*$/g, '');
  };

  utils = {
    _i: _i,
    interpolate: interpolate,
    ValidationError: ValidationError,
    includes: includes,
    isEmpty: isEmpty,
    isEqual: isEqual,
    strip: strip,
    forEach: typeof enyo !== "undefined" && enyo !== null ? enyo.forEach : _.forEach,
    map: typeof enyo !== "undefined" && enyo !== null ? enyo.map : _.map,
    cloneArray: typeof enyo !== "undefined" && enyo !== null ? enyo.cloneArray : _.clone,
    mixin: typeof enyo !== "undefined" && enyo !== null ? enyo.mixin : _.extend,
    clone: typeof enyo !== "undefined" && enyo !== null ? enyo.clone : _.clone
  };

  if (typeof window !== "undefined" && window !== null) {
    window.utils = utils;
  } else if (typeof exports !== "undefined" && exports !== null) {
    module.exports = utils;
  }

}).call(this);
