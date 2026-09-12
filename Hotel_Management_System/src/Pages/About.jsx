import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowUpRight,
  FiMail,
  FiHeart,
  FiMapPin,
  FiSun,
  FiUsers,
} from "react-icons/fi";

/* =========================================================
   BACKGROUND
========================================================= */

const PAGE_BACKGROUND =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2400&q=90";

/* =========================================================
   IMAGE DATA
========================================================= */

const aboutImages = [
  {
    src: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=90",
  },
  {
    src: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=90",
  },
  {
    src: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=90",
  },
  {
    src: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=90",
  },
  {
    src: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=90",
  },
];

/* =========================================================
   VALUES
========================================================= */

const VALUES = [
  {
    icon: FiHeart,
    title: "Warm by nature",
    text: "Genuine welcome is in the small things: a familiar smile, an unhurried recommendation and a room prepared with care.",
  },
  {
    icon: FiSun,
    title: "Thoughtfully simple",
    text: "We focus on what makes a stay feel effortless—restful spaces, considered details and service that anticipates rather than interrupts.",
  },
  {
    icon: FiMapPin,
    title: "Rooted in place",
    text: "From local makers to neighbourhood favourites, every ComfyStay is a gentle introduction to the place around it.",
  },
];

/* =========================================================
   ANIMATION DIRECTIONS
========================================================= */

const directions = [
  {
    current: "translateY(-100%)",
    next: "translateY(100%)",
  },
  {
    current: "translateX(100%)",
    next: "translateX(-100%)",
  },
  {
    current: "translateY(100%)",
    next: "translateY(-100%)",
  },
  {
    current: "translateX(-100%)",
    next: "translateX(100%)",
  },
];

/* =========================================================
   GLASS TEXT CONTAINER
========================================================= */

