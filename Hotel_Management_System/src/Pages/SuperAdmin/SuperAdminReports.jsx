import { useEffect, useState } from "react";
import { FiBarChart2, FiDollarSign, FiUsers, FiHome, FiGrid, FiCreditCard, FiCalendar } from "react-icons/fi";
import toast from "react-hot-toast";
import {
  fetchBookingReport,
  fetchRevenueReport,
  fetchCustomerReport,
  fetchHotelReport,
  fetchRoomOccupancyReport,
  fetchPaymentReport,
} from "../../Services/dashboard.service";
import Pagination from "../../Components/Common/Pagination";
import { bookingStatusClass, paymentStatusClass, formatDate } from "../../Utils/bookingHelpers";

const PAGE_SIZE = 10;

const TABS = [
  { key: "bookings", label: "Bookings", icon: FiCalendar, dated: true },
  { key: "revenue", label: "Revenue", icon: FiDollarSign, dated: true },
  { key: "customers", label: "Customers", icon: FiUsers, dated: false },
  { key: "hotels", label: "Hotels", icon: FiHome, dated: false },
  { key: "occupancy", label: "Occupancy", icon: FiGrid, dated: false },
  { key: "payments", label: "Payments", icon: FiCreditCard, dated: true },
];

const money = (n) => `₹${Number(n || 0).toLocaleString()}`;

const StatCard = ({ label, value, accent = "text-white" }) => (
  <div className="rounded-2xl border border-white/10 bg-black/40 p-4 sm:p-5">
    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 sm:text-[11px]">{label}</p>
    <p className={`mt-2 font-serif text-xl font-bold sm:text-2xl ${accent}`}>{value}</p>
  </div>
);

