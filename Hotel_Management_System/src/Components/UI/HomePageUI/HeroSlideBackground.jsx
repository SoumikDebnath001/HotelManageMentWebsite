import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiStar, FiMapPin, FiPercent, FiChevronLeft, FiChevronRight, FiArrowUpRight } from "react-icons/fi";
import HeroSlide1 from "../../../assets/Homepage/HeroSlide1.png";
import HeroSlide2 from "../../../assets/Homepage/HeroSlide2.png";
import HeroSlide3 from "../../../assets/Homepage/HeroSlide3.png";

/* =========================================================
   TOP 10 HOME STAYS — DUMMY DATA
========================================================= */

const topStays = [
  {
    id: 1,
    name: "Sunset Villa Bali",
    location: "Ubud, Bali",
    rating: 4.9,
    price: "$280",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
    description: "A breathtaking villa nestled in the heart of Ubud's rice terraces. Features an infinity pool overlooking the lush valley, traditional Balinese architecture with modern amenities, and private garden pavilions perfect for romantic getaways.",
    amenities: ["Free Wi-Fi", "Pool", "Spa", "Breakfast", "Ocean View"],
  },
  {
    id: 2,
    name: "Mountain Retreat Lodge",
    location: "Shimla, India",
    rating: 4.8,
    price: "$150",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80",
    description: "Escape to the misty mountains of Shimla in this charming colonial-style lodge. Surrounded by deodar forests, enjoy crackling fireplaces, locally sourced cuisine, and panoramic views of the Himalayan foothills.",
    amenities: ["Free Wi-Fi", "Breakfast", "Room Service", "Parking"],
  },
  {
    id: 3,
    name: "Beachfront Cabana",
    location: "Maldives",
    rating: 5.0,
    price: "$450",
    image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=600&q=80",
    description: "Wake up to turquoise waters lapping beneath your overwater cabana. This Maldivian paradise offers glass-floor panels, direct ocean access, a private sundeck, and world-class snorkeling right from your doorstep.",
    amenities: ["Pool", "Spa", "Ocean View", "Breakfast", "Free Wi-Fi"],
  },
  {
    id: 4,
    name: "Tuscan Farmhouse",
    location: "Florence, Italy",
    rating: 4.7,
    price: "$320",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80",
    description: "A lovingly restored 18th-century farmhouse surrounded by olive groves and vineyards in the Tuscan countryside. Enjoy authentic Italian cooking classes, wine tastings, and lazy afternoons by the stone-edged pool.",
    amenities: ["Pool", "Breakfast", "Parking", "Free Wi-Fi"],
  },
  {
    id: 5,
    name: "Lakeside Chalet",
    location: "Interlaken, Switzerland",
    rating: 4.9,
    price: "$380",
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=600&q=80",
    description: "Perched on the shores of Lake Brienz, this Alpine chalet offers floor-to-ceiling windows framing the Jungfrau massif. Cozy interiors with handcrafted wood furnishings and a private hot tub on the terrace.",
    amenities: ["Free Wi-Fi", "Spa", "Room Service", "Breakfast"],
  },
  {
    id: 6,
    name: "Desert Oasis Riad",
    location: "Marrakech, Morocco",
    rating: 4.6,
    price: "$190",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80",
    description: "Step through ornate wooden doors into a serene courtyard riad with a central mosaic fountain. Traditional zellige tilework, rooftop terraces with Atlas Mountain views, and authentic Moroccan hammam experience.",
    amenities: ["Spa", "Breakfast", "Free Wi-Fi", "Room Service"],
  },
  {
    id: 7,
    name: "Tropical Treehouse",
    location: "Costa Rica",
    rating: 4.8,
    price: "$210",
    image: "https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&w=600&q=80",
    description: "An elevated retreat hidden in the Costa Rican canopy. This eco-luxury treehouse features open-air showers, wildlife spotting from your private deck, and a suspension bridge connecting you to the rainforest spa.",
    amenities: ["Free Wi-Fi", "Spa", "Breakfast", "Pool"],
  },
  {
    id: 8,
    name: "Fjord Glass Cabin",
    location: "Tromsø, Norway",
    rating: 4.9,
    price: "$340",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=600&q=80",
    description: "A stunning glass-walled cabin on the edge of a Norwegian fjord. Watch the Northern Lights from your bed, enjoy midnight sun hikes, and relax in the wood-fired sauna with icy fjord plunges.",
    amenities: ["Free Wi-Fi", "Ocean View", "Breakfast", "Spa"],
  },
  {
    id: 9,
    name: "Heritage Haveli",
    location: "Jaipur, India",
    rating: 4.7,
    price: "$130",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=80",
    description: "A magnificently restored Rajasthani haveli in the Pink City. Intricate jali screens, courtyard dining under the stars, rooftop pool overlooking Nahargarh Fort, and curated heritage walking tours.",
    amenities: ["Pool", "Breakfast", "Free Wi-Fi", "Room Service", "Parking"],
  },
  {
    id: 10,
    name: "Cliffside Sanctuary",
    location: "Santorini, Greece",
    rating: 5.0,
    price: "$420",
    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=80",
    description: "Cave-carved luxury suites in Oia with iconic blue-dome views. Private plunge pool, caldera sunset terraces, and a wine cellar carved into volcanic rock. The quintessential Greek island experience.",
    amenities: ["Pool", "Ocean View", "Breakfast", "Free Wi-Fi", "Spa"],
  },
];

/* =========================================================
   TOP 10 OFFERS — DUMMY DATA
========================================================= */

