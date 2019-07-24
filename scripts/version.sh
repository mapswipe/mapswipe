#!/bin/bash

echo -n "Version number: "
read  versionNumber;
echo -n "Build number: "
read buildNumber;

echo "Releasing version $versionNumber build $buildNumber"

tag="$versionNumber($buildNumber)"

echo "Release version in beta or Prod ?"
  select yn in "Beta" "Prod"; do
    case $yn in
      Beta ) tag="$tag-beta"; break;;
      Prod ) break;;
    esac
  done

yarn version --new-version $versionNumber --no-git-tag-version

bundle exec fastlane run increment_build_number build_number:$buildNumber
bundle exec fastlane run increment_version_number version_number:$versionNumber

git commit -a -m $tag
git tag $tag

git push origin $tag
git push --set-upstream origin HEAD

echo $tag