![Mapswipe headers](http://i.imgur.com/MWhmHpW.jpg)
# Welcome Digital Humanitarians!
Welcome to the Mapswipe app. This is the app that is distributed through mapswipe.org. It was initially developed by Doctors without Borders as part of the Missing Maps project. Remember: We are raising funds in order to create a next version of Mapswipe where self set-up is a lot easier. If you wish to contribute to this, please contact pete.masters@london.msf.org.

# Technology Used:
- Our entire backend runs on Firebase and workers
- The app is written entirely in react native
- The workers on the backend are running on Google Cloud

# Requirements:
- React native 0.29 (Higher versions will likely not work, so please install 0.29. We are accepting contributions to make it compatible with higher versions.)
- Android sdk 21 or higher
- Xcode 10

# State of the project
The project has been released. Keep in mind that this entire project was developed by 1 person, and in order to make it to the deadline - some code compromises had to be taken. For example, the app does currently not include redux or global styles. We are currently fundraising for a V2 to make it easier to run your own instance of Mapswipe, and to add further functionality.

# Main Overview
In a nutshell, here is how Mapswipe works:
- Humanitarian organisations import projects through the importer on mapswipe.org
- Our backend workers process those imports and place them on firebase in the [/projects reference](https://msf-mapswipe.firebaseio.com/projects.json). It imports them into groups that are safe for the user to cache locally on their phone (ideally 200 tiles). You can see an example of how that grouping works here: ![Image of grouping](http://i.imgur.com/giQq43i.jpg)
- The app fetches the projects from the /projects reference in firebase through the javascript SDK and displays them to the user.
- The user searches those tiles and classifies them. The results are then synced back to Firebase.
- When a user chooses to map an area, he or she is distributed groups of the project. On completion, the user then gets badges for the distance they've mapped.

# Setup Instructions

- Clone the repository to any directory. It already comes shipped with the Android and Xcode project
- Create a project on firebase.google.com and place the GoogleService-Info.plist you get from the iOS setup in ios/cfg/. The android version JSON version goes in android/app/google-services.json. You can skip the other firebase set up steps as long as the apps are created.
- Import the security rules to your firebase project from https://gist.github.com/PimDeWitte/b863a8ba38598f40cfa0770114cb775e
- Once you have your firebase files inside of the project, you should be able to compile and install. It will however not work until you add projects and set up your backend.
- Replace all Mapswipe-branded material in shared/views/assets/ - Specifically the loading animation, tut1.png, tut2.png, tut3.png, mm.png, mmwhite.png.
- Replace the splash screen in YourMapswipe/node_modules/@remobile/react-native-splashscreen/android/src/main/res/drawable
- Replace the splash screen in YourMapswipe/node_modules/@remobile/react-native-splashscreen/ios/RCTSplashScreen/SplashScreenResource
- Run a full string replace on the ENTIRE directory on org.yourdomain.yourapp to your own package name.
- Change the directory names in android/app/src/main/java/org/yourdomain/yourapp to match the package name
- You can change the name of the app in xcode, and in android in android/settings.gradle and in android/app/src/main/res/values/strings.xml, and inandroid/app/src/main/java/org/yourdomain/yourapp
- You can now run your own version of Mapswipe! Again, make sure to re-brand it properly.

# Other instructions
- You can access the xcode project in the ios directory. Make sure to open the xcworkspace file and not the xcodeproj file.
- Don't ever load the root of the firebase object or API. Right now it will lag all our end users
- 
# Notes:
- We have our node_modules dir available on github because we were forced to make some changes to certain libraries. [This one in particular](https://github.com/leecade/react-native-swiper/issues/111#issuecomment-227443561), but also some older react packages were not compatible with newer react versions, so we made them compatible.

# Project Diagram
![Main overview](http://i.imgur.com/PYT62JF.png)

