import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import Login from '../../src/shared/views/Login';
import { store } from '../../src/shared/store';

test('Renders sign up screen', () => {
    // this only renders the loading icon, as auth is not ready yet
    const l = <Provider store={store}><Login /></Provider>;
    const screen = renderer.create(l).toJSON();
    expect(screen).toMatchSnapshot();
});
