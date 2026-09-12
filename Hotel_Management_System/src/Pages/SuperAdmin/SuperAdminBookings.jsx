import { useEffect, useState } from "react";
import { FiSearch, FiCalendar } from "react-icons/fi";
import toast from "react-hot-toast";
import { getAllBookings } from "../../Services/superadmin.service";
import Pagination from "../../Components/Common/Pagination";
import { bookingStatusClass, paymentStatusClass, formatDate } from "../../Utils/bookingHelpers";

const PAGE_SIZE = 10;

const BOOKING_STATUSES = ["booked", "checkedIn", "checkedOut", "cancelled"];
const PAYMENT_STATUSES = ["pending", "paid", "refunded"];

const SuperAdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: PAGE_SIZE, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [bookingStatus, setBookingStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      const { data, error } = await getAllBookings({
        page,
        limit: PAGE_SIZE,
        search: search.trim() || undefined,
        bookingStatus: bookingStatus || undefined,
        paymentStatus: paymentStatus || undefined,
      });
      if (cancelled) return;
      if (error) toast.error(error);
      if (data?.status) {
        setBookings(data.data || []);
        setPagination(data.pagination || { total: 0, page: 1, limit: PAGE_SIZE, totalPages: 0 });
      }
      setLoading(false);
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [page, search, bookingStatus, paymentStatus]);

  const selectClass = "min-w-0 bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none [&>option]:bg-stone-900";

  return (
    <div className="animate-in fade-in zoom-in duration-500 relative">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">Bookings</h1>
        <p className="text-stone-400">All reservations across every hotel on the platform.</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-2 mb-4 md:flex md:gap-3">
        <div className="relative col-span-2 flex-1 md:max-w-sm">
          <FiSearch className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-stone-500" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search guest, hotel or room..."
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-stone-500 focus:border-amber-500 focus:outline-none"
          />
        </div>
        <select value={bookingStatus} onChange={(e) => { setBookingStatus(e.target.value); setPage(1); }} className={selectClass}>
          <option value="">All bookings</option>
          {BOOKING_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={paymentStatus} onChange={(e) => { setPaymentStatus(e.target.value); setPage(1); }} className={selectClass}>
          <option value="">All payments</option>
          {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-8 text-center text-stone-400 text-sm">No bookings match the current filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/10 text-stone-300 uppercase tracking-wider text-xs">
                <tr>
                  <th className="py-4 px-6">Guest</th>
                  <th className="py-4 px-6">Hotel / Room</th>
                  <th className="py-4 px-6">Stay</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Payment</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-stone-300">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-medium text-white">{b.userName || "Guest"}</p>
                      <p className="text-[11px] font-mono text-stone-500">{b._id}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-white">{b.hotelName}</p>
                      <p className="text-xs text-stone-400 capitalize">Room {b.roomNumber} · {b.roomType}</p>
                    </td>
                    <td className="py-4 px-6 text-xs">
                      <p className="flex items-center gap-1.5 text-white"><FiCalendar className="h-3 w-3 text-amber-400" />{formatDate(b.checkInDate)} → {formatDate(b.checkOutDate)}</p>
                      <p className="text-stone-500 mt-0.5">{b.numberOfNights} night{b.numberOfNights === 1 ? "" : "s"} · {b.adults} adult{b.adults === 1 ? "" : "s"}{b.children ? `, ${b.children} child${b.children === 1 ? "" : "ren"}` : ""}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-emerald-400 font-semibold">₹{(b.payableAmount ?? b.totalAmount ?? 0).toLocaleString()}</p>
                      {b.discountAmount > 0 && <p className="text-[11px] text-stone-500">−₹{b.discountAmount.toLocaleString()} ({b.offerCode})</p>}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${paymentStatusClass[b.paymentStatus] || ""}`}>{b.paymentStatus}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${bookingStatusClass[b.bookingStatus] || ""}`}>{b.bookingStatus}</span>
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

export default SuperAdminBookings;
