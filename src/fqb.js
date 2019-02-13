import GraphNode from './graph_node'
import GraphEdge from './graph_edge'

class FQB {
  static BASE_GRAPH_URL = 'https://graph.facebook.com'
  static BASE_GRAPH_URL_BETA = 'https://graph.beta.facebook.com'

  /**
   * @param {Object} config - An array of config options.
   * @param {string} graphEndpoint - The name of the Graph API endpoint.
   */
  constructor (config = {}, graphEndpoint = '') {
    this._graphNode = undefined // the GraphNode we are working with
    this._graphVersion = undefined // the URL prefix version of the Graph API
    this._appSecret = undefined // the application secret key
    this._enableBetaMode = false // a toggle to enable the beta tier of the Graph API
    this._config = config // the config options sent in from the user

    this._graphNode = new GraphNode(graphEndpoint)
    if (config.hasOwnProperty('accessToken')) this.accessToken(config.accessToken)
    if (config.hasOwnProperty('graphVersion')) this.graphVersion(config.graphVersion)
    if (config.hasOwnProperty('appSecret')) this._appSecret = config.appSecret
    if (config.hasOwnProperty('enableBetaMode') && config.enableBetaMode === true) this._enableBetaMode = true
  }

  /**
   * New up an instance of self.
   *
   * @param {string} graphNodeName - The node name.
   * @return FQB
   */
  node (graphNodeName) {
    return new FQB(this._config, graphNodeName)
  }

  /**
   * New up an Edge instance.
   *
   * @param {string} edgeName
   * @param {Array}  fields - The fields we want on the edge.
   * @return GraphEdge
   */
  edge (edgeName, fields) {
    return new GraphEdge(edgeName, fields)
  }

  /**
   * Alias to method on GraphNode.
   *
   * @param {(Array|string)} fields
   * @return FQB
   */
  fields (...fields) {
    if (fields.length === 1 && Array.isArray(fields[0])) this._graphNode.fields(fields[0])
    else this._graphNode.fields(fields)
    return this
  }

  /**
   * Sets the access token to use with this request.
   *
   * @param {string} accessToken - The access token to overwrite the default.
   * @return FQB
   */
  accessToken (accessToken) {
    this._graphNode.modifiers(Object.assign(this._graphNode._modifiers, { access_token: accessToken }))
    return this
  }

  /**
   * Sets the graph version to use with this request.
   *
   * @param {string} graphVersion - The access token to overwrite the default.
   * @return FQB
   */
  graphVersion (graphVersion) {
    this._graphVersion = graphVersion
    return this
  }

  /**
   * Alias to method on GraphNode.
   *
   * @param {number} limit
   * @return FQB
   */
  limit (limit) {
    this._graphNode.limit(limit)
    return this
  }

  /**
   * Alias to method on GraphNode.
   *
   * @param {Object} data
   *
   * @return FQB
   */
  modifiers (data) {
    this._graphNode.modifiers(data)
    return this
  }

  /**
   * Return the generated request as a URL with the hostname.
   *
   * @return {string}
   */
  asUrl () {
    return `${this.getHostname()}${this.asEndpoint()}`
  }

  /**
   * Return the generated request as a URL endpoint sans the hostname.
   *
   * @return {string}
   */
  asEndpoint () {
    let graphVersionPrefix = ''
    if (this._graphVersion) graphVersionPrefix = `/${this._graphVersion}`
    return `${graphVersionPrefix}${this._graphNode.asUrl(this._appSecret)}`
  }

  /**
   * Returns the Graph URL as nicely formatted string.
   *
   * @return {string}
   */
  toString () {
    return this.asUrl()
  }

  /**
   * Returns the Graph API hostname.
   *
   * @return {string}
   */
  getHostname () {
    return (this._enableBetaMode)
      ? FQB.BASE_GRAPH_URL_BETA
      : FQB.BASE_GRAPH_URL
  }
}

export default FQB
