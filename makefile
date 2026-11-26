# The committed TypeScript client was generated from moov-io/ach v1.62.0.
# Set ACH_VERSION to generate from a different tag (for example v1.69.1).
ACH_VERSION ?= v1.62.0
OPENAPI_GENERATOR_VERSION ?= 6.6.0

.PHONY: build
build:
	npx tsc --build tsconfig.json

.PHONY: client
# Generating the client requires Java and Maven. The wrapper script uses Maven
# to download the OpenAPI Generator JAR for OPENAPI_GENERATOR_VERSION.
client:
	@chmod +x ./openapi-generator
	@rm -rf ./client
	OPENAPI_GENERATOR_VERSION=$(OPENAPI_GENERATOR_VERSION) ./openapi-generator generate -i https://raw.githubusercontent.com/moov-io/ach/$(ACH_VERSION)/openapi.yaml -g typescript-axios

.PHONY: docs
docs:
	npx typedoc --out docs/ *.ts
