import GraphNode from './graph_node'
import GraphEdge from './graph_edge'

type FQBConfig = {
  accessToken?: string;
  graphVersion?: string;
  appSecret?: string;
  enableBetaMode?: boolean;
}

class FQB {
  static BASE_GRAPH_URL = 'https://graph.facebook.com' // production Graph API URL
  static BASE_GRAPH_URL_BETA = 'https://graph.beta.facebook.com' // beta tier URL of the Graph API
  private _graphNode: GraphNode // the GraphNode we are working with
  private _graphVersion: string // the URL prefix version of the Graph API
  private _appSecret: string // the application secret key
  private _enableBetaMode: boolean // the application secret key
  private _config: FQBConfig // the config options sent in from the user

  /**
   * @param {Object} config - An array of config options.
   * @param {string} graphEndpoint - The name of the Graph API endpoint.
   */
  constructor (config: FQBConfig = {}, graphEndpoint?: string) {
    this._graphNode = new GraphNode(graphEndpoint)
    this._config = config
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
  node (graphNodeName: string): FQB {
    return new FQB(this._config, graphNodeName)
  }

  /**
   * New up an Edge instance.
   *
   * @param {string} edgeName
   * @param {Array}  fields - The fields we want on the edge.
   * @return GraphEdge
   */
  edge (edgeName: string, fields?: string[]): GraphEdge {
    return new GraphEdge(edgeName, fields)
  }

  /**
   * Alias to method on GraphNode.
   *
   * @param {(Array|string)} fields
   * @return FQB
   */
  fields (...fields): this {
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
  accessToken (accessToken: string): this {
    this._graphNode.modifiers(Object.assign(this._graphNode.getModifiers(), { access_token: accessToken })) // eslint-disable-line @typescript-eslint/camelcase
    return this
  }

  /**
   * Sets the graph version to use with this request.
   *
   * @param {string} graphVersion - The access token to overwrite the default.
   * @return FQB
   */
  graphVersion (graphVersion: string): this {
    this._graphVersion = graphVersion
    return this
  }

  /**
   * Alias to method on GraphNode.
   *
   * @param {number} limit
   * @return FQB
   */
  limit (limit: number): this {
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
  modifiers (data: object): this {
    this._graphNode.modifiers(data)
    return this
  }

  /**
   * Return the generated request as a URL with the hostname.
   *
   * @return {string}
   */
  asUrl (): string {
    return `${this.getHostname()}${this.asEndpoint()}`
  }

  /**
   * Return the generated request as a URL endpoint sans the hostname.
   *
   * @return {string}
   */
  asEndpoint (): string {
    let graphVersionPrefix = ''
    if (this._graphVersion) graphVersionPrefix = `/${this._graphVersion}`
    return `${graphVersionPrefix}${this._graphNode.asUrl(this._appSecret)}`
  }

  /**
   * Returns the Graph URL as nicely formatted string.
   *
   * @return {string}
   */
  toString (): string {
    return this.asUrl()
  }

  /**
   * Returns the Graph API hostname.
   *
   * @return {string}
   */
  getHostname (): string {
    return (this._enableBetaMode)
      ? FQB.BASE_GRAPH_URL_BETA
      : FQB.BASE_GRAPH_URL
  }
}

export default FQB