const GlassText = ({ children, className = "" }) => {
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
   ANIMATED IMAGE
========================================================= */

const AnimatedAboutImage = ({ className = "" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  const nextIndex = (currentIndex + 1) % aboutImages.length;

  const direction = directions[currentIndex % directions.length];

  useEffect(() => {
    const waitTimer = setTimeout(() => {
      setAnimating(true);

      const animationTimer = setTimeout(() => {
        setCurrentIndex(nextIndex);
        setAnimating(false);
      }, 1200);

      return () => clearTimeout(animationTimer);
    }, 4000);

    return () => clearTimeout(waitTimer);
  }, [currentIndex, nextIndex]);

  return (
    <div
      className={`
        relative
        w-full
        overflow-hidden
        rounded-2xl
        border
        border-white/15
        bg-black/20
        shadow-2xl
        ${className}
      `}
    >
      {/* BLURRED BACKGROUND */}

      <div className="absolute inset-0">
        <img
          src={aboutImages[currentIndex].src}
          alt=""
          className="
            absolute
            inset-0
            h-full
            w-full
            scale-[1.08]
            object-cover
            blur-[7px]
          "
        />

        <img
          src={aboutImages[nextIndex].src}
          alt=""
          className="
            absolute
            inset-0
            h-full
            w-full
            scale-[1.08]
            object-cover
            blur-[7px]
            transition-transform
            duration-[1200ms]
            ease-[cubic-bezier(.76,0,.24,1)]
          "
          style={{
            transform: animating ? "translate(0,0)" : direction.next,
          }}
        />

        <div className="absolute inset-0 bg-black/25" />
      </div>

      {/* CENTER IMAGE */}

      <div
        className="
          absolute
          left-1/2
          top-1/2
          z-20
          h-[72%]
          w-[42%]
          -translate-x-1/2
          -translate-y-1/2
          overflow-hidden
          rounded-[6px]
          bg-black
          shadow-2xl
        "
      >
        <img
          src={aboutImages[currentIndex].src}
          alt="ComfyStay"
          className="
            absolute
            inset-0
            h-full
            w-full
            object-cover
            transition-transform
            duration-[1200ms]
            ease-[cubic-bezier(.76,0,.24,1)]
          "
          style={{
            transform: animating
              ? direction.current
              : "translate(0,0)",
          }}
        />

        <img
          src={aboutImages[nextIndex].src}
          alt="ComfyStay"
          className="
            absolute
            inset-0
            h-full
            w-full
            object-cover
            transition-transform
            duration-[1200ms]
            ease-[cubic-bezier(.76,0,.24,1)]
          "
          style={{
            transform: animating
              ? "translate(0,0)"
              : direction.next,
          }}
        />
      </div>

      {/* IMAGE OVERLAY */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-30
          bg-gradient-to-t
          from-black/40
          via-transparent
          to-black/10
        "
      />

      {/* COUNTER */}

      <div
        className="
          absolute
          right-4
          top-4
          z-40
          rounded-full
          border
          border-white/20
          bg-black/20
          px-3
          py-1.5
          backdrop-blur-md
        "
      >
        <span className="font-mono text-[10px] text-white/90">
          {String(currentIndex + 1).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
};

/* =========================================================
   ABOUT PAGE
========================================================= */

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <style>{`
        html::-webkit-scrollbar, body::-webkit-scrollbar {
          display: none;
        }
        html, body {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* =====================================================
          FIXED FULL PAGE BACKGROUND
      ===================================================== */}

      <div className="fixed inset-0 -z-20">
        <img
          src={PAGE_BACKGROUND}
          alt=""
          className="
            h-full
            w-full
            object-cover
            object-center
            blur-[2px]
            scale-[1.02]
          "
        />

        {/* Dark transparent layer */}
        <div className="absolute inset-0 bg-black/35" />

        {/* Subtle cinematic gradient */}
        <div
          className="
            absolute
            inset-0
            bg-gradient-to-b
            from-black/25
            via-black/10
            to-black/45
          "
        />
      </div>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden bg-transparent lg:min-h-screen">

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
            sm:gap-14
            sm:px-10
            sm:pb-20
            sm:pt-32
            lg:min-h-screen
            lg:grid-cols-12
            lg:gap-10
            lg:px-16
            lg:pb-24
            lg:pt-40
          "
        >

          {/* =================================================
              LEFT TEXT
          ================================================= */}

          <div className="lg:col-span-7 lg:pr-12">

            <GlassText className="max-w-3xl p-6 sm:p-9 lg:p-11">

              <p
                className="
                  mb-4
                  sm:mb-6
                  flex
                  items-center
                  gap-3
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-amber-400
                "
              >
                <span className="h-px w-9 bg-amber-400/70" />

                Our story
              </p>

              <h1
                className="
                  font-serif
                  text-4xl
                  font-medium
                  leading-[1.02]
                  tracking-[-0.035em]
                  text-white
                  sm:text-6xl
                  lg:text-7xl
                "
              >
                A stay that feels like it was made for you.
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
                ComfyStay is a collection of considered spaces for people who
                value the comfort of home and the quiet pleasure of being
                looked after.
              </p>

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
                <a
                  href="mailto:hello@comfystay.com"
                  className="
                    group
                    inline-flex
                    items-center
                    justify-center
                    gap-3
                    rounded-xl
                    bg-gradient-to-r
                    from-amber-500
                    to-amber-600
                    px-6
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
                  <FiMail className="h-4 w-4" />
                  Get in touch
                </a>

                <button
                  type="button"
                  onClick={() => navigate("/rooms")}
                  className="
                    group
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-white/20
                    bg-white/5
                    px-6
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
                  Browse rooms
                  <FiArrowUpRight
                    className="
                      h-4
                      w-4
                      transition-transform
                      duration-300
                      group-hover:translate-x-0.5
                      group-hover:-translate-y-0.5
                    "
                  />
                </button>
              </div>

            </GlassText>

          </div>

          {/* =================================================
              IMAGE
          ================================================= */}

          <div
            className="
              relative
              order-first
              mx-auto
              w-full
              max-w-md
              lg:order-none
              lg:col-span-5
              lg:max-w-none
            "
          >
            <AnimatedAboutImage className="aspect-[4/3] sm:aspect-[4/5]" />
          </div>

        </div>
      </section>

      {/* =====================================================
          VALUES
      ===================================================== */}

      <section
        className="
          relative
          bg-transparent
          px-4
          py-10
          sm:px-10
          sm:py-20
          lg:px-16
          lg:py-28
        "
      >

        <div className="mx-auto max-w-7xl">

          <div className="grid gap-4 sm:gap-10 lg:grid-cols-12 lg:gap-8">

            {/* LEFT */}

            <div className="lg:col-span-4">

              <GlassText className="p-6 sm:p-9">

                <p
                  className="
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-[0.2em]
                    text-amber-400
                  "
                >
                  What guides us
                </p>

                <h2
                  className="
                    mt-3
                    font-serif
                    text-3xl
                    sm:mt-5
                    leading-tight
                    tracking-[-0.025em]
                    text-white
                    sm:text-5xl
                  "
                >
                  Hospitality,{" "}
                  <span className="italic text-white/70">
                    with heart.
                  </span>
                </h2>

              </GlassText>

            </div>

            {/* RIGHT */}

            <div className="lg:col-span-8">

              <GlassText className="p-6 sm:p-9">

                <p
                  className="
                    max-w-2xl
                    text-base
                    leading-7
                    text-white/85
                    sm:text-xl
                    sm:leading-9
                  "
                >
                  We believe the best hospitality is felt, not announced. It
                  is the calm of arriving somewhere beautiful, the ease of
                  knowing what you need is close at hand, and the freedom to
                  make the day entirely your own.
                </p>

              </GlassText>

            </div>

          </div>

          {/* VALUE CARDS */}

          <div
            className="
              mt-6
              grid
              grid-cols-2
              gap-3
              sm:mt-16
              sm:gap-6
              md:grid-cols-3
              lg:gap-8
            "
          >

            {/* Phone: 2 per row, the last card spans the full row */}

            {VALUES.map(({ icon: Icon, title, text }, index) => (
              <article
                key={title}
                className={`
                  group
                  rounded-2xl
                  border
                  border-white/15
                  bg-black/35
                  p-4
                  backdrop-blur-xl
                  backdrop-saturate-150
                  shadow-[0_20px_60px_rgba(0,0,0,0.18)]
                  transition-all
                  duration-500
                  sm:hover:-translate-y-1
                  hover:border-amber-500/40
                  hover:bg-black/40
                  sm:p-8
                  ${index === VALUES.length - 1 ? "col-span-2 md:col-span-1" : ""}
                `}
              >

                <span
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-amber-500/30
                    bg-amber-500/10
                    text-amber-400
                    sm:h-10
                    sm:w-10
                  "
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </span>

                <h3
                  className="
                    mt-4
                    font-serif
                    text-lg
                    leading-snug
                    text-white
                    sm:mt-7
                    sm:text-2xl
                  "
                >
                  {title}
                </h3>

                <p
                  className="
                    mt-2
                    text-xs
                    leading-5
                    text-white/75
                    sm:mt-3
                    sm:max-w-xs
                    sm:text-sm
                    sm:leading-6
                  "
                >
                  {text}
                </p>

              </article>
            ))}

          </div>

        </div>

      </section>

      {/* =====================================================
          PROMISE
      ===================================================== */}

      <section className="relative border-y border-white/10 bg-transparent">

        <div
          className="
            mx-auto
            grid
            max-w-7xl
            gap-4
            px-4
            py-10
            sm:gap-12
            sm:px-10
            sm:py-20
            lg:grid-cols-2
            lg:items-end
            lg:gap-20
            lg:px-16
            lg:py-24
          "
        >

          {/* LEFT */}

          <GlassText className="p-6 sm:p-9">

            <p
              className="
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.2em]
                text-amber-400
              "
            >
              Our promise
            </p>

            <h2
              className="
                mt-3
                font-serif
                text-3xl
                sm:mt-5
                leading-tight
                tracking-[-0.025em]
                text-white
                sm:text-5xl
              "
            >
              The right balance of privacy and presence.
            </h2>

          </GlassText>

          {/* RIGHT */}

          <GlassText
            className="
              border-l-2
              border-l-amber-500/50
              p-6
              sm:p-9
            "
          >

            <p
              className="
                font-serif
                text-xl
                leading-8
                text-white/85
                sm:text-3xl
                sm:leading-10
              "
            >
              "Come in, exhale, and let us take care of the rest."
            </p>

            <div
              className="
                mt-6
                flex
                items-center
                gap-3
                text-sm
                text-white/65
              "
            >
              <FiUsers className="h-4 w-4 text-amber-400" />

              The ComfyStay team
            </div>

          </GlassText>

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
          pt-10
          text-center
          sm:px-10
          sm:py-20
          lg:px-16
          lg:py-28
        "
      >

        <GlassText className="mx-auto max-w-4xl p-6 sm:p-12 lg:p-16">

          <p
            className="
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.2em]
              text-amber-400
            "
          >
            Your next chapter
          </p>

          <h2
            className="
              mx-auto
              mt-4
              max-w-2xl
              font-serif
              text-3xl
              sm:mt-5
              leading-tight
              tracking-[-0.025em]
              text-white
              sm:text-5xl
            "
          >
            Make yourself at home,{" "}
            <span className="italic text-white/70">
              wherever you go.
            </span>
          </h2>

          <div
            className="
              mt-7
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
              Find your stay
              <FiArrowUpRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => navigate("/services")}
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
              Our services
              <FiArrowUpRight className="h-4 w-4" />
            </button>
          </div>

        </GlassText>

      </section>

    </div>
  );
};

export default About;