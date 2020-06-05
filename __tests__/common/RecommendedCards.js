import React from 'react';
import { Provider } from 'react-redux';
import { render, wait, waitForElement } from 'native-testing-library';
import { createNewStore } from '../../src/shared/store';
import rootReducer from '../../src/shared/reducers';
import RecommendedCards from '../../src/shared/views/RecommendedCards';
import projectsAction from '../fixtures/projects';

test('Renders projects screen while loading', async () => {
    const navigation = { push: jest.fn() };
    // jest.useFakeTimers();

    const l = (
        <Provider store={createNewStore()}>
            <RecommendedCards navigation={navigation} />
        </Provider>
    );
    const { baseElement, queryByTestId, asJSON } = render(l);
    await wait(() => queryByTestId('loading-icon'));
    // first we check that the loading icon is shown
    expect(queryByTestId('loading-icon')).toBeTruthy();
    expect(asJSON(baseElement)).toMatchSnapshot();
});

// Note:
// this is a pretty bad example of test in that it covers way too much code
// but I set it up as an example of how to tie firebase, jest, react-redux-firebase
// and the redux state all together in a test.
test('Renders RecommendedCards screen', async () => {
    const navigation = { push: jest.fn() };
    // calculate the state after receiving the projects data from backend
    const reduxState = rootReducer(createNewStore().getState(), projectsAction);

    // now create a fresh store initialized with that state
    // so that we have projects to show
    const loadedStore = createNewStore(reduxState);
    const l = (
        <Provider store={loadedStore}>
            <RecommendedCards navigation={navigation} />
        </Provider>
    );
    const { baseElement, getByText, asJSON } = render(l);
    // wait for the components to be ready (really, we're waiting for
    // the firebase mock to be ready)
    await waitForElement(() => getByText(/buildarea default/i));
    // check that the screen rendered is still as expected
    expect(asJSON(baseElement)).toMatchSnapshot();
});
