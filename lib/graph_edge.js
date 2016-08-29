'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _graph_node = require('./graph_node');

var _graph_node2 = _interopRequireDefault(_graph_node);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GraphEdge = function (_GraphNode) {
  _inherits(GraphEdge, _GraphNode);

  function GraphEdge() {
    _classCallCheck(this, GraphEdge);

    return _possibleConstructorReturn(this, (GraphEdge.__proto__ || Object.getPrototypeOf(GraphEdge)).apply(this, arguments));
  }

  _createClass(GraphEdge, [{
    key: 'toEndpoints',


    /**
     * Convert the nested query into an array of endpoints.
     *
     * @return {Array}
     */
    value: function toEndpoints() {
      var endpoints = [];

      var children = this.getChildEdges();
      children.forEach(function (child) {
        endpoints.push('/' + child.join('/'));
      });

      return endpoints;
    }

    /**
     * Arrange the child edge nodes into a multidimensional array.
     *
     * @return {Array}
     */

  }, {
    key: 'getChildEdges',
    value: function getChildEdges() {
      var _this2 = this;

      var edges = [];
      var hasChildren = false;

      this._fields.forEach(function (field) {
        if (field instanceof GraphEdge) {
          hasChildren = true;

          var children = field.getChildEdges();
          children.forEach(function (childEdges) {
            edges.push([_this2._name].concat(childEdges));
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
    key: 'compileModifiers',
    value: function compileModifiers() {
      var _this3 = this;

      if (!Object.keys(this._modifiers).length) return;

      var processedModifiers = [];

      Object.keys(this._modifiers).forEach(function (prop) {
        processedModifiers.push(encodeURIComponent(prop) + '(' + encodeURIComponent(_this3._modifiers[prop]) + ')');
      });

      this._compiledValues.push('.' + processedModifiers.join('.'));
    }

    /**
     * Compile the field values.
     */

  }, {
    key: 'compileFields',
    value: function compileFields() {
      if (!this._fields.length) return;

      var processedFields = [];

      this._fields.forEach(function (field) {
        processedFields.push(field instanceof GraphEdge ? field.asUrl() : encodeURIComponent(field));
      });

      this._compiledValues.push('{' + processedFields.join(',') + '}');
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
      if (this._compiledValues.length) append = this._compiledValues.join('');
      return this._name + append;
    }
  }]);

  return GraphEdge;
}(_graph_node2.default);

exports.default = GraphEdge;
module.exports = exports['default'];