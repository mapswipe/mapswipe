// @flow
import {
    cross,
    notSure,
    tick,
    hide,
    chevronRight,
    database,
} from '../../common/SvgIcons';

export type AdditionalOption = {
    reason: number,
    description: string,
};

export type Option = {
    option: number,
    title: string,
    description: string,
    icon: string,
    iconColor: string,
    reasons?: Array<AdditionalOption>,
};

export const options: Option[] = [
    {
        option: 1,
        title: 'Option 1',

        description: 'This is option 1',
        icon: tick,
        iconColor: '#FF0000',
    },
    {
        option: 2,
        title: 'Option 2',
        description: 'This is option 2',
        icon: cross,
        iconColor: '#FFFF00',
    },
    {
        option: 3,
        title: 'Option 3',
        description: 'This is option 3',
        icon: notSure,
        iconColor: '#00FF00',
        reasons: [
            {
                reason: 1,
                description: 'Reason 1 for option 3',
            },
            {
                reason: 2,
                description: 'Reason 2 for option 3',
            },
            {
                reason: 3,
                description: 'Reason 3 for option 3',
            },
            {
                reason: 4,
                description: 'Reason 4 for option 3',
            },
        ],
    },
    {
        option: 4,
        title: 'Option 4',
        description: 'This is option 4',
        icon: hide,
        iconColor: '#0000FF',
        reasons: [
            {
                reason: 1,
                description: 'Reason 1 for option 4',
            },
            {
                reason: 2,
                description: 'Reason 2 for option 4',
            },
            {
                reason: 3,
                description: 'Reason 3 for option 4',
            },
            {
                reason: 4,
                description: 'Reason 4 for option 4',
            },
        ],
    },
    {
        option: 5,
        title: 'Option 5',
        description: 'This is option 5',
        icon: chevronRight,
        iconColor: '#FF00FF',
        reasons: [
            {
                reason: 1,
                description: 'Reason 1 for option 5',
            },
            {
                reason: 2,
                description: 'Reason 2 for option 5',
            },
            {
                reason: 3,
                description: 'Reason 3 for option 5',
            },
            {
                reason: 4,
                description: 'Reason 4 for option 5',
            },
        ],
    },
    {
        option: 6,
        title: 'Option 6',
        description: 'This is option 6',
        icon: database,
        iconColor: '#FFFF00',
        reasons: [
            {
                reason: 1,
                description: 'Reason 1 for option 6',
            },
            {
                reason: 2,
                description: 'Reason 2 for option 6',
            },
            {
                reason: 3,
                description: 'Reason 3 for option 6',
            },
            {
                reason: 4,
                description: 'Reason 4 for option 6',
            },
        ],
    },
];
