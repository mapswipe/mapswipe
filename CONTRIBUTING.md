# Contributing

We want to invite the vast community of developers to contribute to our mission and improve MapSwipe.

## Contributions
We welcome any contributions that help improve the application. Before you start hacking, please read through [README](README.md) and the issues on GitHub to find the best fit for your skills. If you find a task that you confortable working on, simply fork the repo and submit a PR when you are ready!

**Read this entire page before you start doing anything, the order of instructions here is not perfect!**

## Building the Application locally (START HERE)

To build the application locally, you'll need to install Android Studio or XCode in order to build the app in Android or iOS respectively. The React Native docs have [instructions](https://facebook.github.io/react-native/docs/getting-started.html) for both of those setups under the section "Building Projects with Native Code" that you can follow. Do that first. (Ignore the parts about `Expo CLI Quickstart`, you need to use the `React Native CLI Quickstart`).

To run the application, make sure you have NodeJS installed (version 6.3 or higher) as well as React Native CLI. You can install React Native globally with `npm install -g react-native-cli` or `yarn global add react-native-cli`. If you followed the getting started instructions from react-native above, you should be all set.

You should now have:
- the android SDK installed, make sure that you have a working `sdkmanager` under `<SDK_home>/tools/`,
- the android platform tools, including a functioning `adb`. Run

```sh
adb devices
```
with your android phone setup for development (again, follow the `getting started` instructions to make this work) and check that it finds your phone (or your android emulator).

Make sure you have followed instructions in there to install:
- `node.js`
- `yarn`

It is now time to clone this repository:

```sh
git clone git@github.com:mapswipe/mapswipe.git
```

### App variants

There are 4 versions of the app (for Android, this still needs setting up on iOS):
- DevDebug
- DevRelease
- ProductionDebug
- ProductionRelease

`Dev` and `Production` point to the `dev-mapswipe` and `msf-mapswipe` server, respectively.
`Debug` and `Release` are built with debug extras or optimised for distribution.

Use the `DevDebug` variant for developing, with the `dev-mapswipe` firebase backend.

When user testing, you probably want to use `DevRelease` so that your users don't suffer from debug version sluggishness.

`ProductionDebug` should in practice not be used.

### Setting up Firebase

MapSwipe uses Firebase to handle data transfers. The project won't run unless you create your own Firebase configuration.

First, clone the repository. Create a project in Firebase. (Or use an existing Firebase project that you have access to.)

Next, download the Firebase Google Services files from Firebase > Settings > Add App > Download files.

Copy the Android file to `android/app/src/dev/google-services.json` or `android/app/src/production/google-services.json` (depending on the variant you're using. For local development, you will be using `dev`) and the iOS file to `ios/cfg/GoogleService-Info.plist`.(#TODO: add variants for iOS)

You should also request access to the `dev-mapswipe` firebase instance, on which there are real test projects to test against. Contact one of the project admins for this (see https://www.mapswipe.org/ for contacts).

## Developing - Android

Install all dependencies of the mapswipe project (including `react-native`, but not `react-native-cli` which you need to install globally beforehand):

```sh
yarn install
```

You will need several terminals running in parallel. With your phone (or emulator) set up for development, run the following commands, in this order:

- Allow your phone to talk to the development server:
```sh
adb reverse tcp:8081 tcp:8081; adb reverse tcp:5678 tcp:5678
```

- (optional) Get the redux state debugger (see https://github.com/zalmoxisus/redux-devtools-extension for docs). You'll need the chrome redux debugger or an alternative installed to use this.
```sh
yarn reduxDebugger
```

- Start the development server (including the javascript packager):
```sh
yarn start
```

- set ANDROID_HOME path to where you extracted the android SDK (to make this permanent, add this line to your `~/.bashrc` or equivalent):
```
export ANDROID_HOME=/path/to/android-sdk/
```

- accept SDK licenses (sdkmanager is under the android SDK folder):
```sh
yes | sdkmanager --licenses
```

- Assemble the android `DevDebug` app and run it on your emulator or phone. This overrides the standard `react-native run-android` command which is broken with build flavors/variants.

```sh
yarn runAndroid
```

TODO: adda line on getting to chrome debugging tools (incl url) and link to fb rn debugging page

If none of the above makes sense, read the [react-native intro](https://facebook.github.io/react-native/docs/getting-started) again.

### Assembling a Release

Note: this section is mostly for reference, as releases are automatically produced by travis CI. You can safely ignore this section for now.

To assemble a release for Android, you'll have to set up your Android development environment to generate a signed APK. The React Native docs have [instructions](https://facebook.github.io/react-native/docs/signed-apk-android.html) on this to follow. To generate a signed release, you'll need to obtain the release keystore file from a MapSwipe developer as well as the credentials for it. Note, generating a signed release is only necessary for updating the app on the Google Play store.

When creating a new release for the Play store, you'll need to increment the `versionCode` and the `versionName` so that they don't clash with existing versions. See [Version numbering](#version-numbering) below on how to do this.

## Developing - iOS

You can access the xcode project in the iOS directory. Make sure to open the xcworkspace file and not the xcodeproj file.

TBC

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
