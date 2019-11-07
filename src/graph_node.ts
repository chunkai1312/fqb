import createHmac from 'create-hmac'
import qs from 'qs'
import GraphEdge from './graph_edge'

class GraphNode {
  static PARAM_FIELDS = 'fields' // the name of the fields param
  static PARAM_LIMIT = 'limit' // the name of the limit param
  static PARAM_ACCESS_TOKEN = 'access_token' // the name of the access token param
  static PARAM_APP_SECRET_PROOF = 'appsecret_proof' // the name of the app secret proof param
  protected _name: string // the name of the node
  protected _modifiers: object // the modifiers that will be appended to the node
  protected _fields: (string | GraphEdge)[] // the fields & GraphEdge's that we want to request
  protected _compiledValues: string[] // compiled values that are ready to be concatenated

  /**
   * Create a new GraphNode value object.
   *
   * @param {string} name
   * @param {Array}  fields
   * @param {number} limit
   */
  constructor (name: string, fields?: (string | GraphEdge)[], limit?: number) {
    this._name = name || ''
    this._modifiers = {}
    this._fields = fields || []
    this._compiledValues = []
    if (limit) this.limit(limit)
  }

  /**
   * Modifier data to be sent with this node.
   *
   * @param {Object} data
   * @return GraphNode
   */
  modifiers (data: object): this {
    Object.assign(this._modifiers, data)
    return this
  }

  /**
   * Gets the modifiers for this node.
   *
   * @return {Object}
   */
  getModifiers (): object {
    return this._modifiers
  }

  /**
   * Gets a modifier if it is set.
   *
   * @param {string} key
   * @return {unknown}
   */
  getModifier (key: string): unknown {
    return this._modifiers[key] ? this._modifiers[key] : null
  }

  /**
   * Set the limit for this node.
   *
   * @param {number} limit
   * @return GraphNode
   */
  limit (limit: number): this {
    this._modifiers[GraphNode.PARAM_LIMIT] = limit
    return this
  }

  /**
   * Gets the limit for this node.
   *
   * @return {(number|undefined)}
   */
  getLimit (): (number | undefined) {
    return this._modifiers[GraphNode.PARAM_LIMIT]
  }

  /**
   * Set the fields for this node.
   *
   * @param {Array} fields
   *
   * @return GraphNode
   */
  fields (...fields): this {
    this._fields = (fields.length === 1 && Array.isArray(fields[0]))
      ? this._fields.concat(fields[0])
      : this._fields.concat(fields)
    return this
  }

  /**
   * Gets the fields for this node.
   *
   * @return {Array}
   */
  getFields (): (string | GraphEdge)[] {
    return this._fields
  }

  /**
   * Clear the compiled values.
   */
  resetCompiledValues (): void {
    this._compiledValues = []
  }

  /**
   * Compile the modifier values.
   */
  compileModifiers (): void {
    if (!Object.keys(this._modifiers).length) return
    this._compiledValues = qs.stringify(this._modifiers).split('&')
  }

  /**
   * Compile the field values.
   */
  compileFields (): void {
    if (!this._fields.length) return
    this._compiledValues.push(`${GraphNode.PARAM_FIELDS}=${this._fields.join()}`)
  }

  /**
   * Compile the the full URL.
   *
   * @return {string}
   */
  compileUrl (): string {
    let append = ''
    if (this._compiledValues.length) append = `?${this._compiledValues.join('&')}`
    return `/${this._name}${append}`
  }

  /**
   * Compile the final URL as a string.
   *
   * @param {(string|null)} appSecret - The app secret for signing the URL with app secret proof.
   * @return {string}
   */
  asUrl (appSecret?: string): string {
    this.resetCompiledValues()
    if (appSecret) this.addAppSecretProofModifier(appSecret)
    this.compileModifiers()
    this.compileFields()
    return this.compileUrl()
  }

  /**
   * Compile the final URL as a string.
   *
   * @param {(string|null)} appSecret - The app secret for signing the URL with app secret proof.
   * @return {string}
   */
  toString (): string {
    return this.asUrl()
  }

  /**
   * Generate an app secret proof modifier based on the app secret & access token.
   *
   * @param {string} appSecret
   */
  addAppSecretProofModifier (appSecret: string): void {
    const accessToken = this.getModifier(GraphNode.PARAM_ACCESS_TOKEN) as string
    if (!accessToken) return
    this._modifiers[GraphNode.PARAM_APP_SECRET_PROOF] = createHmac('sha256', appSecret).update(accessToken).digest('hex')
  }
}

export default GraphNode
