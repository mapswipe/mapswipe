// @flow
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationCS from '../../locales/cs';
import translationDA from '../../locales/da';
import translationDE from '../../locales/de';
import translationEN from '../../locales/en';
import translationEO from '../../locales/eo';
import translationES from '../../locales/es';
import translationET from '../../locales/et';
// eslint-disable-next-line camelcase
import translationFA_AF from '../../locales/fa_AF';
import translationFR from '../../locales/fr';
import translationHU from '../../locales/hu';
import translationIT from '../../locales/it';
import translationJA from '../../locales/ja';
import translationNE from '../../locales/ne';
import translationNL from '../../locales/nl';
import translationPT from '../../locales/pt';
import translationRU from '../../locales/ru';
import translationSW from '../../locales/sw';
import translationZH from '../../locales/zh';

const resources = {
    cs: translationCS,
    da: translationDA,
    de: translationDE,
    en: translationEN,
    eo: translationEO,
    es: translationES,
    et: translationET,
    fa_AF: translationFA_AF,
    fr: translationFR,
    hu: translationHU,
    it: translationIT,
    ja: translationJA,
    ne: translationNE,
    nl: translationNL,
    pt: translationPT,
    ru: translationRU,
    sw: translationSW,
    zh: translationZH,
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
