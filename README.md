![Mapswipe headers](http://i.imgur.com/MWhmHpW.jpg)
# Welcome Digital Humanitarians!
Welcome to the Mapswipe app. This is the app that is distributed through mapswipe.org. It was initially developed by Doctors without Borders as part of the Missing Maps project. 

# Technology Used:
- Our entire backend runs on Firebase. It is protected with security rules so that users and contributors to this open source project can not cause damage. In the near future, we might set up a dev environemnt and open source the project.
- The app is written entirely in react native
- The workers on the backend are running on Google Cloud

# Requirements:
- React native 0.29 (Higher versions will likely not work, so please install 0.29)
- We have our node_modules dir available on github because we were forced to make some changes to certain libraries. [This one in particular](https://github.com/leecade/react-native-swiper/issues/111#issuecomment-227443561), but also some older react packages were not compatible with newer react versions, so we made them compatible.

# State of the project
The project has been released. Keep in mind that this entire project was developed by 1 person, and in order to make it to the deadline - some code compromises had to be taken. For example, the app does currently not include redux or global styles. Currently, the main developer of the project is [Pim de Witte](http://github.com/pimdewitte). Please feel more than welcome to reach out to him.

# Main Overview
In a nutshell, here is how Mapswipe works:
- Humanitarian organisations import projects through the importer on mapswipe.org
- Our backend workers process those imports and place them on firebase in the [/projects reference](https://msf-mapswipe.firebaseio.com/projects.json). It imports them into groups that are safe for the user to cache locally on their phone (ideally 200 tiles). You can see an example of how that grouping works here: ![Image of grouping](http://i.imgur.com/giQq43i.jpg)
- The app fetches the projects from the /projects reference in firebase through the javascript SDK (don't use http requests to firebase) and displays them to the user.
- The user searches those tiles and classifies them. The results are then synced back to Firebase.
- When a user chooses to map an area, he or she is distributed groups of the project. On completion, the user then gets badges for the distance they've mapped.

# Project Diagram
![Main overview](http://i.imgur.com/PYT62JF.png)

# Other instructions
- You can access the xcode project in the ios directory. Make sure to open the xcworkspace file and not the xcodeproj file.
- Don't ever load the root of the firebase object or API. Right now it will lag all our end users


