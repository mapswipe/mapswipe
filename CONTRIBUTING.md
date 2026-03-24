## Contributions

We welcome the global community of developers to contribute to our mission and help improve MapSwipe! We welcome any contributions that enhance the application.

Before getting started, please:

* Read the [README](README.md)
* Browse existing issues on GitHub to find tasks that match your skills

If you find something you'd like to work on:

1. Fork the repository
2. Create your branch from `dev`
3. Submit a Pull Request (PR) when ready

If you're planning a **non-trivial change**, we strongly recommend that you first [open an issue](https://github.com/mapswipe/mapswipe/issues) to discuss your proposal. This helps avoid duplicated work or conflicts with ongoing efforts.

## ⚠️ Guidelines

### AI-generated contributions

* Direct AI-generated contributions are **not allowed** ❌
* All contributions must be **reviewed, tested, and fully understood by the contributor** before submission
* Repository owners will **independently review, run, and verify** all changes

### Review & Merge Process

* All PRs must go through a proper review process
* Final review and approval will be conducted by **Togglecorp** before merging
* Contributors may be asked to make revisions based on feedback

## Developing - Android

See [Setting up a development environment for Android](docs/develop-android.md) for full instructions.

## Developing - iOS

See [Setting up a development environment for iOS](docs/develop-ios.md).

## Developing and Debugging

(Coming soon — contributors are encouraged to help expand this section.)

## GitHub Actions Setup

See the [deployment page](docs/deployment) for setup and configuration details.

### Deployment to GitHub Releases

Deployment workflows are defined under `.github/workflows`.

## Translating the App

We use [Transifex](https://www.transifex.com/mapswipe/mapswipe-app/) for managing translations.

### Developer workflow:

* Install the Transifex CLI:
  [https://docs.transifex.com/client/installing-the-client](https://docs.transifex.com/client/installing-the-client)

* Push source strings (English):

  ```
  tx push -s
  ```

* Push translations (non-English):

  ```
  tx push -t
  ```

* Pull all translations:

  ```
  tx pull -a
  ```

* Commit updated `<lang>.json` files to the repository

## Troubleshooting and Notes

* When updating dependencies using `yarn`, ensure corresponding **iOS dependencies** are also updated
* Some libraries (e.g., Sentry) rely on CocoaPods and may not sync automatically with JavaScript versions, which can break builds
