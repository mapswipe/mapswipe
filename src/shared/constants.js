// Constants for the project
// @flow

// project types
export const LEGACY_TILES: number = 1;
export const BUILDING_FOOTPRINTS: number = 2;
export const CHANGE_DETECTION: number = 3;
export const COMPLETENESS_PROJECT: number = 4;

export const MIN_USERNAME_LENGTH = 4;

// colours
export const COLOR_BLACK = 'black';
export const COLOR_BLUE = '#4080c3';
export const COLOR_DEEP_BLUE = '#0d1949';
export const COLOR_GREEN = 'rgb(36, 219, 26)'; // #24DB1A
export const COLOR_SUCCESS_GREEN = '#32A82C';
export const COLOR_GREEN_OVERLAY = 'rgba(36, 219, 26, 0.2)';
export const COLOR_TRANSPARENT_GREEN = 'rgba(36, 219, 26, 0)';
export const COLOR_RED = 'rgb(230, 28, 28)';
export const COLOR_RED_OVERLAY = 'rgba(230, 28, 28, 0.2)';
export const COLOR_TRANSPARENT_RED = 'rgba(230, 28, 28, 0)';
export const COLOR_YELLOW = 'rgb(237, 209, 28)';
export const COLOR_YELLOW_OVERLAY = 'rgba(237, 209, 28, 0.2)';
export const COLOR_TRANSPARENT_YELLOW = 'rgba(237, 209, 28, 0)';
export const COLOR_TRANSPARENT = 'transparent';
export const COLOR_WHITE = 'white';
export const COLOR_DARK_GRAY = '#212121';
export const COLOR_LIGHT_GRAY = '#eef2fb';
export const COLOR_TRANSPARENT_LIGHT_GRAY = 'rgba(238, 242, 251, 0)';
export const COLOR_LIME_BACKGROUND = 'rgb(163, 230, 53)';

export const COLOR_CALENDAR_GRAPH_DAY_L1 = '#d6e685';
export const COLOR_CALENDAR_GRAPH_DAY_L2 = '#8cc665';
export const COLOR_CALENDAR_GRAPH_DAY_L3 = '#44a340';
export const COLOR_CALENDAR_GRAPH_DAY_L4 = '#1e6823';

export const COLOR_CALENDAR_GRAPH_BACKGROUND = '#e5e9f1';
export const COLOR_CALENDAR_GRAPH_BORDER = 'rgba(21, 37, 35, 0.06)';

// font weights
export const FONT_WEIGHT_MEDIUM = '400';
export const FONT_WEIGHT_BOLD = '600';

// font sizes
export const FONT_SIZE_EXTRA_SMALL = 11;
export const FONT_SIZE_SMALL = 13;
export const FONT_SIZE_MEDIUM = 16;
export const FONT_SIZE_LARGE = 20;
export const FONT_SIZE_EXTRA_LARGE = 26;

export const FONT_SIZE_INPUT_LABEL = FONT_SIZE_SMALL;

// spacing
export const SPACING_EXTRA_SMALL = 4;
export const SPACING_SMALL = 8;
export const SPACING_MEDIUM = 16;
export const SPACING_LARGE = 24;

export const HEIGHT_INPUT = 40;
export const HEIGHT_BUTTON = 50;

// languages
export const supportedLanguages = [
    // follows (hopefully) the order in which they are displayed
    // in wikipedia's list of languages (left side toolbar)
    // as shown on https://en.wikipedia.org/wiki/Main_Page
    { code: 'cs', localeCode: 'cs', name: 'Čeština' },
    { code: 'da', localeCode: 'da', name: 'Dansk' },
    { code: 'de', localeCode: 'de', name: 'Deutsch' },
    { code: 'eo', localeCode: 'eo', name: 'Esperanto' },
    { code: 'et', localeCode: 'et', name: 'Eesti' },
    { code: 'en', localeCode: 'en', name: 'English' },
    { code: 'es', localeCode: 'es', name: 'Español' },
    { code: 'fa_AF', localeCode: 'fa-AF', name: 'دری- افغانستان' },
    { code: 'fr', localeCode: 'fr', name: 'Français' },
    { code: 'it', localeCode: 'it', name: 'Italiano' },
    { code: 'hu', localeCode: 'hu', name: 'Magyar' },
    { code: 'ja', localeCode: 'ja', name: '日本語' },
    { code: 'ne', localeCode: 'ne', name: 'नेपाली' },
    { code: 'nl', localeCode: 'nl', name: 'Nederlands' },
    { code: 'pt', localeCode: 'pt', name: 'Português' },
    { code: 'ru', localeCode: 'ru', name: 'Русский' },
    { code: 'sw', localeCode: 'sw', name: 'Kiswahili' },
    { code: 'zh', localeCode: 'zh', name: '中文' },
];

// The 3 modes the tutorial prompt box can be in
export const tutorialModes = {
    // instructions is shown at the start, until another mode is switched to:
    instructions: 'instructions',
    // success is displayed once the user has reached the correct combination
    // of taps by themselves,
    success: 'success',
    // hint is shown if they press the "show answers" button
    hint: 'hint',
};

// various urls
export const devOsmUrl = 'https://master.apis.dev.openstreetmap.org/';

// export const sentryDsnUrl = 'https://b5a9356c68a4484c9891484f8a12d016@sentry.io/1326755';
export const sentryDsnUrl =
    'https://e86b18bd37604eba81e6ba125ed8b9b9@o1403718.ingest.sentry.io/6736485';

export const gqlEndpoint = 'https://dev-api.mapswipe.org/graphql/';

// Note: no ending slashes
export const publicDashboardUrl = 'https://dev-community.mapswipe.org';
