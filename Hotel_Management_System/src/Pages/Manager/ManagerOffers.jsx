import { useEffect, useState } from "react";
import { FiPlus, FiX, FiEdit2, FiTrash2, FiTag } from "react-icons/fi";
import toast from "react-hot-toast";
import { fetchMyHotel, fetchMyOffers, createOffer, updateOffer, deleteOffer } from "../../Services/manager.service";
import Pagination from "../../Components/Common/Pagination";
import ConfirmButton from "../../Components/Common/ConfirmButton";
import { formatDate, offerIsLive, describeDiscount } from "../../Utils/bookingHelpers";

const PAGE_SIZE = 10;

const toInputDate = (value) => (value ? new Date(value).toISOString().split("T")[0] : "");

const emptyForm = {
  offerName: "",
  offerCode: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  maxDiscountAmount: "",
  minBookingAmount: "",
  validFrom: "",
  validTill: "",
  isActive: true,
};

const ManagerOffers = () => {
  const [offers, setOffers] = useState([]);
  const [hotelId, setHotelId] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: PAGE_SIZE, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [formData, setFormData] = useState({ ...emptyForm });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await fetchMyHotel();
      if (cancelled) return;
      const hotels = data?.data || [];
      if (hotels.length > 0) setHotelId(hotels[0]._id);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await fetchMyOffers({ page, limit: PAGE_SIZE });
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
  }, [page, refreshKey]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const openCreateModal = () => {
    setFormData({ ...emptyForm });
    setEditingOffer(null);
    setIsModalOpen(true);
  };

  const openEditModal = (offer) => {
    setEditingOffer(offer);
    setFormData({
      offerName: offer.offerName || "",
      offerCode: offer.offerCode || "",
      description: offer.description || "",
      discountType: offer.discountType || "percentage",
      discountValue: offer.discountValue ?? "",
      maxDiscountAmount: offer.maxDiscountAmount ?? "",
      minBookingAmount: offer.minBookingAmount ?? "",
      validFrom: toInputDate(offer.validFrom),
      validTill: toInputDate(offer.validTill),
      isActive: offer.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingOffer(null);
    setFormData({ ...emptyForm });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingOffer && !hotelId) {
      toast.error("No hotel is assigned to your account.");
      return;
    }
    if (formData.validTill && formData.validFrom && formData.validTill <= formData.validFrom) {
      toast.error("Valid till must be after valid from.");
      return;
    }
    if (formData.discountType === "percentage" && Number(formData.discountValue) > 100) {
      toast.error("Percentage discount cannot exceed 100%.");
      return;
    }

    setActionLoading("submitting");
    const payload = {
      offerName: formData.offerName.trim(),
      description: formData.description,
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      validFrom: formData.validFrom,
      validTill: formData.validTill,
      isActive: formData.isActive,
    };
    if (formData.maxDiscountAmount !== "") payload.maxDiscountAmount = Number(formData.maxDiscountAmount);
    if (formData.minBookingAmount !== "") payload.minBookingAmount = Number(formData.minBookingAmount);

    const { data, error } = editingOffer
      ? await updateOffer({ offerId: editingOffer._id, ...payload })
      : await createOffer({ hotelId, offerCode: formData.offerCode.trim().toUpperCase(), ...payload });

    if (!error && data?.status) {
      toast.success(data.message || (editingOffer ? "Offer updated" : "Offer created"));
      closeModal();
      setRefreshKey((k) => k + 1);
    } else {
      toast.error(error || data?.message || "Operation failed");
    }
    setActionLoading(null);
  };

  const handleToggleActive = async (offer) => {
    setActionLoading(offer._id);
    const { data, error } = await updateOffer({ offerId: offer._id, isActive: !offer.isActive });
    if (!error && data?.status) {
      toast.success(`Offer ${offer.isActive ? "deactivated" : "activated"}`);
      setRefreshKey((k) => k + 1);
    } else {
      toast.error(error || data?.message || "Failed to update");
    }
    setActionLoading(null);
  };

  const handleDelete = async (offer) => {
    setActionLoading(offer._id);
    const { data, error } = await deleteOffer({ offerId: offer._id });
    if (!error && data?.status) {
      toast.success("Offer deleted");
      setRefreshKey((k) => k + 1);
    } else {
      toast.error(error || data?.message || "Failed to delete");
    }
    setActionLoading(null);
  };

  const inputClass = "w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none [color-scheme:dark]";
  const labelClass = "block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2";

  return (
    <div className="animate-in fade-in zoom-in duration-500 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">Offers</h1>
          <p className="text-stone-400">Discount codes guests can apply at checkout for your hotel.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-stone-950 px-4 py-2 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)]"
        >
          <FiPlus /> Add Offer
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          </div>
        ) : offers.length === 0 ? (
          <div className="p-8 text-center text-stone-400 text-sm">No offers yet. Click "Add Offer" to create your first discount code.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/10 text-stone-300 uppercase tracking-wider text-xs">
                <tr>
                  <th className="py-4 px-6">Offer</th>
                  <th className="py-4 px-6">Discount</th>
                  <th className="py-4 px-6">Min. booking</th>
                  <th className="py-4 px-6">Validity</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-stone-300">
                {offers.map((offer) => (
                  <tr key={offer._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-medium text-white flex items-center gap-2"><FiTag className="h-4 w-4 text-amber-400" />{offer.offerName}</p>
                      <p className="font-mono text-xs text-amber-400/80 mt-0.5">{offer.offerCode}</p>
                    </td>
                    <td className="py-4 px-6 text-emerald-400 font-medium">{describeDiscount(offer)}</td>
                    <td className="py-4 px-6">{offer.minBookingAmount ? `₹${offer.minBookingAmount.toLocaleString()}` : "—"}</td>
                    <td className="py-4 px-6 text-xs">{formatDate(offer.validFrom)} → {formatDate(offer.validTill)}</td>
                    <td className="py-4 px-6">
                      <button
                        disabled={actionLoading === offer._id}
                        onClick={() => handleToggleActive(offer)}
                        title="Click to toggle"
                        className={`px-2 py-1 rounded-full text-xs font-semibold transition-colors ${offerIsLive(offer) ? "bg-emerald-500/20 text-emerald-400" : offer.isActive ? "bg-stone-500/20 text-stone-300" : "bg-red-500/20 text-red-400"}`}
                      >
                        {offerIsLive(offer) ? "Live" : offer.isActive ? "Scheduled / Expired" : "Inactive"}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditModal(offer)} className="px-3 py-1 bg-stone-500/20 text-stone-300 hover:bg-stone-500/40 rounded-lg transition-colors text-xs font-medium flex items-center gap-1">
                          <FiEdit2 className="h-3 w-3" /> Edit
                        </button>
                        <ConfirmButton
                          disabled={actionLoading === offer._id}
                          onConfirm={() => handleDelete(offer)}
                          confirmLabel="Click again to delete"
                          className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors text-xs font-medium flex items-center gap-1 disabled:opacity-50"
                          armedClassName="!bg-red-500 !text-white"
                        >
                          <FiTrash2 className="h-3 w-3" /> Delete
                        </ConfirmButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination className="mt-4" page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} limit={pagination.limit} onChange={setPage} />

      {/* CREATE / EDIT OFFER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-950 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-serif font-bold text-white">{editingOffer ? "Edit Offer" : "Add New Offer"}</h2>
              <button onClick={closeModal} className="text-stone-400 hover:text-white transition-colors"><FiX className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Offer Name <span className="text-amber-500">*</span></label>
                  <input required name="offerName" value={formData.offerName} onChange={handleInputChange} className={inputClass} placeholder="e.g. Monsoon Special" />
                </div>
                <div>
                  <label className={labelClass}>Offer Code <span className="text-amber-500">*</span></label>
                  <input
                    required
                    disabled={Boolean(editingOffer)}
                    name="offerCode"
                    value={formData.offerCode}
                    onChange={(e) => setFormData({ ...formData, offerCode: e.target.value.toUpperCase().replace(/\s+/g, "") })}
                    className={`${inputClass} font-mono uppercase disabled:opacity-60`}
                    placeholder="e.g. MONSOON20"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Description <span className="text-stone-500 font-normal normal-case tracking-normal">(Optional)</span></label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="2" className={`${inputClass} resize-none`} placeholder="What does this offer include?" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Discount Type <span className="text-amber-500">*</span></label>
                  <select name="discountType" value={formData.discountType} onChange={handleInputChange} className={`${inputClass} [&>option]:bg-stone-900`}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Discount Value <span className="text-amber-500">*</span></label>
                  <input required type="number" min="0" step="0.01" name="discountValue" value={formData.discountValue} onChange={handleInputChange} className={inputClass} placeholder={formData.discountType === "percentage" ? "e.g. 20" : "e.g. 500"} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Max Discount (₹) <span className="text-stone-500 font-normal normal-case tracking-normal">(Opt.)</span></label>
                  <input type="number" min="0" name="maxDiscountAmount" value={formData.maxDiscountAmount} onChange={handleInputChange} className={inputClass} placeholder="Cap for % offers" />
                </div>
                <div>
                  <label className={labelClass}>Min Booking (₹) <span className="text-stone-500 font-normal normal-case tracking-normal">(Opt.)</span></label>
                  <input type="number" min="0" name="minBookingAmount" value={formData.minBookingAmount} onChange={handleInputChange} className={inputClass} placeholder="e.g. 3000" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Valid From <span className="text-amber-500">*</span></label>
                  <input required type="date" name="validFrom" value={formData.validFrom} onChange={handleInputChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Valid Till <span className="text-amber-500">*</span></label>
                  <input required type="date" name="validTill" min={formData.validFrom || undefined} value={formData.validTill} onChange={handleInputChange} className={inputClass} />
                </div>
              </div>

              <label className="inline-flex items-center gap-2.5 text-sm text-stone-300 cursor-pointer">
                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="h-4 w-4 accent-amber-500" />
                Offer is active
              </label>

              <div className="pt-4 flex gap-3 shrink-0">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-stone-300 font-medium hover:bg-white/5 transition-all">Cancel</button>
                <button type="submit" disabled={actionLoading === "submitting"} className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50">
                  {actionLoading === "submitting" ? "Saving..." : editingOffer ? "Save Changes" : "Create Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerOffers;
