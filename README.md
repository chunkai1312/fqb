# fqb

> Facebook Graph API query builder for Node.js

## Install

```sh
$ npm install --save fqb
```

## Usage

### A basic example

Below is a basic example that gets the logged in user's `id` & `email` (assuming the user granted your app [the `email` permission](https://developers.facebook.com/docs/facebook-login/permissions#reference-email)).

```js
const FQB = require('fqb');

const fqb = new FQB()
  .node('me')
  .fields(['id', 'email'])
  .accessToken('user-access-token')
  .graphVersion('v2.6')
  .asUrl();

consolo.log(fqb.asEndpoint());
// /v2.6/me?access_token=user-access-token&fields=id,email

consolo.log(fqb.asUrl());
// https://graph.facebook.com/v2.6/me?access_token=user-access-token&fields=id,email
```

### Get data across multiple edges

The following example will get the logged in user's name & first 5 photos they are tagged in with just one call to Graph.

```js
const FQB = require('fqb');

const photosEdge = new FQB()
  .edge('photos')
  .fields(['id', 'source'])
  .limit(5);

const fqb = new FQB()
  .node('me')
  .fields(['name', photosEdge]);

consolo.log(fqb.asEndpoint());
// /me?fields=name,photos.limit(5){id,source}

consolo.log(fqb.asUrl());
// https://graph.facebook.com/me?fields=name,photos.limit(5){id,source}
```

The following example will get user `1234`'s name, and first 10 photos they are tagged in. For each photo it gets the first 2 comments and all the likes.

```js
const FQB = require('fqb');

const likesEdge = new FQB()
  .edge('likes');

const commentsEdge = new FQB()
  .edge('comments')
  .fields('message')
  .limit(2);

const photosEdge = new FQB()
  .edge('photos')
  .fields(['id', 'source', commentsEdge, likesEdge])
  .limit(10);

const fqb = new FQB()
  .node('1234')
  .fields(['name', photosEdge]);

consolo.log(fqb.asEndpoint());
// /1234?fields=name,photos.limit(10){id,source,comments.limit(2){message},likes}

consolo.log(fqb.asUrl());
// https://graph.facebook.com/1234?fields=name,photos.limit(10){id,source,comments.limit(2){message},likes}
```

## Test

```
$ npm test
```

## Inspiration

Inspired by [FacebookQueryBuilder](https://github.com/SammyK/FacebookQueryBuilder)

## License

MIT © [Chun-Kai Wang](https://github.com/chunkai1312)
