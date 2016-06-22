(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['module', './graph_node', './graph_edge'], factory);
  } else if (typeof exports !== "undefined") {
    factory(module, require('./graph_node'), require('./graph_edge'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod, global.graph_node, global.graph_edge);
    global.fqb = mod.exports;
  }
})(this, function (module, _graph_node, _graph_edge) {
  'use strict';

  var _graph_node2 = _interopRequireDefault(_graph_node);

  var _graph_edge2 = _interopRequireDefault(_graph_edge);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var BASE_GRAPH_URL = 'https://graph.facebook.com'; // production Graph API URL
  var BASE_GRAPH_URL_BETA = 'https://graph.beta.facebook.com'; // beta tier URL of the Graph API

  var FQB = function () {
    function FQB() {
      var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var graphEndpoint = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

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


    FQB.prototype.node = function node(graphNodeName) {
      return new FQB(this._config, graphNodeName);
    };

    FQB.prototype.edge = function edge(edgeName, fields) {
      return new _graph_edge2.default(edgeName, fields);
    };

    FQB.prototype.fields = function fields() {
      for (var _len = arguments.length, _fields = Array(_len), _key = 0; _key < _len; _key++) {
        _fields[_key] = arguments[_key];
      }

      if (_fields.length === 1 && Array.isArray(_fields[0])) this._graphNode.fields(_fields[0]);else this._graphNode.fields(_fields);
      return this;
    };

    FQB.prototype.accessToken = function accessToken(_accessToken) {
      this._graphNode.modifiers(Object.assign(this._graphNode._modifiers, { access_token: _accessToken }));
      return this;
    };

    FQB.prototype.graphVersion = function graphVersion(_graphVersion) {
      this._graphVersion = _graphVersion;
      return this;
    };

    FQB.prototype.limit = function limit(_limit) {
      this._graphNode.limit(_limit);
      return this;
    };

    FQB.prototype.modifiers = function modifiers(data) {
      this._graphNode.modifiers(data);
      return this;
    };

    FQB.prototype.asUrl = function asUrl() {
      return '' + this.getHostname() + this.asEndpoint();
    };

    FQB.prototype.asEndpoint = function asEndpoint() {
      var graphVersionPrefix = '';
      if (this._graphVersion) graphVersionPrefix = '/' + this._graphVersion;
      return '' + graphVersionPrefix + this._graphNode.asUrl(this._appSecret);
    };

    FQB.prototype.getHostname = function getHostname() {
      return this._enableBetaMode ? BASE_GRAPH_URL_BETA : BASE_GRAPH_URL;
    };

    return FQB;
  }();

  module.exports = FQB;
});