const Table = ({ headers, children }) => (
  <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-white/5 border-b border-white/10 text-stone-300 uppercase tracking-wider text-xs">
          <tr>{headers.map((h) => <th key={h} className="py-4 px-6">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-stone-300">{children}</tbody>
      </table>
    </div>
  </div>
);

const Empty = ({ text }) => (
  <div className="rounded-2xl border border-white/10 bg-black/40 p-8 text-center text-stone-400 text-sm">{text}</div>
);

const SuperAdminReports = () => {
  const [tab, setTab] = useState("bookings");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      const params = { page, limit: PAGE_SIZE };
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      if (search.trim()) params.search = search.trim();

      const fetchers = {
        bookings: fetchBookingReport,
        revenue: fetchRevenueReport,
        customers: fetchCustomerReport,
        hotels: fetchHotelReport,
        occupancy: fetchRoomOccupancyReport,
        payments: fetchPaymentReport,
      };

      const { data, error } = await fetchers[tab](params);
      if (cancelled) return;
      if (error) toast.error(error);
      if (data?.status) {
        setReport(data.data);
        setPagination(data.pagination || null);
      } else {
        setReport(null);
        setPagination(null);
      }
      setLoading(false);
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [tab, fromDate, toDate, search, page]);

  const switchTab = (key) => {
    setTab(key);
    setPage(1);
    setSearch("");
  };

  const activeTab = TABS.find((t) => t.key === tab);
  const inputClass = "bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none [color-scheme:dark]";

  const renderBody = () => {
    if (loading) {
      return (
        <div className="p-12 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
        </div>
      );
    }
    if (!report) return <Empty text="No data available." />;

    if (tab === "bookings") {
      const summary = report.summary || [];
      const count = (status) => summary.find((s) => s._id === status)?.count || 0;
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard label="Booked" value={count("booked")} accent="text-amber-400" />
            <StatCard label="Checked in" value={count("checkedIn")} accent="text-blue-400" />
            <StatCard label="Checked out" value={count("checkedOut")} accent="text-emerald-400" />
            <StatCard label="Cancelled" value={count("cancelled")} accent="text-red-400" />
          </div>
          {report.bookings?.length ? (
            <Table headers={["Guest", "Hotel / Room", "Stay", "Amount", "Payment", "Status"]}>
              {report.bookings.map((b) => (
                <tr key={b._id} className="hover:bg-white/5">
                  <td className="py-3 px-6 text-white">{b.userName}</td>
                  <td className="py-3 px-6">{b.hotelName} <span className="text-stone-500">· {b.roomNumber}</span></td>
                  <td className="py-3 px-6 text-xs">{formatDate(b.checkInDate)} → {formatDate(b.checkOutDate)}</td>
                  <td className="py-3 px-6 text-emerald-400">{money(b.payableAmount ?? b.totalAmount)}</td>
                  <td className="py-3 px-6"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${paymentStatusClass[b.paymentStatus] || ""}`}>{b.paymentStatus}</span></td>
                  <td className="py-3 px-6"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${bookingStatusClass[b.bookingStatus] || ""}`}>{b.bookingStatus}</span></td>
                </tr>
              ))}
            </Table>
          ) : <Empty text="No bookings in this period." />}
        </div>
      );
    }

    if (tab === "revenue") {
      const rows = report.revenueByDay || [];
      const max = Math.max(1, ...rows.map((r) => r.totalRevenue));
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard label="Total revenue" value={money(report.totalRevenue)} accent="text-emerald-400" />
            <StatCard label="Payments" value={report.totalPayments || 0} />
            <StatCard label="Refunded" value={money(report.totalRefunded)} accent="text-purple-300" />
            <StatCard label="Refunds" value={report.totalRefunds || 0} />
          </div>
          {rows.length ? (
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-4">Revenue by day</p>
              <div className="space-y-2">
                {rows.map((r) => (
                  <div key={r._id} className="flex items-center gap-2 text-xs sm:gap-3">
                    <span className="w-20 shrink-0 font-mono text-[11px] text-stone-400 sm:w-24 sm:text-xs">{r._id}</span>
                    <div className="flex-1 h-5 rounded-md bg-white/5 overflow-hidden">
                      <div className="h-full rounded-md bg-gradient-to-r from-amber-500 to-amber-600" style={{ width: `${Math.max(2, (r.totalRevenue / max) * 100)}%` }} />
                    </div>
                    <span className="shrink-0 text-right text-emerald-400 font-semibold sm:w-28">{money(r.totalRevenue)}</span>
                    <span className="hidden w-16 shrink-0 text-right text-stone-500 sm:inline">{r.totalPayments} pay.</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <Empty text="No paid transactions in this period." />}
        </div>
      );
    }

    if (tab === "customers") {
      return report.length ? (
        <Table headers={["Customer", "Email", "Bookings", "Total spent", "Status"]}>
          {report.map((c) => (
            <tr key={c._id} className="hover:bg-white/5">
              <td className="py-3 px-6 text-white">{[c.firstMiddleName, c.lastName].filter(Boolean).join(" ") || "—"}</td>
              <td className="py-3 px-6">{c.email}</td>
              <td className="py-3 px-6">{c.totalBookings}</td>
              <td className="py-3 px-6 text-emerald-400">{money(c.totalSpent)}</td>
              <td className="py-3 px-6"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${c.isActive === false ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"}`}>{c.isActive === false ? "Inactive" : "Active"}</span></td>
            </tr>
          ))}
        </Table>
      ) : <Empty text="No customers found." />;
    }

    if (tab === "hotels") {
      return report.length ? (
        <Table headers={["Hotel", "City", "Rooms", "Bookings", "Revenue", "Rating", "Status"]}>
          {report.map((h) => (
            <tr key={h._id} className="hover:bg-white/5">
              <td className="py-3 px-6 text-white">{h.hotelName}</td>
              <td className="py-3 px-6">{h.cityName || "—"}</td>
              <td className="py-3 px-6">{h.totalRooms}</td>
              <td className="py-3 px-6">{h.totalBookings}</td>
              <td className="py-3 px-6 text-emerald-400">{money(h.totalRevenue)}</td>
              <td className="py-3 px-6">{h.totalReviews ? `${Math.round(h.averageRating * 10) / 10} ★ (${h.totalReviews})` : "No reviews"}</td>
              <td className="py-3 px-6"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${h.status === "approved" ? "bg-emerald-500/20 text-emerald-400" : h.status === "pending" ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"}`}>{h.status}</span></td>
            </tr>
          ))}
        </Table>
      ) : <Empty text="No hotels found." />;
    }

    if (tab === "occupancy") {
      return report.length ? (
        <Table headers={["Hotel", "Total rooms", "Available", "Occupied", "Maintenance", "Occupancy"]}>
          {report.map((o) => (
            <tr key={String(o._id?.hotelId)} className="hover:bg-white/5">
              <td className="py-3 px-6 text-white">{o._id?.hotelName || "—"}</td>
              <td className="py-3 px-6">{o.totalRooms}</td>
              <td className="py-3 px-6 text-emerald-400">{o.availableRooms}</td>
              <td className="py-3 px-6 text-blue-400">{o.occupiedRooms}</td>
              <td className="py-3 px-6 text-orange-400">{o.maintenanceRooms}</td>
              <td className="py-3 px-6">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-amber-500" style={{ width: `${o.occupancyPercentage || 0}%` }} /></div>
                  <span className="text-xs">{o.occupancyPercentage || 0}%</span>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      ) : <Empty text="No rooms found." />;
    }

    if (tab === "payments") {
      const summary = report.summary || [];
      const sum = (status) => summary.find((s) => s._id === status) || { count: 0, totalAmount: 0 };
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard label="Paid" value={money(sum("paid").totalAmount)} accent="text-emerald-400" />
            <StatCard label="Paid transactions" value={sum("paid").count} />
            <StatCard label="Refunded" value={money(sum("refunded").totalAmount)} accent="text-purple-300" />
            <StatCard label="Refund transactions" value={sum("refunded").count} />
          </div>
          {report.payments?.length ? (
            <Table headers={["Transaction", "Guest", "Hotel / Room", "Method", "Amount", "Paid on", "Status"]}>
              {report.payments.map((p) => (
                <tr key={p._id} className="hover:bg-white/5">
                  <td className="py-3 px-6 font-mono text-xs text-stone-400">{p.transactionId || p._id}</td>
                  <td className="py-3 px-6 text-white">{p.userName}</td>
                  <td className="py-3 px-6">{p.hotelName} <span className="text-stone-500">· {p.roomNumber}</span></td>
                  <td className="py-3 px-6 capitalize">{p.paymentMethod}</td>
                  <td className="py-3 px-6 text-emerald-400">{money(p.amount)}</td>
                  <td className="py-3 px-6 text-xs">{formatDate(p.paidOn)}</td>
                  <td className="py-3 px-6"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${paymentStatusClass[p.paymentStatus] || ""}`}>{p.paymentStatus}</span></td>
                </tr>
              ))}
            </Table>
          ) : <Empty text="No payments in this period." />}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="animate-in fade-in zoom-in duration-500 relative">
      <div className="mb-5 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2 flex items-center gap-3"><FiBarChart2 className="text-amber-400" /> Reports & Analytics</h1>
        <p className="text-stone-400">Bookings, revenue, customers, hotel performance, occupancy and payments.</p>
      </div>

      {/* Tabs */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 mb-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 sm:mb-5">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = t.key === tab;
          return (
            <button
              key={t.key}
              onClick={() => switchTab(t.key)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all ${active ? "border-amber-500/40 bg-amber-500/15 text-amber-300" : "border-white/10 bg-black/40 text-stone-400 hover:bg-white/5 hover:text-white"}`}
            >
              <Icon className="h-4 w-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 items-end gap-2 mb-5 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
        {activeTab?.dated && (
          <>
            <label className="flex min-w-0 flex-col gap-1 text-xs text-stone-500 sm:flex-row sm:items-center sm:gap-3">From
              <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} className={`${inputClass} w-full min-w-0 sm:w-auto`} />
            </label>
            <label className="flex min-w-0 flex-col gap-1 text-xs text-stone-500 sm:flex-row sm:items-center sm:gap-3">To
              <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} className={`${inputClass} w-full min-w-0 sm:w-auto`} />
            </label>
            {(fromDate || toDate) && (
              <button onClick={() => { setFromDate(""); setToDate(""); setPage(1); }} className="col-span-2 text-left text-xs text-stone-400 underline-offset-4 hover:text-white hover:underline">Clear dates</button>
            )}
          </>
        )}
        {(tab === "customers" || tab === "hotels") && (
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={tab === "customers" ? "Search name or email..." : "Search hotel name..."}
            className={`${inputClass} col-span-2 w-full sm:w-64`}
          />
        )}
      </div>

      {renderBody()}

      {pagination && !loading && (
        <Pagination className="mt-4" page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} limit={pagination.limit} onChange={setPage} />
      )}
    </div>
  );
};

export default SuperAdminReports;
