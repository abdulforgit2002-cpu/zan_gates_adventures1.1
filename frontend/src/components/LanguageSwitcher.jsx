import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    SUPPORTED_LANGUAGES,
} from "../i18n/config";

import "./LanguageSwitcher.css";

/*
|--------------------------------------------------------------------------
| LANGUAGE DISPLAY DATA
|--------------------------------------------------------------------------
*/

const LANGUAGES = [
    { code: "en", short: "EN", native: "English",    country: "United Kingdom" },
    { code: "de", short: "DE", native: "Deutsch",    country: "Deutschland" },
    { code: "it", short: "IT", native: "Italiano",   country: "Italia" },
    { code: "fr", short: "FR", native: "Français",   country: "France" },
    { code: "pl", short: "PL", native: "Polski",     country: "Polska" },
];

/*
|--------------------------------------------------------------------------
| FLAG ICON
|--------------------------------------------------------------------------
*/

function FlagIcon({ code }) {
    switch (code) {
        case "en":
            return (
                <svg viewBox="0 0 60 42" aria-hidden="true" width="20" height="14" focusable="false">
                    <rect width="60" height="42" fill="#012169" />
                    <path d="M0 0 L60 42 M60 0 L0 42" stroke="#fff" strokeWidth="9" />
                    <path d="M0 0 L60 42 M60 0 L0 42" stroke="#C8102E" strokeWidth="5" />
                    <path d="M30 0 V42 M0 21 H60" stroke="#fff" strokeWidth="15" />
                    <path d="M30 0 V42 M0 21 H60" stroke="#C8102E" strokeWidth="9" />
                </svg>
            );
        case "de":
            return (
                <svg viewBox="0 0 60 42" aria-hidden="true" width="20" height="14" focusable="false">
                    <rect width="60" height="14" fill="#000" />
                    <rect y="14" width="60" height="14" fill="#DD0000" />
                    <rect y="28" width="60" height="14" fill="#FFCE00" />
                </svg>
            );
        case "it":
            return (
                <svg viewBox="0 0 60 42" aria-hidden="true" width="20" height="14" focusable="false">
                    <rect width="20" height="42" fill="#009246" />
                    <rect x="20" width="20" height="42" fill="#ffffff" />
                    <rect x="40" width="20" height="42" fill="#CE2B37" />
                </svg>
            );
        case "fr":
            return (
                <svg viewBox="0 0 60 42" aria-hidden="true" width="20" height="14" focusable="false">
                    <rect width="20" height="42" fill="#002395" />
                    <rect x="20" width="20" height="42" fill="#ffffff" />
                    <rect x="40" width="20" height="42" fill="#ED2939" />
                </svg>
            );
        case "pl":
            return (
                <svg viewBox="0 0 60 42" aria-hidden="true" width="20" height="14" focusable="false">
                    <rect width="60" height="21" fill="#ffffff" />
                    <rect y="21" width="60" height="21" fill="#DC143C" />
                </svg>
            );
        default:
            return null;
    }
}

/*
|--------------------------------------------------------------------------
| READ GTRANSLATE LANGUAGE FROM COOKIE
|--------------------------------------------------------------------------
| GTranslate stores its selection as: googtrans=/en/de
|--------------------------------------------------------------------------
*/

function readGTranslateLanguage() {
    try {
        const cookies = document.cookie.split(";");

        const cookie = cookies.find((item) =>
            item.trim().startsWith("googtrans=")
        );

        if (!cookie) return "en";

        const value = decodeURIComponent(
            cookie.split("=").slice(1).join("=")
        );

        const match = value.match(/^\/en\/([a-z]{2})$/i);

        if (match && SUPPORTED_LANGUAGES.includes(match[1].toLowerCase())) {
            return match[1].toLowerCase();
        }

        return "en";
    } catch {
        return "en";
    }
}

/*
|--------------------------------------------------------------------------
| WRITE GTRANSLATE COOKIE
|--------------------------------------------------------------------------
|
| This is the ONLY reliable way to make GTranslate switch — it reads
| the `googtrans` cookie on page load and translates accordingly.
|
| IMPORTANT: On localhost, Chrome rejects cookies with `domain=localhost`.
| We only add the domain attributes on real hostnames.
|--------------------------------------------------------------------------
*/

