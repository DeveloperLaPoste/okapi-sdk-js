'use strict';

const portfinder = require('portfinder');
const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const formidable = require('formidable');
const form = new formidable.IncomingForm();
const formParse = Promise.promisify(form.parse, {context: form, multiArgs: true});
//const log = require('hw-logger').log;

const apiServer = {
  baseUrl: null,
  init(appKey) {
    this.appKey = appKey || 'mysecretkey';
    this.app = express();
    this.app.use((req, res, next) => {
      if (req.headers['x-okapi-key'] !== this.appKey) {
        res.status(401);
        res.json({code: 'UNAUTHORIZED', message: 'BAD_APP_KEY'});
        return;
      }
      next();
    });
    this.app.get('/myapi/v1/myresource', (req, res) => {
      res.json({foo: req.query.foo || 'bar'});
    });
    this.contacts = [];
    this.app.post('/myapi/v1/contact-forms', bodyParser.urlencoded(), (req, res) => {
      const data = Object.assign(_.pick(req.body, ['firstName', 'lastName']), {id: this.contacts.length + 1});
      this.contacts.push(data);
      res.status(201);
      res.json(data);
    });
    this.app.post('/myapi/v1/contacts', bodyParser.json(), (req, res) => {
      const data = Object.assign(_.pick(req.body, ['firstName', 'lastName']), {id: this.contacts.length + 1});
      this.contacts.push(data);
      res.status(201);
      res.json(data);
    });
    this.app.patch('/myapi/v1/contacts/:id', bodyParser.json(), (req, res) => {
      const data = this.contacts[parseInt(req.params.id) - 1];
      if (!data) {
        res.status(404);
        res.json({code: 'NOT_FOUND', message: 'RESOURCE_NOT_FOUND'});
        return;
      }
      this.contacts[req.params.id] = Object.assign(data, _.pick(req.body, ['firstName', 'lastName']));
      this.contacts.push(this.contacts[req.params.id]);
      res.status(200);
      res.json(data);
    });
    this.app.get('/myapi/v1/contacts/:id', (req, res) => {
      const data = this.contacts[parseInt(req.params.id) - 1];
      if (!data) {
        res.status(404);
        res.json({code: 'NOT_FOUND', message: 'RESOURCE_NOT_FOUND'});
        return;
      }
      res.json(data);
    });
    this.app.delete('/myapi/v1/contacts/:id', bodyParser.json(), (req, res) => {
      const index = parseInt(req.params.id) - 1;
      const data = this.contacts[index];
      if (!data) {
        res.status(404);
        res.json({code: 'NOT_FOUND', message: 'RESOURCE_NOT_FOUND'});
        return;
      }
      this.contacts.splice(index, 1);
      res.status(204);
      res.end();
    });
    this.app.post('/myapi/v1/upload', (req, res) => {
      /**
       * $ curl -i -X POST http://localhost:8000/myapi/v1/upload \
       *    -H "Content-Type: multipart/form-data" \
       *    -F "toto=@package.json"
       */
      formParse(req)
        .spread((fields, files) => files[_.first(Object.keys(files))])
        .then(file => fs.readFileAsync(file.path)
          .then(content => {
            res.status(201);
            res.type(file.type);
            res.end(content);
          })
          .finally(() => fs.unlinkAsync(file.path))
        );
    });
    this.app.use((req, res, next) => {
      res.status(404);
      res.json({code: 'NOT_FOUND', message: 'RESOURCE_NOT_FOUND'});
    });
    return this;
  },
  start() {
    return Promise
      .fromCallback(cb => {
        portfinder.getPort(cb);
      })
      .then(freePort => {
        this.port = freePort;
        this.baseUrl = `http://localhost:${apiServer.port}`;
      })
      .then(() => Promise
        .fromCallback(cb => {
          this.server = this.app.listen(this.port, cb);
        })
      );
  },
  stop() {
    if (this.server) {
      return Promise
        .fromCallback(cb => {
          this.server.close(cb);
        });
    }
  }
};

if (!module.parent) {
  apiServer.init()
    .start()
    .then(() => {
      console.log(`Test api server listening to ${apiServer.baseUrl} with app key "${apiServer.appKey}"`);
    });
}

module.exports = apiServer;
