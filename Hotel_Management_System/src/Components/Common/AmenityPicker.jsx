import { useEffect, useState } from "react";
import { FiCheck, FiSearch, FiPlus } from "react-icons/fi";

/*
  Multi-select amenity chips.
  - fetchAmenities: service function resolving to { data, error } with data.data = [{ amenityName }]
  - value / onChange: array of amenity names
  - allowCustom: lets the user add a name that is not in the master list
*/
const AmenityPicker = ({
  value = [],
  onChange,
  fetchAmenities,
  label = "Amenities",
  hint = "Pick from the master list defined by the super admin.",
  allowCustom = false,
}) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data } = await fetchAmenities();
      if (cancelled) return;
      if (data?.status) {
        setOptions((data.data || []).map((amenity) => amenity.amenityName));
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [fetchAmenities]);

  const toggle = (name) => {
    onChange(value.includes(name) ? value.filter((v) => v !== name) : [...value, name]);
  };

  const addCustom = () => {
    const name = search.trim();
    if (!name) return;
    if (!value.includes(name)) onChange([...value, name]);
    setSearch("");
  };

  // Selected names that are no longer in the master list still show so they can be removed
  const extraSelected = value.filter((name) => !options.includes(name));
  const term = search.trim().toLowerCase();
  const visible = options.filter((name) => !term || name.toLowerCase().includes(term));

  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
        {label}{" "}
        <span className="text-stone-500 font-normal normal-case tracking-normal">
          ({value.length} selected)
        </span>
      </label>
      {hint && <p className="text-xs text-stone-500 mb-3">{hint}</p>}

      <div className="relative mb-3">
        <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (allowCustom) addCustom();
            }
          }}
          placeholder="Search amenities..."
          className="w-full bg-black/50 border border-white/15 rounded-xl pl-10 pr-24 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
        />
        {allowCustom && search.trim() && !options.includes(search.trim()) && (
          <button
            type="button"
            onClick={addCustom}
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 rounded-lg bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-500/30"
          >
            <FiPlus className="h-3 w-3" /> Add
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-xs text-stone-500">Loading amenities...</p>
      ) : options.length === 0 && extraSelected.length === 0 ? (
        <p className="text-xs text-stone-500 italic">No amenities defined yet. Ask the super admin to add some.</p>
      ) : (
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
          {[...extraSelected, ...visible].map((name) => {
            const active = value.includes(name);
            return (
              <button
                key={name}
                type="button"
                onClick={() => toggle(name)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? "border-amber-500/60 bg-amber-500/15 text-amber-300"
                    : "border-white/10 bg-white/5 text-stone-300 hover:border-white/25 hover:bg-white/10 hover:text-white"
                }`}
              >
                {active && <FiCheck className="h-3 w-3" />}
                {name}
                {!options.includes(name) && <span className="text-[9px] uppercase text-stone-500">custom</span>}
              </button>
            );
          })}
          {visible.length === 0 && term && (
            <p className="text-xs text-stone-500">No amenity matches "{search}".</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AmenityPicker;
