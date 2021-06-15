#!/bin/bash

# This script updates version and build numbers as needed for both
# Android and iOS build systems.
# This replaces the default `yarn version` script, which does not handle
# build numbers as needed for iOS deployments.

# The resulting git tags will look like:
# v1.3.38(4)-beta where
# 1.3.38 is a semver version number
# 4 is the build number
# all numbers above must be between 0 and 99, or the system will fail somewhere
# -beta is only added to beta/dev builds, the production build has no extension

# On android, the build.grade script will build a globally unique build number to satisfy
# the playstore's requirements.
# This script must be run locally (not on travis) to release a new version.

# stop immediately if we encounter any error
set -e

# Make sure we run from the root of the repo to prevent broken paths
if [[ ! -d ".git" ]]; then
    echo "Please run this script from the root directory of the project, like: bash scripts/version.sh"
    exit 1
fi

# Prevent accidentally pushing random changes
#diff=`git diff-index HEAD | wc -l`
diff=0
if [[ $diff -gt 0 ]]; then
    echo "There are modified files in your working copy (or staged in the index). Please commit or stash them and rerun this command."
    exit 1
fi

# get current version/build from package.json
current_version_number=`grep '^\ *"version":' package.json | sed 's/.*"\(.*\)",/\1/g'`
current_build_number=`grep '^\ *"build": "[0-9]\{1,2\}",' package.json | sed 's/.*"\(.*\)",/\1/g'`

# ask for new version number, and check it's valid
echo -n "Current version is $current_version_number. Input new version number: "
read  versionNumber;
semver_check="(0|[1-9][0-9]*)\\.(0|[1-9][0-9]*)\\.(0|[1-9][0-9]*)"
if [[ ! "$versionNumber" =~ $semver_check ]]; then
    echo "Version number must be a semantic version (like 1.4.19). Exiting."
    exit 1
fi

# ask and validate build number
echo -n "Current build is $current_build_number. Input new build number: "
read buildNumber;
build_check="[0-9][0-9]?"
if [[ ! "$buildNumber" =~ $build_check ]]; then
    echo "Build number must be a number. Exiting."
    exit 1
fi

echo
echo "Releasing version $versionNumber build $buildNumber"

tag="$versionNumber($buildNumber)"

# ensure we only get production releases from the master branch
# any other branch will yield a beta release
current_branch=`git branch --show-current`
if [[ "$current_branch" = "master" ]]; then
    echo "On branch "master", doing a  production release"
else
    echo "On branch $current_branch, doing a beta release"
    # add a "beta" extension to the git tag
    tag="$tag-beta"
fi

# get a final  confirmation to allow user to bail out
read -p "All set? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Aborting"
    exit 1
fi

# run checks before creating the new version
yarn lint
# yarn flow
# FIXME: restore yarn test here, they're broken right now because of native-testing-library, it seems

# update package.json with the new version and build numbers
sed -i -e "s/^\ *\"version\": \"[0-9]\.[0-9]*\.[0-9]*\"\,$/  \"version\": \"${versionNumber}\"\,/" package.json
sed -i -e "s/^\ *\"build\": \"[0-9]\{1,2\}\"\,$/  \"build\": \"${buildNumber}\"\,/" package.json

# update iOS specific files with the new numbers
if [[ "$OSTYPE" =~ "darwin*" ]]; then
    bundle exec fastlane run increment_build_number build_number:$buildNumber xcodeproj:ios/mapswipe.xcodeproj
    bundle exec fastlane run increment_version_number version_number:$versionNumber xcodeproj:ios/mapswipe.xcodeproj
else
  # update the various ios files from linux. There is no native tool there to do this,
  # so we rely on sed...
    plistFiles="ios/mapswipe/Info.plist ios/mapswipeTests/Info.plist ios/mapswipeUITests/Info.plist"
    for f in $plistFiles
    do
        sed -i -e "/CFBundleShortVersionString<\/key>$/{n;s/\(.*\)<string>.*<\/string>/\1<string>$versionNumber<\/string>/}" $f
        sed -i -e "/CFBundleVersion<\/key>$/{n;s/\(.*\)<string>.*<\/string>/\1<string>$buildNumber<\/string>/}" $f
    done
    sed -i -e "s/CURRENT_PROJECT_VERSION = .*;/CURRENT_PROJECT_VERSION = $buildNumber;/" ios/mapswipe.xcodeproj/project.pbxproj
fi

git commit -a -m $tag
git tag $tag

git push origin $tag
git push --set-upstream origin HEAD

echo $tag
