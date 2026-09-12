import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiStar,
  FiMapPin,
  FiArrowUpRight,
  FiSearch,
  FiGrid,
  FiList,
} from "react-icons/fi";

/* =========================================================
   TOP 10 HOME STAYS — DUMMY DATA
   (Later this will come from the backend)
========================================================= */

const allStays = [
  {
    id: 1,
    name: "Sunset Villa Bali",
    location: "Ubud, Bali",
    rating: 4.9,
    price: "$280",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    description: "A breathtaking villa nestled in the heart of Ubud's rice terraces. Features an infinity pool overlooking the lush valley, traditional Balinese architecture with modern amenities, and private garden pavilions perfect for romantic getaways.",
    amenities: ["Free Wi-Fi", "Pool", "Spa", "Breakfast", "Ocean View"],
    guests: "2-4 Guests",
    type: "Villa",
  },
  {
    id: 2,
    name: "Mountain Retreat Lodge",
    location: "Shimla, India",
    rating: 4.8,
    price: "$150",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
    description: "Escape to the misty mountains of Shimla in this charming colonial-style lodge. Surrounded by deodar forests, enjoy crackling fireplaces, locally sourced cuisine, and panoramic views of the Himalayan foothills.",
    amenities: ["Free Wi-Fi", "Breakfast", "Room Service", "Parking"],
    guests: "2-6 Guests",
    type: "Lodge",
  },
  {
    id: 3,
    name: "Beachfront Cabana",
    location: "Maldives",
    rating: 5.0,
    price: "$450",
    image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=800&q=80",
    description: "Wake up to turquoise waters lapping beneath your overwater cabana. This Maldivian paradise offers glass-floor panels, direct ocean access, a private sundeck, and world-class snorkeling right from your doorstep.",
    amenities: ["Pool", "Spa", "Ocean View", "Breakfast", "Free Wi-Fi"],
    guests: "2 Guests",
    type: "Cabana",
  },
  {
    id: 4,
    name: "Tuscan Farmhouse",
    location: "Florence, Italy",
    rating: 4.7,
    price: "$320",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
    description: "A lovingly restored 18th-century farmhouse surrounded by olive groves and vineyards in the Tuscan countryside. Enjoy authentic Italian cooking classes, wine tastings, and lazy afternoons by the stone-edged pool.",
    amenities: ["Pool", "Breakfast", "Parking", "Free Wi-Fi"],
    guests: "2-8 Guests",
    type: "Farmhouse",
  },
  {
    id: 5,
    name: "Lakeside Chalet",
    location: "Interlaken, Switzerland",
    rating: 4.9,
    price: "$380",
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80",
    description: "Perched on the shores of Lake Brienz, this Alpine chalet offers floor-to-ceiling windows framing the Jungfrau massif. Cozy interiors with handcrafted wood furnishings and a private hot tub on the terrace.",
    amenities: ["Free Wi-Fi", "Spa", "Room Service", "Breakfast"],
    guests: "2-4 Guests",
    type: "Chalet",
  },
  {
    id: 6,
    name: "Desert Oasis Riad",
    location: "Marrakech, Morocco",
    rating: 4.6,
    price: "$190",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    description: "Step through ornate wooden doors into a serene courtyard riad with a central mosaic fountain. Traditional zellige tilework, rooftop terraces with Atlas Mountain views, and authentic Moroccan hammam experience.",
    amenities: ["Spa", "Breakfast", "Free Wi-Fi", "Room Service"],
    guests: "2-6 Guests",
    type: "Riad",
  },
  {
    id: 7,
    name: "Tropical Treehouse",
    location: "Costa Rica",
    rating: 4.8,
    price: "$210",
    image: "https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&w=800&q=80",
    description: "An elevated retreat hidden in the Costa Rican canopy. This eco-luxury treehouse features open-air showers, wildlife spotting from your private deck, and a suspension bridge connecting you to the rainforest spa.",
    amenities: ["Free Wi-Fi", "Spa", "Breakfast", "Pool"],
    guests: "2 Guests",
    type: "Treehouse",
  },
  {
    id: 8,
    name: "Fjord Glass Cabin",
    location: "Tromsø, Norway",
    rating: 4.9,
    price: "$340",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80",
    description: "A stunning glass-walled cabin on the edge of a Norwegian fjord. Watch the Northern Lights from your bed, enjoy midnight sun hikes, and relax in the wood-fired sauna with icy fjord plunges.",
    amenities: ["Free Wi-Fi", "Ocean View", "Breakfast", "Spa"],
    guests: "2 Guests",
    type: "Cabin",
  },
  {
    id: 9,
    name: "Heritage Haveli",
    location: "Jaipur, India",
    rating: 4.7,
    price: "$130",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
    description: "A magnificently restored Rajasthani haveli in the Pink City. Intricate jali screens, courtyard dining under the stars, rooftop pool overlooking Nahargarh Fort, and curated heritage walking tours.",
    amenities: ["Pool", "Breakfast", "Free Wi-Fi", "Room Service", "Parking"],
    guests: "2-10 Guests",
    type: "Haveli",
  },
  {
    id: 10,
    name: "Cliffside Sanctuary",
    location: "Santorini, Greece",
    rating: 5.0,
    price: "$420",
    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
    description: "Cave-carved luxury suites in Oia with iconic blue-dome views. Private plunge pool, caldera sunset terraces, and a wine cellar carved into volcanic rock. The quintessential Greek island experience.",
    amenities: ["Pool", "Ocean View", "Breakfast", "Free Wi-Fi", "Spa"],
    guests: "2-4 Guests",
    type: "Suite",
  },
];

