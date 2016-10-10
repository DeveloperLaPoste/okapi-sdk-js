[![NPM version](https://badge.fury.io/js/okapi-sdk.svg)](http://badge.fury.io/js/okapi-sdk)
[![Build Status](https://travis-ci.org/DeveloperLaPoste/okapi-sdk-js.png?branch=master)](https://travis-ci.org/DeveloperLaPoste/okapi-sdk-js)
[![Coverage Status](https://coveralls.io/repos/DeveloperLaPoste/okapi-sdk-js/badge.svg)](https://coveralls.io/r/DeveloperLaPoste/okapi-sdk-js)
[![npm](https://img.shields.io/npm/l/express.svg?style=flat-square)]()

![Okapi](https://github.com/DeveloperLaPoste/okapi-sdk-js/raw/master/assets/img/okapi-logo-200.png | height=200)|![JavaScript](http://i.stack.imgur.com/Mmww2.png | height=200)|![La Poste](https://logorigine.files.wordpress.com/2011/10/logo-la-poste.jpg | height=200)
:---------------------------------------------------------------------------------------------------------------|:------------------------------------------------------------:|:----------------------------------------------------------------------------------------:

## Le SDK client Okapi pour JavaScript / nodejs / navigateurs

Ce SDK facilite la consommation des [Open APIs de La Poste](https://developer.laposte.fr/), via la plateforme Okapi :

![Developer La Poste](https://github.com/DeveloperLaPoste/okapi-sdk-js/raw/master/assets/img/developer-laposte-fr-screenshot.png)

Pour consommer des APIs de La Poste, vous devez au préalable :
- [Créer votre compte](https://developer.laposte.fr/inscription/)
- Créer une application et noter la clé d'app générée, à utiliser comme appKey dans le SDK
- Souscrire à une API du [store](https://developer.laposte.fr/produit/)
 
## Installation

```
$ npm i okapi-sdk --save
```

## Utilisation

```javascript
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

## Utilisation dans un navigateur

### Après installation via NPM

- Version adaptée à la production :

    ```html
    <script src="node_modules/okapi-sdk/client/okapi-sdk.min.js"></script>
    ```

- Version non minifiée pour les développements :

    ```html
    <script src="node_modules/okapi-sdk/client/okapi-sdk.js"></script>
    ```

### Directement

- Version adaptée à la production :

    ```html
    <script src="https://github.com/DeveloperLaPoste/okapi-sdk-js/raw/master/client/okapi-sdk.min.js"></script>
    ```

- Version non minifiée pour les développements :

    ```html
    <script src="https://github.com/DeveloperLaPoste/okapi-sdk-js/raw/master/client/okapi-sdk.js"></script>
    ```

## Référence API

Les méthodes suivantes peuvent être chainées : elles retournent this (Object) pour permettre un chainage des appels.

### .api

Définit le contexte d'URL de l'API à consommer.

Arguments : contexte d'URL de l'API (String)

### .version

Définit la version de l'API à consommer.

Arguments : version (Integer|String)

### .resource

Définit l'URI de ressource de l'API à consommer.

Arguments : URI de la ressource (String)

### .uri

Définit une URI complète à utiliser (alternative à l'utilisation de .api et .version).

Arguments : uri (String) (ex : '/APIname/APIversion/resource')

### .body

Définit le corps de la requête.

Arguments : corps (Object)

### .query

Définit les paramètres de query string.

Arguments: query (Object)

### .params

Défnit les paramètres de l'URI.

Arguments: params (Object)

### .attachment

Définit un fichier à uploader.

Arguments: attachment (Object)

### .build

Méthode utilitaire tout-en-un qui construit l'URI.

Arguments: opt (Object)
 
Exemple :

```{API name, API version, resource, [...]})```

Les méthodes suivantes ne sont pas chainées :

### .toUrl

Retourne l'URL complète de la requête.

Arguments: [opt] (Object)

Exemple : 

```{API name, API version, resource, [...]}```

Retourne une URL complète (String)

### .get | .post | .put | .patch | .post | .delete

Ces méthodes sont identiques à leur équivalent HTTP, l'invocation de l'une de ces méthode déclenche l'appel de la requête au serveur.

Arguments: [opt] (Object)

Exemple : 

```{API name, API version, resource, [...]}```

Retourne une promesse qui se réalise avec les arguments suivants :
- res : réponse (Object)
- body : corps de la réponse body (Object)

