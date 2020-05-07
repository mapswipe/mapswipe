# Contributing

We want to invite the vast community of developers to contribute to our mission and improve MapSwipe.

## Contributions

We welcome any contributions that help improve the application. Before you start hacking, please read through [README](README.md) and the issues on GitHub to find the best fit for your skills. If you find a task that you confortable working on, simply fork the repo and submit a PR (to the `dev` branch) when you are ready!

If you are thinking of a change that is not trivial, we suggest you first [open an issue](https://github.com/mapswipe/mapswipe/issues) to discuss your proposed changes. This may save you a lot of time, as other people may be working on similar (or conflicting) changes.

## Developing - Android

See [Setting up a development environment for Android](docs/develop-android.md) for all the details.

## Developing - iOS

See [Setting up a developer environment for iOS](docs/develop-ios.md).

## Developping and debugging

## Travis setup

See the [deployment page](docs/deployment.md).

### Deployment to github releases

See https://docs.travis-ci.com/user/deployment/releases/. To pick the right repo to deploy to, use:

```
travis setup releases --org -r mapswipe/mapswipe
```

## Testing the development app

Find out how to install the latest test version of MapSwipe [on this page](docs/test_dev_version.md).

## Translating the app

We use [transifex](https://www.transifex.com/mapswipe/mapswipe-app/) to translate the text in the app to other languages. As a developer, you need to know the following:

- install the transifex client: https://docs.transifex.com/client/installing-the-client
- if you modify text strings in the code, you need to push these updates to transifex with `tx push -s`
- if you add new translations (in other languages than English) in the code, use `tx push -t` to upload the translations to transifex
- to pull new translations from transifex into the code base: `tx pull -a`, and commit the updated `<lang>.json` files to git :)

## Troubleshooting and random notes

- When updating dependencies with `yarn`, make sure that the corresponding `iOS` dependency is updated as well, for instance `Sentry` has a cocoapod that does not seem to sync automatically with the javascript version, which ends up breaking the build.
