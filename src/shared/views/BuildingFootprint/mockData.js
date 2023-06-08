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

export type Block =
    | {
          id: number,
          type: 'image',
          image: string,
      }
    | {
          id: number,
          type: 'text',
          description: string,
      };

export type InformationPage = {
    page: number,
    title: string,
    blocks: Block[],
};

export type Option = {
    option: number,
    title: string,
    description: string,
    icon: string,
    iconColor: string,
    reasons?: Array<AdditionalOption>,
};

export const informationPages: InformationPage[] = [
    {
        page: 1,
        title: 'Page 1 - Introduction to Photography',
        blocks: [
            {
                id: 1,
                type: 'image',
                image: 'https://images.unsplash.com/photo-1591154669695-5f2a8d20c089',
            },
            {
                id: 2,
                type: 'text',
                description:
                    "In this introductory section, we'll explore the basics of photography, including camera settings, composition techniques, and lighting principles.",
            },
        ],
    },
    {
        page: 2,
        title: "Page 2 - Exploring Nature's Wonders",
        blocks: [
            {
                id: 1,
                type: 'text',
                description:
                    'Immerse yourself in the enchanting beauty of nature as we delve into capturing stunning landscapes, majestic wildlife, and delicate flora. Learn techniques to convey the awe-inspiring wonders of the natural world through your lens.',
            },
            {
                id: 2,
                type: 'image',
                image: 'https://images.unsplash.com/photo-1582288916603-4698cf723bf6',
            },
            {
                id: 3,
                type: 'text',
                description:
                    'Discover the art of macro photography, where tiny details and intricate patterns of flowers, insects, and other small subjects come to life in breathtaking close-ups.',
            },
            {
                id: 4,
                type: 'image',
                image: 'https://images.unsplash.com/photo-1632012643865-dadda4f2d3cd',
            },
        ],
    },
    {
        page: 3,
        title: 'Page 3 - The Urban Jungle',
        blocks: [
            {
                id: 1,
                type: 'text',
                description:
                    'Uncover the art of street photography, where candid moments and the vibrant spirit of urban environments are immortalized through your lens.',
            },
            {
                id: 2,
                type: 'image',
                image: 'https://images.unsplash.com/photo-1662803774446-c3c6afca5d41',
            },
            {
                id: 3,
                type: 'text',
                description:
                    'Uncover the art of street photography, where candid moments and the vibrant spirit of urban environments are immortalized through your lens.',
            },
            {
                id: 4,
                type: 'image',
                image: 'https://images.unsplash.com/photo-1663004536868-1658c44ffb12',
            },
            {
                id: 5,
                type: 'text',
                description:
                    'Discover the art of macro photography, where tiny details and intricate patterns of flowers, insects, and other small subjects come to life in breathtaking close-ups.',
            },
            {
                id: 6,
                type: 'image',
                image: 'https://images.unsplash.com/photo-1632012643865-dadda4f2d3cd',
            },
        ],
    },
];

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
