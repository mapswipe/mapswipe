# Contributing
We want to invite the vast community of developers to contribute to our mission and improve MapSwipe.


## Contributions
We welcome any contributions that help improve the application. Before you start hacking, please read through [README](README.md) and the issues on GitHub to find the best fit for your skills. If you find a task that you confortable working on, simply fork the repo and submit a PR when you are ready!

## Building the Application locally

To build the application locally, you'll need to install Android Studio or XCode in order to build the app in Android or iOS respectively. The React Native docs have [instructions](https://facebook.github.io/react-native/docs/getting-started.html) for both of those setups under the section "Building Projects with Native Code" that you can follow. Do that first. 

To run the application, you need to have NodeJS installed (version 6.3 or higher) as well as React Native. You can install React Native globally with `npm install -g react-native-cli`.

For Android, you'll have to set up some Gradle variables to prepare a release. The React Native docs have a [good explanation and instructions](https://facebook.github.io/react-native/docs/signed-apk-android.html) for doing that.

To run the application, run either `react-native run-android` or `react-native run-ios` from the root of the project to build it. (If you have trouble running `react-native run-ios`, open the file `./ios/Mapswipe.xcworkspace` in Xcode.)

### Setting up Firebase
MapSwipe uses Firebase to handle data transfers. The project won't run unless you create your own Firebase configuration.

First , clone the repository. Create a project in Firebase. (Or use an existing Firebase project that you have access to.)

Next, download the Firebase Google Services files from Firebase > Settings > Add App > Download files.

Copy the Android file to `android/app/google-services.json` and the iOS file to `ios/cfg/GoogleService-Info.plist`.

### Autogenerate `config.json`

Within the root of the project, run the command

    node setup-config.js
    
and it will prompt you for what you need to fill in the configuration.

### Manually create `config.json`

Alternatively, you may modify the contents of `config.json` to your particular set up. At present, here are the required parameters for that file:


    {
        "firebaseConfig": {
            "apiKey": "<your firebase API key>",
            "authDomain": "<your firebase auth domain>",
            "databaseURL": "<your firebase database URL>",
            "storageBucket": "<your firebase storage buck>"
        },
        "senderID": "<your firebase messaging sender-id>"
    }

To get the required parameters for the Firebase config, go to Develop > Authentication > Web Setup (top right). To get your Firebase messaging key, go to Firebase > Settings > Cloud Messaging.


## Developing - Android

### Assembling a Release

To assemble a release for Android, you'll have to set up your Android development environment to generate a signed APK. The React Native docs have [instructions](https://facebook.github.io/react-native/docs/0.23/signed-apk-android.html) on this to follow. To generate a signed release, you'll need to obtain the release keystore file from a MapSwipe developer as well as the credentials for it. Note, generating a signed release is only necessary for updating the app on the Google Play store.

When creating a new release for the Play store, you'll need to increment the `versionCode` and the `versionName` so that they don't clash with existing versions.

## Developing - iOS
You can access the xcode project in the iOS directory. Make sure to open the xcworkspace file and not the xcodeproj file.

## Version numbering

It should all be set automatically from `package.json`. When you need to release a new version, just run:

```
yarn version
```
and input the new version number (in semantic version format). The build scripts should take care of adjusting the builds based on this. The `yarn postversion` script will push to github, which in turn will trigger a build on travis and deployment to github releases.
For android, gradle will pull the version number from package.json when building.
