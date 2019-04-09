# Setting up a developer environment for iOS

This may be obvious to iOS devs, but to everyone else: you cannot build an iOS app without an apple computer!

If you're desperate, you can rent a mac in the cloud, for instance from macstadium.com.

You can access the xcode project in the iOS directory. Make sure to open the xcworkspace file and not the xcodeproj file.

**Read this entire page before you start doing anything, the order of instructions here is not perfect!**

These instructions are very high level. You can take a look at the [android dev setup page](develop-android) for some inspiration. If you know your way around react-native/iOS development, please feel free to improve this page!

## Building the app locally

### Install dependencies

You need Xcode, node, yarn. See [installing dependencies](http://facebook.github.io/react-native/docs/getting-started.html#installing-dependencies) in the react-native docs.

Once you have dependencies installed, clone the mapswipe repository.

### Setting up access to firebase

MapSwipe uses Firebase to handle data transfers. The project won't run unless you create your own Firebase configuration.

You should request access to the `dev-mapswipe` firebase instance, on which there are real test projects to test against. Contact one of the project admins for this (see https://www.mapswipe.org/ for contacts).

Next, download the Firebase Google Services files from Firebase > Settings > Add App > Download files.

Copy the iOS file to `ios/cfg/GoogleService-Info.plist`.

### Running the app and developing

TBD

## CI build process

**Warning**: this is written as I discover the process, it may not be fully accurate, correct or optimal.

The CI build process relies on [fastlane](https://docs.fastlane.tools) tools to build the app, sign it, and upload it to the beta system (`testflight`) or to the real app store.

At this point, the fastlane setup is built around the premise that you won't be deploying app updates from your computer, but only via travis. The docs below may not make sense for your own laptop.

### Code signing

Before being able to deploy the app to the apple store (or testflight, for beta testing), the code needs to be signed.

The signing certificate and keys are shared on a private [gitlab repository](https://gitlab.com/mapswipe/ios-certificates) according to a system called [match](https://docs.fastlane.tools/codesigning/getting-started/#using-match). You most likely won't need access to this repo unless you're modifying the keys. Please contact one of the project admins to obtain access if needed.

We hit some problems during setup, for which travis has a [workaround](https://docs.travis-ci.com/user/common-build-problems/#mac-macos-mavericks-109-code-signing-errors). The code below is copied in `.travis.yml` to make this work.

```sh
KEY_CHAIN=ios-build.keychain
security create-keychain -p travis $KEY_CHAIN
# Make the keychain the default so identities are found
security default-keychain -s $KEY_CHAIN
# Unlock the keychain
security unlock-keychain -p travis $KEY_CHAIN
# Set keychain locking timeout to 3600 seconds
security set-keychain-settings -t 3600 -u $KEY_CHAIN
```

Once the certificates are downloaded, the app can be built. See `ios/fastlane/Fastfile` for details.

The whole process is performed using the `mapswipe.dev A T gmail` account.
