'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _graph_node = require('./graph_node');

var _graph_node2 = _interopRequireDefault(_graph_node);

var _graph_edge = require('./graph_edge');

var _graph_edge2 = _interopRequireDefault(_graph_edge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FQB = function () {
  // beta tier URL of the Graph API

  function FQB() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var graphEndpoint = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

    _classCallCheck(this, FQB);

    this._graphNode; // the GraphNode we are working with
    this._graphVersion; // the URL prefix version of the Graph API
    this._appSecret; // the application secret key
    this._enableBetaMode = false; // a toggle to enable the beta tier of the Graph API
    this._config = config; // the config options sent in from the user

    this._graphNode = new _graph_node2.default(graphEndpoint);
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
  // production Graph API URL


  _createClass(FQB, [{
    key: 'node',
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
    key: 'edge',
    value: function edge(edgeName, fields) {
      return new _graph_edge2.default(edgeName, fields);
    }

    /**
     * Alias to method on GraphNode.
     *
     * @param {(Array|string)} fields
     * @return FQB
     */

  }, {
    key: 'fields',
    value: function fields() {
      for (var _len = arguments.length, _fields = Array(_len), _key = 0; _key < _len; _key++) {
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
    key: 'accessToken',
    value: function accessToken(_accessToken) {
      this._graphNode.modifiers(Object.assign(this._graphNode._modifiers, { access_token: _accessToken }));
      return this;
    }

    /**
     * Sets the graph version to use with this request.
     *
     * @param {string} graphVersion - The access token to overwrite the default.
     * @return FQB
     */

  }, {
    key: 'graphVersion',
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
    key: 'limit',
    value: function limit(_limit) {
      this._graphNode.limit(_limit);
      return this;
    }

    /**
     * Alias to method on GraphNode.
     *
     * @param {Array} data
     *
     * @return FQB
     */

  }, {
    key: 'modifiers',
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
    key: 'asUrl',
    value: function asUrl() {
      return '' + this.getHostname() + this.asEndpoint();
    }

    /**
     * Returns the Graph URL as nicely formatted string.
     *
     * @return {string}
     */

  }, {
    key: 'asEndpoint',
    value: function asEndpoint() {
      var graphVersionPrefix = '';
      if (this._graphVersion) graphVersionPrefix = '/' + this._graphVersion;
      return '' + graphVersionPrefix + this._graphNode.asUrl(this._appSecret);
    }

    /**
     * Returns the Graph URL as nicely formatted string.
     *
     * @return {string}
     */

  }, {
    key: 'toString',
    value: function toString() {
      return this.asUrl();
    }

    /**
     * Returns the Graph API hostname.
     *
     * @return {string}
     */

  }, {
    key: 'getHostname',
    value: function getHostname() {
      return this._enableBetaMode ? FQB.BASE_GRAPH_URL_BETA : FQB.BASE_GRAPH_URL;
    }
  }]);

  return FQB;
}();

FQB.BASE_GRAPH_URL = 'https://graph.facebook.com';
FQB.BASE_GRAPH_URL_BETA = 'https://graph.beta.facebook.com';
exports.default = FQB;
module.exports = exports['default'];