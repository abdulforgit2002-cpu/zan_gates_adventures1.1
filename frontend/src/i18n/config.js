import i18n from "i18next";
import {
    initReactI18next,
} from "react-i18next";

import en from "./locales/en";
import de from "./locales/de";
import it from "./locales/it";
import fr from "./locales/fr";
import pl from "./locales/pl";


const STORAGE_KEY =
    "zan_gates_language";


const SUPPORTED_LANGUAGES = [
    "en",
    "de",
    "it",
    "fr",
    "pl",
];


const getInitialLanguage = () => {
    try {
        const savedLanguage =
            window.localStorage.getItem(
                STORAGE_KEY
            );

        if (
            SUPPORTED_LANGUAGES.includes(
                savedLanguage
            )
        ) {
            return savedLanguage;
        }

        const browserLanguage =
            navigator.language
                ?.split("-")[0]
                ?.toLowerCase();

        if (
            SUPPORTED_LANGUAGES.includes(
                browserLanguage
            )
        ) {
            return browserLanguage;
        }
    } catch (error) {
        console.warn(
            "Unable to detect language:",
            error
        );
    }

    return "en";
};


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


i18n
    .use(initReactI18next)
    .init({
        resources,

        lng: getInitialLanguage(),

        fallbackLng: "en",

        supportedLngs:
            SUPPORTED_LANGUAGES,

        interpolation: {
            escapeValue: false,
        },

        react: {
            useSuspense: false,
        },
    });


i18n.on(
    "languageChanged",
    (language) => {
        try {
            window.localStorage.setItem(
                STORAGE_KEY,
                language
            );
        } catch (error) {
            console.warn(
                "Unable to save language:",
                error
            );
        }

        document.documentElement.lang =
            language;
    }
);


export {
    SUPPORTED_LANGUAGES,
};

export default i18n;
