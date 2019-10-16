# Setting up a development environment for Android

*Note*: this page assumes you're using some flavour of linux. For other OSes, you may need to adjust some of the content.

**Read this entire page before you start doing anything, the order of instructions here is not perfect!**

## Building the Application locally (START HERE)

### Installing dependencies

To build the application locally, you need to install Android Studio in order to build the app in Android. The React Native docs have [instructions](https://facebook.github.io/react-native/docs/getting-started.html) for this setup under the section "Building Projects with Native Code" that you can follow. Do that first. (Ignore the parts about `Expo CLI Quickstart`, you need to use the `React Native CLI Quickstart`).

If you want to use Android Studio to develop, you should open the `mapswipe/android` folder when first asked what to open.

You should now have:
- the android SDK installed (from https://developer.android.com/studio), make sure that you have a working `sdkmanager` under `<SDK_home>/tools/`,
- the android platform tools, including a functioning `adb`. Run

```sh
adb devices
```
with your android phone setup for development (again, follow the `getting started` instructions to make this work) and check that it finds your phone (or your android emulator). You might need to add the path to `adb` to your `$PATH` environment variable to make this work.

If you want to use an emulator instead of a physical phone for testing, see [this page](https://developer.android.com/studio/run/managing-avds.html) on how to create a new AVD. There are instructions for react-native under the ["using a virtual device" section on this page](http://facebook.github.io/react-native/docs/getting-started.html).

Set `ANDROID_HOME` env var to where you extracted the android SDK (to make this permanent, add this line to your `~/.bashrc` or equivalent):
```
export ANDROID_HOME=/path/to/android-sdk/
```

Now would also be a good time to accept all the android SDK licenses (optional, but this will make your life easier):

```sh
cd <path_to_android_sdk_tools>/tools/bin/ && yes | sudo sdkmanager --licenses
```

Make sure you have followed instructions in there to install:
- `node.js` (as I write this, node 8.x is known to work, and we've seen issues with node 10.x)
- `yarn`

Install React Native globally with:

```sh
npm install -g react-native-cli
# or
yarn global add react-native-cli
```

It is now time to clone this repository:

```sh
git clone git@github.com:mapswipe/mapswipe.git
```

Install all the dependencies of the mapswipe project (including `react-native`, but not `react-native-cli` which you have already installed globally above):

```sh
yarn install
```

### Setting up Firebase

MapSwipe uses Firebase to handle data transfers. The project won't run unless you create your own Firebase configuration.

You should request access to the `dev-mapswipe` firebase instance, on which there are real test projects to test against. Contact one of the project admins for this (see https://www.mapswipe.org/ for contacts), and request the "google services JSON file" that will allow your copy of the app to contact the development firebase.

If you have created your own firebase instance (we do not recommend this, but strongly suggest you contact us to get access to our development instance), download the Firebase Google Services files from Firebase > Settings > Add App > Download files.

Copy the Android file to `android/app/src/dev/google-services.json` or `android/app/src/production/google-services.json` (depending on the variant you're using. For local development, you will be using `dev`).

### Running the app and developing

Enable developer options and debugging on your android phone: https://developer.android.com/studio/debug/dev-options

Connect your android phone to your computer (or setup debug over wifi if you're adventurous).

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

- Assemble the android `DevDebug` app and run it on your emulator or phone. This overrides the standard `react-native run-android` command which is broken with build flavors/variants.

```sh
yarn runAndroid
```

You can also open the developer menu on the phone by shaking it (while running the app) or by running:

```sh
adb shell input keyevent 82
```

and tap "Debug JS remotely" to use the JS engine in chrome. See https://facebook.github.io/react-native/docs/debugging#chrome-developer-tools for details about using the remote debugger.

You're all set! :tada:

If none of the above makes sense, read the [react-native intro](https://facebook.github.io/react-native/docs/getting-started) again.

## App variants

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

## Testing

There are 2 sets of tests setup:

- *unit tests* using `jest`, they are very basic at the moment, but should be enriched as we go. Run them with `yarn test`.
- *end-to-end tests` using [detox](https://github.com/wix/Detox). They aim at reproducing the user's behaviour, like tapping on various components, and allow to check that the app responds as expected. You will need to setup an android emulator, as detox doesn't seem to run on android devices at the moment. Follow the commands in `.travis.yml` at the root of this repo in the `before_script` section of the android build, unless you already have an emulator. You can then run the tests with `yarn detoxTestAndroid`. If you want more detailed output from the tests, add `--loglevel trace` to the `detox test` command.

## Version numbering

It should all be set automatically from `package.json`. When you need to release a new version, just run:

```
bash scripts/version.sh
```
and input the new version number (in semantic version format) and build number (0-99). The script will also ask for a `beta` or `prod` build, which match the `dev` and `production` versions. A new commit will be produced with the version number changed in `package.json` as well as the relevant files in the `ios/` directory. The build scripts will take care of adjusting the builds based on this. The script will then push the commit and new tag to github, which in turn will trigger a build on travis and deployment to github releases for android, and to testflight for iOS.

The git tags will look like:

- `1.2.34(5)-beta` for version `1.2.34` build 5 of the `dev/beta` app (linked to the `dev` firebase instance)
- `1.2.34(5)` for version `.1.2.34` build 5 of the `production` app (linked to the `production` firebase instance)

For android, gradle will pull the version number from package.json when building.
For iOS, the version numbers are in the iOS project files.

## Deployment

See [the page on deployment](deployment).