/* =========================================================
   HOME STAYS PAGE
========================================================= */

const HomeStaysPage = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = allStays.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="
        min-h-screen
        bg-[#0c0a09]
        text-white
      "
    >
      {/* ===================================================
          HERO BANNER
      =================================================== */}

      <section className="relative overflow-hidden pb-6 pt-24 sm:pb-8 sm:pt-36 lg:pt-40">
        {/* Background image */}

        <div className="absolute inset-0 -z-10">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2200&q=80"
            alt=""
            className="h-full w-full object-cover opacity-25"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-[#0c0a09]/60 via-[#0c0a09]/80 to-[#0c0a09]" />
        </div>

        {/* Ambient glow */}

        <div className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/[0.08] blur-[100px] sm:h-[400px] sm:w-[400px] sm:blur-[120px]" />

        <div className="mx-auto max-w-7xl px-4 sm:px-10 lg:px-16">
          <p
            className="
              mb-3
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.25em]
              text-amber-400
            "
          >
            Curated Collection
          </p>

          <h1
            className="
              font-serif
              text-3xl
              font-bold
              leading-tight
              tracking-tight
              text-white
              sm:text-5xl
              lg:text-6xl
            "
          >
            Top 10 Home Stays
            <br />

            <span className="italic text-white/50">
              of the Year
            </span>
          </h1>

          <p
            className="
              mt-3
              max-w-xl
              text-sm
              leading-6
              text-stone-400
              sm:mt-4
              sm:text-base
              sm:leading-7
            "
          >
            Handpicked by our travel experts — the finest home
            stays from around the world that redefine luxury,
            comfort, and unforgettable experiences.
          </p>

          {/* SEARCH & VIEW TOGGLE */}

          <div className="mt-6 flex items-center gap-2 sm:mt-8 sm:justify-between sm:gap-4">
            <div className="relative min-w-0 flex-1 sm:max-w-sm">
              <FiSearch className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-stone-400" />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search stays, places, types..."
                className="
                  w-full
                  rounded-xl
                  border
                  border-white/10
                  bg-stone-900/60
                  py-3
                  pr-4
                  pl-11
                  text-sm
                  text-white
                  backdrop-blur-md
                  placeholder:text-stone-600
                  focus:border-amber-500/40
                  focus:outline-none
                  focus:ring-1
                  focus:ring-amber-500/20
                "
              />
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
                aria-pressed={viewMode === "grid"}
                className={`rounded-lg border p-3 transition-all sm:p-2.5 ${
                  viewMode === "grid"
                    ? "border-amber-500/50 bg-amber-500/15 text-amber-400"
                    : "border-white/10 bg-stone-900/40 text-stone-500 hover:text-white"
                }`}
              >
                <FiGrid className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-label="List view"
                aria-pressed={viewMode === "list"}
                className={`rounded-lg border p-3 transition-all sm:p-2.5 ${
                  viewMode === "list"
                    ? "border-amber-500/50 bg-amber-500/15 text-amber-400"
                    : "border-white/10 bg-stone-900/40 text-stone-500 hover:text-white"
                }`}
              >
                <FiList className="h-4 w-4" />
              </button>
            </div>
          </div>

          <p className="mt-4 text-xs text-stone-500">
            {filtered.length} stay{filtered.length === 1 ? "" : "s"}
            {searchTerm ? ` matching "${searchTerm}"` : ""}
          </p>
        </div>
      </section>

      {/* ===================================================
          STAYS GRID / LIST
      =================================================== */}

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-10 sm:pb-20 lg:px-16">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg text-stone-500">
              No stays match your search.
            </p>
          </div>
        ) : viewMode === "grid" ? (
          /* ================= GRID VIEW ================= */

          <div
            className="
              grid
              grid-cols-2
              gap-3
              sm:gap-6
              lg:grid-cols-3
            "
          >
            {filtered.map((stay, i) => (
              <div
                key={stay.id}
                onClick={() =>
                  navigate(`/stay/${stay.id}`, { state: stay })
                }
                className="
                  group
                  cursor-pointer
                  overflow-hidden
                  rounded-2xl
                  border
                  border-white/[0.07]
                  bg-stone-900/40
                  transition-all
                  duration-300
                  sm:hover:-translate-y-1
                  hover:border-white/15
                  hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]
                "
              >
                {/* IMAGE */}

                <div className="relative h-32 overflow-hidden sm:h-52">
                  <img
                    src={stay.image}
                    alt={stay.name}
                    loading="lazy"
                    decoding="async"
                    className="
                      h-full
                      w-full
                      object-cover
                      transition-transform
                      duration-500
                      group-hover:scale-110
                    "
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                  {/* Rank */}

                  <div
                    className="
                      absolute
                      left-2
                      top-2
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
                      sm:left-3
                      sm:top-3
                      sm:h-8
                      sm:w-8
                      sm:text-xs
                    "
                  >
                    {i + 1}
                  </div>

                  {/* Type */}

                  <span
                    className="
                      absolute
                      right-2
                      top-2
                      rounded-full
                      border
                      border-white/20
                      bg-black/40
                      px-2
                      py-0.5
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-wider
                      text-white
                      backdrop-blur-sm
                      sm:right-3
                      sm:top-3
                      sm:px-3
                      sm:py-1
                      sm:text-[10px]
                    "
                  >
                    {stay.type}
                  </span>

                  {/* Rating */}

                  <div
                    className="
                      absolute
                      bottom-2
                      right-2
                      inline-flex
                      items-center
                      gap-1
                      rounded-full
                      bg-black/50
                      px-2
                      py-0.5
                      text-[11px]
                      font-semibold
                      text-amber-300
                      backdrop-blur-sm
                      sm:bottom-3
                      sm:right-3
                      sm:px-2.5
                      sm:py-1
                      sm:text-xs
                    "
                  >
                    <FiStar className="h-3 w-3" />
                    {stay.rating}
                  </div>
                </div>

                {/* INFO */}

                <div className="p-3 sm:p-5">
                  <h3
                    className="
                      truncate
                      text-sm
                      font-semibold
                      text-white
                      group-hover:text-amber-200
                      sm:text-base
                    "
                  >
                    {stay.name}
                  </h3>

                  <p
                    className="
                      mt-1
                      flex
                      min-w-0
                      items-center
                      gap-1
                      text-[11px]
                      text-stone-400
                      sm:mt-1.5
                      sm:gap-1.5
                      sm:text-xs
                    "
                  >
                    <FiMapPin className="h-3 w-3 shrink-0 text-amber-500/60" />
                    <span className="truncate">{stay.location}</span>
                  </p>

                  <p
                    className="
                      mt-3
                      hidden
                      text-xs
                      leading-5
                      text-stone-500
                      line-clamp-2
                      sm:block
                    "
                  >
                    {stay.description}
                  </p>

                  <div
                    className="
                      mt-2.5
                      flex
                      items-center
                      justify-between
                      sm:mt-4
                    "
                  >
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-bold text-white sm:text-lg">
                        {stay.price}
                      </span>

                      <span className="text-[10px] text-stone-500">
                        / night
                      </span>
                    </div>

                    <span
                      className="
                        inline-flex
                        items-center
                        gap-1
                        text-xs
                        font-medium
                        text-amber-400
                        transition-opacity
                        duration-300
                        sm:opacity-0
                        sm:group-hover:opacity-100
                      "
                    >
                      <span className="hidden sm:inline">View Details</span>
                      <FiArrowUpRight className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ================= LIST VIEW ================= */

          <div className="flex flex-col gap-3 sm:gap-4">
            {filtered.map((stay, i) => (
              <div
                key={stay.id}
                onClick={() =>
                  navigate(`/stay/${stay.id}`, { state: stay })
                }
                className="
                  group
                  flex
                  cursor-pointer
                  overflow-hidden
                  rounded-2xl
                  border
                  border-white/[0.07]
                  bg-stone-900/40
                  transition-all
                  duration-300
                  hover:border-white/15
                  hover:shadow-[0_15px_40px_rgba(0,0,0,0.4)]
                "
              >
                {/* IMAGE */}

                <div className="relative w-28 shrink-0 overflow-hidden sm:h-48 sm:w-56">
                  <img
                    src={stay.image}
                    alt={stay.name}
                    loading="lazy"
                    decoding="async"
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
                      left-2
                      top-2
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
                      sm:left-3
                      sm:top-3
                      sm:h-7
                      sm:w-7
                      sm:text-[11px]
                    "
                  >
                    {i + 1}
                  </div>
                </div>

                {/* INFO */}

                <div className="flex min-w-0 flex-1 flex-col justify-between p-3 sm:p-5">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3
                          className="
                            truncate
                            text-sm
                            font-semibold
                            text-white
                            group-hover:text-amber-200
                            sm:text-base
                          "
                        >
                          {stay.name}
                        </h3>

                        <p className="mt-1 flex min-w-0 items-center gap-1 text-[11px] text-stone-400 sm:gap-1.5 sm:text-xs">
                          <FiMapPin className="h-3 w-3 shrink-0 text-amber-500/60" />
                          <span className="truncate">{stay.location}</span>
                        </p>
                      </div>

                      <div className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-amber-300">
                        <FiStar className="h-3 w-3" />
                        {stay.rating}
                      </div>
                    </div>

                    <p className="mt-2 text-xs leading-5 text-stone-500 line-clamp-2">
                      {stay.description}
                    </p>
                  </div>

                  <div className="mt-2 flex items-center justify-between sm:mt-3">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-bold text-white sm:text-lg">
                        {stay.price}
                      </span>

                      <span className="text-[10px] text-stone-500">
                        / night
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className="
                          hidden
                          sm:inline
                          rounded-full
                          border
                          border-white/10
                          bg-white/5
                          px-3
                          py-1
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-wider
                          text-stone-400
                        "
                      >
                        {stay.type}
                      </span>

                      <span
                        className="
                          inline-flex
                          items-center
                          gap-1
                          text-xs
                          font-medium
                          text-amber-400
                        "
                      >
                        <span className="hidden sm:inline">View Details</span>
                        <FiArrowUpRight className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomeStaysPage;
