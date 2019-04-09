# Contributing

We want to invite the vast community of developers to contribute to our mission and improve MapSwipe.

## Contributions
We welcome any contributions that help improve the application. Before you start hacking, please read through [README](README.md) and the issues on GitHub to find the best fit for your skills. If you find a task that you confortable working on, simply fork the repo and submit a PR when you are ready!

We also suggest you get in touch with the developers to find out what the current progress is on the project, as the repository may not always reflect everything that is going on.


## Developing - Android

See [Setting up a development environment for Android](develop-android) for all the details.

## Developing - iOS

See [Setting up a developer environment for iOS](develop-ios).

### Assembling a Release

Note: this section is mostly for reference, as releases are automatically produced by travis CI. You can safely ignore this section for now.

To assemble a release for Android, you'll have to set up your Android development environment to generate a signed APK. The React Native docs have [instructions](https://facebook.github.io/react-native/docs/signed-apk-android.html) on this to follow. To generate a signed release, you'll need to obtain the release keystore file from a MapSwipe developer as well as the credentials for it. Note, generating a signed release is only necessary for updating the app on the Google Play store.

When creating a new release for the Play store, you'll need to increment the `versionCode` and the `versionName` so that they don't clash with existing versions. See [Version numbering](#version-numbering) below on how to do this.

## Version numbering

It should all be set automatically from `package.json`. When you need to release a new version, just run:

```
yarn version
```
and input the new version number (in semantic version format). A new commit will be produced with the version number changed in `package.json`. The build scripts will take care of adjusting the builds based on this. The `yarn postversion` script will run automatically, and push the commit and new tag to github, which in turn will trigger a build on travis and deployment to github releases. (TODO: add deployment to google playstore for `ProductionRelease` version)

For android, gradle will pull the version number from package.json when building.

## Developping and debugging

## Travis setup

### Encrypted api keys, passwords, etc...

The `secrets.tar.enc` file is the encrypted version of `secrets.tar`, which contains the following files:

```
$ tar tvf secrets.tar
-rw-r--r-- username/username 1026 2018-11-01 00:23 android/app/src/dev/google-services.json
-rw-r--r-- username/username 2281 2018-10-31 15:14 android/app/mapswipe-dev-release-key.keystore
-rw-r--r-- username/username 1052 2018-11-06 16:49 android/gradle.properties
-rw-r--r-- username/username 1382 2018-11-12 09:46 ios/cfg/GoogleService-Info.plist
-rw-r--r-- username/username  214 2018-11-21 15:38 android/sentry.properties
-rw-r--r-- username/username  214 2018-11-21 15:38 ios/sentry.properties
```

If you need to add a file containing sensitive info, you will need to rebuild the `secrets.tar` file by gathering these files from firebase and sentry, then add them to the file with

```
tar xvf secrets.tar file1 file2...
```

and then encrypt the file as detailed in https://docs.travis-ci.com/user/encrypting-files/. Make sure to use the following command line, so that it uses the main `mapswipe/mapswipe` repo when encrypting:

```
travis encrypt-file secrets.tar --org -r mapswipe/mapswipe
```

See the travis logs for a list of files, in case this doc becomes out of date.

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
