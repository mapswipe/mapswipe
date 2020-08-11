# Translating MapSwipe

Here are some notes about translating MapSwipe. This is for the app only, other parts of the project (the website, mainly) are not covered by this document.

## If you're a translator

Go to www.transifex.com and sign up/login and request to join the MapSwipe team.

Details about translating are [on this page](https://github.com/mapswipe/mapswipe/wiki/Translating-MapSwipe).

## If you're a developer

If you add or modify visible text in the app, you need to localize it (l10n for short). This basically means marking the string as being translateable. The easiest way to do this is to follow an example already in the code. The login screen in `Login.js` provides a lot of examples. You need to connect your component to the redux store to pickup the current language and use the `withTranslation()` provider which will give you access to the magic `t()` function to translate your text.

- Extract all text marked for translation, into `locales/en.json`. You need to do this by hand, which is a bit annoying, but not very difficult. Make sure the key you use is the same between your code and the `en.json` file, or your text won't be translated.
- Commit this file to a new branch (create your branch with something like `git checkout -b translations_20200602 dev`). Please use a commit just for this file, do not commit other files together with it. Create a PR targetting `dev`.
- Once merged into `dev`, the file with strings is automatically picked up by transifex, and translators are notified that there are new strings to translate.
- When a language reaches 100% translation, transifex automatically opens a PR against `dev` with the translated strings for that language.
- Merge the automatic PR into `dev` before creating a release.

### The gory details

Some notes to help jumping in:
- we use [react-i18next](https://github.com/i18next/react-i18next) to manage text localization in the app
- the file format used to chat between transifex and the app code is [ICU JSON](https://docs.transifex.com/formats/json) as it seems to be the only format that both systems share.
- The selected language is stored in the redux store, which is persisted when the app is closed, and until it is uninstalled or app data is deleted. Look for `changeLanguage` in the code for more details.
