'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _createHmac = require('create-hmac');

var _createHmac2 = _interopRequireDefault(_createHmac);

var _qs = require('qs');

var _qs2 = _interopRequireDefault(_qs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PARAM_FIELDS = 'fields'; // the name of the fields param
var PARAM_LIMIT = 'limit'; // the name of the limit param
var PARAM_ACCESS_TOKEN = 'access_token'; // the name of the access token param
var PARAM_APP_SECRET_PROOF = 'appsecret_proof'; // the name of the app secret proof param

var GraphNode = function () {

  /**
   * Create a new GraphNode value object.
   *
   * @param {string} name
   * @param {Array}  fields
   * @param {number} limit
   */
  function GraphNode(name) {
    var fields = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
    var limit = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

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
   * @param {Array} data
   * @return GraphNode
   */


  _createClass(GraphNode, [{
    key: 'modifiers',
    value: function modifiers(data) {
      Object.assign(this._modifiers, data);
      return this;
    }

    /**
     * Gets the modifiers for this node.
     *
     * @return {Array}
     */

  }, {
    key: 'getModifiers',
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
    key: 'getModifier',
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
    key: 'limit',
    value: function limit(_limit) {
      this._modifiers[PARAM_LIMIT] = _limit;
      return this;
    }

    /**
     * Gets the limit for this node.
     *
     * @return {(number|null)}
     */

  }, {
    key: 'getLimit',
    value: function getLimit() {
      return this._modifiers[PARAM_LIMIT];
    }

    /**
     * Set the fields for this node.
     *
     * @param {...number} $fields
     *
     * @return GraphNode
     */

  }, {
    key: 'fields',
    value: function fields() {
      for (var _len = arguments.length, _fields = Array(_len), _key = 0; _key < _len; _key++) {
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
    key: 'getFields',
    value: function getFields() {
      return this._fields;
    }

    /**
     * Clear the compiled values.
     */

  }, {
    key: 'resetCompiledValues',
    value: function resetCompiledValues() {
      this._compiledValues = [];
    }

    /**
     * Compile the modifier values.
     */

  }, {
    key: 'compileModifiers',
    value: function compileModifiers() {
      if (!Object.keys(this._modifiers).length) return;
      this._compiledValues = _qs2.default.stringify(this._modifiers).split('&');
    }

    /**
     * Compile the field values.
     */

  }, {
    key: 'compileFields',
    value: function compileFields() {
      if (!this._fields.length) return;
      this._compiledValues.push(PARAM_FIELDS + '=' + this._fields.join());
    }

    /**
     * Compile the the full URL.
     *
     * @return {string}
     */

  }, {
    key: 'compileUrl',
    value: function compileUrl() {
      var append = '';
      if (this._compiledValues.length) append = '?' + this._compiledValues.join('&');
      return '/' + this._name + append;
    }

    /**
     * Compile the final URL as a string.
     *
     * @param {(string|null)} appSecret - The app secret for signing the URL with app secret proof.
     * @return {string}
     */

  }, {
    key: 'asUrl',
    value: function asUrl() {
      var appSecret = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

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
    key: 'toString',
    value: function toString() {
      return this.asUrl();
    }

    /**
     * Generate an app secret proof modifier based on the app secret & access token.
     *
     * @param {string} appSecret
     */

  }, {
    key: 'addAppSecretProofModifier',
    value: function addAppSecretProofModifier(appSecret) {
      var accessToken = this.getModifier(PARAM_ACCESS_TOKEN);
      if (!accessToken) return;
      this._modifiers[PARAM_APP_SECRET_PROOF] = (0, _createHmac2.default)('sha256', appSecret).update(accessToken).digest('hex');
    }
  }]);

  return GraphNode;
}();

exports.default = GraphNode;
module.exports = exports['default'];