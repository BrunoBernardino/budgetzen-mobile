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

.PHONY: build/ios
build/ios:
	expo build:ios -t archive

.PHONY: build/android
build/android:
	expo build:android -t app-bundle

.PHONY: upload/ios
upload/ios:
	expo upload:ios

.PHONY: upload/android
upload/android:
	expo upload:android
