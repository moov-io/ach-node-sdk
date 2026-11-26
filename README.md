# ACH Node SDK

Generated TypeScript SDK for the [moov-io/ach](https://github.com/moov-io/ach) HTTP API.

This package is an HTTP client. Every create, parse, or validate call needs a running moov-io/ach server. The SDK does not build or parse NACHA files in-process.

## Prerequisites

- Node.js 18 or later
- A running [moov-io/ach](https://github.com/moov-io/ach) server. The HTTP API listens on port 8080. Admin and metrics listen on port 9090.

Start the server with Docker:

```bash
docker run -p 8080:8080 -p 9090:9090 moov/ach:v1.69.1
```

Or install and run the Go binary:

```bash
go install github.com/moov-io/ach/cmd/server@v1.69.1
server
```

The default client base path is `http://localhost:8080`. See the [moov-io/ach README](https://github.com/moov-io/ach) for other ways to run the server.

## Installation

Install in your Node.js or TypeScript project using npm:

```bash
npm install ach-node-sdk
```

The npm `latest` tag is still 1.12.0 (published August 2024). GitHub's latest release is v1.14.0, which adds `createNewFile`, `mergeFiles`, and `reverseFile`. Until a 1.14.x (or later) release is published to npm, clone this repository and install a local tarball:

```bash
git clone https://github.com/moov-io/ach-node-sdk.git
cd ach-node-sdk
npm ci
npm pack
npm install ./ach-node-sdk-1.14.0.tgz
```

`npm pack` compiles TypeScript into `dist/` before it writes the tarball.

## Usage

CommonJS (`require` in a `.js` file):

```js
const { ACHFilesApi, Configuration } = require('ach-node-sdk');
```

ES modules or TypeScript (`import` in a `.mjs` file, a project with `"type": "module"`, or TypeScript):

```js
import { ACHFilesApi, Configuration } from 'ach-node-sdk';
```

A plain `.js` CommonJS project cannot use `import` unless you set `"type": "module"` or rename the file to `.mjs`.

Build the client. The default base path is `http://localhost:8080` when you omit `basePath`.

```js
const configuration = new Configuration({ basePath: 'http://localhost:8080' });
const achFilesApi = new ACHFilesApi(configuration);
```

List files on the server:

```js
const { data } = await achFilesApi.getFiles();
console.log(data);
// { files: [], error: null }
```

`createFile` and `createNewFile` take `body` as a `string`. The client sends that string as `text/plain`. The server accepts either NACHA text or JSON (use `JSON.stringify` on a `CreateFile` object). Amounts are integer cents. On a failed request, the server error message is at `error.response.data.error`.

### Build a PPD credit file

```ts
import {
  ACHFilesApi,
  Configuration,
  CreateFile,
  EntryDetailTransactionCodeEnum,
} from 'ach-node-sdk';

const achFilesApi = new ACHFilesApi(
  new Configuration({ basePath: 'http://localhost:8080' })
);

const file: CreateFile = {
  fileHeader: {
    immediateOrigin: '121042882',
    immediateOriginName: 'My Company',
    immediateDestination: '231380104',
    immediateDestinationName: 'Receiving Bank',
    // Format YYMMDD. The current TypeScript type requires this field.
    // The server sets the current date when both date and time are empty.
    fileCreationDate: '261126',
  },
  batches: [
    {
      batchHeader: {
        serviceClassCode: 220, // credits only
        companyName: 'MY COMPANY',
        companyIdentification: '121042882',
        standardEntryClassCode: 'PPD',
        companyEntryDescription: 'PAYROLL',
        effectiveEntryDate: '261127',
        ODFIIdentification: '12104288',
      },
      entryDetails: [
        {
          transactionCode: EntryDetailTransactionCodeEnum.NUMBER_22, // checking credit
          RDFIIdentification: '23138010',
          checkDigit: '4',
          DFIAccountNumber: '123456789',
          amount: 10000, // $100.00 in cents
          individualName: 'JANE DOE',
        },
      ],
    },
  ],
  // The generated CreateFile type currently requires IATBatches.
  // The moov-io/ach server accepts a file that omits this field.
  IATBatches: [],
};

async function buildPayrollFile() {
  try {
    const created = await achFilesApi.createFile('payroll-001', JSON.stringify(file));
    console.log(created.data.id);

    const validated = await achFilesApi.validateFile('payroll-001');
    if (validated.data && validated.data.error) {
      throw new Error(validated.data.error);
    }

    const contents = await achFilesApi.getFileContents('payroll-001');
    console.log(contents.data); // NACHA text, 94-character records
  } catch (err) {
    const e = err as { response?: { data?: { error?: string } }; message?: string };
    console.error(e.response?.data?.error ?? e.message);
  }
}

buildPayrollFile();
```

### Parse an `.ach` file

```ts
import * as fs from 'fs';
import { ACHFilesApi, Configuration } from 'ach-node-sdk';

const achFilesApi = new ACHFilesApi(
  new Configuration({ basePath: 'http://localhost:8080' })
);

async function parseAchFile() {
  try {
    const nacha = fs.readFileSync('./incoming.ach', 'utf8');
    const created = await achFilesApi.createFile('upload-001', nacha);
    console.log(created.data.id);

    const validated = await achFilesApi.validateFile('upload-001');
    if (validated.data && validated.data.error) {
      throw new Error(validated.data.error);
    }

    const contents = await achFilesApi.getFileContents('upload-001');
    console.log(contents.data);
  } catch (err) {
    const e = err as { response?: { data?: { error?: string } }; message?: string };
    console.error(e.response?.data?.error ?? e.message);
  }
}

parseAchFile();
```

See the [generated documentation](https://moov-io.github.io/ach-node-sdk/docs/) for more detail.

## Building Locally

This project needs Node.js 18 or later. Install the dependencies, then compile the TypeScript sources into `dist/`:

```bash
npm ci
npm run build
```

`npm ci` installs the pinned devDependencies, including TypeScript. Use `npx tsc --build tsconfig.json` if you need to invoke the compiler directly.

## Generating Client

`make client` regenerates the TypeScript client from a moov-io/ach OpenAPI document. It requires `make`, Java, and Maven.

The committed client was generated from [moov-io/ach v1.62.0](https://github.com/moov-io/ach/tree/v1.62.0). The current ach release is v1.69.1, which adds the `preserveBatchNumbers` query parameter and the `originatorDateOfBirth` and `receiverDateOfBirth` fields. To generate from a different tag:

```bash
make client ACH_VERSION=v1.69.1
```

## Generating Docs

```bash
npm ci
npm run docs
```

This runs the pinned `typedoc` devDependency through `npx` (see the `docs` script and the makefile).
