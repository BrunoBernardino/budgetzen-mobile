.PHONY: install
install:
	yarn install

.PHONY: start
start:
	yarn start

.PHONY: test
test:
	make lint
	yarn test

.PHONY: test/pretty
test/pretty:
	yarn pretty/test

.PHONY: test/ci
test/ci:
	make test/pretty
	make test

.PHONY: lint
lint:
	yarn lint

.PHONY: pretty
pretty:
	yarn pretty

.PHONY: deploy
deploy:
	expo publish

.PHONY: build
build:
	expo build:ios

.PHONY: upload
upload:
	expo upload:ios
