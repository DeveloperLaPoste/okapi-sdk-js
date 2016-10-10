[![NPM version](https://badge.fury.io/js/anystore.svg)](http://badge.fury.io/js/okapi-sdk)
[![Build Status](https://travis-ci.org/DeveloperLaPoste/okapi-sdk-js.png?branch=master)](https://travis-ci.org/DeveloperLaPoste/okapi-sdk-js)
[![Coverage Status](https://coveralls.io/repos/DeveloperLaPoste/okapi-sdk-js/badge.svg)](https://coveralls.io/r/DeveloperLaPoste/okapi-sdk-js)
[![npm](https://img.shields.io/npm/l/express.svg?style=flat-square)]()


![Okapi](assets/img/okapi-logo-200.png)

## Okapi client SDK for nodejs and the browsers

SDK to integrate Okapi APIs.

## Installation

```
$ npm i okapi-sdk --save
```

## Usage

```
  const okapiSdk = require('okapi-sdk');
  const oka = okapiSdk({appKey: 'mySecretAppKey'});
  oka.api('superapi')
    .version(1)
    .resource('contacts')
    .get()
    .spread((data, res) => {
      console.log('data :', data);
      console.log('status code :', res.statusCode);
    })
    .catch(function(err) {
      console.error(err);
    });
```

## Methods

Following methods are chaining : they return this (Object) for chaining usage.

### .api

Set the name of the API to consume.

Arguments : url context of the API (String)

### .version

Set the version of the API to consume.

Arguments : version (Integer|String)

### .resource

Set the resource of the API to consume.

Arguments : resource_name (String)

### .uri

Set the uri to use.

Arguments : uri (String) (e.g. : '/APIname/APIversion/resource')

### .body

Set the body.

Arguments : body (Object)

### .query

Set the query string.

Arguments: query (Object)

### .params

Set the params.

Arguments: params (Object)

### .attachment

Upload a file.

Arguments: attachment (Object)

### .build

Helper method all in one.

Arguments: opt (Object)
 
Exemple :

```{API name, API version, resource, [...]})```

Following methods are not chaining :

### .toUrl

Returns the url of the call.

Arguments: [opt] (Object)

Example : 

```{API name, API version, resource, [...]}```

Returns a full completed url (String)

### .get | .post | .put | .patch | .post | .delete

They are the same than the HTTP method, it's this methods that make the request server.

Arguments: [opt] (Object)

Example : 

```{API name, API version, resource, [...]}```

Returns a Promise that fullfills following args :
- res : response (Object)
- body : response body (Object)

Enjoy !
