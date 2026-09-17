import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en";
import de from "./locales/de";
import it from "./locales/it";
import fr from "./locales/fr";
import pl from "./locales/pl";

/*
|--------------------------------------------------------------------------
| SUPPORTED LANGUAGES
|--------------------------------------------------------------------------
|
| These languages must match the languages configured in GTranslate.
|
*/

const SUPPORTED_LANGUAGES = [
    "en",
    "de",
    "it",
    "fr",
    "pl",
];

/*
|--------------------------------------------------------------------------
| I18NEXT RESOURCES
|--------------------------------------------------------------------------
|
| Keep the existing translation resources because other React components
| may already use the i18next translation files.
|
| IMPORTANT:
|
| GTranslate is responsible for the visitor-facing language switching.
| This configuration must NOT automatically switch languages when
| GTranslate changes the page.
|
*/

const resources = {
    en: {
        translation: en,
    },

    de: {
        translation: de,
    },

    it: {
        translation: it,
    },

    fr: {
        translation: fr,
    },

    pl: {
        translation: pl,
    },
};

/*
|--------------------------------------------------------------------------
| INITIALIZE I18NEXT
|--------------------------------------------------------------------------
|
| English remains the application's canonical/source language.
|
| We intentionally DO NOT:
|
| - read the GTranslate language into i18next
| - write the GTranslate language to localStorage
| - listen to i18next languageChanged
| - modify document.documentElement.lang from i18next
|
| This prevents i18next from fighting GTranslate.
|
*/

i18n.use(initReactI18next).init({
    resources,

    lng: "en",

    fallbackLng: "en",

    supportedLngs: SUPPORTED_LANGUAGES,

    interpolation: {
        escapeValue: false,
    },

    react: {
        useSuspense: false,
    },

    initImmediate: true,
});

/*
|--------------------------------------------------------------------------
| EXPORTS
|--------------------------------------------------------------------------
*/

export {
    SUPPORTED_LANGUAGES,
};

export default i18n;