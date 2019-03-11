# Architecture of the code

The code is virtually entirely written in javascript, using [react native](http://facebook.github.io/react-native/docs/getting-started.html).

As of early March 2019, there is no "native" code in use outside dependencies (both android and iOS).


## Firebase

The app links with firebase using [react-native-firebase](https://github.com/invertase/react-native-firebase) which provides access to all the major firebase features.

We use:

- realtime database
- analytics

We don't use crashlytics, instead we rely on [sentry](https://sentry.io) for bug reporting, as it integrates better with react-native.

## State management

The app state is managed using [redux](http://redux.js.org/).

[react-redux-firebase](http://react-redux-firebase.com/) helps make the firebase data available to all react components through the redux state. This makes accessing data consistent across the code base.

This means the app state is split in two:
- a "local" part managed by redux,
- a "remotely synced" part, that links to the firebase realtime database to get data. This part is "read only" in that writing requires explicit writes to firebase. `react-native-firebase` caches data locally, which means that database writes will be stored locally until a connection is available again. This is transparent to the user (and the developer) so you can just worry about writing the correct data to firebase, and offline will take care of itself!

### Using state

The code uses [react-redux](https://redux.js.org/basics/usage-with-react) to make the state available to components throughout the app.

To make state usable in your component, wrap it in a Higher Order Component (HOC) like this:

```javascript
const ComponentWithState = compose(
    firebaseConnect(() => [
        // your data mappings from firebase go here
    ]),
    connect(
        mapStateToProps,
        mapDispatchToProps,
    ),
)(_YourComponent);
```

See the respective documentation for `react-redux` and `react-redux-firebase` for more details on how to do this.

The example above will automatically connect to firebase when the component mounts, and fetch the data as defined in your mapping. As `react-native-firebase` is able to cache data locally, data fetched will remain available when offline. As this is linked to the redux state, and passed as `props` to your component, any change in the database will trigger a `render()` of your component.

### Data flow

Overall, the data flow with firebase database works in two parts:

1. the mapping using `firebaseConnect` as above fetches data from the backend, and makes it available inside your component. There is no need to write and explicit `firebase.get()` or similar. With this, data is available when your component mounts, and you can just use it. A good example is in `src/shared/views/RecommendedCards.js`, at the end of the file.
1. To write back to the firebase backend, you will need to be explicit. See an example in `src/shared/actions/index.js` in the `commitGroup` function. Note that updating the `redux` state is NOT enough to save your results.

## Adding a new project type to the app

This section only covers the app side of things. Refer to [xxxx](https://XXXXX) for details on how the backend must be modified.

To add a new project type to the app, you need to:

- Create the screens and components that will display the data and imagery you want, and wrap them in HOCs to link to the firebase database,
- Add redux actions to capture the result of the user's actions, and the corresponding reducers to update the app state,
- Add another redux action to upload results to firebase upon completion of a group of tasks.
