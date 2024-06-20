fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## iOS

### ios matchDev

```sh
[bundle exec] fastlane ios matchDev
```

Update dev certificates locally

### ios matchProd

```sh
[bundle exec] fastlane ios matchProd
```



### ios test

```sh
[bundle exec] fastlane ios test
```

Build the app and run the tests defined for the mapswipe scheme. Used in github actions to trigger the CI step.

### ios release

```sh
[bundle exec] fastlane ios release
```

Build production version and upload to appstore. This step is executed when a tag on master is created

### ios beta

```sh
[bundle exec] fastlane ios beta
```

Build the beta version and upload it to testflight. This step is executed when a tag on any branch is created

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
