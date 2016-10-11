'use strict';

const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const HttpError = require('../lib/http-error');
const chai = require('chai');
const expect = chai.expect;

describe('okapi client sdk', () => {

  const appKey = 'mySecretAppKey';
  let okapiSdk, apiServer;

  before(() => {
    okapiSdk = require('../lib/okapi-sdk');
    apiServer = require('./util/api-server');
    apiServer.init(appKey);
    return apiServer.start();
  });

  after(() => apiServer.stop());

  it('should get response from a simple api resource', () => {
    const oka = okapiSdk({baseUrl: apiServer.baseUrl, appKey});
    return oka.api('myapi')
      .version(1)
      .resource('myresource')
      .get()
      .spread((data, res) => {
        expect(res).to.have.property('statusCode', 200);
        expect(data).to.eql({foo: 'bar'});
      });
  });

  it('should get an error because of bad base url', () => {
    const oka = okapiSdk({baseUrl: 'http://127.0.0.1:9876'});
    return oka.api('myapi')
      .version(1)
      .resource('myresource')
      .get()
      .then(result => {
        throw new Error('Promise was unexpectedly fulfilled with result: ' + result);
      }, err => {
        expect(err).to.be.an.instanceof(Error);
        expect(err).to.have.property('code', 'ECONNREFUSED');
      });
  });

  it('should get an error because of bad uri', () => {
    const oka = okapiSdk({baseUrl: apiServer.baseUrl, appKey});
    return oka.api('baduri')
      .get()
      .then(result => {
        throw new Error('Promise was unexpectedly fulfilled with result: ' + result);
      }, err => {
        expect(err).to.be.an.instanceof(Error);
        expect(err).to.be.an.instanceof(HttpError);
        expect(err).to.have.property('statusCode', 404);
        expect(err).to.have.property('body');
        expect(err.body).to.have.property('code');
        expect(err.body).to.have.property('message');
      });
  });

  it('should get an error because of missing appKey', () => {
    const oka = okapiSdk({baseUrl: apiServer.baseUrl});
    return oka.api('myapi')
      .version(1)
      .resource('myresource')
      .get()
      .then(result => {
        throw new Error('Promise was unexpectedly fulfilled with result: ' + result);
      }, err => {
        expect(err).to.be.an.instanceof(Error);
        expect(err).to.be.an.instanceof(HttpError);
        expect(err).to.have.property('statusCode', 401);
        expect(err).to.have.property('body');
        expect(err.body).to.have.property('code');
        expect(err.body).to.have.property('message');
      });
  });

  describe('requestDefaults', () => {

    it('should accept wildcard certificate', () => {
      expect(okapiSdk.requestDefaults).to.respondsTo('checkServerIdentity');
      const domain = 'mysuperdomain.io';
      expect(okapiSdk.requestDefaults.checkServerIdentity(domain, {
        subjectaltname: `DNS:${domain},DNS:*.${domain}`
      })).to.be.undefined;
      expect(okapiSdk.requestDefaults.checkServerIdentity(domain, {
        subjectaltname: `DNS:*.${domain}`
      })).to.be.undefined;
      expect(okapiSdk.requestDefaults.checkServerIdentity(domain, {
        subjectaltname: 'DNS:anotherdomain.org'
      })).to.equal('Server certificate validation failed');
      expect(okapiSdk.requestDefaults.checkServerIdentity(domain, {
        subjectaltname: 'DNS:anotherdomain.org,DNS:*.anotherdomain.org'
      })).to.equal('Server certificate validation failed');
    });

  });

  describe('crud', () => {

    const body = {firstName: 'John', lastName: 'Doe'};
    let oka, id;

    before(() => {
      oka = okapiSdk({baseUrl: apiServer.baseUrl, appKey});
    });

    it('should post a resource', () => oka
      .api('myapi')
      .version(1)
      .resource('contacts')
      .body(body)
      .post()
      .spread((data, res) => {
        expect(res).to.have.property('statusCode', 201);
        expect(data).to.have.property('id').that.is.a('number');
        expect(_.omit(data, 'id')).to.eql(body);
        id = data.id;
      })
    );

    it('should patch a resource', () => oka
      .api('myapi')
      .version(1)
      .resource('contacts/:id')
      .params({id})
      .body({firstName: 'Jane'})
      .patch()
      .spread((data, res) => {
        expect(res).to.have.property('statusCode', 200);
        expect(data).to.have.property('id').that.is.a('number');
        expect(_.omit(data, 'id')).to.eql(Object.assign(body, {firstName: 'Jane'}));
      })
    );

    it('should get a resource', () => oka
      .api('myapi')
      .version(1)
      .resource('contacts/:id')
      .params({id})
      .get()
      .spread((data, res) => {
        expect(res).to.have.property('statusCode', 200);
        expect(data).to.have.property('id').that.is.a('number');
        expect(_.omit(data, 'id')).to.eql(Object.assign(body, {firstName: 'Jane'}));
        return data.id;
      })
    );

    it('should delete a resource', () => oka
      .api('myapi')
      .version(1)
      .resource('contacts/:id')
      .params({id})
      .delete()
      .spread((data, res) => {
        expect(res).to.have.property('statusCode', 204);
        expect(data).to.not.be.ok;
      })
    );

  });

  it('should upload a file', () => {
    const oka = okapiSdk({baseUrl: apiServer.baseUrl, appKey});
    return oka
      .api('myapi')
      .version(1)
      .resource('upload')
      .attachment({package: fs.createReadStream(path.join(__dirname, '..', 'package.json'))})
      .post()
      .spread((data, res) => {
        expect(res).to.have.property('statusCode', 201);
        expect(data).to.be.ok;
        expect(data).to.eql(require('../package.json'));
      });
  });

  it('should use uri', () => {
    const oka = okapiSdk({baseUrl: apiServer.baseUrl, appKey});
    return oka
      .uri('myapi/v1/myresource')
      .get()
      .spread((data, res) => {
        expect(data).to.be.ok;
        expect(data).to.have.property('foo', 'bar');
        expect(res).to.have.property('statusCode', 200);
      });
  });

  it('should build correctly', () => {
    const oka = okapiSdk({baseUrl: apiServer.baseUrl, appKey});
    return oka
      .build({
        api: 'myapi',
        version: '1',
        resource: 'myresource'
      })
      .get()
      .spread((data, res) => {
        expect(data).to.be.ok;
        expect(data).to.have.property('foo', 'bar');
        expect(res).to.have.property('statusCode', 200);
      });
  });

  it('should return the url', () => {
    const oka = okapiSdk({baseUrl: apiServer.baseUrl, appKey});
    expect(oka.toUrl({
      api: 'myapi',
      version: '1',
      resource: 'myresource'
    })).to.be.eql(`${apiServer.baseUrl}/myapi/v1/myresource`);
  });

  it('should get correctly', () => {
    const oka = okapiSdk({baseUrl: apiServer.baseUrl, appKey});
    return oka
      .get({
        api: 'myapi',
        version: '1',
        resource: 'myresource'
      })
      .spread((data, res) => {
        expect(data).to.be.ok;
        expect(data).to.have.property('foo', 'bar');
        expect(res).to.have.property('statusCode', 200);
      });
  });

  it('should use the query', () => {
    const oka = okapiSdk({baseUrl: apiServer.baseUrl, appKey});
    return oka.api('myapi')
      .version(1)
      .resource('myresource')
      .query({foo: 'rab'})
      .get()
      .spread((data, res) => {
        expect(res).to.have.property('statusCode', 200);
        expect(data).to.eql({foo: 'rab'});
      });
  });

  it('should use form', () => {
    const oka = okapiSdk({baseUrl: apiServer.baseUrl, appKey});
    const body = {firstName: 'John', lastName: 'Doe'};
    return oka.api('myapi')
      .version(1)
      .resource('contact-forms')
      .form(body)
      .post()
      .spread((data, res) => {
        data = JSON.parse(data);
        expect(res).to.have.property('statusCode', 201);
        expect(data).to.have.property('firstName', 'John');
        expect(data).to.have.property('lastName', 'Doe');
        expect(data).to.have.property('id', 1);
      });
  });

});
