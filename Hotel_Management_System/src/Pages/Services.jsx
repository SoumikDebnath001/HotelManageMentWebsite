import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowUpRight,
  FiArrowDown,
  FiStar,
  FiCoffee,
  FiDroplet,
  FiSun,
  FiUsers,
  FiHeart,
  FiCheck,
} from "react-icons/fi";
import Traveler from "../assets/ServicesPage/Traveler.svg";

/* =========================================================
   SERVICES DATA
========================================================= */

const services = [
  {
    icon: FiStar,
    title: "Luxury Rooms & Suites",
    description:
      "Spacious, beautifully designed rooms and premium suites with stunning views, plush bedding, and every modern amenity you could wish for.",
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80",
  },
  {
    icon: FiCoffee,
    title: "Fine Dining & Cuisine",
    description:
      "From farm-to-table breakfasts to candlelit dinners, our award-winning chefs create dishes that celebrate local flavours and international excellence.",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80",
  },
  {
    icon: FiDroplet,
    title: "Spa & Wellness",
    description:
      "Restore mind and body with signature treatments, thermal pools, and holistic wellness programs designed around your personal needs.",
    image:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80",
  },
  {
    icon: FiSun,
    title: "Pool & Fitness",
    description:
      "Infinity pools overlooking stunning landscapes, fully equipped fitness centres, and sunrise yoga sessions to energise your day.",
    image:
      "https://images.unsplash.com/photo-1540202404-a2f29016b523?auto=format&fit=crop&w=900&q=80",
  },
  {
    icon: FiUsers,
    title: "Events & Celebrations",
    description:
      "Intimate weddings, corporate retreats, or milestone celebrations — our dedicated events team creates unforgettable experiences.",
    image:
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=900&q=80",
  },
  {
    icon: FiHeart,
    title: "24/7 Concierge",
    description:
      "From airport transfers to restaurant reservations and local adventures, our concierge team is here around the clock to make every moment special.",
    image:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=900&q=80",
  },
];

/* =========================================================
   HIGHLIGHTS
========================================================= */

const highlights = [
  { number: "200+", label: "Luxury Rooms" },
  { number: "15+", label: "Award-Winning Chefs" },
  { number: "50+", label: "Spa Treatments" },
  { number: "98%", label: "Guest Satisfaction" },
];

const differences = [
  "Personally curated experiences for every guest",
  "Locally sourced ingredients in every meal",
  "Sustainable practices woven into every detail",
];

/* =========================================================
   BACKGROUND
========================================================= */

const PAGE_BACKGROUND =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2400&q=90";

/* =========================================================
   GLASS PANEL
========================================================= */

const GlassPanel = ({ children, className = "" }) => {
  return (
    <div
      className={`
        rounded-3xl
        border border-white/15
        bg-black/35
        backdrop-blur-xl
        backdrop-saturate-150
        shadow-[0_20px_70px_rgba(0,0,0,0.25)]
        ${className}
      `}
    >
      {children}
    </div>
  );
};

/* =========================================================
   EYEBROW
========================================================= */

const Eyebrow = ({ children, className = "" }) => (
  <p
    className={`
      flex
      items-center
      gap-3
      text-[11px]
      font-semibold
      uppercase
      tracking-[0.2em]
      text-amber-400
      ${className}
    `}
  >
    <span className="h-px w-8 bg-amber-400/70" />
    {children}
  </p>
);

/* =========================================================
   SERVICES PAGE
========================================================= */

