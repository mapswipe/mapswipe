import resultsReducer from '../../src/shared/reducers/results';

describe('Results reducers for BuiltArea projects:', () => {
    // a tap on a tile
    const toggleProjAGroupATileA = {
        type: 'TOGGLE_MAP_TILE',
        resultObject: {
            resultId: '18-156597-142796',
            result: 1,
            groupId: 157,
            projectId: '-Lg2Yu6BeIlb1NWeHHhZ',
        },
    };
    // a second tap on the same tile
    const toggleProjAGroupATileA2 = {
        type: 'TOGGLE_MAP_TILE',
        resultObject: {
            resultId: '18-156597-142796',
            result: 2,
            groupId: 157,
            projectId: '-Lg2Yu6BeIlb1NWeHHhZ',
        },
    };
    // this second one is a different tile on the same group
    const toggleProjAGroupATileB = {
        type: 'TOGGLE_MAP_TILE',
        resultObject: {
            resultId: '18-156597-142795',
            result: 1,
            groupId: 157,
            projectId: '-Lg2Yu6BeIlb1NWeHHhZ',
        },
    };
    // a tap on a different group for the same project
    const toggleProjAGroupBTileC = {
        type: 'TOGGLE_MAP_TILE',
        resultObject: {
            resultId: '18-156433-143796',
            result: 1,
            groupId: 145,
            projectId: '-Lg2Yu6BeIlb1NWeHHhZ',
        },
    };
    test('2 taps on the same tile', () => {
        const state1 = resultsReducer({}, toggleProjAGroupATileA);
        const state2 = resultsReducer(state1, toggleProjAGroupATileA2);
        expect(state2).toMatchSnapshot();
    });
    test('2 taps on different tiles in the same group', () => {
        const state1 = resultsReducer({}, toggleProjAGroupATileA);
        const state2 = resultsReducer(state1, toggleProjAGroupATileB);
        expect(state2).toMatchSnapshot();
    });
    test('2 groups in the same project', () => {
        const state1 = resultsReducer({}, toggleProjAGroupATileA);
        const state2 = resultsReducer(state1, toggleProjAGroupBTileC);
        expect(state2).toMatchSnapshot();
    });
});

describe('CANCEL_GROUP reducer', () => {
    test('should empty the project state', () => {
        const cancelAction = {
            type: 'CANCEL_GROUP',
            projectId: '-Lg2iUikAAYgdwMFJpH4',
            groupId: '118',
        };
        const state = resultsReducer({
            '-Lg2iUikAAYgdwMFJpH4': {
                118: {
                    917: 2,
                    918: 1,
                    919: 3,
                    920: 1,
                },
            },
        }, cancelAction);

        expect(state).toEqual({
            '-Lg2iUikAAYgdwMFJpH4': {},
        });
    });
});
