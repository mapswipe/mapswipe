#!/usr/bin/env bash -e

# only use this script in travis CI environment
# it will magically set the iOS build and version number based on the content
# of package.json
#
# Example: in package.json: version = 1.3.24
# MAPSWIPE_PACKAGE_VERSION=1.3.24
# MAPSWIPE_BUILD_NUMBER=10324  (1 * 10000 + 3 * 100 + 24)

# This mirrors the behaviour on android (managed by gradle)

MAPSWIPE_PACKAGE_VERSION=$(cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[\",]//g' | tr -d '[[:space:]]')
export MAPSWIPE_PACKAGE_VERSION


# # set the Internal Field Separator
# IFS='.'
# # split the version number
# read -ra BITS <<< "$MAPSWIPE_PACKAGE_VERSION"
# # math in bash is not pretty
# MAPSWIPE_BUILD_NUMBER=$(expr ${BITS[0]} \* 10000 + ${BITS[1]} \* 100 + ${BITS[2]})

# # reset IFS so we don't mess up other code
# IFS=' '

# echo "Building version ${MAPSWIPE_PACKAGE_VERSION} (build ${MAPSWIPE_BUILD_NUMBER})"

# export MAPSWIPE_BUILD_NUMBER
