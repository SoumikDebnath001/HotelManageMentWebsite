import { useEffect, useState } from "react";
import { FiPlus, FiX, FiEdit2, FiTrash2, FiSearch, FiCheckSquare } from "react-icons/fi";
import toast from "react-hot-toast";
import { fetchAmenities, createAmenity, updateAmenity, deleteAmenity } from "../../Services/superadmin.service";
import Pagination from "../../Components/Common/Pagination";
import ConfirmButton from "../../Components/Common/ConfirmButton";

const PAGE_SIZE = 10;

const emptyForm = { amenityName: "", description: "", icon: "" };

const SuperAdminAmenities = () => {
  const [amenities, setAmenities] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: PAGE_SIZE, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState(null);
  const [formData, setFormData] = useState({ ...emptyForm });

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      const { data, error } = await fetchAmenities({ page, limit: PAGE_SIZE, search: search.trim() || undefined });
      if (cancelled) return;
      if (error) toast.error(error);
      if (data?.status) {
        setAmenities(data.data || []);
        setPagination(data.pagination || { total: 0, page: 1, limit: PAGE_SIZE, totalPages: 0 });
      }
      setLoading(false);
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [page, search]);

  const refetch = async () => {
    const { data } = await fetchAmenities({ page, limit: PAGE_SIZE, search: search.trim() || undefined });
    if (data?.status) {
      setAmenities(data.data || []);
      setPagination(data.pagination || pagination);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openCreateModal = () => {
    setFormData({ ...emptyForm });
    setEditingAmenity(null);
    setIsModalOpen(true);
  };

  const openEditModal = (amenity) => {
    setEditingAmenity(amenity);
    setFormData({
      amenityName: amenity.amenityName || "",
      description: amenity.description || "",
      icon: amenity.icon || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAmenity(null);
    setFormData({ ...emptyForm });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading("submitting");
    const payload = { ...formData, amenityName: formData.amenityName.trim() };
    const { data, error } = editingAmenity
      ? await updateAmenity({ amenityId: editingAmenity._id, ...payload })
      : await createAmenity(payload);

    if (!error && data?.status) {
      toast.success(data.message || (editingAmenity ? "Amenity updated" : "Amenity created"));
      closeModal();
      refetch();
    } else {
      toast.error(error || data?.message || "Operation failed");
    }
    setActionLoading(null);
  };

  const handleToggleActive = async (amenity) => {
    setActionLoading(amenity._id);
    const { data, error } = await updateAmenity({ amenityId: amenity._id, isActive: !amenity.isActive });
    if (!error && data?.status) {
      toast.success(`Amenity ${amenity.isActive ? "deactivated" : "activated"}`);
      refetch();
    } else {
      toast.error(error || data?.message || "Failed to update");
    }
    setActionLoading(null);
  };

  const handleDelete = async (amenity) => {
    setActionLoading(amenity._id);
    const { data, error } = await deleteAmenity({ amenityId: amenity._id });
    if (!error && data?.status) {
      toast.success("Amenity deleted");
      refetch();
    } else {
      toast.error(error || data?.message || "Failed to delete");
    }
    setActionLoading(null);
  };

  return (
    <div className="animate-in fade-in zoom-in duration-500 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">Amenities</h1>
          <p className="text-stone-400">Master list of amenities that hotel admins and managers can assign to hotels and rooms.</p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-stone-950 px-4 py-2 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)]"
        >
          <FiPlus />
          Add Amenity
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search amenities..."
          className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-stone-500 focus:border-amber-500 focus:outline-none"
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          </div>
        ) : amenities.length === 0 ? (
          <div className="p-8 text-center text-stone-400 text-sm">
            {search ? `No amenities match "${search}".` : 'No amenities defined yet. Click "Add Amenity" to create one.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/10 text-stone-300 uppercase tracking-wider text-xs">
                <tr>
                  <th className="py-4 px-6">Amenity</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6">Icon</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-stone-300">
                {amenities.map((amenity) => (
                  <tr key={amenity._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 font-medium text-white flex items-center gap-2">
                      <FiCheckSquare className="h-4 w-4 text-amber-400" />
                      {amenity.amenityName}
                    </td>
                    <td className="py-4 px-6 max-w-xs truncate">{amenity.description || "—"}</td>
                    <td className="py-4 px-6 font-mono text-xs text-stone-400">{amenity.icon || "—"}</td>
                    <td className="py-4 px-6">
                      <button
                        disabled={actionLoading === amenity._id}
                        onClick={() => handleToggleActive(amenity)}
                        title="Click to toggle"
                        className={`px-2 py-1 rounded-full text-xs font-semibold transition-colors ${
                          amenity.isActive ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30" : "bg-stone-500/20 text-stone-400 hover:bg-stone-500/30"
                        }`}
                      >
                        {amenity.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(amenity)}
                          className="px-3 py-1 bg-stone-500/20 text-stone-300 hover:bg-stone-500/40 rounded-lg transition-colors text-xs font-medium flex items-center gap-1"
                        >
                          <FiEdit2 className="h-3 w-3" /> Edit
                        </button>
                        <ConfirmButton
                          disabled={actionLoading === amenity._id}
                          onConfirm={() => handleDelete(amenity)}
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

      <Pagination
        className="mt-4"
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        limit={pagination.limit}
        onChange={setPage}
      />

      {/* CREATE / EDIT AMENITY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-950 border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-serif font-bold text-white">
                {editingAmenity ? "Edit Amenity" : "Add New Amenity"}
              </h2>
              <button onClick={closeModal} className="text-stone-400 hover:text-white transition-colors">
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                  Amenity Name <span className="text-amber-500">*</span>
                </label>
                <input
                  required
                  name="amenityName"
                  value={formData.amenityName}
                  onChange={handleInputChange}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
                  placeholder="e.g. Swimming Pool"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                  Description <span className="text-stone-500 font-normal normal-case tracking-normal">(Optional)</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none resize-none"
                  placeholder="Short description shown to hotel admins..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                  Icon Key <span className="text-stone-500 font-normal normal-case tracking-normal">(Optional)</span>
                </label>
                <input
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
                  placeholder="e.g. wifi, pool, spa"
                />
              </div>

              <div className="pt-4 flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-stone-300 font-medium hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "submitting"}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50"
                >
                  {actionLoading === "submitting" ? "Saving..." : editingAmenity ? "Save Changes" : "Create Amenity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminAmenities;
