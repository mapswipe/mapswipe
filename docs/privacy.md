# How we handle personal data in MapSwipe

First off: our goal is to minimise personal data collection as much as possible. MapSwipe is made to collect information about places, not about people.

The app relies on Google's firebase SDK, which does collect some information. It is difficult to understand exactly what happens with it, even as the developers of the app. This document tries to summarise what we understand of it.

This is not a legal document, but rather well-meaning notes to help developers, contributors and users know what is happening.

## Firebase SDK usage

MapSwipe uses the following components of [react-native-firebase](rnfirebase.io):

- `app`: the core functionality of the SDK
- `analytics`: this allows us to understand how much the app is used and in which countries. We are trying to remove as much information from it as possible, because we've never really been able to make use of it anyway :)
- `auth`: the app uses it to identify users through their email+password. Once authenticated, the email address is not used anywhere, as firebase provides a userId (which looks like `CWkgnstlmi80ctr3MEiK76abe9H2`) which is the only piece of "user" info we use across the app. We use this identifier to know which user contributed what, and prevent a user from mapping a task more than once. If a user deletes their account, we keep this anonymous userId, but delete the email, meaning there is no way to know who contributed this work anymore.
- `database`: This firebase realtime database, which is used to store user contributions (when you tap "finish mapping" and see the blue notification at the top of the screen about uploading your results, the app is sending them to firebase)
- `storage`: we use it to keep user data on the phone between app uses, so that the user doesn't need to login every time they open the app, or see the intro screens again. We also keep the user's language selection for instance.
- `Cloud messaging`: for remote notifications. As I write this document, cloud messaging has been disabled from the app. It was active until v2.0.11.

MapSwipe does not use any advertising features.

## Sentry

Debugging a mobile app once released to an app store is almost impossible without the app sending back some sort of technical information when it hits a problems. We use a service called [Sentry](sentry.io) which sends information from the app when there's a bug in it.

The information it collects includes:
- a user Id, which we don't link to any other information (meaning we as developers have no idea who encountered the bug, which is often frustrating when trying to fix them)
- the phone model
- the ios or android version used by the phone
- the version of MapSwipe used
- the type of network connection used (wifi/4g...)
- the language setting of the phone
- the screen size
- etc...

We do not share this information, and only access it if a bug is problematic enough that we need details to understand when it happens.

## Technical details

This section is mostly for internal use.

### Firebase analytics

Details on how it collects data on [google](https://support.google.com/analytics/answer/10285841) and [firebase](https://firebase.google.com/docs/ios/app-store-data-collection) docs.

#### iOS

In short:
- firebase assigns a unique ID to each app instance (so 1 MapSwipe on 1 phone), called `app instance id`, but it's not linked to any user identifier. We can disable collection of this ID in analytics, which means we would not be able to understand a user's journey through the app.
- Apple's location service is not used, country is derived from an anonymized IP address
- As we don't collect IDFA, we do not have access to age, gender, interests of the user ([source](https://support.google.com/firebase/answer/9268042?visit_id=637626397084989644-2548047988&rd=1))
- We removed IDFV [collection](https://firebase.google.com/docs/analytics/configure-data-collection?platform=ios#disable_idfv_collection) in analytics. IDFV is an apple identifier that seems to uniquely identifier a device, and would allow [tracking usage of various apps of the same provider](https://developer.apple.com/forums/thread/659416) (for instance, track an iOS user across BRC's apps). We don't need this.
- Analytics data is not used for [personalised advertising](https://firebase.google.com/docs/analytics/configure-data-collection?platform=ios#disable_personalized_advertising_features), although we never linked an ad account to the analytics account for MapSwipe.

#### Android

- Each app instance is assigned an `app instance ID` like on iOS
- Demographic data and interests are derived from the `android advertising ID` (TODO: stop collecting it if possible)
- Android [advertising ID](https://firebase.google.com/docs/analytics/configure-data-collection?platform=android#disable_advertising_id_collection) is not collected anymore (it was until version 2.0.11)
- SSAID (Android_ID) is [unique to a combination of app-signing key, user and device](https://firebase.google.com/docs/analytics/configure-data-collection?platform=android#disable_ssaid_collection). Until 2.0.11, this was collection by analytics. We've removed it.
- Analytics data is not used for [personalised advertising](https://firebase.google.com/docs/analytics/configure-data-collection?platform=android#disable_personalized_advertising_features), although we never linked an ad account to the analytics account for MapSwipe.
