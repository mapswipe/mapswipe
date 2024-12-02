---
name: Prepare a release
about: A PR that prepares for a new production release
---

## Release checklist

This template only applies to a PR that prepares a new production release (ie. a PR from `dev` into `main`).
If this is not what you are doing, you can skip this template.

### General
- [ ] The code is commented enough to be understandable by another developer
- [ ] someone has reviewed my code
- [ ] The CI checks are passing before merging the PR
- [ ] I've rebased my branch off a recent `dev` branch commit, or merged `dev` into my branch and resolved all conflicts
- [ ] Any commit to `main` since the last release are also merged into `dev`.
- [ ] Reference related issues in the PR description
- [ ] The next [milestone](https://github.com/mapswipe/mapswipe/milestones) is created
- [ ] All items in the current release milestone are closed or reassigned to the next milestone
- [ ] PRs that are not needed are closed

### Translation
- [ ] Check that all translations are included in `src/shared/18n.js` and `src/shared/constant.js`
- [ ] All translation PRs are merged into `dev`.

### Dependencies and Security Alerts
- [ ] Check all security alerts and either close or merge them
- [ ] Verify outdated dependencies (with `yarn outdated`) and upgrade them
- [ ] Update [fastlane and cocoapods](docs/upgrading_dependencies.md)
- [ ] Check CI logs for the previous release (particularly around the playstore/appstore uploads from fastlane) for
  warnings about upcoming requirements


## Draft release notes

Please write release notes here. Bullet points are fine.
