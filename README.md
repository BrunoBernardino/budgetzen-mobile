# Budgets, calm.

[![](https://github.com/BrunoBernardino/BudgetsCalm/workflows/Run%20Tests/badge.svg)](https://github.com/BrunoBernardino/BudgetsCalm/actions?workflow=Run+Tests)

This is the repo for the mobile app. Website is at https://budgets.calm.sh

## Development

```bash
make install
make start
make pretty
make test
make deploy  # publishes to everyone, prod
make build  # builds iOS
make upload  # uploads iOS build to the App Store
```

https://docs.expo.io/versions/v39.0.0/distribution/building-standalone-apps/#5-test-it-on-your-device-or for testing on iOS simulator (does NOT require `make build`, `make deploy`, nor `make upload`)

## TODOs:

- [ ] When running `make deploy`, update/write the package.json:build automatically
- [ ] Try to unify UI/UX with the BasicModal for the Date Picker and for the Budget Picker (use a regular picker inside the modal)
  - [ ] Add Expense
  - [ ] Edit Expense
  - [ ] Add/Edit Budget
- [ ] Properly tweak UI for dark/light mode
