# Login and Signup with OpenStreetMap via OAuth

## What it is

We use the OAuth2 protocol to allow MapSwipe users to signup/login with the app using the OpenStreetMap account
credentials. OAuth is a standard protocol which allows this without the need for the user to give us there OSM password.

## How it works

The workflow is quite convoluted:
- The user taps the "Login with OSM" button in the app
- The app opens the `/redirect` URL in a separate web browser (NOT a built-in webview, this is critical for the security
  of the [workflow](https://datatracker.ietf.org/doc/html/rfc8252#section-8.12)
- The `/redirect` firebase function sets a cookie in the user's browser with a random `state` and redirects the user to
  the OSM oauth page (with that `state` value passed along)
- On that page (which we do not control), the user optionally logs in to their OSM account (if they were not already
  logged in) and is prompted to agree to sharing some data with MapSwipe.
- Once they agree, the page redirects them to the app via a deep link like `mapswipe://osm/login?xxxx` which includes
  the `state` and a `code` from OSM.
- The app then sends these to the same external browser to our `/token` function which does 3 things:
  - it gets a token from OSM,
  - it fetches the OSM user's profile info (user id and username),
  - it then uses this token to create or update a firebase account linked to the OSM (this is where we set their
    username to match their OSM one) one and obtain a firebase token
- The `/token` function then redirects once again to the app (via a deeplink) passing along the firebase token
- The app can now sign in to firebase as the OSM user.

From then on, the user looks to the app and firebase exactly like any email/password user.

Both the `/redirect` and `/token` URLs are hosted on firebase cloud functions, under a domain that we control
(mapswipe.web.app for now).

## Setup steps

> Note: unless you're rebuilding the auth system entirely, you can skip the OSM app creation and move directly to the part
> related to firebase.
- create OAuth app on OSM https://github.com/osmlab/osm-auth#getting-keys. You need to be logged in to OSM for this to
  work.
  - https://master.apis.dev.openstreetmap.org/oauth2/applications/ or https://www.openstreetmap.org/oauth2/applications
  for production
  - Click "Register new application":
    - Name: anything humanly understandable, this will be shown to users when they login on OSM,
      like: "do you allow the application <name> to access your profile info?"
    - Redirect URIs: "devmapswipe://login/osm" or "mapswipe://login/osm"
    - Do NOT check "confidential app" as the mobile app is not able to guarantee credential security
    - Select only the "Read user preferences" (`read_prefs`) scope.
    - Create the application

- Setup the firebase backend functions. See the docs in the `python-mapswipe-workers` repository.
- Add rules on firebase RTDB


## Config for oauth2

We use OAuth2, not OAuth "1", with the "access code" grant type.

## Testing deeplinks on mapswipe

Connect your phone/emulator to your laptop, and run this (for android) to test
deeplinks.
```bash
adb shell am start -W -a android.intent.action.VIEW -d "devmapswipe://login/osm?code=ccc\&\&state=sss\&\&token=ttt" org.missingmaps.mapswipe.dev
```

This should open the app and take you to the OSM login screen.
