import React, { useState } from "react";
import { Link } from "react-router-dom";

const TailwindTourCard = ({ tour }) => {
  const [imageError, setImageError] = useState(false);

  if (!tour) return null;

  const imageUrl =
    tour.image_url ||
    (Array.isArray(tour.images) && tour.images[0]?.image_url) ||
    "";

  const title = tour.title || "Zanzibar Adventure";
  const destination = tour.destination_name || tour.destination?.name || "Zanzibar";
  const duration = tour.duration || "Flexible";

  const formattedPrice = tour.price ? Number(tour.price).toLocaleString() : null;

  return (
    <article className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-56 bg-gray-100 relative">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm text-gray-600">ZAN GATES</div>
        )}
      </div>

      <div className="p-4">
        <div className="text-sm text-gray-500 flex justify-between">
          <span>{destination}</span>
          <span>{duration}</span>
        </div>

        <h3 className="mt-2 text-lg font-semibold text-gray-900">{title}</h3>

        <p className="mt-2 text-sm text-gray-600 line-clamp-3">{tour.short_description || tour.description}</p>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-800">
            {formattedPrice ? (
              <div className="font-semibold">${formattedPrice}</div>
            ) : (
              <div className="font-semibold">On Request</div>
            )}
          </div>

          <Link to={`/tours/${encodeURIComponent(tour.slug || "")}`} className="text-sm text-zg-deep-teal font-medium">
            View Tour →
          </Link>
        </div>
      </div>
    </article>
  );
};

export default TailwindTourCard;
