import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

// Simple pager for server-side paginated lists ({ total, page, limit, totalPages })
const Pagination = ({ page, totalPages, total, limit, onChange, className = "" }) => {
  if (!totalPages || totalPages <= 1) {
    return total ? (
      <p className={`text-xs text-stone-500 ${className}`}>{total} record{total === 1 ? "" : "s"}</p>
    ) : null;
  }

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 ${className}`}>
      <p className="text-xs text-stone-500">
        Showing <span className="text-stone-300">{from}–{to}</span> of <span className="text-stone-300">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-stone-300 hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <FiChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-xs text-stone-400">
          Page <span className="text-white font-semibold">{page}</span> / {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-stone-300 hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <FiChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
