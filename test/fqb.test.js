import { expect } from 'chai'
import FQB from '../src/fqb'
import GraphNode from '../src/graph_node'
import GraphEdge from '../src/graph_edge'

describe('FQB', () => {
  describe('#constructor()', () => {
    it('should be instantiated', () => {
      const fqb = new FQB()
      expect(fqb).to.be.an.instanceof(FQB)
    })

    it('should be instantiated by passing the arguments config', () => {
      const fqb = new FQB({ graphVersion: 'v2.0' })
      expect(fqb).to.be.an.instanceof(FQB)
      expect(fqb._graphVersion).to.equal('v2.0')
    })

    it('should be instantiated by passing the arguments config and graphEndpoint', () => {
      const fqb = new FQB({ graphVersion: 'v2.0' }, 'node')
      expect(fqb).to.be.an.instanceof(FQB)
      expect(fqb._config.graphVersion).to.equal('v2.0')
      expect(fqb._graphNode).to.be.an.instanceof(GraphNode)
      expect(fqb.asEndpoint()).to.equal('/v2.0/node')
      expect(fqb.asUrl()).to.equal('https://graph.facebook.com/v2.0/node')
      expect(fqb.toString()).to.equal(fqb.asUrl())
    })

    it('should be enable beta mode to return the beta hostname', () => {
      const fqb = new FQB({ graphVersion: 'v2.0', enableBetaMode: true }, 'node')
      expect(fqb).to.be.an.instanceof(FQB)
      expect(fqb._config.graphVersion).to.equal('v2.0')
      expect(fqb._graphNode).to.be.an.instanceof(GraphNode)
      expect(fqb.asEndpoint()).to.equal('/v2.0/node')
      expect(fqb.asUrl()).to.equal('https://graph.beta.facebook.com/v2.0/node')
      expect(fqb.toString()).to.equal(fqb.asUrl())
    })

    it('should be generated when an app secret is provided an app secret proof', () => {
      const fqb = new FQB({ appSecret: 'foo-secret', accessToken: 'foo-token' }, 'node')
      expect(fqb.asEndpoint()).to.equal('/node?access_token=foo-token&appsecret_proof=3bf321559c5c870f37d36d9ea270676d1af8830edf3a7ef457b17e416a7848b2')
    })
  })

  describe('#node()', () => {
    it('should be instantiated', () => {
      const fqb = new FQB()
      const node = fqb.node('node')
      expect(node).to.be.an.instanceof(FQB)
      expect(node._graphNode).to.be.an.instanceof(GraphNode)
      expect(node.asEndpoint()).to.equal('/node')
    })
  })

  describe('#edge()', () => {
    it('should be instantiated', () => {
      const fqb = new FQB()
      const edge = fqb.edge('foo')
      expect(edge).to.be.an.instanceof(GraphEdge)
    })

    it('should be instantiated with fields', () => {
      const fqb = new FQB()
      const edge = fqb.edge('edge')
      expect(edge).to.be.an.instanceof(GraphEdge)
      expect(edge.asUrl()).to.equal('edge')
    })
  })

  describe('#fields()', () => {
    it('should set fields of node to compile', () => {
      const node1 = new FQB().node('node1').fields(['foo', 'bar'])
      const node2 = new FQB().node('node2').fields('baz', 'qux')
      expect(node1.asEndpoint()).to.equal('/node1?fields=foo,bar')
      expect(node2.asEndpoint()).to.equal('/node2?fields=baz,qux')
    })

    it('should set fields of node to compile', () => {
      const edge1 = new FQB().edge('edge1').fields(['foo', 'bar'])
      const edge2 = new FQB().edge('edge2').fields('baz', 'qux')
      expect(edge1.asUrl()).to.equal('edge1{foo,bar}')
      expect(edge2.asUrl()).to.equal('edge2{baz,qux}')
    })
  })

  describe('#accessToken()', () => {
    it('should fallback to the access token if none set explicitly', () => {
      const fqb = new FQB({ accessToken: 'foo-token' })
      const request = fqb.node('bar').accessToken('foo-token')
      expect(request.asEndpoint()).to.equal('/bar?access_token=foo-token')
    })

    it('should set the parameter access token', () => {
      const fqb = new FQB()
      const request = fqb.node('bar').accessToken('foo-token')
      expect(request.asEndpoint()).to.equal('/bar?access_token=foo-token')
    })

    it('should be overwritten the default access token', () => {
      const fqb = new FQB({ accessToken: 'foo-token' })
      const request = fqb.node('bar').accessToken('use-me-instead')
      expect(request.asEndpoint()).to.equal('/bar?access_token=use-me-instead')
    })
  })

  describe('#graphVersion()', () => {
    it('should set the version of graph api and prefix the url', () => {
      const fqb = new FQB()
      const request = fqb.node('foo').graphVersion('v1.0')
      expect(request.asEndpoint()).to.equal('/v1.0/foo')
    })

    it('should be overwritten the default graph version', () => {
      const fqb = new FQB({ graphVersion: 'v1.0' })
      const request = fqb.node('foo').graphVersion('v2.0')
      expect(request.asEndpoint()).to.equal('/v2.0/foo')
    })
  })

  describe('#limit()', () => {
    it('should set the parameter limit', () => {
      const fqb = new FQB()
      const request = fqb.node('foo').limit('5')
      expect(request.asEndpoint()).to.equal('/foo?limit=5')
    })
  })

  describe('#modifiers()', () => {
    it('should set the modifiers', () => {
      const fqb = new FQB()
      const request = fqb
        .node('foo')
        .fields(['foo', 'bar'])
        .modifiers({ west: 'coast-swing' })
        .limit(2)
      expect(request.asEndpoint()).to.equal('/foo?west=coast-swing&limit=2&fields=foo,bar')
    })
  })
})
