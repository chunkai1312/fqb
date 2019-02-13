import GraphNode from './graph_node'

class GraphEdge extends GraphNode {
  /**
   * Convert the nested query into an array of endpoints.
   *
   * @return {Array}
   */
  toEndpoints () {
    const endpoints = []

    const children = this.getChildEdges()
    children.forEach(child => {
      endpoints.push(`/${child.join('/')}`)
    })

    return endpoints
  }

  /**
   * Arrange the child edge nodes into a multidimensional array.
   *
   * @return {Array}
   */
  getChildEdges () {
    const edges = []
    let hasChildren = false

    this._fields.forEach(field => {
      if (field instanceof GraphEdge) {
        hasChildren = true

        const children = field.getChildEdges()
        children.forEach(childEdges => {
          edges.push([this._name].concat(childEdges))
        })
      }
    })

    if (!hasChildren) {
      edges.push([this._name])
    }

    return edges
  }

  /**
   * Compile the modifier values.
   */
  compileModifiers () {
    if (!Object.keys(this._modifiers).length) return

    const processedModifiers = []

    Object.keys(this._modifiers).forEach(prop => {
      processedModifiers.push(
        `${encodeURIComponent(prop)}(${encodeURIComponent(this._modifiers[prop])})`
      )
    })

    this._compiledValues.push(`.${processedModifiers.join('.')}`)
  }

  /**
   * Compile the field values.
   */
  compileFields () {
    if (!this._fields.length) return

    const processedFields = []

    this._fields.forEach(field => {
      processedFields.push(
        (field instanceof GraphEdge) ? field.asUrl() : encodeURIComponent(field)
      )
    })

    this._compiledValues.push(`{${processedFields.join(',')}}`)
  }

  /**
   * Compile the the full URL.
   *
   * @return {string}
   */
  compileUrl () {
    let append = ''
    if (this._compiledValues.length) append = this._compiledValues.join('')
    return this._name + append
  }
}

export default GraphEdge
