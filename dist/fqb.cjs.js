'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var createHmac = _interopDefault(require('create-hmac'));
var qs = _interopDefault(require('qs'));

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
        this._compiledValues = qs.stringify(this._modifiers).split('&');
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

module.exports = FQB;
