import { useEffect, useState } from "react";

/* =========================================================
   GLOBAL SOCIAL RAIL
   Sticky vertical rail rendered on every public page.
   Auto-hides on scroll-down, reveals on scroll-up.
   ========================================================= */

const SOCIAL_LINKS = [
  {
    type: "whatsapp",
    label: "WhatsApp",
    href: "https://wa.me/255658450092",
  },
  {
    type: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/share/19SBfqRvNk/?mibextid=wwXIfr",
  },
  {
    type: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/zanzibar_gates_safaris._?stkn=MWppNW9rYzU4ZGx3dg%3D%3D&utm_source=qr",
  },
  {
    type: "threads",
    label: "Threads",
    href: "https://www.threads.com/@zanzibar_gates_safaris._?igshid=NTc4MTIwNjQ2YQ==",
  },
];

/* Premium icon set — filled for weight, tuned stroke for detail */
function SocialIcon({ type }) {
  switch (type) {
    case "whatsapp":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.004c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.02zM12.04 20.15h-.004a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.22 8.22 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24zm4.52-6.17c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43-.14-.01-.31-.01-.48-.01s-.43.06-.66.31c-.23.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.55.12.17 1.72 2.63 4.18 3.69.58.25 1.04.4 1.4.51.59.19 1.12.16 1.55.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.11-.22-.17-.47-.29z" />
        </svg>
      );

    case "facebook":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33V22c4.78-.76 8.45-4.92 8.45-9.94z" />
        </svg>
      );

    case "instagram":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.22.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.05.41 2.22.06 1.27.07 1.65.07 4.85 0 3.2-.01 3.58-.07 4.85-.05 1.17-.25 1.8-.41 2.22-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.05.36-2.22.41-1.27.06-1.65.07-4.85.07-3.2 0-3.58-.01-4.85-.07-1.17-.05-1.8-.25-2.22-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.05-.41-2.22C2.17 15.58 2.16 15.2 2.16 12c0-3.2.01-3.58.07-4.85.05-1.17.25-1.8.41-2.22.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.05-.36 2.22-.41C8.42 2.17 8.8 2.16 12 2.16zm0 3.68a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm7.84-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z" />
        </svg>
      );

    case "threads":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12.5 22h-.18a9.94 9.94 0 0 1-4.4-1.01c-1.17-.54-2.2-1.3-3.06-2.25A10.66 10.66 0 0 1 2.1 14.5a10.82 10.82 0 0 1 0-5.34C2.42 7.62 3 6.28 3.89 5.11 4.78 3.93 5.86 2.96 7.13 2.23A9.86 9.86 0 0 1 12.03 1c2.35 0 4.58.66 6.5 1.96a10.56 10.56 0 0 1 3.99 5.06 11 11 0 0 1 .6 3.7v.28a10.5 10.5 0 0 1-.72 3.83 8.88 8.88 0 0 1-2.02 3.02 8.35 8.35 0 0 1-2.84 1.75 10.06 10.06 0 0 1-3.34.55 9.6 9.6 0 0 1-3.4-.6 7.7 7.7 0 0 1-2.53-1.6l1.67-1.66a6.5 6.5 0 0 0 2.07 1.32c.7.24 1.42.36 2.19.36.87 0 1.72-.11 2.55-.34a6.5 6.5 0 0 0 2.16-1.31 6.6 6.6 0 0 0 1.5-2.28 8.4 8.4 0 0 0 .56-3.07v-.18a8.85 8.85 0 0 0-.5-3.06 8.6 8.6 0 0 0-3.22-4.12A8.05 8.05 0 0 0 12.01 3a7.9 7.9 0 0 0-3.91.99A8.4 8.4 0 0 0 5.47 6.3a8.6 8.6 0 0 0-1.42 3.22 8.8 8.8 0 0 0 0 4.35 8.7 8.7 0 0 0 1.42 3.22 8.4 8.4 0 0 0 2.5 2.26 7.9 7.9 0 0 0 3.55.94c.2 0 .4 0 .6-.02.6-.05 1.18-.18 1.74-.38a4.5 4.5 0 0 0 1.4-.87 3.6 3.6 0 0 0 .88-1.4c.19-.52.24-1.07.15-1.63a2.36 2.36 0 0 0-.84-1.53 3.55 3.55 0 0 0-1.85-.68 8.5 8.5 0 0 0-2.1.03 1.9 1.9 0 0 0-1.15.5 1.2 1.2 0 0 0-.35.8c.02.28.17.52.42.68.31.19.66.29 1.03.3.8.03 1.63-.05 2.44-.24a6.2 6.2 0 0 0 1.88-.7l.62 1.83a8 8 0 0 1-2.4.89c-1.02.24-2.05.34-3.09.31a3.9 3.9 0 0 1-2.3-.75 2.9 2.9 0 0 1-1.19-2.19c-.04-.7.24-1.39.77-1.9a4 4 0 0 1 2.15-.94 10.8 10.8 0 0 1 2.6-.04 5.7 5.7 0 0 1 2.94 1.12 4.4 4.4 0 0 1 1.55 2.73c.15.85.04 1.74-.32 2.53a5.6 5.6 0 0 1-1.43 2.18 6.6 6.6 0 0 1-2.12 1.3c-.75.27-1.53.43-2.34.48-.25.02-.5.03-.75.03z" />
        </svg>
      );

    default:
      return null;
  }
}

function SocialRail() {
  const [hidden, setHidden] = useState(false);

  /* Auto-hide when scrolling down, reveal when scrolling up */
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        const goingDown = y > lastY && y > 120;
        const goingUp = y < lastY;

        if (goingDown) setHidden(true);
        else if (goingUp) setHidden(false);

        lastY = y;
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <aside
      className={`social-rail${hidden ? " is-hidden" : ""}`}
      aria-label="Social media and contact shortcuts"
    >
      {SOCIAL_LINKS.map((link) => (
        <a
          key={link.type}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          className={`social-rail-link social-rail-link--${link.type}`}
          aria-label={link.label}
          title={link.label}
        >
          <span className="social-rail-icon" aria-hidden="true">
            <SocialIcon type={link.type} />
          </span>
        </a>
      ))}
    </aside>
  );
}

export default SocialRail;