# Notes about the deployment process

All deployments are done by continuous integration/deployment with [github actions](https://github.com/mapswipe/mapswipe/actions).

You should never publish an update of the app directly from your machine, this is to save developers from having to setup the appropriate environment, and saves us from having to share a bunch of passwords and keyfiles with everyone.

To release a new version of the app, use the script made for it:
```bash
bash scripts/version.sh
```
and follow the prompts.

## Secrets management

Passwords, API keys and logins come from a variety of sources, but we've tried hard to gather them all in one place (currently a KeePassXC file). Contact one of the owners of the github project to be pointed to it.

Github actions loads the different secrets from two different sources:

- [environment variables](https://github.com/mapswipe/mapswipe/settings/secrets/actions) wherever possible,
- for binary files (which don't seem to work well even if base64 encoded in a variable), we gpg encrypt them and commit them to the git repository.

See the github workflow file for details on how this works.

## If you accidentally commit the non encrypted files

Congratulations! You just earned yourself a few hours of sad and tedious work. You need to reset the corresponding API key or password. This should be done urgently. Then update the environment variable in github actions or the encrypted file in the repository, and you should be good to go again.
