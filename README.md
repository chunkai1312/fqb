# fqb [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Test coverage][codecov-image]][codecov-url]

> Facebook Graph API query builder for JavaScript

A query builder that helps you simply make [nested requests](https://developers.facebook.com/docs/graph-api/using-graph-api#fieldexpansion) to Facebook's [Graph API](https://developers.facebook.com/docs/graph-api) for fetching specific data that you want.

## Introduction

About Facebook's Graph API, there are [three concepts](https://developers.facebook.com/docs/graph-api/quickstart#basics) you should know:

1. **Node**: A node represents a "real-world thing" on Facebook, such as a user, a photo, a page, a comment.
2. **Edge**: An edge is the connection between two or more nodes, such as a page's photos, or a photo's comments.
3. **Field**: A Field is a property of the node. such as a user's birthday, or the name of a page.

We follow the same concepts to help you generate request URLs. For example, when you send a request to the Facebook's Graph API, the URL looks like as following:

```
https://graph.facebook.com/node-id/edge-name?fields=field-name
```

To generate the same URL with fqb, you'd do the following:

```js
const edge = new FQB().edge('edge-name').fields('field-name')
const fqb = new FQB().node('node-id').fields(edge)

console.log(fqb.asUrl())
// https://graph.facebook.com/node-id?fields=edge-name{field-name}
```

The output looks a little different, but two URL's are functionally identical with the exception of how the Graph API returns the response data. What makes the URL generated with fqb different is that it is being expressed as a nested request.

Making nested request allows you to effectively nest multiple graph queries into a single call. With fqb, you can make it easy to generate properly formatted nested requests from a fluent, easy-to-read JavaScript interface.

## Install

```shell
$ npm install --save fqb
```

### Browser

Add a `<script>` to your `index.html`:

```html
<script src="/node_modules/fqb/dist/fqb.min.js"></script>
```

### Node.js / Webpack

Import the module to your `*.js` file:

```js
const FQB = require('fqb')
```

## Usage

### A basic example

Below is a basic example that gets the logged in user's `id` & `email` (assuming the user granted your app [the `email` permission](https://developers.facebook.com/docs/facebook-login/permissions#reference-email)).

```js
const fqb = new FQB()
  .node('me')
  .fields(['id', 'email'])
  .accessToken('user-access-token')
  .graphVersion('v2.6')

console.log(fqb.asEndpoint())
// /v2.6/me?access_token=user-access-token&fields=id,email

console.log(fqb.asUrl())
// https://graph.facebook.com/v2.6/me?access_token=user-access-token&fields=id,email
```

### Get data across multiple edges

The following example will get the logged in user's name & first 5 photos they are tagged in with just one call to Graph.

```js
const photosEdge = new FQB()
  .edge('photos')
  .fields(['id', 'source'])
  .limit(5)

const fqb = new FQB()
  .node('me')
  .fields(['name', photosEdge])

console.log(fqb.asEndpoint())
// /me?fields=name,photos.limit(5){id,source}

console.log(fqb.asUrl())
// https://graph.facebook.com/me?fields=name,photos.limit(5){id,source}
```

The following example will get user `1234`'s name, and first 10 photos they are tagged in. For each photo it gets the first 2 comments and all the likes.

```js
const likesEdge = new FQB()
  .edge('likes')

const commentsEdge = new FQB()
  .edge('comments')
  .fields('message')
  .limit(2)

const photosEdge = new FQB()
  .edge('photos')
  .fields(['id', 'source', commentsEdge, likesEdge])
  .limit(10)

const fqb = new FQB()
  .node('1234')
  .fields(['name', photosEdge])

console.log(fqb.asEndpoint())
// /1234?fields=name,photos.limit(10){id,source,comments.limit(2){message},likes}

console.log(fqb.asUrl())
// https://graph.facebook.com/1234?fields=name,photos.limit(10){id,source,comments.limit(2){message},likes}
```

## Note

Inspired by [FacebookQueryBuilder](https://github.com/SammyK/FacebookQueryBuilder)

## Reference

Facebook's [Graph API](https://developers.facebook.com/docs/graph-api)

## License

MIT © [Chun-Kai Wang](https://github.com/chunkai1312)

[npm-image]: https://img.shields.io/npm/v/fqb.svg
[npm-url]: https://npmjs.org/package/fqb
[travis-image]: https://travis-ci.org/chunkai1312/fqb.svg?branch=master
[travis-url]: https://travis-ci.org/chunkai1312/fqb
[codecov-image]: https://codecov.io/gh/chunkai1312/fqb/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/chunkai1312/fqb
