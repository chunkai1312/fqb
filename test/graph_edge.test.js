import { expect } from 'chai'
import GraphEdge from '../src/graph_edge'

describe('GraphEdge', () => {
  describe('#constructor()', () => {
    it('should convert to string', () => {
      const edge = new GraphEdge('foo')
      expect(edge.toString()).to.equal('foo')
    })

    it('should convert to string with fields', () => {
      const edge1 = new GraphEdge('foo', ['bar'])
      const edge2 = new GraphEdge('foo', ['bar', 'baz'])
      expect(edge1.toString()).to.equal('foo{bar}')
      expect(edge2.toString()).to.equal('foo{bar,baz}')
    })

    it('should convert to string with fields and limit', () => {
      const edge = new GraphEdge('foo', ['bar', 'baz'], 3)
      expect(edge.toString()).to.equal('foo.limit(3){bar,baz}')
    })

    it('should convert to string with fields, limit and modifiers', () => {
      const edge = new GraphEdge('foo', ['bar', 'baz'], 3)
      edge.modifiers({ foo: 'bar' })
      expect(edge.toString()).to.equal('foo.limit(3).foo(bar){bar,baz}')
    })

    it('should be embedded into another edge with an edge', () => {
      const edgeToEmbed = new GraphEdge('embeds', ['faz', 'boo'], 6)
      const edge = new GraphEdge('foo', ['bar', 'baz', edgeToEmbed], 3)
      expect(edge.toString()).to.equal('foo.limit(3){bar,baz,embeds.limit(6){faz,boo}}')
    })

    it('should be embedded into other edges deeply with edges', () => {
      const edgeLevel1 = new GraphEdge('level1', ['one', 'foo'], 1)
      const edgeLevel2 = new GraphEdge('level2', ['two', 'bar', edgeLevel1], 2)
      const edgeLevel3 = new GraphEdge('level3', ['three', 'baz', edgeLevel2], 3)
      const edgeLevel4 = new GraphEdge('level4', ['four', 'faz', edgeLevel3], 4)
      const edge = new GraphEdge('root', ['foo', 'bar', edgeLevel4], 5)
      expect(edgeLevel1.toString()).to.equal('level1.limit(1){one,foo}')
      expect(edgeLevel2.toString()).to.equal(`level2.limit(2){two,bar,${edgeLevel1.toString()}}`)
      expect(edgeLevel3.toString()).to.equal(`level3.limit(3){three,baz,${edgeLevel2.toString()}}`)
      expect(edgeLevel4.toString()).to.equal(`level4.limit(4){four,faz,${edgeLevel3.toString()}}`)
      expect(edge.toString()).to.equal(`root.limit(5){foo,bar,${edgeLevel4.toString()}}`)
    })

    it('should be embedded into other edges deeply with multiple edges', () => {
      const edgeTags = new GraphEdge('tags', [], 2)

      const edgeD = new GraphEdge('d')
      const edgeC = new GraphEdge('c', [edgeD])
      const edgeB = new GraphEdge('b', [edgeC, edgeTags])
      const edgeA = new GraphEdge('a', [edgeB])

      const edge4 = new GraphEdge('four', ['one', 'foo'], 4)
      const edge3 = new GraphEdge('three', [edge4, 'bar', edgeA], 3)
      const edge2 = new GraphEdge('two', [edge3], 2)
      const edge1 = new GraphEdge('one', ['faz', edge2])

      const edge = new GraphEdge('root', ['foo', 'bar', edge1])

      expect(edgeTags.toString()).to.equal('tags.limit(2)')

      expect(edgeD.toString()).to.equal('d')
      expect(edgeC.toString()).to.equal(`c{${edgeD.toString()}}`)
      expect(edgeB.toString()).to.equal(`b{${edgeC.toString()},${edgeTags.toString()}}`)
      expect(edgeA.toString()).to.equal(`a{${edgeB.toString()}}`)

      expect(edge4.toString()).to.equal('four.limit(4){one,foo}')
      expect(edge3.toString()).to.equal(`three.limit(3){${edge4.toString()},bar,${edgeA.toString()}}`)
      expect(edge2.toString()).to.equal(`two.limit(2){${edge3.toString()}}`)
      expect(edge1.toString()).to.equal(`one{faz,${edge2.toString()}}`)

      expect(edge.toString()).to.equal(`root{foo,bar,${edge1.toString()}}`)
    })
  })

  describe('#modifiers()', () => {
    it('should get compiled with proper syntax', () => {
      const edge1 = new GraphEdge('foo')
      const modifiers1 = edge1.asUrl()
      expect(modifiers1).to.equal('foo')

      const edge2 = new GraphEdge('bar')
      edge2.modifiers({ bar: 'baz' })
      const modifiers2 = edge2.asUrl()
      expect(modifiers2).to.equal('bar.bar(baz)')

      const edge3 = new GraphEdge('baz')
      edge3.modifiers({ foo: 'bar', faz: 'baz' })
      const modifiers3 = edge3.asUrl()
      expect(modifiers3).to.equal('baz.foo(bar).faz(baz)')
    })
  })

  describe('#getChildEdges()', () => {
    it('be traversed recursively with embedded edges', () => {
      const edgeR4 = new GraphEdge('r_four', ['bla'], 4)
      const edge4 = new GraphEdge('four', ['bla'], 4)
      const edge3 = new GraphEdge('three', ['faz', 'boo', edge4, edgeR4], 3)
      const edge2 = new GraphEdge('two', ['faz', 'boo', edge3], 2)
      const edgeR3 = new GraphEdge('r_three')
      const edgeR2 = new GraphEdge('r_two', [edgeR3])
      const node = new GraphEdge('one', ['bar', 'baz', edge2, edgeR2], 1)
      const children = node.getChildEdges()
      expect(children).to.deep.equal([
        ['one', 'two', 'three', 'four'],
        ['one', 'two', 'three', 'r_four'],
        ['one', 'r_two', 'r_three']
      ])
    })

    it('should return node name when there are no children', () => {
      const node = new GraphEdge('foo', ['bar', 'baz'], 1)
      const children = node.getChildEdges()
      expect(children).to.deep.equal([['foo']])
    })
  })

  describe('#toEndpoints()', () => {
    it('should be converted to an endpoint', () => {
      const node = new GraphEdge('one', ['bar', 'baz'], 1)
      const endpoints = node.toEndpoints()
      expect(endpoints).to.deep.equal(['/one'])
    })

    it('should be converted to an endpoint with embedded endpoints', () => {
      const edge4 = new GraphEdge('four', ['bla'], 4)
      const edge3 = new GraphEdge('three', ['faz', 'boo', edge4], 3)
      const edge2 = new GraphEdge('two', ['faz', 'boo', edge3], 2)
      const node = new GraphEdge('one', ['bar', 'baz', edge2], 1)
      const endpoints = node.toEndpoints()
      expect(endpoints).to.deep.equal(['/one/two/three/four'])
    })

    it('should be converted to an endpoint with multiple embedded endpoints', () => {
      const edgeTags = new GraphEdge('tags')
      const edgeD = new GraphEdge('d')
      const edgeC = new GraphEdge('c', [edgeD])
      const edgeB = new GraphEdge('b', [edgeC, edgeTags])
      const edgeA = new GraphEdge('a', [edgeB])
      const edge4 = new GraphEdge('four', ['bla'], 4)
      const edge3 = new GraphEdge('three', ['faz', 'boo', edge4], 3)
      const edge2 = new GraphEdge('two', ['faz', 'boo', edge3], 2)
      const node = new GraphEdge('one', [edgeA, 'bar', 'baz', edge2, 'foo'], 1)
      const endpoints = node.toEndpoints()
      expect(endpoints).to.deep.equal([
        '/one/a/b/c/d',
        '/one/a/b/tags',
        '/one/two/three/four'
      ])
    })
  })
})
