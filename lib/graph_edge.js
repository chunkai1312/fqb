(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['module', './graph_node'], factory);
  } else if (typeof exports !== "undefined") {
    factory(module, require('./graph_node'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod, global.graph_node);
    global.graph_edge = mod.exports;
  }
})(this, function (module, _graph_node) {
  'use strict';

  var _graph_node2 = _interopRequireDefault(_graph_node);

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

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  var GraphEdge = function (_GraphNode) {
    _inherits(GraphEdge, _GraphNode);

    function GraphEdge() {
      _classCallCheck(this, GraphEdge);

      return _possibleConstructorReturn(this, _GraphNode.apply(this, arguments));
    }

    GraphEdge.prototype.toEndpoints = function toEndpoints() {
      var endpoints = [];

      var children = this.getChildEdges();
      children.forEach(function (child) {
        endpoints.push('/' + child.join('/'));
      });

      return endpoints;
    };

    GraphEdge.prototype.getChildEdges = function getChildEdges() {
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
    };

    GraphEdge.prototype.compileModifiers = function compileModifiers() {
      var _this3 = this;

      if (!Object.keys(this._modifiers).length) return;

      var processedModifiers = [];

      Object.keys(this._modifiers).forEach(function (prop) {
        processedModifiers.push(encodeURIComponent(prop) + '(' + encodeURIComponent(_this3._modifiers[prop]) + ')');
      });

      this._compiledValues.push('.' + processedModifiers.join('.'));
    };

    GraphEdge.prototype.compileFields = function compileFields() {
      if (!this._fields.length) return;

      var processedFields = [];

      this._fields.forEach(function (field) {
        processedFields.push(field instanceof GraphEdge ? field.asUrl() : encodeURIComponent(field));
      });

      this._compiledValues.push('{' + processedFields.join(',') + '}');
    };

    GraphEdge.prototype.compileUrl = function compileUrl() {
      var append = '';
      if (this._compiledValues.length) append = this._compiledValues.join('');
      return this._name + append;
    };

    return GraphEdge;
  }(_graph_node2.default);

  module.exports = GraphEdge;
});