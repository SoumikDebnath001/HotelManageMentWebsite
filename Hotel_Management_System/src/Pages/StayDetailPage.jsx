import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiStar,
  FiMapPin,
  FiWifi,
  FiCoffee,
  FiDroplet,
  FiSun,
  FiPercent,
} from "react-icons/fi";

/* =========================================================
   AMENITY ICONS
========================================================= */

const amenityIcons = {
  "Free Wi-Fi": FiWifi,
  "Breakfast": FiCoffee,
  "Pool": FiDroplet,
  "Ocean View": FiSun,
  "Spa": FiDroplet,
  "Room Service": FiCoffee,
  "Gym": FiSun,
  "Parking": FiMapPin,
};

/* =========================================================
   STAY DETAIL PAGE
========================================================= */

const StayDetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;

  if (!data) {
    return (
      <div
        className="
          flex
          min-h-screen
          flex-col
          items-center
          justify-center
          bg-[#0c0a09]
          text-white
        "
      >
        <p className="mb-6 text-lg text-stone-400">
          No details available.
        </p>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="
            inline-flex
            cursor-pointer
            items-center
            gap-2
            rounded-xl
            bg-amber-500
            px-6
            py-3
            text-sm
            font-semibold
            text-white
            transition-all
            duration-300
            hover:bg-amber-400
          "
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to Home
        </button>
      </div>
    );
  }

  const isOffer = !!data.discount;

  return (
    <div
      className="
        min-h-screen
        bg-[#0c0a09]
        text-white
      "
    >
      {/* ===================================================
          HERO IMAGE
      =================================================== */}

      <div className="relative h-[50vh] w-full overflow-hidden sm:h-[60vh]">
        <img
          src={data.image}
          alt={data.name || data.title}
          className="
            absolute
            inset-0
            h-full
            w-full
            object-cover
          "
        />

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-t
            from-[#0c0a09]
            via-[#0c0a09]/40
            to-transparent
          "
        />

        {/* Back button */}

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="
            absolute
            left-6
            top-6
            z-20
            inline-flex
            cursor-pointer
            items-center
            gap-2
            rounded-full
            border
            border-white/15
            bg-black/40
            px-5
            py-2.5
            text-xs
            font-semibold
            text-white
            backdrop-blur-md
            transition-all
            duration-300
            hover:bg-white/10
          "
        >
          <FiArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>

        {/* Discount badge for offers */}

        {isOffer && (
          <div
            className="
              absolute
              right-6
              top-6
              z-20
              inline-flex
              items-center
              gap-1.5
              rounded-full
              bg-gradient-to-r
              from-emerald-500
              to-emerald-600
              px-4
              py-2
              text-xs
              font-bold
              text-white
              shadow-lg
            "
          >
            <FiPercent className="h-3.5 w-3.5" />
            {data.discount} OFF
          </div>
        )}
      </div>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          -mt-24
          max-w-4xl
          px-6
          pb-20
          sm:px-10
        "
      >
        {/* Title Block */}

        <div className="mb-8">
          {isOffer && (
            <p
              className="
                mb-2
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.2em]
                text-emerald-400
              "
            >
              Limited Time Offer
            </p>
          )}

          {!isOffer && (
            <p
              className="
                mb-2
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.2em]
                text-amber-400
              "
            >
              Top Rated Stay
            </p>
          )}

          <h1
            className="
              font-serif
              text-3xl
              font-bold
              tracking-tight
              text-white
              sm:text-4xl
              lg:text-5xl
            "
          >
            {data.name || data.title}
          </h1>

          <div
            className="
              mt-4
              flex
              flex-wrap
              items-center
              gap-4
              text-sm
              text-stone-400
            "
          >
            <span className="inline-flex items-center gap-1.5">
              <FiMapPin className="h-3.5 w-3.5 text-amber-400" />
              {data.location}
            </span>

            <span className="inline-flex items-center gap-1.5">
              <FiStar className="h-3.5 w-3.5 text-amber-400" />
              {data.rating} / 5
            </span>
          </div>
        </div>

        {/* Price Card */}

        <div
          className="
            mb-10
            rounded-2xl
            border
            border-white/10
            bg-stone-900/60
            px-6
            py-5
            backdrop-blur-md
          "
        >
          <div
            className="
              flex
              flex-col
              items-start
              justify-between
              gap-4
              sm:flex-row
              sm:items-center
            "
          >
            <div>
              <p className="text-xs uppercase tracking-widest text-stone-500">
                {isOffer ? "Offer Price" : "Starting From"}
              </p>

              <div className="mt-1 flex items-baseline gap-2">
                <span
                  className="
                    font-serif
                    text-3xl
                    font-bold
                    text-white
                  "
                >
                  {data.price}
                </span>

                <span className="text-sm text-stone-500">
                  / night
                </span>

                {isOffer && data.originalPrice && (
                  <span className="text-sm text-stone-600 line-through">
                    {data.originalPrice}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              className="
                inline-flex
                cursor-pointer
                items-center
                gap-2
                rounded-xl
                bg-gradient-to-r
                from-amber-500
                to-amber-600
                px-8
                py-3.5
                text-sm
                font-semibold
                text-white
                shadow-[0_0_20px_rgba(245,158,11,0.25)]
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:from-amber-400
                hover:to-amber-500
                hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]
              "
            >
              Book Now
            </button>
          </div>
        </div>

        {/* Description */}

        <div className="mb-10">
          <h2
            className="
              mb-4
              text-lg
              font-semibold
              text-white
            "
          >
            About this {isOffer ? "Offer" : "Stay"}
          </h2>

          <p
            className="
              leading-7
              text-stone-400
            "
          >
            {data.description}
          </p>
        </div>

        {/* Amenities */}

        {data.amenities && data.amenities.length > 0 && (
          <div>
            <h2
              className="
                mb-4
                text-lg
                font-semibold
                text-white
              "
            >
              Amenities
            </h2>

            <div
              className="
                grid
                grid-cols-2
                gap-3
                sm:grid-cols-3
                lg:grid-cols-4
              "
            >
              {data.amenities.map((amenity) => {
                const Icon = amenityIcons[amenity] || FiStar;

                return (
                  <div
                    key={amenity}
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      border
                      border-white/5
                      bg-stone-900/40
                      px-4
                      py-3
                      text-sm
                      text-stone-300
                    "
                  >
                    <Icon className="h-4 w-4 text-amber-400" />
                    {amenity}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Valid Until for offers */}

        {isOffer && data.validUntil && (
          <div
            className="
              mt-8
              rounded-xl
              border
              border-emerald-500/20
              bg-emerald-500/5
              px-5
              py-3
              text-sm
              text-emerald-400
            "
          >
            ⏳ This offer is valid until{" "}
            <strong>{data.validUntil}</strong>
          </div>
        )}
      </div>
    </div>
  );
};

export default StayDetailPage;
