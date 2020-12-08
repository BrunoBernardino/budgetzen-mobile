# Budget Zen - Mobile

[![](https://github.com/BrunoBernardino/budgetzen-mobile/workflows/Run%20Tests/badge.svg)](https://github.com/BrunoBernardino/budgetzen-mobile/actions?workflow=Run+Tests)

This is the repo for the iOS and Android apps. Website is at https://budgetzen.net

## Development

```bash
make install
make start
make pretty
make test
make deploy   # publishes to everyone, prod
make build/ios   # builds iOS
make upload/ios   # uploads iOS build to the App Store
make build/android   # builds Android
make upload/android   # uploads Android build to the Play Store
```

https://docs.expo.io/versions/v39.0.0/distribution/building-standalone-apps/#5-test-it-on-your-device-or for testing on iOS simulator (does NOT require `make build/ios`, `make deploy`, nor `make upload/ios`)

## TODOs:

- [ ] When running `make deploy`, update/write the package.json:build automatically
- [ ] Try to unify UI/UX with the BasicModal for the Date Picker and for the Budget Picker (use a regular picker inside the modal)
  - [ ] Add Expense
  - [ ] Edit Expense
  - [ ] Add/Edit Budget
