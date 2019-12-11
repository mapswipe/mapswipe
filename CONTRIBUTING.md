# Contributing

We want to invite the vast community of developers to contribute to our mission and improve MapSwipe.

## Contributions

We welcome any contributions that help improve the application. Before you start hacking, please read through [README](README.md) and the issues on GitHub to find the best fit for your skills. If you find a task that you confortable working on, simply fork the repo and submit a PR (to the `dev` branch) when you are ready!

If you are thinking of a change that is not trivial, we suggest you first [open an issue](https://github.com/mapswipe/mapswipe/issues) to discuss your proposed changes. This may save you a lot of time, as other people may be working on similar (or conflicting) changes.

## Developing - Android

See [Setting up a development environment for Android](docs/develop-android.md) for all the details.

## Developing - iOS

See [Setting up a developer environment for iOS](docs/develop-ios.md).

### Assembling a Release

Note: this section is mostly for reference, as releases are automatically produced by travis CI. You can safely ignore this section for now.

To assemble a release for Android, you'll have to set up your Android development environment to generate a signed APK. The React Native docs have [instructions](https://facebook.github.io/react-native/docs/signed-apk-android.html) on this to follow. To generate a signed release, you'll need to obtain the release keystore file from a MapSwipe developer as well as the credentials for it. Note, generating a signed release is only necessary for updating the app on the Google Play store.

When creating a new release for the Play store, you'll need to increment the `versionCode` and the `versionName` so that they don't clash with existing versions. See [Version numbering](#version-numbering) below on how to do this.

## Developping and debugging

## Travis setup

See the [deployment page](docs/deployment).

### Deployment to github releases

See https://docs.travis-ci.com/user/deployment/releases/. To pick the right repo to deploy to, use:

```
travis setup releases --org -r mapswipe/mapswipe
```

## Translating the app

We use [transifex](https://www.transifex.com/mapswipe/mapswipe-app/) to translate the text in the app to other languages. As a developer, you need to know the following:

- install the transifex client: https://docs.transifex.com/client/installing-the-client
- if you modify text strings in the code, you need to push these updates to transifex with `tx push -s`
- if you add new translations (in other languages than English) in the code, use `tx push -t` to upload the translations to transifex
- to pull new translations from transifex into the code base: `tx pull -a`, and commit the updated `<lang>.json` files to git :)

## Troubleshooting and random notes

- When updating dependencies with `yarn`, make sure that the corresponding `iOS` dependency is updated as well, for instance `Sentry` has a cocoapod that does not seem to sync automatically with the javascript version, which ends up breaking the build.