const Services = () => {
  const navigate = useNavigate();

  /* =======================================================
     HIDE SCROLLBAR
  ======================================================= */

  useEffect(() => {
    const style = document.createElement("style");

    style.innerHTML = `
      html {
        scrollbar-width: none;
      }

      body {
        scrollbar-width: none;
      }

      html::-webkit-scrollbar,
      body::-webkit-scrollbar {
        display: none;
        width: 0;
        height: 0;
      }
    `;

    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const scrollToServices = () => {
    document
      .getElementById("our-services")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-white">

      {/* =====================================================
          FIXED PARALLAX BACKGROUND
      ===================================================== */}

      <div className="fixed inset-0 -z-30">

        <img
          src={PAGE_BACKGROUND}
          alt=""
          className="
            absolute
            inset-0
            h-full
            w-full
            scale-[1.08]
            object-cover
            object-center
            will-change-transform
            blur-[2px]
          "
        />

        <div className="absolute inset-0 bg-black/45" />

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-b
            from-black/30
            via-black/10
            to-black/60
          "
        />
      </div>

      {/* =====================================================
          HERO
          Phone: illustration on top, text below.
          Desktop: text left, illustration right.
      ===================================================== */}

      <section
        className="
          relative
          overflow-hidden
          bg-transparent
          lg:min-h-screen
        "
      >

        <div
          className="
            relative
            z-10
            mx-auto
            grid
            w-full
            max-w-7xl
            items-center
            gap-6
            px-4
            pb-10
            pt-24
            sm:gap-10
            sm:px-10
            sm:pb-16
            sm:pt-32
            lg:min-h-screen
            lg:grid-cols-2
            lg:gap-16
            lg:px-16
            lg:pb-20
          "
        >

          {/* =================================================
              HERO TEXT
          ================================================= */}

          <div className="relative z-20">

            <GlassPanel
              className="
                max-w-3xl
                p-6
                sm:p-10
                lg:p-12
              "
            >

              <Eyebrow className="mb-4 sm:mb-5">Our Services</Eyebrow>

              <h1
                className="
                  max-w-3xl
                  font-serif
                  text-4xl
                  leading-[1.02]
                  font-medium
                  tracking-[-0.035em]
                  text-white
                  sm:text-6xl
                  lg:text-7xl
                "
              >
                Exceptional experiences,{" "}
                <span className="italic text-white/75">
                  crafted for you.
                </span>
              </h1>

              <p
                className="
                  mt-5
                  max-w-xl
                  text-[15px]
                  leading-7
                  text-white/85
                  sm:mt-7
                  sm:text-lg
                  sm:leading-8
                "
              >
                Every service at ComfyStay is designed around a single idea:
                making your stay feel effortless, personal, and extraordinary.
              </p>

              {/* HERO ACTIONS */}

              <div
                className="
                  mt-7
                  flex
                  flex-col
                  gap-3
                  sm:mt-9
                  sm:flex-row
                "
              >
                <button
                  type="button"
                  onClick={() => navigate("/rooms")}
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-gradient-to-r
                    from-amber-500
                    to-amber-600
                    px-7
                    py-3.5
                    text-sm
                    font-semibold
                    text-white
                    shadow-[0_0_25px_rgba(245,158,11,0.3)]
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:from-amber-400
                    hover:to-amber-500
                  "
                >
                  Book a room
                  <FiArrowUpRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={scrollToServices}
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-white/20
                    bg-white/5
                    px-7
                    py-3.5
                    text-sm
                    font-semibold
                    text-white
                    backdrop-blur-md
                    transition-all
                    duration-300
                    hover:border-amber-500/50
                    hover:bg-white/10
                    hover:text-amber-300
                  "
                >
                  Explore services
                  <FiArrowDown className="h-4 w-4" />
                </button>
              </div>

            </GlassPanel>

          </div>

          {/* =================================================
              TRAVELER SVG — first on phone, right on desktop
          ================================================= */}

          <div
            className="
              relative
              order-first
              flex
              items-center
              justify-center
              py-4
              sm:py-0
              lg:order-none
              lg:min-h-[620px]
            "
          >

            {/* Soft glow */}

            <div
              className="
                absolute
                h-[220px]
                w-[220px]
                rounded-full
                bg-amber-400/10
                blur-[80px]
                sm:h-[320px]
                sm:w-[320px]
                sm:blur-[100px]
              "
            />

            {/* Glass circle */}

            <div
              className="
                absolute
                h-[270px]
                w-[270px]
                rounded-full
                border
                border-white/10
                bg-white/[0.025]
                backdrop-blur-[2px]
                sm:h-[430px]
                sm:w-[430px]
              "
            />

            {/* Traveler illustration */}

            <img
              src={Traveler}
              alt="Traveler exploring world landmarks"
              className="
                relative
                z-10
                w-full
                max-w-[240px]
                object-contain
                drop-shadow-[0_30px_60px_rgba(0,0,0,0.45)]
                transition-transform
                duration-700
                hover:scale-[1.03]
                sm:max-w-[400px]
                lg:max-w-[500px]
              "
            />

          </div>

        </div>
      </section>

      {/* =====================================================
          HIGHLIGHTS
      ===================================================== */}

      <section
        className="
          relative
          bg-transparent
          px-4
          py-6
          sm:px-10
          sm:py-12
          lg:px-16
        "
      >

        <div className="mx-auto max-w-7xl">

          <GlassPanel className="p-5 sm:p-9 lg:p-10">

            <div
              className="
                grid
                grid-cols-2
                gap-x-4
                gap-y-6
                sm:gap-8
                lg:grid-cols-4
                lg:gap-12
              "
            >

              {highlights.map(({ number, label }, index) => (
                <div
                  key={label}
                  className={`
                    text-center
                    lg:border-white/10
                    ${index > 0 ? "lg:border-l" : ""}
                  `}
                >

                  <p
                    className="
                      font-serif
                      text-3xl
                      font-bold
                      text-amber-400
                      sm:text-4xl
                    "
                  >
                    {number}
                  </p>

                  <p
                    className="
                      mt-1.5
                      text-[10px]
                      font-medium
                      uppercase
                      tracking-[0.15em]
                      text-white/70
                      sm:text-xs
                    "
                  >
                    {label}
                  </p>

                </div>
              ))}

            </div>

          </GlassPanel>

        </div>
      </section>

      {/* =====================================================
          SERVICES GRID
      ===================================================== */}

      <section
        id="our-services"
        className="
          relative
          scroll-mt-20
          bg-transparent
          px-4
          py-12
          sm:px-10
          sm:py-20
          lg:px-16
          lg:py-28
        "
      >

        <div className="mx-auto max-w-7xl">

          {/* SECTION HEADER */}

          <div
            className="
              mb-8
              flex
              flex-col
              justify-between
              gap-4
              sm:mb-14
              lg:flex-row
              lg:items-end
              lg:gap-6
            "
          >

            <div>
              <Eyebrow className="mb-3 sm:mb-4">What We Offer</Eyebrow>

              <h2
                className="
                  max-w-xl
                  font-serif
                  text-3xl
                  leading-tight
                  tracking-[-0.025em]
                  text-white
                  drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]
                  sm:text-5xl
                "
              >
                Services designed around
                <span className="italic text-white/75">
                  {" "}your comfort.
                </span>
              </h2>
            </div>

            <p
              className="
                max-w-md
                text-sm
                leading-7
                text-white/80
                drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]
                lg:text-right
              "
            >
              From the moment you arrive to the moment you leave,
              every detail is crafted to ensure an unforgettable
              experience.
            </p>

          </div>

          {/* SERVICE CARDS — 2 per row on phone, 3 on desktop */}

          <div
            className="
              grid
              grid-cols-2
              gap-3
              sm:gap-6
              lg:grid-cols-3
              lg:gap-8
            "
          >

            {services.map(
              ({ icon: Icon, title, description, image }) => (
                <article
                  key={title}
                  className="
                    group
                    relative
                    flex
                    flex-col
                    overflow-hidden
                    rounded-2xl
                    border
                    border-white/15
                    bg-black/40
                    backdrop-blur-xl
                    backdrop-saturate-150
                    shadow-[0_20px_60px_rgba(0,0,0,0.25)]
                    transition-all
                    duration-500
                    sm:rounded-3xl
                    sm:hover:-translate-y-2
                    sm:hover:border-amber-500/40
                    sm:hover:shadow-[0_25px_70px_rgba(0,0,0,0.35)]
                  "
                >

                  {/* IMAGE */}

                  <div className="relative h-28 overflow-hidden sm:h-56">

                    <img
                      src={image}
                      alt={title}
                      loading="lazy"
                      decoding="async"
                      className="
                        h-full
                        w-full
                        object-cover
                        transition-transform
                        duration-700
                        group-hover:scale-110
                      "
                    />

                    <div
                      className="
                        absolute
                        inset-0
                        bg-gradient-to-t
                        from-black/70
                        via-black/10
                        to-transparent
                      "
                    />

                    {/* ICON */}

                    <div
                      className="
                        absolute
                        bottom-2.5
                        left-3
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-amber-400/40
                        bg-black/40
                        text-amber-400
                        backdrop-blur-xl
                        sm:bottom-4
                        sm:left-5
                        sm:h-11
                        sm:w-11
                        sm:rounded-xl
                      "
                    >
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>

                  </div>

                  {/* CONTENT */}

                  <div className="flex-1 p-3.5 sm:p-7">

                    <h3
                      className="
                        font-serif
                        text-[15px]
                        font-medium
                        leading-snug
                        text-white
                        sm:text-xl
                      "
                    >
                      {title}
                    </h3>

                    <p
                      className="
                        mt-1.5
                        line-clamp-3
                        text-xs
                        leading-5
                        text-white/70
                        sm:mt-3
                        sm:line-clamp-none
                        sm:text-sm
                        sm:leading-6
                      "
                    >
                      {description}
                    </p>

                  </div>

                </article>
              )
            )}

          </div>

        </div>
      </section>

      {/* =====================================================
          EXPERIENCE SECTION
      ===================================================== */}

      <section
        className="
          relative
          overflow-hidden
          bg-transparent
          px-4
          py-12
          sm:px-10
          sm:py-20
          lg:px-16
          lg:py-28
        "
      >

        <div className="mx-auto max-w-7xl">

          <div className="relative overflow-hidden rounded-3xl">

            {/* BACKGROUND IMAGE */}

            <img
              src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1800&q=90"
              alt="Hotel interior"
              loading="lazy"
              className="
                absolute
                inset-0
                h-full
                w-full
                object-cover
                transition-transform
                duration-[1200ms]
                hover:scale-105
              "
            />

            <div
              className="
                absolute
                inset-0
                bg-black/45
                backdrop-blur-[1px]
              "
            />

            {/* CONTENT */}

            <div
              className="
                relative
                z-10
                grid
                items-center
                sm:min-h-[560px]
                lg:min-h-[600px]
                lg:grid-cols-2
              "
            >

              <GlassPanel
                className="
                  m-4
                  p-6
                  sm:m-10
                  sm:p-10
                  lg:m-14
                  lg:p-12
                "
              >

                <Eyebrow className="mb-4 sm:mb-5">The ComfyStay difference</Eyebrow>

                <h2
                  className="
                    font-serif
                    text-3xl
                    leading-tight
                    tracking-[-0.025em]
                    text-white
                    sm:text-5xl
                  "
                >
                  Hospitality that feels personal.
                </h2>

                <p
                  className="
                    mt-4
                    max-w-lg
                    text-[15px]
                    leading-7
                    text-white/80
                    sm:mt-6
                    sm:text-base
                    sm:leading-8
                  "
                >
                  We believe the best hospitality is felt, not announced.
                  It is the calm of arriving somewhere beautiful, the ease
                  of knowing what you need is close at hand, and the freedom
                  to make the day entirely your own.
                </p>

                <ul className="mt-6 space-y-4 sm:mt-8 sm:space-y-5">

                  {differences.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3"
                    >

                      <span
                        className="
                          mt-0.5
                          flex
                          h-5
                          w-5
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-amber-500/20
                          text-amber-400
                        "
                      >
                        <FiCheck className="h-3 w-3" strokeWidth={3} />
                      </span>

                      <p className="text-sm leading-6 text-white/80">
                        {item}
                      </p>

                    </li>
                  ))}

                </ul>

              </GlassPanel>

            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          CTA
      ===================================================== */}

      <section
        className="
          relative
          bg-transparent
          px-4
          pb-16
          pt-4
          sm:px-10
          sm:py-20
          lg:px-16
          lg:py-28
        "
      >

        <div className="mx-auto max-w-4xl">

          <GlassPanel
            className="
              p-6
              text-center
              sm:p-12
              lg:p-16
            "
          >

            <p
              className="
                mb-4
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.2em]
                text-amber-400
                sm:mb-5
              "
            >
              Ready to experience luxury?
            </p>

            <h2
              className="
                mx-auto
                max-w-2xl
                font-serif
                text-3xl
                leading-tight
                tracking-[-0.025em]
                text-white
                sm:text-5xl
              "
            >
              Your perfect stay is just a click away.
            </h2>

            <p
              className="
                mx-auto
                mt-4
                max-w-lg
                text-sm
                leading-7
                text-white/75
                sm:mt-5
              "
            >
              Browse our collection of rooms and suites, or reach out
              to our team to plan something truly special.
            </p>

            <div
              className="
                mt-8
                flex
                flex-col
                justify-center
                gap-3
                sm:mt-10
                sm:flex-row
              "
            >

              <button
                type="button"
                onClick={() => navigate("/rooms")}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-gradient-to-r
                  from-amber-500
                  to-amber-600
                  px-8
                  py-4
                  text-sm
                  font-semibold
                  text-white
                  shadow-[0_0_25px_rgba(245,158,11,0.3)]
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:from-amber-400
                  hover:to-amber-500
                "
              >
                Browse rooms

                <FiArrowUpRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate("/about")}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-white/15
                  bg-white/5
                  px-8
                  py-4
                  text-sm
                  font-semibold
                  text-white
                  backdrop-blur-md
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:border-amber-500/50
                  hover:bg-white/10
                  hover:text-amber-300
                "
              >
                About ComfyStay

                <FiArrowUpRight className="h-4 w-4" />
              </button>

            </div>

          </GlassPanel>

        </div>

      </section>

    </div>
  );
};

export default Services;
