# Notes about the deployment process

All deployments are done by continuous integration/deployment with [github actions](https://github.com/mapswipe/mapswipe/actions).

You should never publish an update of the app directly from your machine, this is to save developers from having to setup the appropriate environment, and saves us from having to share a bunch of passwords and keyfiles with everyone.

To release a new version of the app, use the script made for it:
```bash
bash scripts/version.sh
```
and follow the prompts.

## Secrets management

Passwords, API keys and logins come from a variety of sources, but we've tried hard to gather them all in one place. Contact one of the owners of the github project to be pointed to it.

From a developer perspective, you will sometimes need to update the `secrets.tar.enc` files which contains sensitive values (passwords, API keys) required to deploy the app. There is one file for android, one for iOS. You do not need most of these for local development!
Look in the travis logs for the content of the secrets.tar files. The extraction commands are both verbose, so that we always see an up-to-date list of files included in them.

The files are:
```
`./secrets.tar.enc` for android
`./ios/cfg/secrets.tar.enc` for ios
```

## Updating secrets.tar

The workflow is simple, but not very convenient, as you cannot extract the content of the encrypted `secrets.tar.enc`, so you need to rebuild the archive from scratch, even if you're only adding or changing one file. The recommended way is to setup all the required files locally, where they should be (see the tar content for this) then:

```bash
`tar cvf secrets.tar GoogleService-Info.dev.plist GoogleService-Info.prd.plist sentry.properties sentry.prod.properties mapswipe.dev_at_gmail_rsa_key_for_travis_ci`  # this is for ios, adjust paths for android
$ tar -rf secrets.tar relative/path/to/the/file/you/want/to/add # to add them to the archive
$ travis login --org # to login with the travis CLI, see travis docs for help
$ travis encrypt-file -r mapswipe/mapswipe secrets.tar
```

You should now have a `secrets.tar.enc` that you can commit to git. Do NOT commit the unencrypted file.

## If you accidentally commit the non encrypted file

Congratulations! You just earned yourself a few hours of sad and tedious work. You need to reset each API key and password used in the archive. This should be done urgently. Once all the credentials have been invalidated, you can rebuild the archive, and commit the encrypted one again.
