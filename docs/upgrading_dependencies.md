# Upgrading dependencies and tools

Here are a few notes about upgrading some of the tools and requirements for building the app.
These should be available with a bit of searching, but it's always easier to have them handy.

## Fastlane and CocoaPods

Fastlane is used to build the iOS app and release it to testflight and the Apple App Store, and also to deploy the android app to PlayStore.

Cocoapods is used to manage dependencies for the iOS app. This is a requirement of react-native. Do not try to manage cocoapods from a non apple computer, or you'll get hurt!

Both tools are built in ruby, and managed via `Gemfile` and bundler.

To upgrade the tools:

- Install bundler: `gem install bundler` (you might already have this)
- `rm Gemfile.lock`
- `bundle lock` will then recreate the lockfile with updated versions, without installing anything. This seems to work outside the Apple world as it is pure ruby.
- (optional) `bundle install` (this will fail on non-apple, as there are binaries to build)
- (optional) `pod install` (only on macOS)

## React Native

This is a big one. Read [this ticket](https://github.com/mapswipe/mapswipe/issues/61) for some background.

The process is widely regarded as the worst part of the framework. There are a few tools to help upgrade automatically, but it seems that manual upgrades are still the most reliable path.

Below is the process used to upgrade to 0.60.

Based on [this blog post](https://brucelefebvre.com/blog/2019/03/03/upgrading-react-native-with-rn-diff-purge/) and a few other bits, plus my own attempts, it seems that the easiest path is:
- git checkout -b rn-upgrade-branch
- run tests and checks to ensure they all pass before breaking stuff
- get the diff to apply from https://pvinis.github.io/purge-web/ for instance: https://github.com/react-native-community/rn-diff-purge/compare/release/0.57.8..release/0.58.0
- apply the diff by hand, for javascript, android and iOS
- this will include a change of dependency versions in `package.json`. Make sure you run `yarn install` after this, or the following steps won't work
- *iOS specific stuff*
    + `cd ios`
    + `rm Podfile.lock`
    + `bundle exec pod install`  // this probably needs to happen on a mac, as cocoapods will sometimes fail on other OSes :(
- *test the app again*
- if it works, you're done :tada: 
- `cd ..`
- `git add .`
- `git commit -m "Upgrade react-native to XXX"`

From 0.61 onwards, there is a helper tool that improves the process a lot:
- go to https://react-native-community.github.io/upgrade-helper/
- input the current version of RN in MapSwipe, and the next
- apply the patches manually to all files as recommended. Pay attention to `project.pbxproj`. Unless you have a mac to run Xcode, it is a small nightmare of a file that will require some black magic, as it is full of identifiers that change based on who runs the upgrade. Ideally find a mac, and just fix it there.
- delete `yarn.lock`
- delete `ios/Podfile.lock`
- run `yarn install` to upgrade javascript dependencies and create a new `yarn.lock`.
- (on macOS only) run `pod install` to generate a new `Podfile.lock`. If you don't have a mac, you can cheat by using the CI build to get the desired output:
    + in `.github/workflows/ios.yml`, after the cocoapods install step, add a step that does the following:
    + `cd ios && bundle exec pod install`
    + `- cat Podfile.lock`
    + push to a new throwaway branch.
    + copy/paste the output of `cat Podfile.lock` back into your local file and commit the result.
- At this point, you should have a working build for both android and iOS.
