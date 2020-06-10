# Translating MapSwipe

Here are some notes about translating MapSwipe. This is for the app only, other parts of the project (the website, mainly) are not covered by this document.

## If you're a translator

Go to www.transifex.com and sign up/login and request to join the MapSwipe team.

## If you're a developer

- Run the strings extraction script. It will parse the source code of the app, and extract all text marked for translation, into `locales/en.json`.
- Check that everything looks ok, and commit this file to a new branch (create your branch with something like `git checkout -b translations_20200602 dev`). Please use a commit just for this file, do not commit other files together with it. Create a PR targetting `dev`.
- Once merged into `dev`, the file with strings is automatically picked up by transifex, and translators are notified that there are new strings to translate.
- When a language reached 100% translation, transifex automatically opens a PR against `dev` with the translated strings for that language.
- Merge the automatic PR into `dev` before creating a release.

### The gory details

Some notes to help jumping in:
- we use [react-i18next](https://github.com/i18next/react-i18next) to manage text localization in the app
- the file format used to chat between transifex and the app code is [ICU JSON](https://docs.transifex.com/formats/json) as it seems to be the only format that both systems share.
- The selected language is stored in the redux store, which is persisted when the app is closed, and until it is uninstalled or app data is deleted. Look for `changeLanguage` in the code for more details.
