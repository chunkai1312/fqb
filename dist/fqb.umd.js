(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('crypto')) :
  typeof define === 'function' && define.amd ? define(['crypto'], factory) :
  (global = global || self, global.FQB = factory(global.crypto));
}(this, function (crypto) { 'use strict';

  crypto = crypto && crypto.hasOwnProperty('default') ? crypto['default'] : crypto;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  var createHmac = crypto.createHmac;

  var has = Object.prototype.hasOwnProperty;

  var hexTable = (function () {
      var array = [];
      for (var i = 0; i < 256; ++i) {
          array.push('%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase());
      }

      return array;
  }());

  var compactQueue = function compactQueue(queue) {
      while (queue.length > 1) {
          var item = queue.pop();
          var obj = item.obj[item.prop];

          if (Array.isArray(obj)) {
              var compacted = [];

              for (var j = 0; j < obj.length; ++j) {
                  if (typeof obj[j] !== 'undefined') {
                      compacted.push(obj[j]);
                  }
              }

              item.obj[item.prop] = compacted;
          }
      }
  };

  var arrayToObject = function arrayToObject(source, options) {
      var obj = options && options.plainObjects ? Object.create(null) : {};
      for (var i = 0; i < source.length; ++i) {
          if (typeof source[i] !== 'undefined') {
              obj[i] = source[i];
          }
      }

      return obj;
  };

  var merge = function merge(target, source, options) {
      if (!source) {
          return target;
      }

      if (typeof source !== 'object') {
          if (Array.isArray(target)) {
              target.push(source);
          } else if (typeof target === 'object') {
              if ((options && (options.plainObjects || options.allowPrototypes)) || !has.call(Object.prototype, source)) {
                  target[source] = true;
              }
          } else {
              return [target, source];
          }

          return target;
      }

      if (typeof target !== 'object') {
          return [target].concat(source);
      }

      var mergeTarget = target;
      if (Array.isArray(target) && !Array.isArray(source)) {
          mergeTarget = arrayToObject(target, options);
      }

      if (Array.isArray(target) && Array.isArray(source)) {
          source.forEach(function (item, i) {
              if (has.call(target, i)) {
                  if (target[i] && typeof target[i] === 'object') {
                      target[i] = merge(target[i], item, options);
                  } else {
                      target.push(item);
                  }
              } else {
                  target[i] = item;
              }
          });
          return target;
      }

      return Object.keys(source).reduce(function (acc, key) {
          var value = source[key];

          if (has.call(acc, key)) {
              acc[key] = merge(acc[key], value, options);
          } else {
              acc[key] = value;
          }
          return acc;
      }, mergeTarget);
  };

  var assign = function assignSingleSource(target, source) {
      return Object.keys(source).reduce(function (acc, key) {
          acc[key] = source[key];
          return acc;
      }, target);
  };

  var decode = function (str, decoder, charset) {
      var strWithoutPlus = str.replace(/\+/g, ' ');
      if (charset === 'iso-8859-1') {
          // unescape never throws, no try...catch needed:
          return strWithoutPlus.replace(/%[0-9a-f]{2}/gi, unescape);
      }
      // utf-8
      try {
          return decodeURIComponent(strWithoutPlus);
      } catch (e) {
          return strWithoutPlus;
      }
  };

  var encode = function encode(str, defaultEncoder, charset) {
      // This code was originally written by Brian White (mscdex) for the io.js core querystring library.
      // It has been adapted here for stricter adherence to RFC 3986
      if (str.length === 0) {
          return str;
      }

      var string = typeof str === 'string' ? str : String(str);

      if (charset === 'iso-8859-1') {
          return escape(string).replace(/%u[0-9a-f]{4}/gi, function ($0) {
              return '%26%23' + parseInt($0.slice(2), 16) + '%3B';
          });
      }

      var out = '';
      for (var i = 0; i < string.length; ++i) {
          var c = string.charCodeAt(i);

          if (
              c === 0x2D // -
              || c === 0x2E // .
              || c === 0x5F // _
              || c === 0x7E // ~
              || (c >= 0x30 && c <= 0x39) // 0-9
              || (c >= 0x41 && c <= 0x5A) // a-z
              || (c >= 0x61 && c <= 0x7A) // A-Z
          ) {
              out += string.charAt(i);
              continue;
          }

          if (c < 0x80) {
              out = out + hexTable[c];
              continue;
          }

          if (c < 0x800) {
              out = out + (hexTable[0xC0 | (c >> 6)] + hexTable[0x80 | (c & 0x3F)]);
              continue;
          }

          if (c < 0xD800 || c >= 0xE000) {
              out = out + (hexTable[0xE0 | (c >> 12)] + hexTable[0x80 | ((c >> 6) & 0x3F)] + hexTable[0x80 | (c & 0x3F)]);
              continue;
          }

          i += 1;
          c = 0x10000 + (((c & 0x3FF) << 10) | (string.charCodeAt(i) & 0x3FF));
          out += hexTable[0xF0 | (c >> 18)]
              + hexTable[0x80 | ((c >> 12) & 0x3F)]
              + hexTable[0x80 | ((c >> 6) & 0x3F)]
              + hexTable[0x80 | (c & 0x3F)];
      }

      return out;
  };

  var compact = function compact(value) {
      var queue = [{ obj: { o: value }, prop: 'o' }];
      var refs = [];

      for (var i = 0; i < queue.length; ++i) {
          var item = queue[i];
          var obj = item.obj[item.prop];

          var keys = Object.keys(obj);
          for (var j = 0; j < keys.length; ++j) {
              var key = keys[j];
              var val = obj[key];
              if (typeof val === 'object' && val !== null && refs.indexOf(val) === -1) {
                  queue.push({ obj: obj, prop: key });
                  refs.push(val);
              }
          }
      }

      compactQueue(queue);

      return value;
  };

  var isRegExp = function isRegExp(obj) {
      return Object.prototype.toString.call(obj) === '[object RegExp]';
  };

  var isBuffer = function isBuffer(obj) {
      if (obj === null || typeof obj === 'undefined') {
          return false;
      }

      return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
  };

  var combine = function combine(a, b) {
      return [].concat(a, b);
  };

  var utils = {
      arrayToObject: arrayToObject,
      assign: assign,
      combine: combine,
      compact: compact,
      decode: decode,
      encode: encode,
      isBuffer: isBuffer,
      isRegExp: isRegExp,
      merge: merge
  };

  var replace = String.prototype.replace;
  var percentTwenties = /%20/g;

  var formats = {
      'default': 'RFC3986',
      formatters: {
          RFC1738: function (value) {
              return replace.call(value, percentTwenties, '+');
          },
          RFC3986: function (value) {
              return value;
          }
      },
      RFC1738: 'RFC1738',
      RFC3986: 'RFC3986'
  };

  var arrayPrefixGenerators = {
      brackets: function brackets(prefix) { // eslint-disable-line func-name-matching
          return prefix + '[]';
      },
      indices: function indices(prefix, key) { // eslint-disable-line func-name-matching
          return prefix + '[' + key + ']';
      },
      repeat: function repeat(prefix) { // eslint-disable-line func-name-matching
          return prefix;
      }
  };

  var isArray = Array.isArray;
  var push = Array.prototype.push;
  var pushToArray = function (arr, valueOrArray) {
      push.apply(arr, isArray(valueOrArray) ? valueOrArray : [valueOrArray]);
  };

  var toISO = Date.prototype.toISOString;

  var defaults = {
      addQueryPrefix: false,
      allowDots: false,
      charset: 'utf-8',
      charsetSentinel: false,
      delimiter: '&',
      encode: true,
      encoder: utils.encode,
      encodeValuesOnly: false,
      // deprecated
      indices: false,
      serializeDate: function serializeDate(date) { // eslint-disable-line func-name-matching
          return toISO.call(date);
      },
      skipNulls: false,
      strictNullHandling: false
  };

  var stringify = function stringify( // eslint-disable-line func-name-matching
      object,
      prefix,
      generateArrayPrefix,
      strictNullHandling,
      skipNulls,
      encoder,
      filter,
      sort,
      allowDots,
      serializeDate,
      formatter,
      encodeValuesOnly,
      charset
  ) {
      var obj = object;
      if (typeof filter === 'function') {
          obj = filter(prefix, obj);
      } else if (obj instanceof Date) {
          obj = serializeDate(obj);
      }

      if (obj === null) {
          if (strictNullHandling) {
              return encoder && !encodeValuesOnly ? encoder(prefix, defaults.encoder, charset) : prefix;
          }

          obj = '';
      }

      if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean' || utils.isBuffer(obj)) {
          if (encoder) {
              var keyValue = encodeValuesOnly ? prefix : encoder(prefix, defaults.encoder, charset);
              return [formatter(keyValue) + '=' + formatter(encoder(obj, defaults.encoder, charset))];
          }
          return [formatter(prefix) + '=' + formatter(String(obj))];
      }

      var values = [];

      if (typeof obj === 'undefined') {
          return values;
      }

      var objKeys;
      if (Array.isArray(filter)) {
          objKeys = filter;
      } else {
          var keys = Object.keys(obj);
          objKeys = sort ? keys.sort(sort) : keys;
      }

      for (var i = 0; i < objKeys.length; ++i) {
          var key = objKeys[i];

          if (skipNulls && obj[key] === null) {
              continue;
          }

          if (Array.isArray(obj)) {
              pushToArray(values, stringify(
                  obj[key],
                  generateArrayPrefix(prefix, key),
                  generateArrayPrefix,
                  strictNullHandling,
                  skipNulls,
                  encoder,
                  filter,
                  sort,
                  allowDots,
                  serializeDate,
                  formatter,
                  encodeValuesOnly,
                  charset
              ));
          } else {
              pushToArray(values, stringify(
                  obj[key],
                  prefix + (allowDots ? '.' + key : '[' + key + ']'),
                  generateArrayPrefix,
                  strictNullHandling,
                  skipNulls,
                  encoder,
                  filter,
                  sort,
                  allowDots,
                  serializeDate,
                  formatter,
                  encodeValuesOnly,
                  charset
              ));
          }
      }

      return values;
  };

  var stringify_1 = function (object, opts) {
      var obj = object;
      var options = opts ? utils.assign({}, opts) : {};

      if (options.encoder !== null && options.encoder !== undefined && typeof options.encoder !== 'function') {
          throw new TypeError('Encoder has to be a function.');
      }

      var delimiter = typeof options.delimiter === 'undefined' ? defaults.delimiter : options.delimiter;
      var strictNullHandling = typeof options.strictNullHandling === 'boolean' ? options.strictNullHandling : defaults.strictNullHandling;
      var skipNulls = typeof options.skipNulls === 'boolean' ? options.skipNulls : defaults.skipNulls;
      var encode = typeof options.encode === 'boolean' ? options.encode : defaults.encode;
      var encoder = typeof options.encoder === 'function' ? options.encoder : defaults.encoder;
      var sort = typeof options.sort === 'function' ? options.sort : null;
      var allowDots = typeof options.allowDots === 'undefined' ? defaults.allowDots : !!options.allowDots;
      var serializeDate = typeof options.serializeDate === 'function' ? options.serializeDate : defaults.serializeDate;
      var encodeValuesOnly = typeof options.encodeValuesOnly === 'boolean' ? options.encodeValuesOnly : defaults.encodeValuesOnly;
      var charset = options.charset || defaults.charset;
      if (typeof options.charset !== 'undefined' && options.charset !== 'utf-8' && options.charset !== 'iso-8859-1') {
          throw new Error('The charset option must be either utf-8, iso-8859-1, or undefined');
      }

      if (typeof options.format === 'undefined') {
          options.format = formats['default'];
      } else if (!Object.prototype.hasOwnProperty.call(formats.formatters, options.format)) {
          throw new TypeError('Unknown format option provided.');
      }
      var formatter = formats.formatters[options.format];
      var objKeys;
      var filter;

      if (typeof options.filter === 'function') {
          filter = options.filter;
          obj = filter('', obj);
      } else if (Array.isArray(options.filter)) {
          filter = options.filter;
          objKeys = filter;
      }

      var keys = [];

      if (typeof obj !== 'object' || obj === null) {
          return '';
      }

      var arrayFormat;
      if (options.arrayFormat in arrayPrefixGenerators) {
          arrayFormat = options.arrayFormat;
      } else if ('indices' in options) {
          arrayFormat = options.indices ? 'indices' : 'repeat';
      } else {
          arrayFormat = 'indices';
      }

      var generateArrayPrefix = arrayPrefixGenerators[arrayFormat];

      if (!objKeys) {
          objKeys = Object.keys(obj);
      }

      if (sort) {
          objKeys.sort(sort);
      }

      for (var i = 0; i < objKeys.length; ++i) {
          var key = objKeys[i];

          if (skipNulls && obj[key] === null) {
              continue;
          }
          pushToArray(keys, stringify(
              obj[key],
              key,
              generateArrayPrefix,
              strictNullHandling,
              skipNulls,
              encode ? encoder : null,
              filter,
              sort,
              allowDots,
              serializeDate,
              formatter,
              encodeValuesOnly,
              charset
          ));
      }

      var joined = keys.join(delimiter);
      var prefix = options.addQueryPrefix === true ? '?' : '';

      if (options.charsetSentinel) {
          if (charset === 'iso-8859-1') {
              // encodeURIComponent('&#10003;'), the "numeric entity" representation of a checkmark
              prefix += 'utf8=%26%2310003%3B&';
          } else {
              // encodeURIComponent('✓')
              prefix += 'utf8=%E2%9C%93&';
          }
      }

      return joined.length > 0 ? prefix + joined : '';
  };

  var has$1 = Object.prototype.hasOwnProperty;

  var defaults$1 = {
      allowDots: false,
      allowPrototypes: false,
      arrayLimit: 20,
      charset: 'utf-8',
      charsetSentinel: false,
      decoder: utils.decode,
      delimiter: '&',
      depth: 5,
      ignoreQueryPrefix: false,
      interpretNumericEntities: false,
      parameterLimit: 1000,
      parseArrays: true,
      plainObjects: false,
      strictNullHandling: false
  };

  var interpretNumericEntities = function (str) {
      return str.replace(/&#(\d+);/g, function ($0, numberStr) {
          return String.fromCharCode(parseInt(numberStr, 10));
      });
  };

  // This is what browsers will submit when the ✓ character occurs in an
  // application/x-www-form-urlencoded body and the encoding of the page containing
  // the form is iso-8859-1, or when the submitted form has an accept-charset
  // attribute of iso-8859-1. Presumably also with other charsets that do not contain
  // the ✓ character, such as us-ascii.
  var isoSentinel = 'utf8=%26%2310003%3B'; // encodeURIComponent('&#10003;')

  // These are the percent-encoded utf-8 octets representing a checkmark, indicating that the request actually is utf-8 encoded.
  var charsetSentinel = 'utf8=%E2%9C%93'; // encodeURIComponent('✓')

  var parseValues = function parseQueryStringValues(str, options) {
      var obj = {};
      var cleanStr = options.ignoreQueryPrefix ? str.replace(/^\?/, '') : str;
      var limit = options.parameterLimit === Infinity ? undefined : options.parameterLimit;
      var parts = cleanStr.split(options.delimiter, limit);
      var skipIndex = -1; // Keep track of where the utf8 sentinel was found
      var i;

      var charset = options.charset;
      if (options.charsetSentinel) {
          for (i = 0; i < parts.length; ++i) {
              if (parts[i].indexOf('utf8=') === 0) {
                  if (parts[i] === charsetSentinel) {
                      charset = 'utf-8';
                  } else if (parts[i] === isoSentinel) {
                      charset = 'iso-8859-1';
                  }
                  skipIndex = i;
                  i = parts.length; // The eslint settings do not allow break;
              }
          }
      }

      for (i = 0; i < parts.length; ++i) {
          if (i === skipIndex) {
              continue;
          }
          var part = parts[i];

          var bracketEqualsPos = part.indexOf(']=');
          var pos = bracketEqualsPos === -1 ? part.indexOf('=') : bracketEqualsPos + 1;

          var key, val;
          if (pos === -1) {
              key = options.decoder(part, defaults$1.decoder, charset);
              val = options.strictNullHandling ? null : '';
          } else {
              key = options.decoder(part.slice(0, pos), defaults$1.decoder, charset);
              val = options.decoder(part.slice(pos + 1), defaults$1.decoder, charset);
          }

          if (val && options.interpretNumericEntities && charset === 'iso-8859-1') {
              val = interpretNumericEntities(val);
          }
          if (has$1.call(obj, key)) {
              obj[key] = utils.combine(obj[key], val);
          } else {
              obj[key] = val;
          }
      }

      return obj;
  };

  var parseObject = function (chain, val, options) {
      var leaf = val;

      for (var i = chain.length - 1; i >= 0; --i) {
          var obj;
          var root = chain[i];

          if (root === '[]' && options.parseArrays) {
              obj = [].concat(leaf);
          } else {
              obj = options.plainObjects ? Object.create(null) : {};
              var cleanRoot = root.charAt(0) === '[' && root.charAt(root.length - 1) === ']' ? root.slice(1, -1) : root;
              var index = parseInt(cleanRoot, 10);
              if (!options.parseArrays && cleanRoot === '') {
                  obj = { 0: leaf };
              } else if (
                  !isNaN(index)
                  && root !== cleanRoot
                  && String(index) === cleanRoot
                  && index >= 0
                  && (options.parseArrays && index <= options.arrayLimit)
              ) {
                  obj = [];
                  obj[index] = leaf;
              } else {
                  obj[cleanRoot] = leaf;
              }
          }

          leaf = obj;
      }

      return leaf;
  };

  var parseKeys = function parseQueryStringKeys(givenKey, val, options) {
      if (!givenKey) {
          return;
      }

      // Transform dot notation to bracket notation
      var key = options.allowDots ? givenKey.replace(/\.([^.[]+)/g, '[$1]') : givenKey;

      // The regex chunks

      var brackets = /(\[[^[\]]*])/;
      var child = /(\[[^[\]]*])/g;

      // Get the parent

      var segment = brackets.exec(key);
      var parent = segment ? key.slice(0, segment.index) : key;

      // Stash the parent if it exists

      var keys = [];
      if (parent) {
          // If we aren't using plain objects, optionally prefix keys that would overwrite object prototype properties
          if (!options.plainObjects && has$1.call(Object.prototype, parent)) {
              if (!options.allowPrototypes) {
                  return;
              }
          }

          keys.push(parent);
      }

      // Loop through children appending to the array until we hit depth

      var i = 0;
      while ((segment = child.exec(key)) !== null && i < options.depth) {
          i += 1;
          if (!options.plainObjects && has$1.call(Object.prototype, segment[1].slice(1, -1))) {
              if (!options.allowPrototypes) {
                  return;
              }
          }
          keys.push(segment[1]);
      }

      // If there's a remainder, just add whatever is left

      if (segment) {
          keys.push('[' + key.slice(segment.index) + ']');
      }

      return parseObject(keys, val, options);
  };

  var parse = function (str, opts) {
      var options = opts ? utils.assign({}, opts) : {};

      if (options.decoder !== null && options.decoder !== undefined && typeof options.decoder !== 'function') {
          throw new TypeError('Decoder has to be a function.');
      }

      options.ignoreQueryPrefix = options.ignoreQueryPrefix === true;
      options.delimiter = typeof options.delimiter === 'string' || utils.isRegExp(options.delimiter) ? options.delimiter : defaults$1.delimiter;
      options.depth = typeof options.depth === 'number' ? options.depth : defaults$1.depth;
      options.arrayLimit = typeof options.arrayLimit === 'number' ? options.arrayLimit : defaults$1.arrayLimit;
      options.parseArrays = options.parseArrays !== false;
      options.decoder = typeof options.decoder === 'function' ? options.decoder : defaults$1.decoder;
      options.allowDots = typeof options.allowDots === 'undefined' ? defaults$1.allowDots : !!options.allowDots;
      options.plainObjects = typeof options.plainObjects === 'boolean' ? options.plainObjects : defaults$1.plainObjects;
      options.allowPrototypes = typeof options.allowPrototypes === 'boolean' ? options.allowPrototypes : defaults$1.allowPrototypes;
      options.parameterLimit = typeof options.parameterLimit === 'number' ? options.parameterLimit : defaults$1.parameterLimit;
      options.strictNullHandling = typeof options.strictNullHandling === 'boolean' ? options.strictNullHandling : defaults$1.strictNullHandling;

      if (typeof options.charset !== 'undefined' && options.charset !== 'utf-8' && options.charset !== 'iso-8859-1') {
          throw new Error('The charset option must be either utf-8, iso-8859-1, or undefined');
      }
      if (typeof options.charset === 'undefined') {
          options.charset = defaults$1.charset;
      }

      if (str === '' || str === null || typeof str === 'undefined') {
          return options.plainObjects ? Object.create(null) : {};
      }

      var tempObj = typeof str === 'string' ? parseValues(str, options) : str;
      var obj = options.plainObjects ? Object.create(null) : {};

      // Iterate over the keys and setup the new object

      var keys = Object.keys(tempObj);
      for (var i = 0; i < keys.length; ++i) {
          var key = keys[i];
          var newObj = parseKeys(key, tempObj[key], options);
          obj = utils.merge(obj, newObj, options);
      }

      return utils.compact(obj);
  };

  var lib = {
      formats: formats,
      parse: parse,
      stringify: stringify_1
  };

  var GraphNode =
  /*#__PURE__*/
  function () {
    // the name of the fields param
    // the name of the limit param
    // the name of the access token param
    // the name of the app secret proof param

    /**
     * Create a new GraphNode value object.
     *
     * @param {string} name
     * @param {Array}  fields
     * @param {number} limit
     */
    function GraphNode(name) {
      var fields = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var limit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

      _classCallCheck(this, GraphNode);

      this._name = name; // the name of the node

      this._modifiers = {}; // the modifiers that will be appended to the node

      this._fields = fields; // the fields & GraphEdge's that we want to request

      this._compiledValues = []; // compiled values that are ready to be concatenated

      if (limit) this.limit(limit);
    }
    /**
     * Modifier data to be sent with this node.
     *
     * @param {Object} data
     * @return GraphNode
     */


    _createClass(GraphNode, [{
      key: "modifiers",
      value: function modifiers(data) {
        Object.assign(this._modifiers, data);
        return this;
      }
      /**
       * Gets the modifiers for this node.
       *
       * @return {Object}
       */

    }, {
      key: "getModifiers",
      value: function getModifiers() {
        return this._modifiers;
      }
      /**
       * Gets a modifier if it is set.
       *
       * @param {string} key
       * @return {(Mixed|null)}
       */

    }, {
      key: "getModifier",
      value: function getModifier(key) {
        return this._modifiers[key] ? this._modifiers[key] : null;
      }
      /**
       * Set the limit for this node.
       *
       * @param {number} limit
       * @return GraphNode
       */

    }, {
      key: "limit",
      value: function limit(_limit) {
        this._modifiers[GraphNode.PARAM_LIMIT] = _limit;
        return this;
      }
      /**
       * Gets the limit for this node.
       *
       * @return {(number|null)}
       */

    }, {
      key: "getLimit",
      value: function getLimit() {
        return this._modifiers[GraphNode.PARAM_LIMIT];
      }
      /**
       * Set the fields for this node.
       *
       * @param {...number} $fields
       *
       * @return GraphNode
       */

    }, {
      key: "fields",
      value: function fields() {
        for (var _len = arguments.length, _fields = new Array(_len), _key = 0; _key < _len; _key++) {
          _fields[_key] = arguments[_key];
        }

        this._fields = _fields.length === 1 && Array.isArray(_fields[0]) ? this._fields.concat(_fields[0]) : this._fields.concat(_fields);
        return this;
      }
      /**
       * Gets the fields for this node.
       *
       * @return {Array}
       */

    }, {
      key: "getFields",
      value: function getFields() {
        return this._fields;
      }
      /**
       * Clear the compiled values.
       */

    }, {
      key: "resetCompiledValues",
      value: function resetCompiledValues() {
        this._compiledValues = [];
      }
      /**
       * Compile the modifier values.
       */

    }, {
      key: "compileModifiers",
      value: function compileModifiers() {
        if (!Object.keys(this._modifiers).length) return;
        this._compiledValues = lib.stringify(this._modifiers).split('&');
      }
      /**
       * Compile the field values.
       */

    }, {
      key: "compileFields",
      value: function compileFields() {
        if (!this._fields.length) return;

        this._compiledValues.push("".concat(GraphNode.PARAM_FIELDS, "=").concat(this._fields.join()));
      }
      /**
       * Compile the the full URL.
       *
       * @return {string}
       */

    }, {
      key: "compileUrl",
      value: function compileUrl() {
        var append = '';
        if (this._compiledValues.length) append = "?".concat(this._compiledValues.join('&'));
        return "/".concat(this._name).concat(append);
      }
      /**
       * Compile the final URL as a string.
       *
       * @param {(string|null)} appSecret - The app secret for signing the URL with app secret proof.
       * @return {string}
       */

    }, {
      key: "asUrl",
      value: function asUrl() {
        var appSecret = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        this.resetCompiledValues();
        if (appSecret) this.addAppSecretProofModifier(appSecret);
        this.compileModifiers();
        this.compileFields();
        return this.compileUrl();
      }
      /**
       * Compile the final URL as a string.
       *
       * @param {(string|null)} appSecret - The app secret for signing the URL with app secret proof.
       * @return {string}
       */

    }, {
      key: "toString",
      value: function toString() {
        return this.asUrl();
      }
      /**
       * Generate an app secret proof modifier based on the app secret & access token.
       *
       * @param {string} appSecret
       */

    }, {
      key: "addAppSecretProofModifier",
      value: function addAppSecretProofModifier(appSecret) {
        var accessToken = this.getModifier(GraphNode.PARAM_ACCESS_TOKEN);
        if (!accessToken) return;
        this._modifiers[GraphNode.PARAM_APP_SECRET_PROOF] = createHmac('sha256', appSecret).update(accessToken).digest('hex');
      }
    }]);

    return GraphNode;
  }();

  _defineProperty(GraphNode, "PARAM_FIELDS", 'fields');

  _defineProperty(GraphNode, "PARAM_LIMIT", 'limit');

  _defineProperty(GraphNode, "PARAM_ACCESS_TOKEN", 'access_token');

  _defineProperty(GraphNode, "PARAM_APP_SECRET_PROOF", 'appsecret_proof');

  var GraphEdge =
  /*#__PURE__*/
  function (_GraphNode) {
    _inherits(GraphEdge, _GraphNode);

    function GraphEdge() {
      _classCallCheck(this, GraphEdge);

      return _possibleConstructorReturn(this, _getPrototypeOf(GraphEdge).apply(this, arguments));
    }

    _createClass(GraphEdge, [{
      key: "toEndpoints",

      /**
       * Convert the nested query into an array of endpoints.
       *
       * @return {Array}
       */
      value: function toEndpoints() {
        var endpoints = [];
        var children = this.getChildEdges();
        children.forEach(function (child) {
          endpoints.push("/".concat(child.join('/')));
        });
        return endpoints;
      }
      /**
       * Arrange the child edge nodes into a multidimensional array.
       *
       * @return {Array}
       */

    }, {
      key: "getChildEdges",
      value: function getChildEdges() {
        var _this = this;

        var edges = [];
        var hasChildren = false;

        this._fields.forEach(function (field) {
          if (field instanceof GraphEdge) {
            hasChildren = true;
            var children = field.getChildEdges();
            children.forEach(function (childEdges) {
              edges.push([_this._name].concat(childEdges));
            });
          }
        });

        if (!hasChildren) {
          edges.push([this._name]);
        }

        return edges;
      }
      /**
       * Compile the modifier values.
       */

    }, {
      key: "compileModifiers",
      value: function compileModifiers() {
        var _this2 = this;

        if (!Object.keys(this._modifiers).length) return;
        var processedModifiers = [];
        Object.keys(this._modifiers).forEach(function (prop) {
          processedModifiers.push("".concat(encodeURIComponent(prop), "(").concat(encodeURIComponent(_this2._modifiers[prop]), ")"));
        });

        this._compiledValues.push(".".concat(processedModifiers.join('.')));
      }
      /**
       * Compile the field values.
       */

    }, {
      key: "compileFields",
      value: function compileFields() {
        if (!this._fields.length) return;
        var processedFields = [];

        this._fields.forEach(function (field) {
          processedFields.push(field instanceof GraphEdge ? field.asUrl() : encodeURIComponent(field));
        });

        this._compiledValues.push("{".concat(processedFields.join(','), "}"));
      }
      /**
       * Compile the the full URL.
       *
       * @return {string}
       */

    }, {
      key: "compileUrl",
      value: function compileUrl() {
        var append = '';
        if (this._compiledValues.length) append = this._compiledValues.join('');
        return this._name + append;
      }
    }]);

    return GraphEdge;
  }(GraphNode);

  var FQB =
  /*#__PURE__*/
  function () {
    /**
     * @param {Object} config - An array of config options.
     * @param {string} graphEndpoint - The name of the Graph API endpoint.
     */
    function FQB() {
      var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var graphEndpoint = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

      _classCallCheck(this, FQB);

      this._graphNode = undefined; // the GraphNode we are working with

      this._graphVersion = undefined; // the URL prefix version of the Graph API

      this._appSecret = undefined; // the application secret key

      this._enableBetaMode = false; // a toggle to enable the beta tier of the Graph API

      this._config = config; // the config options sent in from the user

      this._graphNode = new GraphNode(graphEndpoint);
      if (config.hasOwnProperty('accessToken')) this.accessToken(config.accessToken);
      if (config.hasOwnProperty('graphVersion')) this.graphVersion(config.graphVersion);
      if (config.hasOwnProperty('appSecret')) this._appSecret = config.appSecret;
      if (config.hasOwnProperty('enableBetaMode') && config.enableBetaMode === true) this._enableBetaMode = true;
    }
    /**
     * New up an instance of self.
     *
     * @param {string} graphNodeName - The node name.
     * @return FQB
     */


    _createClass(FQB, [{
      key: "node",
      value: function node(graphNodeName) {
        return new FQB(this._config, graphNodeName);
      }
      /**
       * New up an Edge instance.
       *
       * @param {string} edgeName
       * @param {Array}  fields - The fields we want on the edge.
       * @return GraphEdge
       */

    }, {
      key: "edge",
      value: function edge(edgeName, fields) {
        return new GraphEdge(edgeName, fields);
      }
      /**
       * Alias to method on GraphNode.
       *
       * @param {(Array|string)} fields
       * @return FQB
       */

    }, {
      key: "fields",
      value: function fields() {
        for (var _len = arguments.length, _fields = new Array(_len), _key = 0; _key < _len; _key++) {
          _fields[_key] = arguments[_key];
        }

        if (_fields.length === 1 && Array.isArray(_fields[0])) this._graphNode.fields(_fields[0]);else this._graphNode.fields(_fields);
        return this;
      }
      /**
       * Sets the access token to use with this request.
       *
       * @param {string} accessToken - The access token to overwrite the default.
       * @return FQB
       */

    }, {
      key: "accessToken",
      value: function accessToken(_accessToken) {
        this._graphNode.modifiers(Object.assign(this._graphNode._modifiers, {
          access_token: _accessToken
        }));

        return this;
      }
      /**
       * Sets the graph version to use with this request.
       *
       * @param {string} graphVersion - The access token to overwrite the default.
       * @return FQB
       */

    }, {
      key: "graphVersion",
      value: function graphVersion(_graphVersion) {
        this._graphVersion = _graphVersion;
        return this;
      }
      /**
       * Alias to method on GraphNode.
       *
       * @param {number} limit
       * @return FQB
       */

    }, {
      key: "limit",
      value: function limit(_limit) {
        this._graphNode.limit(_limit);

        return this;
      }
      /**
       * Alias to method on GraphNode.
       *
       * @param {Object} data
       *
       * @return FQB
       */

    }, {
      key: "modifiers",
      value: function modifiers(data) {
        this._graphNode.modifiers(data);

        return this;
      }
      /**
       * Return the generated request as a URL with the hostname.
       *
       * @return {string}
       */

    }, {
      key: "asUrl",
      value: function asUrl() {
        return "".concat(this.getHostname()).concat(this.asEndpoint());
      }
      /**
       * Return the generated request as a URL endpoint sans the hostname.
       *
       * @return {string}
       */

    }, {
      key: "asEndpoint",
      value: function asEndpoint() {
        var graphVersionPrefix = '';
        if (this._graphVersion) graphVersionPrefix = "/".concat(this._graphVersion);
        return "".concat(graphVersionPrefix).concat(this._graphNode.asUrl(this._appSecret));
      }
      /**
       * Returns the Graph URL as nicely formatted string.
       *
       * @return {string}
       */

    }, {
      key: "toString",
      value: function toString() {
        return this.asUrl();
      }
      /**
       * Returns the Graph API hostname.
       *
       * @return {string}
       */

    }, {
      key: "getHostname",
      value: function getHostname() {
        return this._enableBetaMode ? FQB.BASE_GRAPH_URL_BETA : FQB.BASE_GRAPH_URL;
      }
    }]);

    return FQB;
  }();

  _defineProperty(FQB, "BASE_GRAPH_URL", 'https://graph.facebook.com');

  _defineProperty(FQB, "BASE_GRAPH_URL_BETA", 'https://graph.beta.facebook.com');

  return FQB;

}));