const topOffers = [
  {
    id: 1,
    title: "Monsoon Escape Package",
    location: "Munnar, India",
    rating: 4.8,
    price: "$89",
    originalPrice: "$160",
    discount: "45%",
    image: "https://images.unsplash.com/photo-1540202404-a2f29016b523?auto=format&fit=crop&w=600&q=80",
    description: "Experience the magic of monsoon in Kerala's tea country. This exclusive package includes guided plantation walks, Ayurvedic spa sessions, traditional Kerala cuisine, and complimentary airport transfers.",
    amenities: ["Spa", "Breakfast", "Free Wi-Fi", "Room Service"],
    validUntil: "September 30, 2026",
  },
  {
    id: 2,
    title: "Early Bird Summer Deal",
    location: "Phuket, Thailand",
    rating: 4.7,
    price: "$199",
    originalPrice: "$350",
    discount: "40%",
    image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=600&q=80",
    description: "Book early for the ultimate Phuket summer. Includes oceanfront suite, daily breakfast buffet, two complimentary Thai massages, and a sunset catamaran cruise around Phang Nga Bay.",
    amenities: ["Pool", "Ocean View", "Spa", "Breakfast", "Free Wi-Fi"],
    validUntil: "June 15, 2026",
  },
  {
    id: 3,
    title: "Honeymoon Special",
    location: "Bora Bora, French Polynesia",
    rating: 5.0,
    price: "$550",
    originalPrice: "$900",
    discount: "38%",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
    description: "Celebrate love in the world's most romantic destination. Overwater bungalow with glass floor, couples spa ritual, candlelit beach dinner, and a private lagoon excursion included.",
    amenities: ["Ocean View", "Spa", "Breakfast", "Room Service", "Pool"],
    validUntil: "December 31, 2026",
  },
  {
    id: 4,
    title: "Weekend City Getaway",
    location: "Dubai, UAE",
    rating: 4.6,
    price: "$250",
    originalPrice: "$420",
    discount: "35%",
    image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=600&q=80",
    description: "Two nights in a luxury downtown hotel with Burj Khalifa views. Includes rooftop dining credit, desert safari adventure, and complimentary access to the infinity pool and sky lounge.",
    amenities: ["Pool", "Gym", "Breakfast", "Free Wi-Fi", "Room Service"],
    validUntil: "October 15, 2026",
  },
  {
    id: 5,
    title: "Winter Wonderland",
    location: "Zermatt, Switzerland",
    rating: 4.9,
    price: "$320",
    originalPrice: "$500",
    discount: "36%",
    image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=600&q=80",
    description: "Ski-in ski-out chalet with Matterhorn views. Includes ski pass, equipment rental, fondue dinner experience, and après-ski spa access with outdoor hot spring pools.",
    amenities: ["Spa", "Breakfast", "Free Wi-Fi", "Parking"],
    validUntil: "March 31, 2027",
  },
  {
    id: 6,
    title: "Wellness Detox Retreat",
    location: "Rishikesh, India",
    rating: 4.8,
    price: "$120",
    originalPrice: "$220",
    discount: "45%",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80",
    description: "A transformative 3-night wellness program by the Ganges. Daily yoga and meditation, Ayurvedic consultation, detox meals, sound healing sessions, and river rafting adventure included.",
    amenities: ["Spa", "Breakfast", "Free Wi-Fi", "Gym"],
    validUntil: "November 30, 2026",
  },
  {
    id: 7,
    title: "Family Fun Package",
    location: "Orlando, USA",
    rating: 4.5,
    price: "$180",
    originalPrice: "$300",
    discount: "40%",
    image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80",
    description: "Family suite with kids' play zone, complimentary theme park shuttle, daily breakfast for 4, evening poolside BBQ, and a surprise welcome gift bag for little ones.",
    amenities: ["Pool", "Breakfast", "Free Wi-Fi", "Parking", "Gym"],
    validUntil: "August 31, 2026",
  },
  {
    id: 8,
    title: "Safari & Stay",
    location: "Maasai Mara, Kenya",
    rating: 4.9,
    price: "$400",
    originalPrice: "$650",
    discount: "38%",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80",
    description: "Luxury tented camp in the heart of the savanna. Two game drives daily, bush breakfast, sundowner cocktails, Maasai cultural visit, and a hot air balloon safari over the Great Migration.",
    amenities: ["Breakfast", "Room Service", "Free Wi-Fi"],
    validUntil: "January 15, 2027",
  },
  {
    id: 9,
    title: "Art & Culture Break",
    location: "Paris, France",
    rating: 4.7,
    price: "$270",
    originalPrice: "$430",
    discount: "37%",
    image: "https://images.unsplash.com/photo-1594563703937-fdc640497dcd?auto=format&fit=crop&w=600&q=80",
    description: "Boutique hotel in Le Marais with Louvre skip-the-line passes, private Seine dinner cruise, macaron-making workshop, and a curated art gallery walking tour with a local expert.",
    amenities: ["Breakfast", "Free Wi-Fi", "Room Service"],
    validUntil: "July 31, 2026",
  },
  {
    id: 10,
    title: "Island Hopping Deal",
    location: "Mykonos, Greece",
    rating: 4.8,
    price: "$310",
    originalPrice: "$480",
    discount: "35%",
    image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=600&q=80",
    description: "Stay at a clifftop villa and explore the Cyclades. Package includes ferry passes to Delos and Naxos, sunset yacht cruise, beach club day pass, and authentic Greek cooking class.",
    amenities: ["Pool", "Ocean View", "Breakfast", "Free Wi-Fi"],
    validUntil: "September 15, 2026",
  },
];

