// @flow
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEN from '../../locales/en';
import translationFR from '../../locales/fr';

const resources = {
    en: translationEN,
    fr: translationFR,
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
