'use strict';

const _ = require('lodash');

class HttpError extends Error {
  constructor(opt) {
    opt = opt || {};
    const message = _.get(opt, 'body.message');
    super(message);
    Object.assign(this, _.pick(opt, ['statusCode', 'body']));
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
  }
}

module.exports = HttpError;