/* =========================================================
   SLIDE DATA
========================================================= */

const slides = [
  {
    title: "",
    eyebrow: "",
    hero: HeroSlide1,

    surrounding: [
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=80",
    ],
  },

  {
    title: "",
    eyebrow: "",
    contentType: "topStays",
    hero: HeroSlide2,

    surrounding: [
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1594563703937-fdc640497dcd?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=900&q=80",
    ],
  },

  {
    title: "",
    eyebrow: "",
    contentType: "topOffers",
    hero: HeroSlide3,

    surrounding: [
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1540202404-a2f29016b523?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=900&q=80",
    ],
  },
];

/* =========================================================
   HELPERS
========================================================= */

const clamp = (value, min = 0, max = 1) =>
  Math.min(Math.max(value, min), max);

const lerp = (start, end, progress) =>
  start + (end - start) * progress;

const smooth = (value) => {
  value = clamp(value);
  return value * value * (3 - 2 * value);
};

/* =========================================================
   COMPONENT
========================================================= */

const HeroSlideBackground = () => {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const stickyRef = useRef(null);
  const centerRef = useRef(null);

  const animationRef = useRef(null);
  const isAnimatingRef = useRef(false);
  const scrollTickingRef = useRef(false);

  const [progress, setProgress] = useState(0);

  /*
    Viewport size + center cell rect.

    Measured once on mount and on resize
    instead of calling getBoundingClientRect
    on every render / every scroll event.
  */

  const [layout, setLayout] = useState({
    width:
      typeof window !== "undefined"
        ? window.innerWidth
        : 1920,

    height:
      typeof window !== "undefined"
        ? window.innerHeight
        : 1080,

    center: null,
  });

  /* ========================================================
     HIDE SCROLLBAR
  ======================================================== */

  useEffect(() => {
    const style = document.createElement("style");

    style.innerHTML = `
      html {
        scrollbar-width: none;
        -ms-overflow-style: none;
      }

      html::-webkit-scrollbar {
        display: none;
        width: 0;
        height: 0;
      }

      body {
        scrollbar-width: none;
        -ms-overflow-style: none;
      }

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

  /* ========================================================
     GET CURRENT PROGRESS
  ======================================================== */

  const getProgress = () => {
    if (!sectionRef.current) {
      return 0;
    }

    const section =
      sectionRef.current;

    const rect =
      section.getBoundingClientRect();

    const distance =
      section.offsetHeight -
      window.innerHeight;

    if (distance <= 0) {
      return 0;
    }

    return clamp(
      -rect.top / distance,
      0,
      1
    );
  };

  /* ========================================================
     UPDATE PROGRESS
  ======================================================== */

  const updateProgress = () => {
    setProgress(getProgress());
  };

  /* ========================================================
     MEASURE LAYOUT

     The center cell is measured relative to the
     sticky viewport so the value stays valid no
     matter where the page is scrolled.
  ======================================================== */

  const measureLayout = () => {
    let center = null;

    if (
      stickyRef.current &&
      centerRef.current
    ) {
      const stickyRect =
        stickyRef.current.getBoundingClientRect();

      const centerRect =
        centerRef.current.getBoundingClientRect();

      center = {
        left:
          centerRect.left -
          stickyRect.left,

        top:
          centerRect.top -
          stickyRect.top,

        width: centerRect.width,
        height: centerRect.height,
      };
    }

    setLayout({
      width: window.innerWidth,
      height: window.innerHeight,
      center,
    });
  };

  /* ========================================================
     CUSTOM SCROLL ANIMATION
     
     THIS IS THE IMPORTANT PART
  ======================================================== */

  const animateToProgress = (
    targetProgress
  ) => {
    if (
      !sectionRef.current ||
      isAnimatingRef.current
    ) {
      return;
    }

    const section =
      sectionRef.current;

    const sectionTop =
      window.scrollY +
      section.getBoundingClientRect()
        .top;

    const maxScroll =
      section.offsetHeight -
      window.innerHeight;

    const startScroll =
      window.scrollY;

    const targetScroll =
      sectionTop +
      targetProgress *
        maxScroll;

    const distance =
      targetScroll -
      startScroll;

    /*
      Animation duration.
      Increase this if you want slower.
    */

    const duration = 1100;

    const startTime =
      performance.now();

    isAnimatingRef.current =
      true;

    const animate = (currentTime) => {
      const elapsed =
        currentTime -
        startTime;

      const rawProgress =
        clamp(
          elapsed / duration
        );

      /*
        Smooth ease-in-out.
        This makes the image movement
        clearly visible.
      */

      const eased =
        rawProgress < 0.5
          ? 2 *
            rawProgress *
            rawProgress
          : 1 -
            Math.pow(
              -2 *
                rawProgress +
                2,
              2
            ) /
              2;

      const currentScroll =
        startScroll +
        distance * eased;

      window.scrollTo(
        0,
        currentScroll
      );

      /*
        Immediately synchronize
        React animation with scroll.
      */

      const currentProgress =
        maxScroll > 0
          ? clamp(
              (currentScroll -
                sectionTop) /
                maxScroll,
              0,
              1
            )
          : 0;

      setProgress(
        currentProgress
      );

      if (
        rawProgress < 1
      ) {
        animationRef.current =
          requestAnimationFrame(
            animate
          );
      } else {
        /*
          Snap exactly to the requested scene.
          This prevents floating-point scroll positions
          such as 0.499999 / 0.500001 from confusing
          the next wheel interaction.
        */

        window.scrollTo({
          top: targetScroll,
          left: 0,
          behavior: "instant",
        });

        setProgress(
          targetProgress
        );

        isAnimatingRef.current =
          false;

        animationRef.current =
          null;
      }
    };

    animationRef.current =
      requestAnimationFrame(
        animate
      );
  };

  /* ========================================================
     FIND NEXT SCENE

     Exact 3-slide behavior:
     Slide 1 → Slide 2 → Slide 3 → next section

     IMPORTANT:
     We use fixed scene boundaries instead of Math.ceil/floor
     so scrolling back from Slide 2 can never target Slide 2
     itself.
  ======================================================== */

  const moveScene = (direction) => {
    if (
      !sectionRef.current ||
      isAnimatingRef.current
    ) {
      return;
    }

    const currentProgress = getProgress();

    /*
      There are exactly 2 transitions:
      0.00 → 0.50 = Slide 1 → Slide 2
      0.50 → 1.00 = Slide 2 → Slide 3
    */

    const FIRST_SLIDE_END = 0.5;
    const SECOND_SLIDE_END = 1;

    /*
      SCROLL DOWN
    */

    if (direction > 0) {
      /*
        Slide 1 → Slide 2
      */

      if (currentProgress < 0.25) {
        animateToProgress(
          FIRST_SLIDE_END
        );
        return;
      }

      /*
        Slide 2 → Slide 3
      */

      if (
        currentProgress >= 0.25 &&
        currentProgress < 0.99
      ) {
        animateToProgress(
          SECOND_SLIDE_END
        );
        return;
      }

      /*
        Slide 3 → allow normal browser
        scrolling into the next section.
      */

      return;
    }

    /*
      SCROLL UP
    */

    if (direction < 0) {
      /*
        Slide 3 → Slide 2
      */

      if (currentProgress > 0.75) {
        animateToProgress(
          FIRST_SLIDE_END
        );
        return;
      }

      /*
        Slide 2 → Slide 1

        Anything around the middle is
        explicitly sent to 0 instead of
        calculating another scene index.
      */

      if (currentProgress > 0.001) {
        animateToProgress(0);
        return;
      }

      /*
        Slide 1 → allow normal browser
        scrolling into the previous section.
      */

      return;
    }
  };

  /* ========================================================
     SCROLL EVENT
  ======================================================== */

  useEffect(() => {
    /*
      Throttle to one update per frame.
      While the custom animation runs it
      already drives progress itself.
    */

    const handleScroll = () => {
      if (
        isAnimatingRef.current ||
        scrollTickingRef.current
      ) {
        return;
      }

      scrollTickingRef.current = true;

      requestAnimationFrame(() => {
        scrollTickingRef.current = false;

        if (!isAnimatingRef.current) {
          updateProgress();
        }
      });
    };

    const handleResize = () => {
      measureLayout();
      updateProgress();
    };

    measureLayout();
    updateProgress();

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );

      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, []);

  /* ========================================================
     WHEEL CONTROL
  ======================================================== */

  useEffect(() => {
    let wheelLocked = false;

    const handleWheel = (
      event
    ) => {
      /*
        Only react to meaningful
        wheel movement.
      */

      if (
        Math.abs(event.deltaY) < 5
      ) {
        return;
      }

      const currentProgress =
        getProgress();

      /*
        Only take over the wheel
        while the hero is active.
      */

      const section =
        sectionRef.current;

      if (!section) {
        return;
      }

      const rect =
        section.getBoundingClientRect();

      const insideSection =
        rect.top <= 1 &&
        rect.bottom >=
          window.innerHeight - 1;

      /*
        At the exact beginning/end,
        let the normal page scroll.
      */

      if (
        !insideSection
      ) {
        return;
      }

      if (
        isAnimatingRef.current
      ) {
        event.preventDefault();
        return;
      }

      /*
        At final scene, allow scrolling
        into the next section.
      */

      if (
        event.deltaY > 0 &&
        currentProgress >=
          0.999
      ) {
        return;
      }

      /*
        At first scene, allow scrolling
        back to the previous page.
      */

      if (
        event.deltaY < 0 &&
        currentProgress <=
          0.001
      ) {
        return;
      }

      event.preventDefault();

      if (wheelLocked) {
        return;
      }

      wheelLocked = true;

      moveScene(
        event.deltaY > 0
          ? 1
          : -1
      );

      /*
        Prevent trackpad from generating
        multiple scene changes.
      */

      setTimeout(() => {
        wheelLocked = false;
      }, 1150);
    };

    window.addEventListener(
      "wheel",
      handleWheel,
      {
        passive: false,
      }
    );

    return () => {
      window.removeEventListener(
        "wheel",
        handleWheel
      );
    };
  }, []);

  /* ========================================================
     KEYBOARD SUPPORT
  ======================================================== */

  useEffect(() => {
    const handleKeyDown = (
      event
    ) => {
      if (
        event.key ===
          "ArrowDown" ||
        event.key ===
          "PageDown"
      ) {
        event.preventDefault();

        moveScene(1);
      }

      if (
        event.key ===
          "ArrowUp" ||
        event.key ===
          "PageUp"
      ) {
        event.preventDefault();

        moveScene(-1);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  /* ========================================================
     CLEANUP ANIMATION
  ======================================================== */

  useEffect(() => {
    return () => {
      if (
        animationRef.current
      ) {
        cancelAnimationFrame(
          animationRef.current
        );
      }
    };
  }, []);

  /* ========================================================
     TIMELINE

     3 slides = 2 transition intervals.
     This prevents Slide 3 from being rendered as a
     separate Slide 3 → Slide 3 transition.
  ======================================================== */

  const count = slides.length;

  const totalTransitions = count - 1;

  const timeline =
    progress * totalTransitions;

  // There are only TWO transition intervals:
  // Slide 1 → Slide 2
  // Slide 2 → Slide 3
  // Never create a Slide 3 → Slide 3 interval.
  const sceneIndex = Math.min(
    Math.floor(timeline),
    count - 2
  );

  let localProgress =
    timeline - sceneIndex;

  // Once the final position is reached,
  // keep Slide 3 fully visible.
  if (progress >= 0.999) {
    localProgress = 1;
  }

  localProgress = clamp(localProgress);

  const nextIndex = Math.min(
    sceneIndex + 1,
    count - 1
  );

  /* ========================================================
     HERO EXPANSION
  ======================================================== */

  let heroExpansion = 0;

  /*
    FULLSCREEN → GRID
  */

  if (
    localProgress <= 0.25
  ) {
    heroExpansion =
      1 -
      localProgress /
        0.25;
  }

  /*
    GRID → FULLSCREEN
  */

  else if (
    localProgress >= 0.7
  ) {
    heroExpansion =
      (localProgress - 0.7) /
      0.3;
  }

  heroExpansion =
    smooth(
      heroExpansion
    );

  /* ========================================================
     GRID TRANSITION
  ======================================================== */

  const gridTransition =
    smooth(
      clamp(
        (localProgress - 0.15) /
          0.7
      )
    );

  /* ========================================================
     HERO SCENE
  ======================================================== */

  const showingNext =
    localProgress >= 0.7 &&
    sceneIndex < count - 1;

  const heroScene =
    showingNext
      ? nextIndex
      : sceneIndex;

  const heroData =
    slides[heroScene];

  /*
    Content fades in only once the hero is
    almost fullscreen. While fully transparent
    it is also hidden so the browser skips
    painting the card grid entirely.
  */

  const contentOpacity =
    clamp(
      (heroExpansion - 0.35) /
        0.35
    );

  /* ========================================================
     HERO POSITION
  ======================================================== */

  let heroStyle = {
    left: "0px",
    top: "0px",
    width: "100vw",
    height: "100vh",
    borderRadius: "0px",
  };

  if (
    layout.center &&
    progress > 0
  ) {
    const rect = layout.center;

    heroStyle = {
      left: `${lerp(
        rect.left,
        0,
        heroExpansion
      )}px`,

      top: `${lerp(
        rect.top,
        0,
        heroExpansion
      )}px`,

      width: `${lerp(
        rect.width,
        layout.width,
        heroExpansion
      )}px`,

      height: `${lerp(
        rect.height,
        layout.height,
        heroExpansion
      )}px`,

      borderRadius: `${lerp(
        8,
        0,
        heroExpansion
      )}px`,
    };
  }

  /* ========================================================
     CENTER MOVEMENT
  ======================================================== */

  const currentCenterY =
    -gridTransition *
    100;

  const nextCenterY =
    100 -
    gridTransition *
    100;

  /* ========================================================
     DIRECTION
  ======================================================== */

  const getDirection = (
    index
  ) => {
    const leftColumn =
      index === 0 ||
      index === 3 ||
      index === 5;

    const rightColumn =
      index === 2 ||
      index === 4 ||
      index === 7;

    if (leftColumn) {
      return 1;
    }

    if (rightColumn) {
      return -1;
    }

    return -1;
  };

  /* ========================================================
     RENDER
  ======================================================== */

  return (
    <section
      ref={sectionRef}
      className="
        relative
        h-[300vh]
        bg-[#efefed]
      "
    >
      {/* ===================================================
          STICKY VIEWPORT
      =================================================== */}

      <div
        ref={stickyRef}
        className="
          sticky
          top-0
          h-screen
          w-full
          overflow-hidden
          bg-[#efefed]
        "
      >
        {/* =================================================
            GRID
        ================================================= */}

        <div
          className="
            absolute
            inset-0
            h-screen
            w-screen
          "
        >
          <div
            className="
              absolute
              inset-0
              grid
              h-screen
              w-screen
              grid-cols-[22%_56%_22%]
              grid-rows-[20%_60%_20%]
              gap-0.75
              bg-[#efefed]
            "
          >
            <GridBlock
              position="col-start-1 row-start-1"
              index={0}
              current={slides[sceneIndex]}
              next={slides[nextIndex]}
              transition={gridTransition}
              direction={getDirection(0)}
            />

            <GridBlock
              position="col-start-2 row-start-1"
              index={1}
              current={slides[sceneIndex]}
              next={slides[nextIndex]}
              transition={gridTransition}
              direction={getDirection(1)}
            />

            <GridBlock
              position="col-start-3 row-start-1"
              index={2}
              current={slides[sceneIndex]}
              next={slides[nextIndex]}
              transition={gridTransition}
              direction={getDirection(2)}
            />

            <GridBlock
              position="col-start-1 row-start-2"
              index={3}
              current={slides[sceneIndex]}
              next={slides[nextIndex]}
              transition={gridTransition}
              direction={getDirection(3)}
            />

            {/* CENTER */}

            <div
              ref={centerRef}
              className="
                relative
                col-start-2
                row-start-2
                overflow-hidden
                bg-black
              "
            >
              <img
                src={
                  slides[
                    sceneIndex
                  ].hero
                }
                alt=""
                className="
                  absolute
                  inset-0
                  h-full
                  w-full
                  object-cover
                  will-change-transform
                "
                style={{
                  transform:
                    `translateY(${currentCenterY}%)`,
                }}
              />

              {sceneIndex <
                count - 1 && (
                <img
                  src={
                    slides[
                      nextIndex
                    ].hero
                  }
                  alt=""
                  className="
                    absolute
                    inset-0
                    h-full
                    w-full
                    object-cover
                    will-change-transform
                  "
                  style={{
                    transform:
                      `translateY(${nextCenterY}%)`,
                  }}
                />
              )}
            </div>

            <GridBlock
              position="col-start-3 row-start-2"
              index={4}
              current={slides[sceneIndex]}
              next={slides[nextIndex]}
              transition={gridTransition}
              direction={getDirection(4)}
            />

            <GridBlock
              position="col-start-1 row-start-3"
              index={5}
              current={slides[sceneIndex]}
              next={slides[nextIndex]}
              transition={gridTransition}
              direction={getDirection(5)}
            />

            <GridBlock
              position="col-start-2 row-start-3"
              index={6}
              current={slides[sceneIndex]}
              next={slides[nextIndex]}
              transition={gridTransition}
              direction={getDirection(6)}
            />

            <GridBlock
              position="col-start-3 row-start-3"
              index={7}
              current={slides[sceneIndex]}
              next={slides[nextIndex]}
              transition={gridTransition}
              direction={getDirection(7)}
            />
          </div>
          </div>

          {/* =================================================
              EXPANDING HERO
          ================================================= */}

          <div
            className="
              pointer-events-none
              absolute
              left-0
              top-0
              z-50
              h-screen
              w-screen
              overflow-hidden
              bg-black
              will-change-[left,top,width,height]
            "
            style={heroStyle}
          >
          <img
            src={heroData.hero}
            alt={heroData.title}
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
              bg-linear-to-t
              from-black/60
              via-black/10
              to-transparent
            "
          />

          {/* CONTENT */}

          <div
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
            "
            style={{
              opacity: contentOpacity,
              visibility:
                contentOpacity === 0
                  ? "hidden"
                  : "visible",
              pointerEvents: heroExpansion > 0.7 ? "auto" : "none",
            }}
          >
            {/* Slide 2: Top 10 Home Stays */}

            {heroData.contentType === "topStays" && (
              <TopPicksGrid
                heading="Top 10 Home Stays of the Year"
                eyebrow="CURATED PICKS"
                items={topStays}
                type="stay"
                navigate={navigate}
                exploreLink="/homestays"
                exploreLabel="Explore All Stays"
              />
            )}

            {/* Slide 3: Top 10 Offers */}

            {heroData.contentType === "topOffers" && (
              <TopPicksGrid
                heading="Top 10 Offers"
                eyebrow="EXCLUSIVE DEALS"
                items={topOffers}
                type="offer"
                navigate={navigate}
                exploreLink="/rooms?filter=top-offers"
                exploreLabel="Explore All Offers"
              />
            )}

            {/* Default slide: title + eyebrow */}

            {!heroData.contentType && heroData.title && (
              <div className="w-[90%] text-center text-white">
                <p
                  className="
                    mb-3
                    font-mono
                    text-[11px]
                    font-medium
                    uppercase
                    tracking-[0.25em]
                  "
                >
                  {heroData.eyebrow}
                </p>

                <h1
                  className="
                    text-5xl
                    font-semibold
                    leading-[0.9]
                    tracking-tighter
                    sm:text-7xl
                    lg:text-8xl
                  "
                >
                  {heroData.title}
                </h1>
              </div>
            )}
          </div>

          {/* COUNTER */}

          <div
            className="
              absolute
              bottom-6
              right-6
              font-mono
              text-[11px]
              text-white/90
            "
          >
            {String(
              heroScene + 1
            ).padStart(2, "0")}

            {" / "}

            {String(
              count
            ).padStart(2, "0")}
          </div>
        </div>
      </div>
    </section>
  );
};

/* =========================================================
   GRID BLOCK
========================================================= */

const GridBlock = ({
  position,
  index,
  current,
  next,
  transition,
  direction,
}) => {
  const currentY =
    direction *
    transition *
    100;

  const nextStart =
    direction === 1
      ? -100
      : 100;

  const nextY =
    nextStart +
    direction *
      transition *
      100;

  return (
    <div
      className={`
        ${position}
        relative
        overflow-hidden
        bg-stone-200
      `}
    >
      {/* CURRENT */}

      <img
        src={
          current.surrounding[
            index
          ]
        }
        alt=""
        className="
          absolute
          inset-0
          h-full
          w-full
          object-cover
          will-change-transform
        "
        style={{
          transform:
            `translateY(${currentY}%)`,
        }}
      />

      {/* NEXT */}

      <img
        src={
          next.surrounding[
            index
          ]
        }
        alt=""
        className="
          absolute
          inset-0
          h-full
          w-full
          object-cover
          will-change-transform
        "
        style={{
          transform:
            `translateY(${nextY}%)`,
        }}
      />
    </div>
  );
};

/* =========================================================
   SLIDE CARD CAROUSEL
========================================================= */

const SlideCardCarousel = ({
  heading,
  eyebrow,
  items,
  type,
  navigate,
  exploreLink,
  exploreLabel = "Explore More",
}) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const cardWidth = 280;
    const gap = 16;
    scrollRef.current.scrollBy({
      left: direction * (cardWidth + gap) * 2,
      behavior: "smooth",
    });
  };

  const isOffer = type === "offer";

  return (
    <div
      className="
        relative
        flex
        h-full
        w-full
        flex-col
        justify-center
        px-6
        sm:px-10
        lg:px-16
      "
    >
      {/* HEADING */}

      <div className="mb-6 flex items-end justify-between">
        <div>
          <p
            className="
              mb-2
              font-mono
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.25em]
              text-amber-400
            "
          >
            {eyebrow}
          </p>

          <h2
            className="
              font-serif
              text-2xl
              font-bold
              tracking-tight
              text-white
              sm:text-3xl
              lg:text-4xl
            "
          >
            {heading}
          </h2>
        </div>

        {/* NAV ARROWS */}

        <div className="hidden gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scroll(-1)}
            className="
              flex
              h-10
              w-10
              cursor-pointer
              items-center
              justify-center
              rounded-full
              border
              border-white/15
              bg-white/5
              text-white
              backdrop-blur-md
              transition-all
              duration-200
              hover:bg-white/15
            "
          >
            <FiChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => scroll(1)}
            className="
              flex
              h-10
              w-10
              cursor-pointer
              items-center
              justify-center
              rounded-full
              border
              border-white/15
              bg-white/5
              text-white
              backdrop-blur-md
              transition-all
              duration-200
              hover:bg-white/15
            "
          >
            <FiChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* MOBILE EXPLORE BUTTON */}
        <div className="flex sm:hidden mt-2">
          {exploreLink && (
            <button
              type="button"
              onClick={() => navigate(exploreLink)}
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-amber-500/50
                bg-amber-500/10
                px-4
                py-1.5
                text-xs
                font-medium
                text-amber-400
                backdrop-blur-md
                transition-colors
                hover:bg-amber-500/20
              "
            >
              {exploreLabel}
              <FiArrowUpRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        
        {/* DESKTOP EXPLORE BUTTON (placed before arrows normally, but let's put it here if there's space, or better yet, next to the arrows) */}
      </div>

      {/* EXPLORE MORE (DESKTOP) */}
      <div className="hidden sm:flex justify-end mb-4 pr-4">
          {exploreLink && (
            <button
              type="button"
              onClick={() => navigate(exploreLink)}
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-amber-500/50
                bg-amber-500/10
                px-5
                py-2
                text-sm
                font-medium
                text-amber-400
                backdrop-blur-md
                transition-all
                hover:-translate-y-0.5
                hover:bg-amber-500/20
              "
            >
              {exploreLabel}
              <FiArrowUpRight className="h-4 w-4" />
            </button>
          )}
      </div>

      {/* CARD STRIP */}

      <div
        ref={scrollRef}
        className="
          flex
          gap-4
          overflow-x-auto
          pb-4
        "
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {items.map((item, i) => (
          <div
            key={item.id}
            onClick={() =>
              navigate(`/${type}/${item.id}`, {
                state: item,
              })
            }
            className="
              group
              relative
              w-65
              shrink-0
              cursor-pointer
              overflow-hidden
              rounded-2xl
              border
              border-white/10
              bg-white/6
              backdrop-blur-xl
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-white/20
              hover:bg-white/10
              hover:shadow-[0_15px_40px_rgba(0,0,0,0.4)]
              sm:w-70
            "
          >
            {/* IMAGE */}

            <div className="relative h-36 overflow-hidden">
              <img
                src={item.image}
                alt={item.name || item.title}
                className="
                  h-full
                  w-full
                  object-cover
                  transition-transform
                  duration-500
                  group-hover:scale-110
                "
              />

              <div
                className="
                  absolute
                  inset-0
                  bg-linear-to-t
                  from-black/50
                  to-transparent
                "
              />

              {/* RANK BADGE */}

              <div
                className="
                  absolute
                  left-3
                  top-3
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-full
                  bg-amber-500
                  text-[11px]
                  font-bold
                  text-white
                  shadow-lg
                "
              >
                {i + 1}
              </div>

              {/* DISCOUNT BADGE (offers only) */}

              {isOffer && item.discount && (
                <div
                  className="
                    absolute
                    right-3
                    top-3
                    inline-flex
                    items-center
                    gap-1
                    rounded-full
                    bg-emerald-500/90
                    px-2.5
                    py-1
                    text-[10px]
                    font-bold
                    text-white
                    shadow-md
                  "
                >
                  <FiPercent className="h-2.5 w-2.5" />
                  {item.discount} OFF
                </div>
              )}

              {/* RATING */}

              <div
                className="
                  absolute
                  bottom-3
                  right-3
                  inline-flex
                  items-center
                  gap-1
                  rounded-full
                  bg-black/40
                  px-2
                  py-0.5
                  text-[11px]
                  font-semibold
                  text-amber-300
                  backdrop-blur-sm
                "
              >
                <FiStar className="h-3 w-3" />
                {item.rating}
              </div>
            </div>

            {/* INFO */}

            <div className="p-4">
              <h3
                className="
                  text-sm
                  font-semibold
                  leading-snug
                  text-white
                  group-hover:text-amber-200
                "
              >
                {item.name || item.title}
              </h3>

              <p
                className="
                  mt-1.5
                  inline-flex
                  items-center
                  gap-1
                  text-[11px]
                  text-stone-400
                "
              >
                <FiMapPin className="h-3 w-3 text-amber-500/60" />
                {item.location}
              </p>

              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-base font-bold text-white">
                  {item.price}
                </span>

                <span className="text-[10px] text-stone-500">
                  / night
                </span>

                {isOffer && item.originalPrice && (
                  <span className="ml-1 text-[10px] text-stone-600 line-through">
                    {item.originalPrice}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* =========================================================
   TOP PICK CARD
========================================================= */

const TopPickCard = ({
  item,
  rank,
  type,
  navigate,
}) => {
  const isOffer = type === "offer";

  return (
    <div
      onClick={() =>
        navigate(`/${type}/${item.id}`, {
          state: item,
        })
      }
      className="
        group
        relative
        h-[clamp(120px,21vh,210px)]
        w-full
        cursor-pointer
        overflow-hidden
        rounded-2xl
        border
        border-white/10
        bg-stone-900
        transition-colors
        duration-200
        hover:border-amber-400/40
      "
    >
      {/* IMAGE */}

      <div className="absolute inset-0 z-0">
        <img
          src={item.image}
          alt={item.name || item.title}
          loading="lazy"
          decoding="async"
          className="
            h-full
            w-full
            object-cover
          "
        />

        <div
          className="
            absolute
            inset-0
            bg-linear-to-t
            from-black/85
            via-black/25
            to-transparent
          "
        />
      </div>

      {/* CONTENT OVERLAY */}

      <div
        className="
          absolute
          inset-0
          z-10
          flex
          flex-col
          justify-between
          p-3
        "
      >
        {/* TOP BADGES */}

        <div className="flex w-full items-start justify-between">
          <div
            className="
              flex
              h-6
              w-6
              items-center
              justify-center
              rounded-full
              bg-amber-500
              text-[10px]
              font-bold
              text-white
              shadow-lg
            "
          >
            {rank}
          </div>

          {isOffer && item.discount && (
            <div
              className="
                inline-flex
                items-center
                gap-1
                rounded-full
                bg-emerald-500/90
                px-2
                py-0.5
                text-[9px]
                font-bold
                text-white
                shadow-md
              "
            >
              <FiPercent className="h-2.5 w-2.5" />
              {item.discount} OFF
            </div>
          )}
        </div>

        {/* BOTTOM INFO */}

        <div>
          <h3
            className="
              truncate
              text-sm
              font-semibold
              leading-snug
              text-white
              drop-shadow-md
              group-hover:text-amber-200
            "
          >
            {item.name || item.title}
          </h3>

          <p
            className="
              mt-1
              flex
              items-center
              gap-1
              truncate
              text-[11px]
              text-stone-300
              drop-shadow-md
            "
          >
            <FiMapPin className="h-3 w-3 shrink-0 text-amber-500" />
            <span className="truncate">{item.location}</span>
          </p>

          <div className="mt-1.5 flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold text-white drop-shadow-md">
                {item.price}
              </span>

              <span className="text-[10px] text-stone-400">
                / night
              </span>

              {isOffer && item.originalPrice && (
                <span className="ml-1 text-[10px] text-stone-500 line-through">
                  {item.originalPrice}
                </span>
              )}
            </div>

            <div
              className="
                inline-flex
                items-center
                gap-1
                rounded-full
                bg-black/50
                px-1.5
                py-0.5
                text-[11px]
                font-semibold
                text-amber-300
              "
            >
              <FiStar className="h-3 w-3" />
              {item.rating}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   TOP PICKS GRID

   Slide 2 / Slide 3 content.

   Static layout: 2 rows x 5 cards.
   No auto-rotation, no 3D transforms.
========================================================= */

const TopPicksGrid = ({
  heading,
  eyebrow,
  items,
  type,
  navigate,
  exploreLink,
  exploreLabel = "Explore More",
}) => {
  return (
    <div
      className="
        relative
        flex
        h-full
        w-full
        flex-col
        items-center
        justify-center
        px-4
        pb-8
        pt-16
        sm:px-8
        lg:px-16
      "
    >
      {/* HEADING */}

      <div
        className="
          relative
          z-20
          flex
          shrink-0
          flex-col
          items-center
          text-center
        "
      >
        <p
          className="
            mb-3
            font-mono
            text-[11px]
            font-bold
            uppercase
            tracking-[0.3em]
            text-amber-400
            drop-shadow-md
          "
        >
          {eyebrow}
        </p>

        <h2
          className="
            font-serif
            text-3xl
            font-bold
            tracking-tight
            text-white
            drop-shadow-lg
            sm:text-4xl
            lg:text-5xl
          "
        >
          {heading}
        </h2>
      </div>

      {/* CARD GRID — 2 ROWS x 5 CARDS */}

      <div
        className="
          relative
          z-10
          mt-8
          grid
          w-full
          max-w-300
          grid-cols-2
          gap-3
          sm:grid-cols-5
          sm:gap-4
        "
      >
        {items.map((item, index) => (
          <TopPickCard
            key={item.id}
            item={item}
            rank={index + 1}
            type={type}
            navigate={navigate}
          />
        ))}
      </div>

      {/* EXPLORE MORE BUTTON */}

      <div
        className="
          relative
          z-20
          mt-8
          flex
          shrink-0
          justify-center
        "
      >
        {exploreLink && (
          <button
            type="button"
            onClick={() => navigate(exploreLink)}
            className="
              inline-flex
              items-center
              gap-3
              rounded-full
              bg-linear-to-r
              from-amber-500
              to-amber-600
              px-8
              py-3.5
              text-base
              font-bold
              tracking-wide
              text-white
              shadow-lg
              transition-all
              hover:-translate-y-1
              hover:shadow-xl
              hover:shadow-amber-500/30
            "
          >
            {exploreLabel}
            <FiArrowUpRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default HeroSlideBackground;