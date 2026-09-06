import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";

import adminApi from "../../services/adminApi";

import {
    useAuth,
} from "../../context/AuthContext";

import "./AdminTourForm.css";


/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/

const EMPTY_FORM = {
    title: "",
    slug: "",
    category_id: "",
    destination_id: "",
    short_description: "",
    description: "",
    duration: "",
    featured: false,
    status: "ACTIVE",
};


const EMPTY_PRICE = {
    pricing_type: "PER_PERSON",
    min_people: 1,
    max_people: "",
    price: "",
    currency: "USD",
};


const EMPTY_IMAGE = {
    image_url: "",
    alt_text: "",
    is_primary: false,
    sort_order: 0,
};


/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function slugify(value) {
    return String(value || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}


function getErrorMessage(error) {
    if (
        error?.response?.errors &&
        typeof error.response.errors === "object"
    ) {
        const errors = error.response.errors;

        const messages = Object.entries(errors)
            .map(([field, message]) => {
                if (Array.isArray(message)) {
                    return `${field}: ${message.join(", ")}`;
                }

                return `${field}: ${message}`;
            });

        if (messages.length > 0) {
            return messages.join(" | ");
        }
    }

    return (
        error?.message ||
        "Something went wrong. Please try again."
    );
}


function normalizeTourResponse(response) {
    return (
        response?.data?.tour ||
        response?.data ||
        null
    );
}


function normalizeListResponse(response) {
    if (Array.isArray(response?.data)) {
        return response.data;
    }

    if (Array.isArray(response?.data?.items)) {
        return response.data.items;
    }

    if (Array.isArray(response?.data?.categories)) {
        return response.data.categories;
    }

    if (Array.isArray(response?.data?.destinations)) {
        return response.data.destinations;
    }

    return [];
}


/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

function AdminTourForm() {

    const {
        id,
    } = useParams();

    const navigate =
        useNavigate();

    const {
        logout,
    } = useAuth();


    const isEditMode =
        Boolean(id);


    /*
    |--------------------------------------------------------------------------
    | FORM STATE
    |--------------------------------------------------------------------------
    */

    const [
        form,
        setForm,
    ] = useState(EMPTY_FORM);


    const [
        originalTitle,
        setOriginalTitle,
    ] = useState("");


    const [
        slugManuallyEdited,
        setSlugManuallyEdited,
    ] = useState(false);


    /*
    |--------------------------------------------------------------------------
    | CATEGORY / DESTINATION STATE
    |--------------------------------------------------------------------------
    */

    const [
        categories,
        setCategories,
    ] = useState([]);


    const [
        destinations,
        setDestinations,
    ] = useState([]);


    /*
    |--------------------------------------------------------------------------
    | PRICE STATE
    |--------------------------------------------------------------------------
    */

    const [
        prices,
        setPrices,
    ] = useState([]);


    const [
        priceForm,
        setPriceForm,
    ] = useState(EMPTY_PRICE);


    const [
        editingPriceId,
        setEditingPriceId,
    ] = useState(null);


    /*
    |--------------------------------------------------------------------------
    | IMAGE STATE
    |--------------------------------------------------------------------------
    */

    const [
        images,
        setImages,
    ] = useState([]);


    const [
        imageForm,
        setImageForm,
    ] = useState(EMPTY_IMAGE);


    const [
        editingImageId,
        setEditingImageId,
    ] = useState(null);


    /*
    |--------------------------------------------------------------------------
    | UI STATE
    |--------------------------------------------------------------------------
    */

    const [
        loading,
        setLoading,
    ] = useState(isEditMode);


    const [
        saving,
        setSaving,
    ] = useState(false);


    const [
        priceSaving,
        setPriceSaving,
    ] = useState(false);


    const [
        imageSaving,
        setImageSaving,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState("");


    const [
        notification,
        setNotification,
    ] = useState(null);


    /*
    |--------------------------------------------------------------------------
    | NOTIFICATION
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        if (!notification) {
            return undefined;
        }

        const timer =
            window.setTimeout(() => {
                setNotification(null);
            }, 4000);

        return () => {
            window.clearTimeout(timer);
        };

    }, [notification]);


    /*
    |--------------------------------------------------------------------------
    | AUTH ERROR
    |--------------------------------------------------------------------------
    */

    const handleAuthError = useCallback(
        (requestError) => {

            if (
                requestError?.code ===
                "AUTH_REQUIRED" ||
                requestError?.code ===
                "AUTH_EXPIRED"
            ) {
                logout();
                navigate(
                    "/admin/login",
                    {
                        replace: true,
                    }
                );

                return true;
            }

            return false;
        },
        [
            logout,
            navigate,
        ]
    );


    /*
    |--------------------------------------------------------------------------
    | LOAD CATEGORIES + DESTINATIONS
    |--------------------------------------------------------------------------
    */

    const loadReferenceData =
        useCallback(
            async () => {

                try {

                    const [
                        categoriesResponse,
                        destinationsResponse,
                    ] = await Promise.all([
                        adminApi.authenticatedRequest(
                            "/categories"
                        ),
                        adminApi.authenticatedRequest(
                            "/destinations"
                        ),
                    ]);

                    setCategories(
                        normalizeListResponse(
                            categoriesResponse
                        )
                    );

                    setDestinations(
                        normalizeListResponse(
                            destinationsResponse
                        )
                    );

                } catch (requestError) {

                    if (
                        handleAuthError(
                            requestError
                        )
                    ) {
                        return;
                    }

                    throw requestError;
                }

            },
            [
                handleAuthError,
            ]
        );


    /*
    |--------------------------------------------------------------------------
    | LOAD EXISTING TOUR
    |--------------------------------------------------------------------------
    */

    const loadTour =
        useCallback(
            async () => {

                if (!isEditMode) {
                    return;
                }

                try {

                    setLoading(true);
                    setError("");

                    const response =
                        await adminApi.authenticatedRequest(
                            `/admin/tours/${encodeURIComponent(
                                id
                            )}`
                        );


                    const tour =
                        normalizeTourResponse(
                            response
                        );


                    if (!tour) {
                        throw new Error(
                            "Tour information was not returned by the server."
                        );
                    }


                    const loadedForm = {
                        title:
                            tour.title ||
                            "",
                        slug:
                            tour.slug ||
                            "",
                        category_id:
                            tour.category_id ??
                            "",
                        destination_id:
                            tour.destination_id ??
                            "",
                        short_description:
                            tour.short_description ||
                            "",
                        description:
                            tour.description ||
                            "",
                        duration:
                            tour.duration ||
                            "",
                        featured:
                            Boolean(
                                tour.featured
                            ),
                        status:
                            tour.status ||
                            "ACTIVE",
                    };


                    setForm(
                        loadedForm
                    );

                    setOriginalTitle(
                        loadedForm.title
                    );

                    setSlugManuallyEdited(
                        true
                    );


                    setPrices(
                        Array.isArray(
                            tour.prices
                        )
                            ? tour.prices
                            : []
                    );


                    setImages(
                        Array.isArray(
                            tour.images
                        )
                            ? tour.images
                            : []
                    );

                } catch (requestError) {

                    if (
                        handleAuthError(
                            requestError
                        )
                    ) {
                        return;
                    }

                    setError(
                        getErrorMessage(
                            requestError
                        )
                    );

                } finally {

                    setLoading(false);
                }

            },
            [
                id,
                isEditMode,
                handleAuthError,
            ]
        );


    /*
    |--------------------------------------------------------------------------
    | INITIAL LOAD
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        let cancelled = false;


        const initialize =
            async () => {

                try {

                    setLoading(
                        isEditMode
                    );

                    await loadReferenceData();

                    if (
                        !cancelled &&
                        isEditMode
                    ) {
                        await loadTour();
                    }

                } catch (requestError) {

                    if (
                        cancelled
                    ) {
                        return;
                    }

                    setError(
                        getErrorMessage(
                            requestError
                        )
                    );

                    setLoading(false);
                }
            };


        initialize();


        return () => {
            cancelled = true;
        };

    }, [
        isEditMode,
        loadReferenceData,
        loadTour,
    ]);


    /*
    |--------------------------------------------------------------------------
    | FORM HANDLERS
    |--------------------------------------------------------------------------
    */

    const handleChange =
        (event) => {

            const {
                name,
                value,
                type,
                checked,
            } = event.target;


            setForm(
                (current) => ({
                    ...current,
                    [name]:
                        type === "checkbox"
                            ? checked
                            : value,
                })
            );
        };


    const handleTitleChange =
        (event) => {

            const title =
                event.target.value;


            setForm(
                (current) => ({
                    ...current,
                    title,
                    slug:
                        slugManuallyEdited
                            ? current.slug
                            : slugify(title),
                })
            );
        };


    const handleSlugChange =
        (event) => {

            setSlugManuallyEdited(
                true
            );

            setForm(
                (current) => ({
                    ...current,
                    slug: slugify(
                        event.target.value
                    ),
                })
            );
        };


    /*
    |--------------------------------------------------------------------------
    | MAIN FORM VALIDATION
    |--------------------------------------------------------------------------
    */

    const validateMainForm =
        () => {

            if (
                !form.title.trim()
            ) {
                return "Tour title is required.";
            }

            if (
                !form.slug.trim()
            ) {
                return "Tour slug is required.";
            }

            if (
                !form.category_id
            ) {
                return "Please select a category.";
            }

            if (
                !form.destination_id
            ) {
                return "Please select a destination.";
            }

            if (
                form.short_description.length >
                500
            ) {
                return "Short description cannot exceed 500 characters.";
            }

            if (
                !form.duration.trim()
            ) {
                return "Tour duration is required.";
            }

            return null;
        };


    /*
    |--------------------------------------------------------------------------
    | SAVE TOUR
    |--------------------------------------------------------------------------
    */

    const handleSubmit =
        async (event) => {

            event.preventDefault();

            setError("");

            const validationError =
                validateMainForm();


            if (validationError) {
                setError(
                    validationError
                );

                window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                });

                return;
            }


            const payload = {
                title:
                    form.title.trim(),

                slug:
                    form.slug.trim(),

                category_id:
                    Number(
                        form.category_id
                    ),

                destination_id:
                    Number(
                        form.destination_id
                    ),

                short_description:
                    form.short_description.trim(),

                description:
                    form.description.trim(),

                duration:
                    form.duration.trim(),

                featured:
                    Boolean(
                        form.featured
                    ),

                status:
                    form.status,
            };


            try {

                setSaving(true);


                let response;


                if (isEditMode) {

                    response =
                        await adminApi.authenticatedRequest(
                            `/admin/tours/${encodeURIComponent(
                                id
                            )}`,
                            {
                                method: "PUT",
                                body:
                                    JSON.stringify(
                                        payload
                                    ),
                            }
                        );

                } else {

                    response =
                        await adminApi.authenticatedRequest(
                            "/admin/tours",
                            {
                                method: "POST",
                                body:
                                    JSON.stringify(
                                        payload
                                    ),
                            }
                        );
                }


                const savedTour =
                    response?.data?.tour ||
                    response?.data;


                const savedId =
                    savedTour?.id ||
                    response?.data?.id ||
                    id;


                if (!savedId) {
                    throw new Error(
                        "Tour was saved, but the tour ID was not returned."
                    );
                }


                setNotification({
                    type: "success",
                    message:
                        isEditMode
                            ? "Tour updated successfully."
                            : "Tour created successfully.",
                });


                /*
                |--------------------------------------------------------------------------
                | CREATE MODE
                |--------------------------------------------------------------------------
                |
                | After creating the tour, stay on the editor so the administrator
                | can immediately add prices and images.
                |
                */

                if (!isEditMode) {

                    navigate(
                        `/admin/tours/${savedId}/edit`,
                        {
                            replace: true,
                            state: {
                                created: true,
                            },
                        }
                    );

                    return;
                }


                setOriginalTitle(
                    form.title
                );

            } catch (requestError) {

                if (
                    handleAuthError(
                        requestError
                    )
                ) {
                    return;
                }

                setError(
                    getErrorMessage(
                        requestError
                    )
                );

                window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                });

            } finally {

                setSaving(false);
            }
        };


    /*
    |--------------------------------------------------------------------------
    | PRICE HANDLERS
    |--------------------------------------------------------------------------
    */

    const handlePriceChange =
        (event) => {

            const {
                name,
                value,
            } = event.target;


            setPriceForm(
                (current) => ({
                    ...current,
                    [name]: value,
                })
            );
        };


    const resetPriceForm =
        () => {

            setPriceForm(
                EMPTY_PRICE
            );

            setEditingPriceId(
                null
            );
        };


    const validatePrice =
        () => {

            if (
                !priceForm.pricing_type.trim()
            ) {
                return "Pricing type is required.";
            }

            const minPeople =
                Number(
                    priceForm.min_people
                );


            if (
                !Number.isInteger(
                    minPeople
                ) ||
                minPeople < 1
            ) {
                return "Minimum people must be at least 1.";
            }


            if (
                priceForm.max_people !== ""
            ) {

                const maxPeople =
                    Number(
                        priceForm.max_people
                    );


                if (
                    !Number.isInteger(
                        maxPeople
                    ) ||
                    maxPeople < minPeople
                ) {
                    return "Maximum people must be greater than or equal to minimum people.";
                }
            }


            const price =
                Number(
                    priceForm.price
                );


            if (
                !Number.isFinite(price) ||
                price <= 0
            ) {
                return "Price must be greater than 0.";
            }


            if (
                !priceForm.currency.trim()
            ) {
                return "Currency is required.";
            }


            return null;
        };


    const handlePriceSubmit =
        async (event) => {

            event.preventDefault();

            const validationError =
                validatePrice();


            if (validationError) {

                setError(
                    validationError
                );

                return;
            }


            try {

                setPriceSaving(true);
                setError("");


                const payload = {
                    pricing_type:
                        priceForm.pricing_type
                            .trim()
                            .toUpperCase(),

                    min_people:
                        Number(
                            priceForm.min_people
                        ),

                    max_people:
                        priceForm.max_people === ""
                            ? null
                            : Number(
                                priceForm.max_people
                            ),

                    price:
                        Number(
                            priceForm.price
                        ),

                    currency:
                        priceForm.currency
                            .trim()
                            .toUpperCase(),
                };


                let response;


                if (editingPriceId) {

                    response =
                        await adminApi.authenticatedRequest(
                            `/admin/tours/${id}/prices/${editingPriceId}`,
                            {
                                method: "PUT",
                                body:
                                    JSON.stringify(
                                        payload
                                    ),
                            }
                        );

                } else {

                    response =
                        await adminApi.authenticatedRequest(
                            `/admin/tours/${id}/prices`,
                            {
                                method: "POST",
                                body:
                                    JSON.stringify(
                                        payload
                                    ),
                            }
                        );
                }


                const savedPrice =
                    response?.data?.price ||
                    response?.data;


                if (
                    savedPrice
                ) {

                    setPrices(
                        (current) => {

                            if (
                                editingPriceId
                            ) {

                                return current.map(
                                    (item) =>
                                        Number(
                                            item.id
                                        ) ===
                                        Number(
                                            editingPriceId
                                        )
                                            ? savedPrice
                                            : item
                                );
                            }


                            return [
                                ...current,
                                savedPrice,
                            ];
                        }
                    );

                } else {

                    /*
                    |--------------------------------------------------------------------------
                    | FALLBACK
                    |--------------------------------------------------------------------------
                    */

                    const refresh =
                        await adminApi.authenticatedRequest(
                            `/admin/tours/${id}`
                        );

                    const refreshedTour =
                        normalizeTourResponse(
                            refresh
                        );

                    setPrices(
                        Array.isArray(
                            refreshedTour?.prices
                        )
                            ? refreshedTour.prices
                            : []
                    );
                }


                setNotification({
                    type: "success",
                    message:
                        editingPriceId
                            ? "Price updated successfully."
                            : "Price added successfully.",
                });


                resetPriceForm();

            } catch (requestError) {

                if (
                    handleAuthError(
                        requestError
                    )
                ) {
                    return;
                }

                setError(
                    getErrorMessage(
                        requestError
                    )
                );

            } finally {

                setPriceSaving(false);
            }
        };


    const editPrice =
        (price) => {

            setEditingPriceId(
                price.id
            );

            setPriceForm({
                pricing_type:
                    price.pricing_type ||
                    "PER_PERSON",

                min_people:
                    price.min_people ??
                    1,

                max_people:
                    price.max_people ??
                    "",

                price:
                    price.price ??
                    "",

                currency:
                    price.currency ||
                    "USD",
            });

            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth",
            });
        };


    const deletePrice =
        async (priceId) => {

            if (
                !window.confirm(
                    "Are you sure you want to delete this price?"
                )
            ) {
                return;
            }


            try {

                setError("");


                await adminApi.authenticatedRequest(
                    `/admin/tours/${id}/prices/${priceId}`,
                    {
                        method: "DELETE",
                    }
                );


                setPrices(
                    (current) =>
                        current.filter(
                            (item) =>
                                Number(
                                    item.id
                                ) !==
                                Number(
                                    priceId
                                )
                        )
                );


                if (
                    Number(
                        editingPriceId
                    ) ===
                    Number(
                        priceId
                    )
                ) {
                    resetPriceForm();
                }


                setNotification({
                    type: "success",
                    message:
                        "Price deleted successfully.",
                });

            } catch (requestError) {

                if (
                    handleAuthError(
                        requestError
                    )
                ) {
                    return;
                }

                setError(
                    getErrorMessage(
                        requestError
                    )
                );
            }
        };


    /*
    |--------------------------------------------------------------------------
    | IMAGE HANDLERS
    |--------------------------------------------------------------------------
    */

    const handleImageChange =
        (event) => {

            const {
                name,
                value,
                type,
                checked,
            } = event.target;


            setImageForm(
                (current) => ({
                    ...current,
                    [name]:
                        type === "checkbox"
                            ? checked
                            : value,
                })
            );
        };


    const resetImageForm =
        () => {

            setImageForm(
                EMPTY_IMAGE
            );

            setEditingImageId(
                null
            );
        };


    const validateImage =
        () => {

            if (
                !imageForm.image_url.trim()
            ) {
                return "Image URL is required.";
            }


            try {
                new URL(
                    imageForm.image_url.trim()
                );
            } catch {
                return "Please enter a valid image URL.";
            }


            if (
                imageForm.alt_text.length >
                255
            ) {
                return "Alt text cannot exceed 255 characters.";
            }


            const sortOrder =
                Number(
                    imageForm.sort_order
                );


            if (
                !Number.isInteger(
                    sortOrder
                ) ||
                sortOrder < 0
            ) {
                return "Sort order must be a whole number of 0 or greater.";
            }


            return null;
        };


    const handleImageSubmit =
        async (event) => {

            event.preventDefault();

            const validationError =
                validateImage();


            if (validationError) {

                setError(
                    validationError
                );

                return;
            }


            try {

                setImageSaving(true);
                setError("");


                const payload = {
                    image_url:
                        imageForm.image_url
                            .trim(),

                    alt_text:
                        imageForm.alt_text
                            .trim(),

                    is_primary:
                        Boolean(
                            imageForm.is_primary
                        ),

                    sort_order:
                        Number(
                            imageForm.sort_order
                        ),
                };


                let response;


                if (editingImageId) {

                    response =
                        await adminApi.authenticatedRequest(
                            `/admin/tours/${id}/images/${editingImageId}`,
                            {
                                method: "PUT",
                                body:
                                    JSON.stringify(
                                        payload
                                    ),
                            }
                        );

                } else {

                    response =
                        await adminApi.authenticatedRequest(
                            `/admin/tours/${id}/images`,
                            {
                                method: "POST",
                                body:
                                    JSON.stringify(
                                        payload
                                    ),
                            }
                        );
                }


                const savedImage =
                    response?.data?.image ||
                    response?.data;


                if (
                    savedImage
                ) {

                    setImages(
                        (current) => {

                            if (
                                editingImageId
                            ) {

                                return current.map(
                                    (item) =>
                                        Number(
                                            item.id
                                        ) ===
                                        Number(
                                            editingImageId
                                        )
                                            ? savedImage
                                            : item
                                );
                            }


                            /*
                            |--------------------------------------------------------------------------
                            | If new image is primary, clear other primary flags.
                            |--------------------------------------------------------------------------
                            */

                            if (
                                savedImage.is_primary
                            ) {

                                return [
                                    ...current.map(
                                        (
                                            item
                                        ) => ({
                                            ...item,
                                            is_primary:
                                                false,
                                        })
                                    ),
                                    savedImage,
                                ];
                            }


                            return [
                                ...current,
                                savedImage,
                            ];
                        }
                    );

                } else {

                    const refresh =
                        await adminApi.authenticatedRequest(
                            `/admin/tours/${id}`
                        );

                    const refreshedTour =
                        normalizeTourResponse(
                            refresh
                        );

                    setImages(
                        Array.isArray(
                            refreshedTour?.images
                        )
                            ? refreshedTour.images
                            : []
                    );
                }


                setNotification({
                    type: "success",
                    message:
                        editingImageId
                            ? "Image updated successfully."
                            : "Image added successfully.",
                });


                resetImageForm();

            } catch (requestError) {

                if (
                    handleAuthError(
                        requestError
                    )
                ) {
                    return;
                }

                setError(
                    getErrorMessage(
                        requestError
                    )
                );

            } finally {

                setImageSaving(false);
            }
        };


    const editImage =
        (image) => {

            setEditingImageId(
                image.id
            );

            setImageForm({
                image_url:
                    image.image_url ||
                    "",

                alt_text:
                    image.alt_text ||
                    "",

                is_primary:
                    Boolean(
                        image.is_primary
                    ),

                sort_order:
                    image.sort_order ??
                    0,
            });

            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth",
            });
        };


    const deleteImage =
        async (imageId) => {

            if (
                !window.confirm(
                    "Are you sure you want to delete this image?"
                )
            ) {
                return;
            }


            try {

                setError("");


                await adminApi.authenticatedRequest(
                    `/admin/tours/${id}/images/${imageId}`,
                    {
                        method: "DELETE",
                    }
                );


                setImages(
                    (current) =>
                        current.filter(
                            (item) =>
                                Number(
                                    item.id
                                ) !==
                                Number(
                                    imageId
                                )
                        )
                );


                if (
                    Number(
                        editingImageId
                    ) ===
                    Number(
                        imageId
                    )
                ) {
                    resetImageForm();
                }


                setNotification({
                    type: "success",
                    message:
                        "Image deleted successfully.",
                });

            } catch (requestError) {

                if (
                    handleAuthError(
                        requestError
                    )
                ) {
                    return;
                }

                setError(
                    getErrorMessage(
                        requestError
                    )
                );
            }
        };


    /*
    |--------------------------------------------------------------------------
    | COMPUTED VALUES
    |--------------------------------------------------------------------------
    */

    const pageTitle =
        isEditMode
            ? "Edit Tour"
            : "Create Tour";


    const pageDescription =
        isEditMode
            ? "Update your Zanzibar experience and manage its pricing and images."
            : "Create a new Zanzibar experience for your guests.";


    const sortedPrices =
        useMemo(
            () =>
                [...prices].sort(
                    (a, b) =>
                        Number(
                            a.min_people || 0
                        ) -
                        Number(
                            b.min_people || 0
                        )
                ),
            [
                prices,
            ]
        );


    const sortedImages =
        useMemo(
            () =>
                [...images].sort(
                    (a, b) =>
                        Number(
                            a.sort_order || 0
                        ) -
                        Number(
                            b.sort_order || 0
                        )
                ),
            [
                images,
            ]
        );


    /*
    |--------------------------------------------------------------------------
    | LOADING
    |--------------------------------------------------------------------------
    */

    if (loading) {

        return (
            <div className="admin-tour-form-page">

                <div className="tour-form-loading">

                    <div className="tour-form-spinner" />

                    <h2>
                        Loading tour...
                    </h2>

                    <p>
                        Please wait while we prepare the editor.
                    </p>

                </div>

            </div>
        );
    }


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <div className="admin-tour-form-page">

            {notification && (
                <div
                    className={`tour-form-notification ${notification.type}`}
                >
                    <span className="notification-icon">
                        {notification.type ===
                        "success"
                            ? "✓"
                            : "!"}
                    </span>

                    <span>
                        {notification.message}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setNotification(
                                null
                            )
                        }
                        aria-label="Close notification"
                    >
                        ×
                    </button>
                </div>
            )}


            <header className="tour-form-header">

                <div className="tour-form-header-copy">

                    <Link
                        to="/admin/tours"
                        className="tour-form-back"
                    >
                        ← Back to Tours
                    </Link>

                    <span className="tour-form-eyebrow">
                        TOUR MANAGEMENT
                    </span>

                    <h1>
                        {pageTitle}
                    </h1>

                    <p>
                        {pageDescription}
                    </p>

                </div>


                <div className="tour-form-header-actions">

                    <Link
                        to="/admin/tours"
                        className="tour-secondary-button"
                    >
                        Cancel
                    </Link>

                    <button
                        type="submit"
                        form="tour-main-form"
                        className="tour-primary-button"
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <span className="button-spinner" />
                                Saving...
                            </>
                        ) : (
                            <>
                                ✓
                                {isEditMode
                                    ? "Save Changes"
                                    : "Create Tour"}
                            </>
                        )}
                    </button>

                </div>

            </header>


            {error && (
                <div className="tour-form-error">

                    <div className="tour-form-error-icon">
                        !
                    </div>

                    <div>
                        <strong>
                            Unable to complete request
                        </strong>

                        <p>
                            {error}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setError("")
                        }
                    >
                        ×
                    </button>

                </div>
            )}


            <form
                id="tour-main-form"
                onSubmit={
                    handleSubmit
                }
                className="tour-form-layout"
            >

                <main className="tour-form-main">

                    {/* ======================================================
                        BASIC INFORMATION
                    ====================================================== */}

                    <section className="tour-form-card">

                        <div className="tour-form-card-heading">

                            <div className="section-number">
                                01
                            </div>

                            <div>
                                <h2>
                                    Basic Information
                                </h2>

                                <p>
                                    Define the main identity of your tour.
                                </p>
                            </div>

                        </div>


                        <div className="tour-form-grid">

                            <div className="tour-field tour-field-full">

                                <label htmlFor="title">
                                    Tour Title
                                    <span>*</span>
                                </label>

                                <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    value={
                                        form.title
                                    }
                                    onChange={
                                        handleTitleChange
                                    }
                                    placeholder="e.g. Safari Blue Zanzibar"
                                    maxLength={200}
                                    required
                                />

                                <small>
                                    Use a clear, attractive name guests will understand.
                                </small>

                            </div>


                            <div className="tour-field">

                                <label htmlFor="slug">
                                    URL Slug
                                    <span>*</span>
                                </label>

                                <input
                                    id="slug"
                                    name="slug"
                                    type="text"
                                    value={
                                        form.slug
                                    }
                                    onChange={
                                        handleSlugChange
                                    }
                                    placeholder="safari-blue-zanzibar"
                                    maxLength={220}
                                    required
                                />

                                <small>
                                    /tours/{form.slug || "your-tour-slug"}
                                </small>

                            </div>


                            <div className="tour-field">

                                <label htmlFor="duration">
                                    Duration
                                    <span>*</span>
                                </label>

                                <input
                                    id="duration"
                                    name="duration"
                                    type="text"
                                    value={
                                        form.duration
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="e.g. Full Day"
                                    maxLength={100}
                                    required
                                />

                            </div>


                            <div className="tour-field">

                                <label htmlFor="category_id">
                                    Category
                                    <span>*</span>
                                </label>

                                <select
                                    id="category_id"
                                    name="category_id"
                                    value={
                                        form.category_id
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                >
                                    <option value="">
                                        Select category
                                    </option>

                                    {categories.map(
                                        (category) => (
                                            <option
                                                key={
                                                    category.id
                                                }
                                                value={
                                                    category.id
                                                }
                                            >
                                                {
                                                    category.name
                                                }
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>


                            <div className="tour-field">

                                <label htmlFor="destination_id">
                                    Destination
                                    <span>*</span>
                                </label>

                                <select
                                    id="destination_id"
                                    name="destination_id"
                                    value={
                                        form.destination_id
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                >
                                    <option value="">
                                        Select destination
                                    </option>

                                    {destinations.map(
                                        (destination) => (
                                            <option
                                                key={
                                                    destination.id
                                                }
                                                value={
                                                    destination.id
                                                }
                                            >
                                                {
                                                    destination.name
                                                }
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>

                        </div>

                    </section>


                    {/* ======================================================
                        DESCRIPTIONS
                    ====================================================== */}

                    <section className="tour-form-card">

                        <div className="tour-form-card-heading">

                            <div className="section-number">
                                02
                            </div>

                            <div>
                                <h2>
                                    Tour Content
                                </h2>

                                <p>
                                    Tell visitors what makes this experience special.
                                </p>
                            </div>

                        </div>


                        <div className="tour-field tour-field-full">

                            <label htmlFor="short_description">
                                Short Description
                            </label>

                            <textarea
                                id="short_description"
                                name="short_description"
                                value={
                                    form.short_description
                                }
                                onChange={
                                    handleChange
                                }
                                rows={4}
                                maxLength={500}
                                placeholder="A concise description shown in tour cards and previews."
                            />

                            <div className="field-footer">

                                <small>
                                    Maximum 500 characters.
                                </small>

                                <span>
                                    {
                                        form.short_description
                                            .length
                                    }
                                    /500
                                </span>

                            </div>

                        </div>


                        <div className="tour-field tour-field-full">

                            <label htmlFor="description">
                                Full Description
                            </label>

                            <textarea
                                id="description"
                                name="description"
                                value={
                                    form.description
                                }
                                onChange={
                                    handleChange
                                }
                                rows={10}
                                placeholder="Provide a detailed description of the experience, itinerary, highlights and what guests can expect."
                            />

                            <small>
                                Write clear, informative content suitable for the public tour details page.
                            </small>

                        </div>

                    </section>


                    {/* ======================================================
                        PRICING
                    ====================================================== */}

                    <section className="tour-form-card">

                        <div className="tour-form-card-heading">

                            <div className="section-number">
                                03
                            </div>

                            <div>
                                <h2>
                                    Pricing
                                </h2>

                                <p>
                                    Create flexible pricing rules for different group sizes.
                                </p>
                            </div>

                        </div>


                        {!isEditMode ? (
                            <div className="tour-editor-notice">
                                <span>i</span>

                                <div>
                                    <strong>
                                        Save the tour first
                                    </strong>

                                    <p>
                                        Pricing can be added immediately after the tour is created.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {sortedPrices.length > 0 && (
                                    <div className="price-list">

                                        {sortedPrices.map(
                                            (price) => (
                                                <div
                                                    className="price-row"
                                                    key={
                                                        price.id
                                                    }
                                                >

                                                    <div className="price-type">
                                                        <strong>
                                                            {
                                                                price.pricing_type
                                                            }
                                                        </strong>

                                                        <span>
                                                            {price.min_people}
                                                            {" "}
                                                            {price.max_people
                                                                ? `– ${price.max_people}`
                                                                : "+"}
                                                            {" "}
                                                            people
                                                        </span>
                                                    </div>


                                                    <div className="price-value">
                                                        <strong>
                                                            {Number(
                                                                price.price
                                                            ).toLocaleString(
                                                                undefined,
                                                                {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2,
                                                                }
                                                            )}
                                                        </strong>

                                                        <span>
                                                            {
                                                                price.currency
                                                            }
                                                        </span>
                                                    </div>


                                                    <div className="row-actions">

                                                        <button
                                                            type="button"
                                                            className="row-edit-button"
                                                            onClick={() =>
                                                                editPrice(
                                                                    price
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="row-delete-button"
                                                            onClick={() =>
                                                                deletePrice(
                                                                    price.id
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>

                                                    </div>

                                                </div>
                                            )
                                        )}

                                    </div>
                                )}


                                {sortedPrices.length === 0 && (
                                    <div className="editor-empty">
                                        <div className="editor-empty-icon">
                                            $
                                        </div>

                                        <strong>
                                            No pricing configured
                                        </strong>

                                        <p>
                                            Add your first pricing rule below.
                                        </p>
                                    </div>
                                )}


                                <div className="embedded-form">

                                    <div className="embedded-form-heading">

                                        <h3>
                                            {editingPriceId
                                                ? "Edit Pricing"
                                                : "Add Pricing"}
                                        </h3>

                                        {editingPriceId && (
                                            <button
                                                type="button"
                                                onClick={
                                                    resetPriceForm
                                                }
                                            >
                                                Cancel editing
                                            </button>
                                        )}

                                    </div>


                                    <div className="tour-form-grid">

                                        <div className="tour-field">

                                            <label>
                                                Pricing Type
                                            </label>

                                            <select
                                                name="pricing_type"
                                                value={
                                                    priceForm.pricing_type
                                                }
                                                onChange={
                                                    handlePriceChange
                                                }
                                            >
                                                <option value="PER_PERSON">
                                                    Per Person
                                                </option>

                                                <option value="PER_GROUP">
                                                    Per Group
                                                </option>

                                                <option value="CHILD">
                                                    Child
                                                </option>

                                                <option value="ADULT">
                                                    Adult
                                                </option>

                                                <option value="PRIVATE">
                                                    Private
                                                </option>

                                                <option value="CUSTOM">
                                                    Custom
                                                </option>

                                            </select>

                                        </div>


                                        <div className="tour-field">

                                            <label>
                                                Currency
                                            </label>

                                            <input
                                                name="currency"
                                                type="text"
                                                value={
                                                    priceForm.currency
                                                }
                                                onChange={
                                                    handlePriceChange
                                                }
                                                maxLength={10}
                                                placeholder="USD"
                                            />

                                        </div>


                                        <div className="tour-field">

                                            <label>
                                                Minimum People
                                            </label>

                                            <input
                                                name="min_people"
                                                type="number"
                                                min="1"
                                                step="1"
                                                value={
                                                    priceForm.min_people
                                                }
                                                onChange={
                                                    handlePriceChange
                                                }
                                            />

                                        </div>


                                        <div className="tour-field">

                                            <label>
                                                Maximum People
                                            </label>

                                            <input
                                                name="max_people"
                                                type="number"
                                                min="1"
                                                step="1"
                                                value={
                                                    priceForm.max_people
                                                }
                                                onChange={
                                                    handlePriceChange
                                                }
                                                placeholder="No limit"
                                            />

                                        </div>


                                        <div className="tour-field tour-field-full">

                                            <label>
                                                Price
                                            </label>

                                            <div className="input-prefix">

                                                <span>
                                                    {priceForm.currency || "$"}
                                                </span>

                                                <input
                                                    name="price"
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={
                                                        priceForm.price
                                                    }
                                                    onChange={
                                                        handlePriceChange
                                                    }
                                                    placeholder="150.00"
                                                />

                                            </div>

                                        </div>

                                    </div>


                                    <button
                                        type="button"
                                        className="embedded-submit"
                                        onClick={
                                            handlePriceSubmit
                                        }
                                        disabled={
                                            priceSaving
                                        }
                                    >
                                        {priceSaving ? (
                                            <>
                                                <span className="button-spinner" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                +
                                                {editingPriceId
                                                    ? " Update Pricing"
                                                    : " Add Pricing"}
                                            </>
                                        )}
                                    </button>

                                </div>

                            </>
                        )}

                    </section>


                    {/* ======================================================
                        IMAGES
                    ====================================================== */}

                    <section className="tour-form-card">

                        <div className="tour-form-card-heading">

                            <div className="section-number">
                                04
                            </div>

                            <div>
                                <h2>
                                    Tour Images
                                </h2>

                                <p>
                                    Manage the visual presentation of this experience.
                                </p>
                            </div>

                        </div>


                        {!isEditMode ? (
                            <div className="tour-editor-notice">
                                <span>i</span>

                                <div>
                                    <strong>
                                        Save the tour first
                                    </strong>

                                    <p>
                                        Images can be added immediately after the tour is created.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {sortedImages.length > 0 && (
                                    <div className="image-management-grid">

                                        {sortedImages.map(
                                            (image) => (
                                                <div
                                                    className="managed-image-card"
                                                    key={
                                                        image.id
                                                    }
                                                >

                                                    <div className="managed-image-preview">

                                                        <img
                                                            src={
                                                                image.image_url
                                                            }
                                                            alt={
                                                                image.alt_text ||
                                                                "Tour image"
                                                            }
                                                            onError={(
                                                                event
                                                            ) => {
                                                                event.currentTarget.style.display =
                                                                    "none";

                                                                event.currentTarget.nextElementSibling.style.display =
                                                                    "flex";
                                                            }}
                                                        />

                                                        <div className="image-fallback">
                                                            Image unavailable
                                                        </div>


                                                        {Boolean(
                                                            image.is_primary
                                                        ) && (
                                                            <span className="primary-image-badge">
                                                                ★ Primary
                                                            </span>
                                                        )}

                                                    </div>


                                                    <div className="managed-image-content">

                                                        <strong>
                                                            {image.alt_text ||
                                                                "Tour image"}
                                                        </strong>

                                                        <span>
                                                            Sort order:{" "}
                                                            {
                                                                image.sort_order
                                                            }
                                                        </span>


                                                        <div className="row-actions">

                                                            <button
                                                                type="button"
                                                                className="row-edit-button"
                                                                onClick={() =>
                                                                    editImage(
                                                                        image
                                                                    )
                                                                }
                                                            >
                                                                Edit
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="row-delete-button"
                                                                onClick={() =>
                                                                    deleteImage(
                                                                        image.id
                                                                    )
                                                                }
                                                            >
                                                                Delete
                                                            </button>

                                                        </div>

                                                    </div>

                                                </div>
                                            )
                                        )}

                                    </div>
                                )}


                                {sortedImages.length === 0 && (
                                    <div className="editor-empty">

                                        <div className="editor-empty-icon">
                                            ◫
                                        </div>

                                        <strong>
                                            No images configured
                                        </strong>

                                        <p>
                                            Add a high-quality image for this experience.
                                        </p>

                                    </div>
                                )}


                                <div className="embedded-form">

                                    <div className="embedded-form-heading">

                                        <h3>
                                            {editingImageId
                                                ? "Edit Image"
                                                : "Add Image"}
                                        </h3>

                                        {editingImageId && (
                                            <button
                                                type="button"
                                                onClick={
                                                    resetImageForm
                                                }
                                            >
                                                Cancel editing
                                            </button>
                                        )}

                                    </div>


                                    <div className="tour-form-grid">

                                        <div className="tour-field tour-field-full">

                                            <label>
                                                Image URL
                                            </label>

                                            <input
                                                name="image_url"
                                                type="url"
                                                value={
                                                    imageForm.image_url
                                                }
                                                onChange={
                                                    handleImageChange
                                                }
                                                placeholder="https://res.cloudinary.com/..."
                                            />

                                            <small>
                                                Use a publicly accessible image URL.
                                            </small>

                                        </div>


                                        <div className="tour-field tour-field-full">

                                            <label>
                                                Alt Text
                                            </label>

                                            <input
                                                name="alt_text"
                                                type="text"
                                                value={
                                                    imageForm.alt_text
                                                }
                                                onChange={
                                                    handleImageChange
                                                }
                                                maxLength={255}
                                                placeholder="Safari Blue Zanzibar boat experience"
                                            />

                                        </div>


                                        <div className="tour-field">

                                            <label>
                                                Sort Order
                                            </label>

                                            <input
                                                name="sort_order"
                                                type="number"
                                                min="0"
                                                step="1"
                                                value={
                                                    imageForm.sort_order
                                                }
                                                onChange={
                                                    handleImageChange
                                                }
                                            />

                                        </div>


                                        <div className="tour-checkbox-field">

                                            <label>

                                                <input
                                                    name="is_primary"
                                                    type="checkbox"
                                                    checked={
                                                        imageForm.is_primary
                                                    }
                                                    onChange={
                                                        handleImageChange
                                                    }
                                                />

                                                <span className="custom-checkbox">
                                                    ✓
                                                </span>

                                                <span>
                                                    Set as primary image
                                                </span>

                                            </label>

                                        </div>

                                    </div>


                                    {imageForm.image_url && (
                                        <div className="image-live-preview">

                                            <img
                                                src={
                                                    imageForm.image_url
                                                }
                                                alt={
                                                    imageForm.alt_text ||
                                                    "Preview"
                                                }
                                                onError={(
                                                    event
                                                ) => {
                                                    event.currentTarget.style.display =
                                                        "none";
                                                }}
                                            />

                                            <div>
                                                <span>
                                                    LIVE PREVIEW
                                                </span>

                                                <strong>
                                                    {
                                                        imageForm.alt_text ||
                                                        "Tour image"
                                                    }
                                                </strong>
                                            </div>

                                        </div>
                                    )}


                                    <button
                                        type="button"
                                        className="embedded-submit"
                                        onClick={
                                            handleImageSubmit
                                        }
                                        disabled={
                                            imageSaving
                                        }
                                    >
                                        {imageSaving ? (
                                            <>
                                                <span className="button-spinner" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                +
                                                {editingImageId
                                                    ? " Update Image"
                                                    : " Add Image"}
                                            </>
                                        )}
                                    </button>

                                </div>

                            </>
                        )}

                    </section>

                </main>


                {/* ==========================================================
                    SIDEBAR
                ========================================================== */}

                <aside className="tour-form-sidebar">

                    <div className="tour-form-card publishing-card">

                        <div className="sidebar-heading">
                            <span className="sidebar-icon">
                                ◈
                            </span>

                            <div>
                                <h2>
                                    Publishing
                                </h2>

                                <p>
                                    Control how this tour appears.
                                </p>
                            </div>
                        </div>


                        <div className="publishing-status">

                            <label>
                                Status
                            </label>

                            <select
                                name="status"
                                value={
                                    form.status
                                }
                                onChange={
                                    handleChange
                                }
                            >
                                <option value="ACTIVE">
                                    Active
                                </option>

                                <option value="INACTIVE">
                                    Inactive
                                </option>
                            </select>

                        </div>


                        <label className="featured-toggle">

                            <input
                                type="checkbox"
                                name="featured"
                                checked={
                                    form.featured
                                }
                                onChange={
                                    handleChange
                                }
                            />

                            <span className="featured-toggle-box">
                                ★
                            </span>

                            <span className="featured-toggle-copy">

                                <strong>
                                    Featured Tour
                                </strong>

                                <small>
                                    Highlight this experience across the website.
                                </small>

                            </span>

                        </label>


                        <button
                            type="submit"
                            form="tour-main-form"
                            className="sidebar-save-button"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : isEditMode
                                    ? "Save Changes"
                                    : "Create Tour"}
                        </button>


                        <Link
                            to="/admin/tours"
                            className="sidebar-cancel-button"
                        >
                            Cancel
                        </Link>

                    </div>


                    {/* ======================================================
                        SUMMARY
                    ====================================================== */}

                    <div className="tour-form-card summary-card">

                        <div className="sidebar-heading">

                            <span className="sidebar-icon">
                                ≡
                            </span>

                            <div>
                                <h2>
                                    Tour Summary
                                </h2>

                                <p>
                                    Current content overview.
                                </p>
                            </div>

                        </div>


                        <div className="summary-list">

                            <div>
                                <span>
                                    Prices
                                </span>

                                <strong>
                                    {prices.length}
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Images
                                </span>

                                <strong>
                                    {images.length}
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Status
                                </span>

                                <strong
                                    className={
                                        form.status ===
                                        "ACTIVE"
                                            ? "summary-active"
                                            : "summary-inactive"
                                    }
                                >
                                    {form.status}
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Featured
                                </span>

                                <strong>
                                    {form.featured
                                        ? "YES"
                                        : "NO"}
                                </strong>
                            </div>

                        </div>

                    </div>


                    {/* ======================================================
                        GUIDANCE
                    ====================================================== */}

                    <div className="tour-form-tip">

                        <span>
                            ✦
                        </span>

                        <div>

                            <strong>
                                Premium presentation
                            </strong>

                            <p>
                                Use compelling descriptions and high-resolution images to give guests confidence before booking.
                            </p>

                        </div>

                    </div>

                </aside>

            </form>

        </div>
    );
}


export default AdminTourForm;