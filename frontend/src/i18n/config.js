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


const detectPreferredLanguage = () => {
    try {
        const savedLanguage =
            window.localStorage.getItem(
                STORAGE_KEY
            );

        if (
            savedLanguage &&
            SUPPORTED_LANGUAGES.includes(
                savedLanguage
            )
        ) {
            return savedLanguage;
        }
    } catch (error) {
        console.warn(
            "Unable to read saved language:",
            error
        );
    }

    const browserLanguage =
        navigator.languages?.[0] ||
        navigator.language ||
        "en";

    const normalizedLanguage =
        browserLanguage
            .toLowerCase()
            .split("-")[0];

    return SUPPORTED_LANGUAGES.includes(
        normalizedLanguage
    )
        ? normalizedLanguage
        : "en";
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
        lng: detectPreferredLanguage(),
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
