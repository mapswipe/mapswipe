# MapSwipe

**The badges refer to the `dev` branch**

[![Syntax & Linting](https://github.com/mapswipe/mapswipe/actions/workflows/build.yml/badge.svg?branch=dev&event=push)](https://github.com/mapswipe/mapswipe/actions/workflows/build.yml)
[![Android build](https://github.com/mapswipe/mapswipe/actions/workflows/android.yml/badge.svg?branch=dev&event=push)](https://github.com/mapswipe/mapswipe/actions/workflows/android.yml)
[![iOS build](https://github.com/mapswipe/mapswipe/actions/workflows/ios.yml/badge.svg?branch=dev&event=push)](https://github.com/mapswipe/mapswipe/actions/workflows/ios.yml)


Welcome to the MapSwipe app. This is the app that is distributed through [mapswipe.org](http://mapswipe.org) as well as through the Google Play and Apple stores. It was initially developed by Doctors without Borders as part of the Missing Maps project.

## Main Overview

In a nutshell, here is how MapSwipe works:

1. Humanitarian organisations set the parameters for projects through a web-based admin interface.
1. Our backend workers process those projects and place them on Firebase. It imports them into groups that are safe for the user to cache locally on their phone (ideally 200 tiles). This [image](http://i.imgur.com/giQq43i.jpg "image of grouping") shows an example of how that grouping algorithm works.
1. The app fetches the projects from the /projects reference in Firebase through the JavaScript SDK (don't use http requests to Firebase) and displays them to the user.
1. The user searches those tiles and classifies them. The results are then synced back to Firebase.
1. When a user chooses to map an area, he or she is distributed groups of the project. On completion, the user then gets badges for the distance they've mapped.

:)

## Project Diagram

The following is an outline of how data typically flows and makes it into the mobile application. Most of the action happens in one of the three areas, namely the **backend scripts**, **Firebase database**, and **clients**. 

![Main overview](http://i.imgur.com/PYT62JF.png)

This application encompasses only the mobile Android & iOS clients. The role of the clients are to retrieve project information (metadata and tile information) so that volunteers can swipe through and tag them. Then, this tagging information is synchronized back to Firebase. The backend scripts (in a [separate repository](https://github.com/mapswipe/python-mapswipe-workers)) are responsible for populating and processing the project information in Firebase.

## Developing, Building, and Contributing to MapSwipe

If you'd like to modify and improve MapSwipe, read through the following to get familiar with the project. Please also read [CONTRIBUTING](CONTRIBUTING.md).

## Technology Used

1. The app is written entirely in [React Native](https://facebook.github.io/react-native/docs/getting-started.html)
1. Firebase provides the backend database. It is protected with security rules so that users and contributors to this open source project can not cause damage.
1. The [workers](https://github.com/mapswipe/python-mapswipe-workers) on the backend are running on Google Cloud and handle pre-processing and post-processing the data.

## State of the project

The app was rebuilt at the end of 2018 on a recent version of react-native, and expanded to support multiple types of tasks, as well as a variety  of languages.
