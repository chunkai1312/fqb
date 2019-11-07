(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('crypto')) :
    typeof define === 'function' && define.amd ? define(['crypto'], factory) :
    (global = global || self, global.FQB = factory(global.crypto));
}(this, function (crypto) { 'use strict';

    crypto = crypto && crypto.hasOwnProperty('default') ? crypto['default'] : crypto;

    var createHmac = crypto.createHmac;

    var has = Object.prototype.hasOwnProperty;
    var isArray = Array.isArray;

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

            if (isArray(obj)) {
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
        /* eslint no-param-reassign: 0 */
        if (!source) {
            return target;
        }

        if (typeof source !== 'object') {
            if (isArray(target)) {
                target.push(source);
            } else if (target && typeof target === 'object') {
                if ((options && (options.plainObjects || options.allowPrototypes)) || !has.call(Object.prototype, source)) {
                    target[source] = true;
                }
            } else {
                return [target, source];
            }

            return target;
        }

        if (!target || typeof target !== 'object') {
            return [target].concat(source);
        }

        var mergeTarget = target;
        if (isArray(target) && !isArray(source)) {
            mergeTarget = arrayToObject(target, options);
        }

        if (isArray(target) && isArray(source)) {
            source.forEach(function (item, i) {
                if (has.call(target, i)) {
                    var targetItem = target[i];
                    if (targetItem && typeof targetItem === 'object' && item && typeof item === 'object') {
                        target[i] = merge(targetItem, item, options);
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

        var string = str;
        if (typeof str === 'symbol') {
            string = Symbol.prototype.toString.call(str);
        } else if (typeof str !== 'string') {
            string = String(str);
        }

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
        if (!obj || typeof obj !== 'object') {
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



    var Format = {
        RFC1738: 'RFC1738',
        RFC3986: 'RFC3986'
    };

    var formats = utils.assign(
        {
            'default': Format.RFC3986,
            formatters: {
                RFC1738: function (value) {
                    return replace.call(value, percentTwenties, '+');
                },
                RFC3986: function (value) {
                    return String(value);
                }
            }
        },
        Format
    );

    var has$1 = Object.prototype.hasOwnProperty;

    var arrayPrefixGenerators = {
        brackets: function brackets(prefix) {
            return prefix + '[]';
        },
        comma: 'comma',
        indices: function indices(prefix, key) {
            return prefix + '[' + key + ']';
        },
        repeat: function repeat(prefix) {
            return prefix;
        }
    };

    var isArray$1 = Array.isArray;
    var push = Array.prototype.push;
    var pushToArray = function (arr, valueOrArray) {
        push.apply(arr, isArray$1(valueOrArray) ? valueOrArray : [valueOrArray]);
    };

    var toISO = Date.prototype.toISOString;

    var defaultFormat = formats['default'];
    var defaults = {
        addQueryPrefix: false,
        allowDots: false,
        charset: 'utf-8',
        charsetSentinel: false,
        delimiter: '&',
        encode: true,
        encoder: utils.encode,
        encodeValuesOnly: false,
        format: defaultFormat,
        formatter: formats.formatters[defaultFormat],
        // deprecated
        indices: false,
        serializeDate: function serializeDate(date) {
            return toISO.call(date);
        },
        skipNulls: false,
        strictNullHandling: false
    };

    var isNonNullishPrimitive = function isNonNullishPrimitive(v) {
        return typeof v === 'string'
            || typeof v === 'number'
            || typeof v === 'boolean'
            || typeof v === 'symbol'
            || typeof v === 'bigint';
    };

    var stringify = function stringify(
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
        } else if (generateArrayPrefix === 'comma' && isArray$1(obj)) {
            obj = obj.join(',');
        }

        if (obj === null) {
            if (strictNullHandling) {
                return encoder && !encodeValuesOnly ? encoder(prefix, defaults.encoder, charset, 'key') : prefix;
            }

            obj = '';
        }

        if (isNonNullishPrimitive(obj) || utils.isBuffer(obj)) {
            if (encoder) {
                var keyValue = encodeValuesOnly ? prefix : encoder(prefix, defaults.encoder, charset, 'key');
                return [formatter(keyValue) + '=' + formatter(encoder(obj, defaults.encoder, charset, 'value'))];
            }
            return [formatter(prefix) + '=' + formatter(String(obj))];
        }

        var values = [];

        if (typeof obj === 'undefined') {
            return values;
        }

        var objKeys;
        if (isArray$1(filter)) {
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

            if (isArray$1(obj)) {
                pushToArray(values, stringify(
                    obj[key],
                    typeof generateArrayPrefix === 'function' ? generateArrayPrefix(prefix, key) : prefix,
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

    var normalizeStringifyOptions = function normalizeStringifyOptions(opts) {
        if (!opts) {
            return defaults;
        }

        if (opts.encoder !== null && opts.encoder !== undefined && typeof opts.encoder !== 'function') {
            throw new TypeError('Encoder has to be a function.');
        }

        var charset = opts.charset || defaults.charset;
        if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
            throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined');
        }

        var format = formats['default'];
        if (typeof opts.format !== 'undefined') {
            if (!has$1.call(formats.formatters, opts.format)) {
                throw new TypeError('Unknown format option provided.');
            }
            format = opts.format;
        }
        var formatter = formats.formatters[format];

        var filter = defaults.filter;
        if (typeof opts.filter === 'function' || isArray$1(opts.filter)) {
            filter = opts.filter;
        }

        return {
            addQueryPrefix: typeof opts.addQueryPrefix === 'boolean' ? opts.addQueryPrefix : defaults.addQueryPrefix,
            allowDots: typeof opts.allowDots === 'undefined' ? defaults.allowDots : !!opts.allowDots,
            charset: charset,
            charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults.charsetSentinel,
            delimiter: typeof opts.delimiter === 'undefined' ? defaults.delimiter : opts.delimiter,
            encode: typeof opts.encode === 'boolean' ? opts.encode : defaults.encode,
            encoder: typeof opts.encoder === 'function' ? opts.encoder : defaults.encoder,
            encodeValuesOnly: typeof opts.encodeValuesOnly === 'boolean' ? opts.encodeValuesOnly : defaults.encodeValuesOnly,
            filter: filter,
            formatter: formatter,
            serializeDate: typeof opts.serializeDate === 'function' ? opts.serializeDate : defaults.serializeDate,
            skipNulls: typeof opts.skipNulls === 'boolean' ? opts.skipNulls : defaults.skipNulls,
            sort: typeof opts.sort === 'function' ? opts.sort : null,
            strictNullHandling: typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults.strictNullHandling
        };
    };

    var stringify_1 = function (object, opts) {
        var obj = object;
        var options = normalizeStringifyOptions(opts);

        var objKeys;
        var filter;

        if (typeof options.filter === 'function') {
            filter = options.filter;
            obj = filter('', obj);
        } else if (isArray$1(options.filter)) {
            filter = options.filter;
            objKeys = filter;
        }

        var keys = [];

        if (typeof obj !== 'object' || obj === null) {
            return '';
        }

        var arrayFormat;
        if (opts && opts.arrayFormat in arrayPrefixGenerators) {
            arrayFormat = opts.arrayFormat;
        } else if (opts && 'indices' in opts) {
            arrayFormat = opts.indices ? 'indices' : 'repeat';
        } else {
            arrayFormat = 'indices';
        }

        var generateArrayPrefix = arrayPrefixGenerators[arrayFormat];

        if (!objKeys) {
            objKeys = Object.keys(obj);
        }

        if (options.sort) {
            objKeys.sort(options.sort);
        }

        for (var i = 0; i < objKeys.length; ++i) {
            var key = objKeys[i];

            if (options.skipNulls && obj[key] === null) {
                continue;
            }
            pushToArray(keys, stringify(
                obj[key],
                key,
                generateArrayPrefix,
                options.strictNullHandling,
                options.skipNulls,
                options.encode ? options.encoder : null,
                options.filter,
                options.sort,
                options.allowDots,
                options.serializeDate,
                options.formatter,
                options.encodeValuesOnly,
                options.charset
            ));
        }

        var joined = keys.join(options.delimiter);
        var prefix = options.addQueryPrefix === true ? '?' : '';

        if (options.charsetSentinel) {
            if (options.charset === 'iso-8859-1') {
                // encodeURIComponent('&#10003;'), the "numeric entity" representation of a checkmark
                prefix += 'utf8=%26%2310003%3B&';
            } else {
                // encodeURIComponent('✓')
                prefix += 'utf8=%E2%9C%93&';
            }
        }

        return joined.length > 0 ? prefix + joined : '';
    };

    var has$2 = Object.prototype.hasOwnProperty;
    var isArray$2 = Array.isArray;

    var defaults$1 = {
        allowDots: false,
        allowPrototypes: false,
        arrayLimit: 20,
        charset: 'utf-8',
        charsetSentinel: false,
        comma: false,
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
                key = options.decoder(part, defaults$1.decoder, charset, 'key');
                val = options.strictNullHandling ? null : '';
            } else {
                key = options.decoder(part.slice(0, pos), defaults$1.decoder, charset, 'key');
                val = options.decoder(part.slice(pos + 1), defaults$1.decoder, charset, 'value');
            }

            if (val && options.interpretNumericEntities && charset === 'iso-8859-1') {
                val = interpretNumericEntities(val);
            }

            if (val && typeof val === 'string' && options.comma && val.indexOf(',') > -1) {
                val = val.split(',');
            }

            if (part.indexOf('[]=') > -1) {
                val = isArray$2(val) ? [val] : val;
            }

            if (has$2.call(obj, key)) {
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

        var segment = options.depth > 0 && brackets.exec(key);
        var parent = segment ? key.slice(0, segment.index) : key;

        // Stash the parent if it exists

        var keys = [];
        if (parent) {
            // If we aren't using plain objects, optionally prefix keys that would overwrite object prototype properties
            if (!options.plainObjects && has$2.call(Object.prototype, parent)) {
                if (!options.allowPrototypes) {
                    return;
                }
            }

            keys.push(parent);
        }

        // Loop through children appending to the array until we hit depth

        var i = 0;
        while (options.depth > 0 && (segment = child.exec(key)) !== null && i < options.depth) {
            i += 1;
            if (!options.plainObjects && has$2.call(Object.prototype, segment[1].slice(1, -1))) {
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

    var normalizeParseOptions = function normalizeParseOptions(opts) {
        if (!opts) {
            return defaults$1;
        }

        if (opts.decoder !== null && opts.decoder !== undefined && typeof opts.decoder !== 'function') {
            throw new TypeError('Decoder has to be a function.');
        }

        if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
            throw new Error('The charset option must be either utf-8, iso-8859-1, or undefined');
        }
        var charset = typeof opts.charset === 'undefined' ? defaults$1.charset : opts.charset;

        return {
            allowDots: typeof opts.allowDots === 'undefined' ? defaults$1.allowDots : !!opts.allowDots,
            allowPrototypes: typeof opts.allowPrototypes === 'boolean' ? opts.allowPrototypes : defaults$1.allowPrototypes,
            arrayLimit: typeof opts.arrayLimit === 'number' ? opts.arrayLimit : defaults$1.arrayLimit,
            charset: charset,
            charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults$1.charsetSentinel,
            comma: typeof opts.comma === 'boolean' ? opts.comma : defaults$1.comma,
            decoder: typeof opts.decoder === 'function' ? opts.decoder : defaults$1.decoder,
            delimiter: typeof opts.delimiter === 'string' || utils.isRegExp(opts.delimiter) ? opts.delimiter : defaults$1.delimiter,
            // eslint-disable-next-line no-implicit-coercion, no-extra-parens
            depth: (typeof opts.depth === 'number' || opts.depth === false) ? +opts.depth : defaults$1.depth,
            ignoreQueryPrefix: opts.ignoreQueryPrefix === true,
            interpretNumericEntities: typeof opts.interpretNumericEntities === 'boolean' ? opts.interpretNumericEntities : defaults$1.interpretNumericEntities,
            parameterLimit: typeof opts.parameterLimit === 'number' ? opts.parameterLimit : defaults$1.parameterLimit,
            parseArrays: opts.parseArrays !== false,
            plainObjects: typeof opts.plainObjects === 'boolean' ? opts.plainObjects : defaults$1.plainObjects,
            strictNullHandling: typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults$1.strictNullHandling
        };
    };

    var parse = function (str, opts) {
        var options = normalizeParseOptions(opts);

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

    var GraphNode = /** @class */ (function () {
        /**
         * Create a new GraphNode value object.
         *
         * @param {string} name
         * @param {Array}  fields
         * @param {number} limit
         */
        function GraphNode(name, fields, limit) {
            this._name = name || '';
            this._modifiers = {};
            this._fields = fields || [];
            this._compiledValues = [];
            if (limit)
                this.limit(limit);
        }
        /**
         * Modifier data to be sent with this node.
         *
         * @param {Object} data
         * @return GraphNode
         */
        GraphNode.prototype.modifiers = function (data) {
            Object.assign(this._modifiers, data);
            return this;
        };
        /**
         * Gets the modifiers for this node.
         *
         * @return {Object}
         */
        GraphNode.prototype.getModifiers = function () {
            return this._modifiers;
        };
        /**
         * Gets a modifier if it is set.
         *
         * @param {string} key
         * @return {unknown}
         */
        GraphNode.prototype.getModifier = function (key) {
            return this._modifiers[key] ? this._modifiers[key] : null;
        };
        /**
         * Set the limit for this node.
         *
         * @param {number} limit
         * @return GraphNode
         */
        GraphNode.prototype.limit = function (limit) {
            this._modifiers[GraphNode.PARAM_LIMIT] = limit;
            return this;
        };
        /**
         * Gets the limit for this node.
         *
         * @return {(number|undefined)}
         */
        GraphNode.prototype.getLimit = function () {
            return this._modifiers[GraphNode.PARAM_LIMIT];
        };
        /**
         * Set the fields for this node.
         *
         * @param {Array} fields
         *
         * @return GraphNode
         */
        GraphNode.prototype.fields = function () {
            var fields = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                fields[_i] = arguments[_i];
            }
            this._fields = (fields.length === 1 && Array.isArray(fields[0]))
                ? this._fields.concat(fields[0])
                : this._fields.concat(fields);
            return this;
        };
        /**
         * Gets the fields for this node.
         *
         * @return {Array}
         */
        GraphNode.prototype.getFields = function () {
            return this._fields;
        };
        /**
         * Clear the compiled values.
         */
        GraphNode.prototype.resetCompiledValues = function () {
            this._compiledValues = [];
        };
        /**
         * Compile the modifier values.
         */
        GraphNode.prototype.compileModifiers = function () {
            if (!Object.keys(this._modifiers).length)
                return;
            this._compiledValues = lib.stringify(this._modifiers).split('&');
        };
        /**
         * Compile the field values.
         */
        GraphNode.prototype.compileFields = function () {
            if (!this._fields.length)
                return;
            this._compiledValues.push(GraphNode.PARAM_FIELDS + "=" + this._fields.join());
        };
        /**
         * Compile the the full URL.
         *
         * @return {string}
         */
        GraphNode.prototype.compileUrl = function () {
            var append = '';
            if (this._compiledValues.length)
                append = "?" + this._compiledValues.join('&');
            return "/" + this._name + append;
        };
        /**
         * Compile the final URL as a string.
         *
         * @param {(string|null)} appSecret - The app secret for signing the URL with app secret proof.
         * @return {string}
         */
        GraphNode.prototype.asUrl = function (appSecret) {
            this.resetCompiledValues();
            if (appSecret)
                this.addAppSecretProofModifier(appSecret);
            this.compileModifiers();
            this.compileFields();
            return this.compileUrl();
        };
        /**
         * Compile the final URL as a string.
         *
         * @param {(string|null)} appSecret - The app secret for signing the URL with app secret proof.
         * @return {string}
         */
        GraphNode.prototype.toString = function () {
            return this.asUrl();
        };
        /**
         * Generate an app secret proof modifier based on the app secret & access token.
         *
         * @param {string} appSecret
         */
        GraphNode.prototype.addAppSecretProofModifier = function (appSecret) {
            var accessToken = this.getModifier(GraphNode.PARAM_ACCESS_TOKEN);
            if (!accessToken)
                return;
            this._modifiers[GraphNode.PARAM_APP_SECRET_PROOF] = createHmac('sha256', appSecret).update(accessToken).digest('hex');
        };
        GraphNode.PARAM_FIELDS = 'fields'; // the name of the fields param
        GraphNode.PARAM_LIMIT = 'limit'; // the name of the limit param
        GraphNode.PARAM_ACCESS_TOKEN = 'access_token'; // the name of the access token param
        GraphNode.PARAM_APP_SECRET_PROOF = 'appsecret_proof'; // the name of the app secret proof param
        return GraphNode;
    }());

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var GraphEdge = /** @class */ (function (_super) {
        __extends(GraphEdge, _super);
        function GraphEdge() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Convert the nested query into an array of endpoints.
         *
         * @return {Array}
         */
        GraphEdge.prototype.toEndpoints = function () {
            var endpoints = [];
            var children = this.getChildEdges();
            children.forEach(function (child) {
                endpoints.push("/" + child.join('/'));
            });
            return endpoints;
        };
        /**
         * Arrange the child edge nodes into a multidimensional array.
         *
         * @return {Array}
         */
        GraphEdge.prototype.getChildEdges = function () {
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
        };
        /**
         * Compile the modifier values.
         */
        GraphEdge.prototype.compileModifiers = function () {
            var _this = this;
            if (!Object.keys(this._modifiers).length)
                return;
            var processedModifiers = [];
            Object.keys(this._modifiers).forEach(function (prop) {
                processedModifiers.push(encodeURIComponent(prop) + "(" + encodeURIComponent(_this._modifiers[prop]) + ")");
            });
            this._compiledValues.push("." + processedModifiers.join('.'));
        };
        /**
         * Compile the field values.
         */
        GraphEdge.prototype.compileFields = function () {
            if (!this._fields.length)
                return;
            var processedFields = [];
            this._fields.forEach(function (field) {
                processedFields.push((field instanceof GraphEdge) ? field.asUrl() : encodeURIComponent(field));
            });
            this._compiledValues.push("{" + processedFields.join(',') + "}");
        };
        /**
         * Compile the the full URL.
         *
         * @return {string}
         */
        GraphEdge.prototype.compileUrl = function () {
            var append = '';
            if (this._compiledValues.length)
                append = this._compiledValues.join('');
            return this._name + append;
        };
        return GraphEdge;
    }(GraphNode));

    var FQB = /** @class */ (function () {
        /**
         * @param {Object} config - An array of config options.
         * @param {string} graphEndpoint - The name of the Graph API endpoint.
         */
        function FQB(config, graphEndpoint) {
            if (config === void 0) { config = {}; }
            this._graphNode = new GraphNode(graphEndpoint);
            this._config = config;
            if (config.hasOwnProperty('accessToken'))
                this.accessToken(config.accessToken);
            if (config.hasOwnProperty('graphVersion'))
                this.graphVersion(config.graphVersion);
            if (config.hasOwnProperty('appSecret'))
                this._appSecret = config.appSecret;
            if (config.hasOwnProperty('enableBetaMode') && config.enableBetaMode === true)
                this._enableBetaMode = true;
        }
        /**
         * New up an instance of self.
         *
         * @param {string} graphNodeName - The node name.
         * @return FQB
         */
        FQB.prototype.node = function (graphNodeName) {
            return new FQB(this._config, graphNodeName);
        };
        /**
         * New up an Edge instance.
         *
         * @param {string} edgeName
         * @param {Array}  fields - The fields we want on the edge.
         * @return GraphEdge
         */
        FQB.prototype.edge = function (edgeName, fields) {
            return new GraphEdge(edgeName, fields);
        };
        /**
         * Alias to method on GraphNode.
         *
         * @param {(Array|string)} fields
         * @return FQB
         */
        FQB.prototype.fields = function () {
            var fields = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                fields[_i] = arguments[_i];
            }
            if (fields.length === 1 && Array.isArray(fields[0]))
                this._graphNode.fields(fields[0]);
            else
                this._graphNode.fields(fields);
            return this;
        };
        /**
         * Sets the access token to use with this request.
         *
         * @param {string} accessToken - The access token to overwrite the default.
         * @return FQB
         */
        FQB.prototype.accessToken = function (accessToken) {
            this._graphNode.modifiers(Object.assign(this._graphNode.getModifiers(), { access_token: accessToken })); // eslint-disable-line @typescript-eslint/camelcase
            return this;
        };
        /**
         * Sets the graph version to use with this request.
         *
         * @param {string} graphVersion - The access token to overwrite the default.
         * @return FQB
         */
        FQB.prototype.graphVersion = function (graphVersion) {
            this._graphVersion = graphVersion;
            return this;
        };
        /**
         * Alias to method on GraphNode.
         *
         * @param {number} limit
         * @return FQB
         */
        FQB.prototype.limit = function (limit) {
            this._graphNode.limit(limit);
            return this;
        };
        /**
         * Alias to method on GraphNode.
         *
         * @param {Object} data
         *
         * @return FQB
         */
        FQB.prototype.modifiers = function (data) {
            this._graphNode.modifiers(data);
            return this;
        };
        /**
         * Return the generated request as a URL with the hostname.
         *
         * @return {string}
         */
        FQB.prototype.asUrl = function () {
            return "" + this.getHostname() + this.asEndpoint();
        };
        /**
         * Return the generated request as a URL endpoint sans the hostname.
         *
         * @return {string}
         */
        FQB.prototype.asEndpoint = function () {
            var graphVersionPrefix = '';
            if (this._graphVersion)
                graphVersionPrefix = "/" + this._graphVersion;
            return "" + graphVersionPrefix + this._graphNode.asUrl(this._appSecret);
        };
        /**
         * Returns the Graph URL as nicely formatted string.
         *
         * @return {string}
         */
        FQB.prototype.toString = function () {
            return this.asUrl();
        };
        /**
         * Returns the Graph API hostname.
         *
         * @return {string}
         */
        FQB.prototype.getHostname = function () {
            return (this._enableBetaMode)
                ? FQB.BASE_GRAPH_URL_BETA
                : FQB.BASE_GRAPH_URL;
        };
        FQB.BASE_GRAPH_URL = 'https://graph.facebook.com'; // production Graph API URL
        FQB.BASE_GRAPH_URL_BETA = 'https://graph.beta.facebook.com'; // beta tier URL of the Graph API
        return FQB;
    }());

    return FQB;

}));
