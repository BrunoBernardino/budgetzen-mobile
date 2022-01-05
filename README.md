# Budget Zen - Mobile

[![](https://github.com/BrunoBernardino/budgetzen-mobile/workflows/Run%20Tests/badge.svg)](https://github.com/BrunoBernardino/budgetzen-mobile/actions?workflow=Run+Tests)

This is the repo for the iOS and Android apps. Website is at https://budgetzen.net

**NOTE**: The mobile app is no longer available in the Play Store or App Store for ideological reasons. You can still build it from this repo yourself, or download + install the APK from the [Releases page](https://github.com/BrunoBernardino/budgetzen-mobile/releases). The new, end-to-end encrypted version (v2) is currently available as a [PWA/web app](https://app.budgetzen.net), which works for both mobile and desktop, and still has the source code publicly available.

## Development

```bash
make install
make start
make pretty
make test
make deploy   # publishes to everyone (prod)
make build/android   # builds Android APK (manually added to releases)
```

See [an older commit](https://github.com/BrunoBernardino/budgetzen-mobile/tree/7bd2ff89746167168d7b54e6982501fd9c668556#development) for other commands, related to building this for your iOS device.

## TODOs:

- [ ] Try to unify UI/UX with the BasicModal for the Date Picker and for the Budget Picker (use a regular picker inside the modal)
  - [ ] Add Expense
  - [ ] Edit Expense
  - [ ] Add/Edit Budget
