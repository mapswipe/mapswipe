#!/bin/bash

# help debugging
set -euo pipefail

# this is meant to be run in CI only
if [[ -z "$GITHUB_ACTIONS" ]]; then
    echo "Only run this in CI, bye!"
    exit 1
fi

# setup RSA key so we can clone the certificate repo in gitlab
eval "$(ssh-agent -s)"
chmod 600 ./ios/cfg/mapswipe.dev_at_gmail_rsa_key_for_travis_ci
ssh-add ./ios/cfg/mapswipe.dev_at_gmail_rsa_key_for_travis_ci
# define a custom keychain for fastlane to use
export KEY_CHAIN=ios-build.keychain
security create-keychain -p travis $KEY_CHAIN
security default-keychain -s $KEY_CHAIN
security unlock-keychain -p travis $KEY_CHAIN
security set-keychain-settings -t 3600 -u $KEY_CHAIN