function writeGTranslateCookie(code) {
    const hostname = window.location.hostname;
    const isLocalhost =
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname.endsWith(".local");

    const expired = "expires=Thu, 01 Jan 1970 00:00:00 GMT";

    // Clear any existing googtrans cookie on every path/domain combo we might have set.
    document.cookie = `googtrans=; path=/; ${expired}`;
    if (!isLocalhost) {
        document.cookie = `googtrans=; path=/; domain=${hostname}; ${expired}`;
        document.cookie = `googtrans=; path=/; domain=.${hostname}; ${expired}`;
    }

    // English is the source language — no translation cookie needed.
    if (code === "en") return;

    const value = `/en/${code}`;

    document.cookie = `googtrans=${value}; path=/`;
    if (!isLocalhost) {
        document.cookie = `googtrans=${value}; path=/; domain=${hostname}`;
        document.cookie = `googtrans=${value}; path=/; domain=.${hostname}`;
    }
}

/*
|--------------------------------------------------------------------------
| LANGUAGE SWITCHER
|--------------------------------------------------------------------------
*/

function LanguageSwitcher({ variant = "navbar" }) {
    const rootRef = useRef(null);
    const [open, setOpen] = useState(false);

    const [currentCode, setCurrentCode] = useState(() =>
        readGTranslateLanguage()
    );

    /*
     * Sync the visual trigger with the googtrans cookie.
     * This matters when GTranslate itself updates the cookie,
     * or after a reload driven by our own writeGTranslateCookie.
     */
    useEffect(() => {
        const syncLanguage = () => {
            const language = readGTranslateLanguage();
            if (SUPPORTED_LANGUAGES.includes(language)) {
                setCurrentCode(language);
            }
        };

        syncLanguage();

        const interval = window.setInterval(syncLanguage, 500);
        return () => window.clearInterval(interval);
    }, []);

    /*
     * Close dropdown when clicking outside / pressing Escape.
     */
    useEffect(() => {
        if (!open) return undefined;

        const handlePointerDown = (event) => {
            if (rootRef.current && !rootRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === "Escape") setOpen(false);
        };

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open]);

    /*
     * ------------------------------------------------------
     * SELECT LANGUAGE
     * ------------------------------------------------------
     *
     * The most reliable mechanism:
     *
     *   1. Write the googtrans cookie (localhost-safe)
     *   2. If doGTranslate() is available, use it directly
     *      — this translates without a reload.
     *   3. Otherwise, reload — the cookie makes GTranslate
     *      pick up the new language on next page load.
     */

    const selectLanguage = (code) => {
        if (!SUPPORTED_LANGUAGES.includes(code)) return;

        setOpen(false);

        // Optimistic UI update so the user sees the flag change instantly.
        setCurrentCode(code);

        // 1. Write the googtrans cookie for both paths.
        writeGTranslateCookie(code);

        // 2. Try the global GTranslate helper first — no reload needed.
        if (typeof window.doGTranslate === "function") {
            try {
                window.doGTranslate(`en|${code}`);
                return;
            } catch (err) {
                console.warn("[LanguageSwitcher] doGTranslate failed:", err);
            }
        }

        // 3. Fallback: reload — GTranslate reads the cookie on load.
        window.setTimeout(() => {
            window.location.reload();
        }, 150);
    };

    const currentLanguage =
        LANGUAGES.find((language) => language.code === currentCode) ||
        LANGUAGES[0];

    return (
        <div
            ref={rootRef}
            className={`language-switcher language-switcher--${variant}`}
            translate="no"
        >
            <button
                type="button"
                className={`language-switcher-trigger${open ? " is-open" : ""}`}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label="Select language"
                onClick={() => setOpen((current) => !current)}
            >
                <span className="language-switcher-flag">
                    <FlagIcon code={currentLanguage.code} />
                </span>

                <span className="language-switcher-copy">
                    <strong>{currentLanguage.short}</strong>
                </span>

                <svg
                    className="language-switcher-caret"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                    focusable="false"
                    width="12"
                    height="12"
                >
                    <path
                        d="M4 6L8 10L12 6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>

            {open && (
                <div
                    className="language-switcher-menu"
                    role="listbox"
                    aria-label="Select language"
                >
                    {LANGUAGES.map((language) => {
                        const selected =
                            language.code === currentLanguage.code;

                        return (
                            <button
                                key={language.code}
                                type="button"
                                role="option"
                                aria-selected={selected}
                                className={`language-switcher-option${
                                    selected ? " is-selected" : ""
                                }`}
                                onClick={() => selectLanguage(language.code)}
                            >
                                <span className="language-switcher-flag">
                                    <FlagIcon code={language.code} />
                                </span>

                                <span className="language-switcher-option-copy">
                                    <strong>{language.native}</strong>
                                </span>

                                <span className="language-switcher-option-code">
                                    {language.short}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default LanguageSwitcher;