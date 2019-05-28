import firebasemock from 'firebase-mock';

// using soumak77/firebase-mock
// we only mock auth and RTDB as we don't need the rest
const mockauth = new firebasemock.MockAuthentication();
const mockdatabase = new firebasemock.MockFirebase();
const mocksdk = new firebasemock.MockFirebaseSdk(
    path => (path ? mockdatabase.child(path) : mockdatabase),
    () => mockauth,
    null,
    null,
    null,
);

export default mocksdk;
