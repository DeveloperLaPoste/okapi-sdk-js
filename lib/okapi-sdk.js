'use strict';

const Promise = require('bluebird');
const request = require('request');
const requestAsync = Promise.promisify(request, {multiArgs: true});
const _ = require('lodash');
const pathToRegexp = require('path-to-regexp');
const HttpError = require('./http-error');

const okapiSdk = function(opt) {
  opt = opt || {};
  const httpErrorHandler = (res, body) => {
    if (res.statusCode >= 400) {
      throw new HttpError({statusCode: res.statusCode, body});
    }
    return [body, res];
  };
  const defaultCtx = {
    baseUrl: opt.baseUrl || okapiSdk.defaultBaseUrl,
    method: 'get',
    appKey: opt.appKey,
    json: true,
    headers: {},
    rebuildUri: () => {
      ctx.uri = [ctx.api, `v${ctx.version}`].concat(ctx.resource && _.compact(ctx.resource.split('/'))).join('/');
    }
  };
  let ctx = _.clone(defaultCtx);
  const resolve = () => {
    const reqOpt = Object.assign({}, okapiSdk.requestDefaults, _.omit(ctx, ['appKey']));
    if (ctx.appKey) {
      _.set(reqOpt, "headers['x-okapi-key']", ctx.appKey);
    }
    return requestAsync(reqOpt).spread(httpErrorHandler);
  };
  const promise = Promise.bind(ctx, Promise.resolve());
  Object.assign(promise, {
    reset() {
      ctx = _.clone(defaultCtx);
      return this;
    },
    api(urlContext) {
      ctx.api = urlContext;
      ctx.rebuildUri();
      return this;
    },
    version(versionName) {
      ctx.version = versionName;
      ctx.rebuildUri();
      return this;
    },
    resource(resourceUri) {
      ctx.resource = resourceUri;
      ctx.rebuildUri();
      return this;
    },
    uri(apiUri) {
      ctx.uri = apiUri;
      const parts = _.compact(apiUri.split('/'));
      if (parts.length) {
        ctx.api = parts.shift();
      }
      if (parts.length) {
        ctx.version = parts.shift().replace(/v(.*)/, '$1');
      }
      if (parts.length) {
        ctx.resource = parts.join('/');
      }
      return this;
    },
    form(data) {
      ctx.form = data;
      ctx.json = false;
      return this;
    },
    body(data) {
      ctx.body = data;
      return this;
    },
    query(data) {
      ctx.qs = data;
      return this;
    },
    params(data) {
      ctx.uri = pathToRegexp.compile(ctx.uri)(data);
      return this;
    },
    attachment(data) {
      ctx.formData = Object.assign(ctx.formData || {}, data);
      return this;
    },
    headers(data) {
      if (Array.isArray(data)) {
        for (const item of data) {
          Object.assign(ctx.headers, item);
        }
      } else if (data) {
        Object.assign(ctx.headers, data);
      }
      return this;
    },
    build(opt) {
      if (typeof opt !== 'object' || !opt) {
        return this;
      }
      opt = _.pick(opt, ['api', 'version', 'resource', 'uri',
        'body', 'query', 'params', 'attachment']);
      for (const key in opt) {
        if (opt.hasOwnProperty(key)) {
          this[key](opt[key]);
        }
      }
      ctx.rebuildUri();
      return this;
    },
    info() {
      return ctx;
    },
    toUrl(opt) {
      if (opt) {
        this.build(opt);
      }
      return [ctx.baseUrl, ctx.uri].join('/');
    }
  }, ['get', 'post', 'put', 'patch', 'post', 'delete'].reduce((o, name) => {
    o[name] = function(opt) {
      ctx.method = name;
      if (typeof opt === 'object') {
        this.build(opt);
      } else if (typeof opt === 'string') {
        if (ctx.api) {
          this.resource(opt);
        } else {
          this.uri(opt);
        }
      }
      return resolve();
    };
    return o;
  }, {}));
  return promise.reset();
};

okapiSdk.HttpError = HttpError;
okapiSdk.defaultBaseUrl = 'https://api.laposte.fr' /*'http://localhost:3000'*/;
okapiSdk.requestDefaults = {
  checkServerIdentity: (host, cert) => {
    // Accept wildcard certificates if domains match
    if (cert && cert.subjectaltname) {
      const altNames = _.compact(cert.subjectaltname.split(',')
        .map(item => {
          const match = item.match('DNS:(.*)');
          return match ? match[1] : null;
        })
      );
      if (altNames && altNames.length) {
        if (altNames.indexOf(host) !== -1) {
          return;
        }
        for (const item of altNames) {
          if (item.indexOf('*.') === 0) {
            const domain = item.substring(2);
            const index = host.indexOf(domain);
            if (index !== -1 && index === host.length - domain.length) {
              return;
            }
          }
        }
      }
    }
    return 'Server certificate validation failed';
  }
};

module.exports = okapiSdk;
