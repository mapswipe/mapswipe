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

You should request access to the `dev-mapswipe` firebase instance, on which there are real test projects to test against. You can [email us](mailto:info@mapswipe.org) for this.

We will email you 2 files.

Copy `GoogleService-Info.plist` to `ios/cfg/GoogleService-Info.dev.plist` and duplicate it to `ios/cfg/GoogleService-Info.prd.plist` (The build will fail if you don't, even though this seems useless).

You will also get a copy of `sentry.properties` which you will need to copy to `ios/cfg/`.

### Running the app and developing

#### On the simulator

Install steps:

1. Clone the repo. You will need to setup an SSH key if you want to push any code changes back to github.
2. Run `yarn install` -> Install the React native dependencies
3. Run `yarn start` -> Start React Native. You need to leave this running during your entire development session.
4. Run `sudo gem install bundler`
5. Run `bundle install` to install fastlane and cocoapods
6. Run `cd ios && bundle exec pod install` -> Install (mostly copy) the dependencies for iOS
7. Build & run the target mapswipe in debug.
8. Check that the tests are passing locally: Run `fastlane ios test`

If you get errors while installing pods (glog specifically), you might want to try this: https://github.com/facebook/react-native/issues/18408#issuecomment-386696744

Another error you might face is "resource fork, Finder information, or similar detritus not allowed", you can fix it by running `xattr -cr .`, see [this page](https://developer.apple.com/library/archive/qa/qa1940/_index.html) for more details.

Note: if you run into weird problems when running `yarn install` and such, and find no logical explanation, you may need to check your version of node (`node -v`). There has been a number of problems with some versions of `react-native` not working on specific versions of node. Overall, it seems that using the LTS version of node works better than the very latest builds.

#### On your phone

You will also need to create a provisioning profile. This [page](https://help.apple.com/xcode/mac/current/#/dev60b6fbbc7) should help.

### Testing

There are 2 sets of tests setup:

- _unit tests_ using `jest`, they are very basic at the moment, but should be enriched as we go. Run them with `yarn test`.
- \*end-to-end tests`using [detox](https://github.com/wix/Detox). They aim at reproducing the user's behaviour, like tapping on various components, and allow to check that the app responds as expected. You can run the tests with`yarn detoxTestIOS`. If you want more detailed output from the tests, add`--loglevel trace`to the`detox test` command.
  Before running the tests, you will need to install the tooling required:

```bash
$ brew tap wix/brew
$ brew install applesimutils
$ yarn global add react-native-cli
$ yarn global add detox-cli
```

### Version numbering

See [the android page](develop-android.md#version-numbering) for details.

## CI build process

**Warning**: this is written as I discover the process, it may not be fully accurate, correct or optimal.

The CI build process relies on [fastlane](https://docs.fastlane.tools) tools to build the app, sign it, and upload it to the beta system (`testflight`) or to the real app store.

At this point, the fastlane setup is built around the premise that you won't be deploying app updates from your computer, but only via github actions. The docs below may not make sense for your own laptop.

### Deployment

See [the page on deployment](deployment).

### Build variants

There are 2 different apps:

- mapswipe, which talks to the the main `msf-mapswipe` firebase instance. It is the one pushed to public users.
- mapswipe-dev has the exact same code base, but points to the `dev-mapswipe` firebase instance. It is the version used in development, and is shared with beta-testers via `testflight`. It never goes to the appstore, so general users will never see it. This variant has a sepia icon to spot the difference easily.

Github Actions run like this:

- on every `git push`, the tests are run, and the app is compiled, to verify that there are no broken dependencies, etc...
- on all pushes with a tag (except on the `master` branch), it also deploys the `dev` version to testflight, for beta-testers to review.
- on a push to `master` with a tag, it does all the above (except the upload to testflight), but also deploys the production version to the appstore (this requires a final manual step, plus a review by apple which takes 1-2 days).

### Getting users to test the beta version

There are 2 ways to test a beta build:

- inside the mapswipe core team: the users who are registered on the AppStore Connect can see and test all builds without approval from Apple. This is limited to 25 users who we trust enough to add to the organization.
- outside the mapswipe core team (public testing): we can share selected builds with up to 1000 users. These builds must be reviewed by Apple, which can take up to 24 hours. The AppStore Connect page will give you a link you can share with testers for them to get access (they need to install the testflight app)

For the app build that actually goes to the App Store, a review by Apple is also required, and takes up to 2 days.

### Code signing

Before being able to deploy the app to the apple store (or testflight, for beta testing), the code needs to be signed.

The signing certificate and keys are shared on a private [gitlab repository](https://gitlab.com/mapswipe/ios-certificates) according to a system called [match](https://docs.fastlane.tools/codesigning/getting-started/#using-match). You most likely won't need access to this repo unless you're modifying the keys. Please contact one of the project admins to obtain access if needed.

Once the certificates are downloaded, the app can be built. See `ios/fastlane/Fastfile` for details.

The whole process is performed using the `mapswipe.dev A T gmail` account.

### Renewing iOS certificates

Note: The naming of all these components is a bit confusing, and sometimes conflicting. This doc tries to make it clear what is what, but don't be surprised if the labels don't exactly match what you see. Also, Apple seems to change their processes every now and then, so this may be outdated sooner or later.

The CI build and deployment to testflight and the appstore require certificates and provisioning profiles (local development as well, in fact), which seem to have a fixed lifetime of 1 year. Once expired, you need to renew them, or more correctly, delete the old ones, and generate new ones.

The process looks like this:

- Delete the expired certificate and provisioning profile from the `ios-certificates` git repository. You can do this
  directly in the gitlab repo via their web IDE. Remove all the files under `profiles` and `certs`.
- On your laptop (it doesn't have to be a mac), run `fastlane spaceauth -u mapswipe.dev@gmail.com` and provide the
  password that you can find in the keepass file under "apple appstore / appstore login for app upload". This will give
  you a temp session string that you need to setup as an env var in github actions as `FASTLANE_SESSION`.
- login to `developer.apple.com`, go to `Certificates, Identifiers & Profiles` > `Profiles` and delete the ones for
  MapSwipe (and only those!) they should be expired when you do this.
- You might need to grant write permission to the deploy token on gitlab, under
  https://gitlab.com/mapswipe/ios-certificates/-/settings/repository#js-deploy-keys-settings (click the little pen to
  edit the key).
- Create a new branch from `dev` with the same changes as in [PR 572](https://github.com/mapswipe/mapswipe/pull/572) and
  push it to github, let CI run, and ~~watch the magic~~ fix the errors as they come.
- run `fastlane ios matchProd` or `fastlane ios matchDev` depending on the certs to renew. This should create new files
  and push them to the remote git repo, so you don't need to do anything else.
- If you run into an error similar to "maximum number of certificates reached", you might need to delete one of the
  extra distribution certs on developer.apple.com.
- You might need to give your deploy key write access to the git repo so that fastlane can push the new certs.
- Ideally remove the write permissions from the deploy key on gitlab (see the step above)

These steps are written as an indication only, if you actually know how this is working, an update to this section is more than welcome!

## Upgrading dependencies and tools

See [this page](upgrading_dependencies.md)
