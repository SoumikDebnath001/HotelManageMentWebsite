import { useEffect, useState } from "react";
import { FiTag } from "react-icons/fi";
import toast from "react-hot-toast";
import { getAllOffers } from "../../Services/superadmin.service";
import Pagination from "../../Components/Common/Pagination";
import { formatDate, offerIsLive, describeDiscount } from "../../Utils/bookingHelpers";

const PAGE_SIZE = 10;

const SuperAdminOffers = () => {
  const [offers, setOffers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: PAGE_SIZE, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await getAllOffers({ page, limit: PAGE_SIZE });
      if (cancelled) return;
      if (error) toast.error(error);
      if (data?.status) {
        setOffers(data.data || []);
        setPagination(data.pagination || { total: 0, page: 1, limit: PAGE_SIZE, totalPages: 0 });
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <div className="animate-in fade-in zoom-in duration-500 relative">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-white mb-2">Offers</h1>
        <p className="text-stone-400">Promotional codes created by hotel managers. Customers apply them at checkout.</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          </div>
        ) : offers.length === 0 ? (
          <div className="p-8 text-center text-stone-400 text-sm">No offers have been created yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/10 text-stone-300 uppercase tracking-wider text-xs">
                <tr>
                  <th className="py-4 px-6">Offer</th>
                  <th className="py-4 px-6">Hotel</th>
                  <th className="py-4 px-6">Discount</th>
                  <th className="py-4 px-6">Min. booking</th>
                  <th className="py-4 px-6">Validity</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-stone-300">
                {offers.map((offer) => (
                  <tr key={offer._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-medium text-white flex items-center gap-2"><FiTag className="h-4 w-4 text-amber-400" />{offer.offerName}</p>
                      <p className="font-mono text-xs text-amber-400/80 mt-0.5">{offer.offerCode}</p>
                    </td>
                    <td className="py-4 px-6">{offer.hotelName}</td>
                    <td className="py-4 px-6 text-emerald-400 font-medium">{describeDiscount(offer)}</td>
                    <td className="py-4 px-6">{offer.minBookingAmount ? `₹${offer.minBookingAmount.toLocaleString()}` : "—"}</td>
                    <td className="py-4 px-6 text-xs">{formatDate(offer.validFrom)} → {formatDate(offer.validTill)}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${offerIsLive(offer) ? "bg-emerald-500/20 text-emerald-400" : offer.isActive ? "bg-stone-500/20 text-stone-300" : "bg-red-500/20 text-red-400"}`}>
                        {offerIsLive(offer) ? "Live" : offer.isActive ? "Scheduled / Expired" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination className="mt-4" page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} limit={pagination.limit} onChange={setPage} />
    </div>
  );
};

export default SuperAdminOffers;
