// @flow
// Code to convert an old user profile to the new format used in v2
// In theory, this code should remain in the code base only for a short while.
// Once all users have transitioned, this file can be removed.

// convertProfileToV2Format()
export default (firebase: Object) => {
    // Check if the user has an old profile still lying around and convert if needed
    const { currentUser } = firebase.auth();
    // get the old profile
    const userRef = `users/${currentUser.uid}`;
    firebase
        .database()
        .ref(userRef)
        .once('value')
        .then((snapshot) => {
            const prof = snapshot.val();
            if (prof === null) {
                // no old profile, it's already in v2 format
                return;
            }
            // create the new profile
            firebase.updateProfile({
                // eslint-disable-next-line no-underscore-dangle
                created: new Date(currentUser._user.metadata.creationTime),
                groupContributionCount: 0,
                projectContributionCount: 0,
                taskContributionCount: parseInt(
                    prof.distance / 0.0233732728,
                    10,
                ),
                updateNeeded: true, // used by backend profile update script
                username: prof.username,
            });
            // remove the old profile from firebase
            firebase.database().ref(userRef).remove();
        });
};
