fastlane documentation
================
# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```
xcode-select --install
```

Install _fastlane_ using
```
[sudo] gem install fastlane -NV
```
or alternatively using `brew install fastlane`

# Available Actions
## iOS
### ios matchDev
```
fastlane ios matchDev
```
Update dev certificates locally
### ios matchProd
```
fastlane ios matchProd
```

### ios test
```
fastlane ios test
```
Build the app and run the tests defined for the mapswipe scheme. Used in github actions to trigger the CI step.
### ios release
```
fastlane ios release
```
Build production version and upload to appstore. This step is executed when a tag on master is created
### ios beta
```
fastlane ios beta
```
Build the beta version and upload it to testflight. This step is executed when a tag on any branch is created

----

This README.md is auto-generated and will be re-generated every time [fastlane](https://fastlane.tools) is run.
More information about fastlane can be found on [fastlane.tools](https://fastlane.tools).
The documentation of fastlane can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
