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


echo $tag