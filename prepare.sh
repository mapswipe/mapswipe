#!/bin/bash


# Patch installed within node_modules
./node_modules/.bin/patch-package


# `patch-package` has issues with diffing binary files so we'll fallback to just
# copying the splashscreen image to where it needs to be, overwriting the default
# https://github.com/remobile/react-native-splashscreen#genarate-splash-with-ffmpeg

MAPSWIPE_SPLASH="assets/splash.png"
SPLASH_PACKAGE="node_modules/@remobile/react-native-splashscreen"

echo "Copying $MAPSWIPE_SPLASH to $SPLASH_PACKAGE library to overwrite"
cp "$MAPSWIPE_SPLASH" "$SPLASH_PACKAGE/android/src/main/res/drawable/"
cp "$MAPSWIPE_SPLASH" "$SPLASH_PACKAGE/ios/RCTSplashScreen/SplashScreenResource/"
