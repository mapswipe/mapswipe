// @flow
import i18n from 'i18next';
import { reactI18nextModule } from 'react-i18next';
import translationEN from '../../locales/en';
import translationFR from '../../locales/fr';

const resources = {
    en: translationEN,
    fr: translationFR,
};

console.log('res', resources);

i18n.use(reactI18nextModule).init({
    fallbackLng: 'en',
    resources,
    lng: 'en', // TODO: get this from the OS
    interpolation: {
        escapeValue: false,
    },
    react: {
        wait: true,
    },
});

export default i18n;
