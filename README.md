# ACH Node SDK
Generated Typescript SDK for the [moov-io/ach](https://github.com/moov-io/ach) service.

## Installation
Install in your Node.js or Typescript project using npm:
```bash
npm install ach-node-sdk
```

## Usage
Using `require` sytax:
```js
const { ACHFilesApi, Configuration } = require('ach-node-sdk');
```

Using `import` syntax:
```js
import { ACHFilesApi, Configuration } from 'ach-node-sdk';
```

Build the client instance:
```js
const configuration = new Configuration({ basePath: 'https://ach.mycompany.com' });
const achFilesApi = new ACHFilesApi(configuration);
```

Call functions on the client:
```js
achFilesApi.getFiles().then(response => console.log(response.data));
=> Promise{ <pending> }
{ files: [], error: null };
```

See the [generated documentation](https://routefusion.github.io/ach-node-sdk/docs/) for more detail.
