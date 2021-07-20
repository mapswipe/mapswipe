# Notes about building release version locally

All deployments are done from [Github Actions](https://github.com/mapswipe/mapswipe/actions).

You should **NOT** try to release from your local machine, except by using the script under `./scripts/version.sh`.

## Secrets management

Passwords, API keys and logins come from a variety of sources. Contact one of the owners of the github project to be pointed to it.

You'll need the sentry.properties file, so it knows where the server is:

`android/sentry.properties`

And then you'll need keystore file. Try to copy the file to:

`android/app/mapswipe-dev-release-key.keystore`

finally add a gradle.properties file, that should tell gradle where the key is, and the password to use it

`~/.gradle/gradle.properties` (keep it outside of the mapswipe folder, so you don't accidentally commit it)

## Run dev in release mode

In `mapswipe/package.json`, there's this line:

```
"runAndroid": "cd android && ./gradlew installDevDebug && adb -d shell am start -n org.missingmaps.mapswipe.dev/org.missingmaps.mapswipe.MainActivity ; cd ..",
``` 
replace `installDevDebug` with `installDevRelease` it will install the release version on your phone/emulator.

Most likely it will complain that there is an incompatible version on your phone, in which case you need to uninstall the dev app before running `yarn runAndroid`
