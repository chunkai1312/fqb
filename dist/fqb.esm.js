import createHmac from 'create-hmac';
import qs from 'qs';

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
      this._compiledValues = qs.stringify(this._modifiers).split('&');
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

export default FQB;
