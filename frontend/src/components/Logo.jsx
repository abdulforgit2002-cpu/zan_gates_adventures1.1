import { Link } from "react-router-dom";


const LOGO_URL =
    "https://res.cloudinary.com/djczmay2i/image/upload/v1788254388/ZAN_GATES_ADVENTURES_k59crf.jpg";


function Logo({
    variant = "default",
    className = "",
    linkTo = null,
}) {

    const logoImage = (
        <span
            className={`site-logo-wrapper site-logo-wrapper-${variant}`}
        >

            <img
                src={LOGO_URL}
                alt="ZAN GATES Adventures Tours & Safaris"
                className={`site-logo site-logo-${variant} ${className}`.trim()}
                width="600"
                height="248"
                loading={
                    variant === "navbar"
                        ? "eager"
                        : "lazy"
                }
                decoding="async"
            />

        </span>
    );


    if (linkTo) {

        return (
            <Link
                to={linkTo}
                className={`site-logo-link site-logo-link-${variant}`}
                aria-label="ZAN GATES Adventures"
            >
                {logoImage}
            </Link>
        );

    }


    return logoImage;
}


export default Logo;