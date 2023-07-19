.PHONY: build
build:
	tsc --build tsconfig.json

.PHONY: client
client:
# Generate client
# Checkout https://github.com/OpenAPITools/openapi-generator/releases
	@chmod +x ./openapi-generator
	@rm -rf ./client
	OPENAPI_GENERATOR_VERSION=6.6.0 ./openapi-generator generate -i https://raw.githubusercontent.com/moov-io/ach/1008caf15aaf7d870f9ff939182dca29ef54b7b2/openapi.yaml -g typescript-axios # v1.32.0 + 1 commit

.PHONY: docs
docs:
	npm install -g typedoc
	typedoc --out docs/ *.ts
