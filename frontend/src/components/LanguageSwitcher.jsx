// LanguageSwitcher.jsx
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "../i18n/config";
import "./LanguageSwitcher.css";

/* =========================================================
   SUPPORTED LANGUAGE DISPLAY DATA
   ========================================================= */

const LANGUAGES = [
  { code: "en", short: "EN", native: "English", country: "United Kingdom" },
  { code: "de", short: "DE", native: "Deutsch", country: "Deutschland" },
  { code: "it", short: "IT", native: "Italiano", country: "Italia" },
  { code: "fr", short: "FR", native: "Français", country: "France" },
  { code: "pl", short: "PL", native: "Polski", country: "Polska" },
];

/* =========================================================
   FLAG ICON
   ========================================================= */

function FlagIcon({ code }) {
  switch (code) {
    case "en":
      return (
        <svg viewBox="0 0 60 42" aria-hidden="true" width="20" height="14">
          <rect width="60" height="42" fill="#012169" />
          <path d="M0 0 L60 42 M60 0 L0 42" stroke="#fff" strokeWidth="9" />
          <path d="M0 0 L60 42 M60 0 L0 42" stroke="#C8102E" strokeWidth="5" />
          <path d="M30 0 V42 M0 21 H60" stroke="#fff" strokeWidth="15" />
          <path d="M30 0 V42 M0 21 H60" stroke="#C8102E" strokeWidth="9" />
        </svg>
      );

    case "de":
      return (
        <svg viewBox="0 0 60 42" aria-hidden="true" width="20" height="14">
          <rect width="60" height="14" fill="#000" />
          <rect y="14" width="60" height="14" fill="#DD0000" />
          <rect y="28" width="60" height="14" fill="#FFCE00" />
        </svg>
      );

    case "it":
      return (
        <svg viewBox="0 0 60 42" aria-hidden="true" width="20" height="14">
          <rect width="20" height="42" fill="#009246" />
          <rect x="20" width="20" height="42" fill="#ffffff" />
          <rect x="40" width="20" height="42" fill="#CE2B37" />
        </svg>
      );

    case "fr":
      return (
        <svg viewBox="0 0 60 42" aria-hidden="true" width="20" height="14">
          <rect width="20" height="42" fill="#002395" />
          <rect x="20" width="20" height="42" fill="#ffffff" />
          <rect x="40" width="20" height="42" fill="#ED2939" />
        </svg>
      );

    case "pl":
      return (
        <svg viewBox="0 0 60 42" aria-hidden="true" width="20" height="14">
          <rect width="60" height="21" fill="#ffffff" />
          <rect y="21" width="60" height="21" fill="#DC143C" />
        </svg>
      );

    default:
      return null;
  }
}

/* =========================================================
   READ GTRANSLATE COOKIE
   ========================================================= */

function readStoredLanguage() {
  try {
    const match = document.cookie.match(
      /(?:^|;\s*)googtrans=\/en\/([a-z]{2})/i
    );
    if (match && SUPPORTED_LANGUAGES.includes(match[1])) {
      return match[1];
    }
  } catch {
    // Cookie access can fail in restricted browsers.
  }
  return null;
}

/* =========================================================
   WRITE GTRANSLATE COOKIE
   ========================================================= */

function writeGTranslateCookie(code) {
  const hostname = window.location.hostname;

  // Clear previous googtrans cookies on every common path/domain.
  const expired = "expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = `googtrans=; path=/; ${expired}`;
  document.cookie = `googtrans=; path=/; domain=${hostname}; ${expired}`;
  document.cookie = `googtrans=; path=/; domain=.${hostname}; ${expired}`;

  // English is the source language — no translation cookie needed.
  if (code === "en") return;

  const cookieValue = `/en/${code}`;
  document.cookie = `googtrans=${cookieValue}; path=/`;
  document.cookie = `googtrans=${cookieValue}; path=/; domain=${hostname}`;
  document.cookie = `googtrans=${cookieValue}; path=/; domain=.${hostname}`;
}

/* =========================================================
   LANGUAGE SWITCHER
   ========================================================= */

function LanguageSwitcher({ variant = "navbar" }) {
  const { i18n, t } = useTranslation();
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);

  /* =====================================================
     DETERMINE CURRENT LANGUAGE
     ===================================================== */

  const currentCode = SUPPORTED_LANGUAGES.includes(i18n.resolvedLanguage)
    ? i18n.resolvedLanguage
    : SUPPORTED_LANGUAGES.includes(i18n.language?.split("-")[0])
      ? i18n.language.split("-")[0]
      : "en";

  const currentLanguage =
    LANGUAGES.find((language) => language.code === currentCode) || LANGUAGES[0];

  /* =====================================================
     SYNC WITH GTRANSLATE COOKIE ON MOUNT
     ===================================================== */

  useEffect(() => {
    const storedLanguage = readStoredLanguage();
    if (storedLanguage && storedLanguage !== currentCode) {
      i18n.changeLanguage(storedLanguage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =====================================================
     CLOSE WHEN CLICKING OUTSIDE
     ===================================================== */

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

  /* =====================================================
     SELECT LANGUAGE
     ===================================================== */

  const selectLanguage = (code) => {
    setOpen(false);

    if (code === currentCode) return;

    // 1. Update i18next locale (UI strings).
    i18n.changeLanguage(code);

    // 2. Persist the Google Translate preference.
    writeGTranslateCookie(code);

    // 3. Reload so Google Translate picks up the new cookie
    //    on the next page load. A short delay lets i18next finish
    //    persisting to localStorage first.
    window.setTimeout(() => {
      window.location.reload();
    }, 120);
  };

  /* =====================================================
     RENDER
     ===================================================== */

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
        aria-label={t("accessibility.selectLanguage")}
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
          aria-label={t("language.select")}
        >
          {LANGUAGES.map((language) => {
            const selected = language.code === currentLanguage.code;

            return (
              <button
                key={language.code}
                type="button"
                role="option"
                aria-selected={selected}
                className={`language-switcher-option${selected ? " is-selected" : ""}`}
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