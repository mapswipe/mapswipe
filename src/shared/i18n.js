// @flow
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationCS from '../../locales/cs';
import translationDE from '../../locales/de';
import translationEN from '../../locales/en';
import translationFR from '../../locales/fr';
import translationHU from '../../locales/hu';
import translationJA from '../../locales/ja';
import translationNE from '../../locales/ne';
import translationNL from '../../locales/nl';
import translationSW from '../../locales/sw';

const resources = {
    cs: translationCS,
    de: translationDE,
    en: translationEN,
    fr: translationFR,
    hu: translationHU,
    ja: translationJA,
    ne: translationNE,
    nl: translationNL,
    sw: translationSW,
};

i18n.use(initReactI18next).init({
    fallbackLng: 'en',
    resources,
    lng: 'en', // the actual value is loaded from redux in Main
    interpolation: {
        escapeValue: false,
    },
    react: {
        wait: true,
    },
});

export default i18n;
