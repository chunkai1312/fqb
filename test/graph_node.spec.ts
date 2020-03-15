import { expect } from 'chai'
import GraphNode from '../src/graph_node'
import GraphEdge from '../src/graph_edge'

describe('GraphNode', () => {
  describe('#constructor()', () => {
    it('should instantiate with just the edge name', () => {
      const node = new GraphNode('foo')
      expect(node).to.be.an.instanceof(GraphNode)
    })

    it('should be converted to a string', () => {
      const node = new GraphNode('foo')
      expect(node.toString()).to.equal('/foo')
    })

    it('should be converted to a string with fields', () => {
      const node1 = new GraphNode('foo', ['bar'])
      const node2 = new GraphNode('foo', ['bar', 'baz'])
      expect(node1.toString()).to.equal('/foo?fields=bar')
      expect(node2.toString()).to.equal('/foo?fields=bar,baz')
    })

    it('should be converted to a string with fields and limit', () => {
      const node = new GraphNode('foo', ['bar', 'baz'], 3)
      expect(node.toString()).to.equal('/foo?limit=3&fields=bar,baz')
    })

    it('should be converted to a string with fields, limit and modifiers', () => {
      const node1 = new GraphNode('foo', ['bar', 'baz'], 3)
      node1.modifiers({ foo: 'bar' })
      expect(node1.toString()).to.equal('/foo?limit=3&foo=bar&fields=bar,baz')

      const node2 = new GraphNode('foo', ['bar', 'baz'], 3)
      node2.modifiers({ foo: 'bar', faz: 'baz' })
      expect(node2.toString()).to.equal('/foo?limit=3&foo=bar&faz=baz&fields=bar,baz')
    })

    it('should be embedded in the_node with other edges', () => {
      const edgeToEmbed = new GraphEdge('embeds', ['faz', 'boo'], 6)
      const node = new GraphNode('root', ['bar', 'baz', edgeToEmbed], 3)
      expect(node.toString()).to.equal('/root?limit=3&fields=bar,baz,embeds.limit(6){faz,boo}')
    })
  })

  describe('#limit()', () => {
    it('should get set properly', () => {
      const node = new GraphNode('foo')
      node.limit(5)
      expect(node.getLimit()).to.equal(5)
      expect(node.toString()).to.equal('/foo?limit=5')
    })
  })

  describe('#fields()', () => {
    it('should be set by sending an array', () => {
      const node = new GraphNode('foo')
      node.fields(['bar', 'baz'])
      expect(node.getFields()).to.deep.equal(['bar', 'baz'])
    })

    it('should get merged into existing fields', () => {
      const node = new GraphNode('foo', ['foo', 'bar'])
      node.fields('baz')
      expect(node.getFields()).to.deep.equal(['foo', 'bar', 'baz'])
    })
  })

  describe('#modifiers()', () => {
    it('should be set by sending an object', () => {
      const node = new GraphNode('foo')
      node.modifiers({ bar: 'baz' })
      expect(node.getModifiers()).to.deep.equal({ bar: 'baz' })
    })
  })
})
