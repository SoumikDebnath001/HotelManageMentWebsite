import React, { useEffect, useState, useRef } from "react";
import { FiPlus, FiX, FiEdit2, FiUpload, FiTrash2, FiImage } from "react-icons/fi";
import toast from "react-hot-toast";
import { fetchMyHotels, createHotel, updateHotel, uploadHotelImage, fetchAmenities } from "../../Services/admin.service";
import AmenityPicker from "../../Components/Common/AmenityPicker";

const AdminHotelsList = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editHotel, setEditHotel] = useState(null);
  const [editFormData, setEditFormData] = useState({
    hotelName: "",
    description: "",
    email: "",
    mobileNumber: "",
    address: "",
    starRating: "",
  });
  const [editAmenities, setEditAmenities] = useState([]);
  const [editCoverImage, setEditCoverImage] = useState(null);     // string URL or null
  const [editGalleryImages, setEditGalleryImages] = useState([]); // string URL[]
  const [editUploading, setEditUploading] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const editCoverInputRef = useRef(null);
  const editGalleryInputRef = useRef(null);

  // Create Form State
  const [formData, setFormData] = useState({
    hotelName: "",
    description: "",
    email: "",
    mobileNumber: "",
    address: "",
    starRating: "",
  });
  const [createAmenities, setCreateAmenities] = useState([]);
  const [createCoverImage, setCreateCoverImage] = useState(null);
  const [createGalleryImages, setCreateGalleryImages] = useState([]);
  const [createUploading, setCreateUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const createCoverInputRef = useRef(null);
  const createGalleryInputRef = useRef(null);

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    setLoading(true);
    try {
      const res = await fetchMyHotels();
      if (res?.data?.status) {
        setHotels(res.data.data || []);
      }
    } catch (error) {
      toast.error("Failed to fetch hotels");
    }
    setLoading(false);
  };

  // ===== Helper: Upload a single file and return URL =====
  const uploadSingleImage = async (file) => {
    const res = await uploadHotelImage(file);
    if (res?.data?.status && res.data.url) {
      return res.data.url;
    }
    return null;
  };

  // ===== CREATE MODAL HANDLERS =====
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCreateUploading(true);
    try {
      const url = await uploadSingleImage(file);
      if (url) {
        setCreateCoverImage(url);
        toast.success("Cover image uploaded");
      } else {
        toast.error("Failed to upload cover image");
      }
    } catch {
      toast.error("Error uploading cover image");
    }
    setCreateUploading(false);
    if (createCoverInputRef.current) createCoverInputRef.current.value = "";
  };

  const handleCreateGalleryUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setCreateUploading(true);
    try {
      for (const file of files) {
        const url = await uploadSingleImage(file);
        if (url) {
          setCreateGalleryImages((prev) => [...prev, url]);
        } else {
          toast.error("Failed to upload an image");
        }
      }
    } catch {
      toast.error("Error uploading gallery images");
    }
    setCreateUploading(false);
    if (createGalleryInputRef.current) createGalleryInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = { ...formData };
      if (payload.starRating) {
        payload.starRating = Number(payload.starRating);
      }
      // Build image array: cover first, then gallery
      const imageArray = [];
      if (createCoverImage) imageArray.push(createCoverImage);
      imageArray.push(...createGalleryImages);
      if (imageArray.length > 0) payload.image = imageArray;
      payload.amenities = createAmenities;

      const res = await createHotel(payload);
      if (res?.data?.status) {
        toast.success(res.data.message || "Hotel created successfully");
        setIsModalOpen(false);
        setFormData({ hotelName: "", description: "", email: "", mobileNumber: "", address: "", starRating: "" });
        setCreateCoverImage(null);
        setCreateGalleryImages([]);
        setCreateAmenities([]);
        loadHotels();
      } else {
        toast.error(res?.data?.message || "Failed to create hotel");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating hotel");
    }
    setCreating(false);
  };

  const handleUpdateStatus = async (hotelId, updates) => {
    setActionLoading(hotelId);
    try {
      const res = await updateHotel({ hotelId, ...updates });
      if (res?.data?.status) {
        toast.success(res.data.message || "Hotel updated successfully");
        loadHotels();
      } else {
        toast.error(res?.data?.message || "Failed to update hotel");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating hotel");
    }
    setActionLoading(null);
  };

  // ===== EDIT MODAL HANDLERS =====
  const openEditModal = (hotel) => {
    setEditHotel(hotel);
    setEditFormData({
      hotelName: hotel.hotelName || "",
      description: hotel.description || "",
      email: hotel.email || "",
      mobileNumber: hotel.mobileNumber || "",
      address: hotel.address || "",
      starRating: hotel.starRating ? String(hotel.starRating) : "",
    });
    setEditAmenities(hotel.amenities || []);
    const images = hotel.image || [];
    setEditCoverImage(images.length > 0 ? images[0] : null);
    setEditGalleryImages(images.length > 1 ? images.slice(1) : []);
    setEditModalOpen(true);
  };

  const handleEditInputChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditUploading(true);
    try {
      const url = await uploadSingleImage(file);
      if (url) {
        setEditCoverImage(url);
        toast.success("Cover image updated");
      } else {
        toast.error("Failed to upload cover image");
      }
    } catch {
      toast.error("Error uploading cover image");
    }
    setEditUploading(false);
    if (editCoverInputRef.current) editCoverInputRef.current.value = "";
  };

  const handleEditGalleryUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setEditUploading(true);
    try {
      for (const file of files) {
        const url = await uploadSingleImage(file);
        if (url) {
          setEditGalleryImages((prev) => [...prev, url]);
        } else {
          toast.error("Failed to upload an image");
        }
      }
    } catch {
      toast.error("Error uploading gallery images");
    }
    setEditUploading(false);
    if (editGalleryInputRef.current) editGalleryInputRef.current.value = "";
  };

  const handleRemoveGalleryImage = (index) => {
    setEditGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editHotel) return;
    setEditSaving(true);
    try {
      // Build image array: cover first, then gallery
      const imageArray = [];
      if (editCoverImage) imageArray.push(editCoverImage);
      imageArray.push(...editGalleryImages);

      const payload = {
        hotelId: editHotel._id,
        ...editFormData,
        image: imageArray,
        amenities: editAmenities,
      };
      if (payload.starRating) {
        payload.starRating = Number(payload.starRating);
      }
      const res = await updateHotel(payload);
      if (res?.data?.status) {
        toast.success(res.data.message || "Hotel updated successfully");
        setEditModalOpen(false);
        setEditHotel(null);
        loadHotels();
      } else {
        toast.error(res?.data?.message || "Failed to update hotel");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating hotel");
    }
    setEditSaving(false);
  };

  // ===== REUSABLE IMAGE UPLOAD UI COMPONENTS =====
  const CoverImageSection = ({ coverImage, onRemove, inputRef, onUpload, uploading, label = "Cover Image" }) => (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
        {label} <span className="text-stone-500 font-normal normal-case tracking-normal">(Main display image)</span>
      </label>
      
      {coverImage ? (
        <div className="relative group rounded-xl overflow-hidden border border-white/10 aspect-video mb-2">
          <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-3 py-2 bg-amber-500/90 text-stone-950 rounded-lg text-xs font-bold hover:bg-amber-400 transition-colors flex items-center gap-1"
            >
              <FiUpload className="h-3 w-3" /> Change
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="px-3 py-2 bg-red-500/90 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors flex items-center gap-1"
            >
              <FiTrash2 className="h-3 w-3" /> Remove
            </button>
          </div>
          <div className="absolute top-2 left-2 px-2 py-1 bg-amber-500/90 text-stone-950 rounded-md text-[10px] font-bold uppercase tracking-wider">
            Cover
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="w-full flex flex-col items-center justify-center gap-2 px-4 py-8 rounded-xl border-2 border-dashed border-white/15 text-stone-400 hover:border-amber-500/50 hover:text-amber-400 transition-all disabled:opacity-50 aspect-video"
        >
          {uploading ? (
            <>
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
              <span className="text-xs">Uploading...</span>
            </>
          ) : (
            <>
              <FiImage className="h-8 w-8" />
              <span className="text-sm font-medium">Upload Cover Image</span>
              <span className="text-xs text-stone-500">This will be the main image shown on cards</span>
            </>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onUpload}
        className="hidden"
      />
    </div>
  );

  const GalleryImagesSection = ({ galleryImages, onRemove, inputRef, onUpload, uploading, label = "Gallery Images" }) => (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
        {label} <span className="text-stone-500 font-normal normal-case tracking-normal">(Room views & interior)</span>
      </label>
      
      {galleryImages.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {galleryImages.map((imgUrl, index) => (
            <div key={index} className="relative group rounded-xl overflow-hidden border border-white/10 aspect-video">
              <img src={imgUrl} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute top-1 right-1 p-1 bg-red-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <FiTrash2 className="h-3 w-3" />
              </button>
              <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-white rounded text-[9px] font-medium">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={onUpload}
        className="hidden"
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-white/15 text-stone-400 hover:border-amber-500/50 hover:text-amber-400 transition-all disabled:opacity-50"
      >
        {uploading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
            Uploading...
          </>
        ) : (
          <>
            <FiUpload className="h-4 w-4" />
            Add Gallery Images
          </>
        )}
      </button>
    </div>
  );

  return (
    <div className="animate-in fade-in zoom-in duration-500 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">My Hotels</h1>
          <p className="text-stone-400">View and manage the hotels under your administration.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-stone-950 px-4 py-2 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)]"
        >
          <FiPlus />
          Add Hotel
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          </div>
        ) : hotels.length === 0 ? (
          <div className="p-8 text-center text-stone-400 text-sm">
            No hotels assigned yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/10 text-stone-300 uppercase tracking-wider text-xs">
                <tr>
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Code</th>
                  <th className="py-4 px-6">Amenities</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-stone-300">
                {hotels.map((hotel) => (
                  <tr key={hotel._id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-4 px-6 font-medium text-white">
                      {hotel.hotelName}
                      {!hotel.isActive && hotel.status === 'approved' && <span className="ml-2 text-xs text-red-500">(Revoked)</span>}
                    </td>
                    <td className="py-4 px-6 font-mono text-amber-400/80">
                      {hotel.hotelCode || <span className="text-stone-500 italic">Pending...</span>}
                    </td>
                    <td className="py-4 px-6">
                      {hotel.amenities && hotel.amenities.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {hotel.amenities.slice(0, 3).map((amenity) => (
                            <span key={amenity} className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-stone-300">{amenity}</span>
                          ))}
                          {hotel.amenities.length > 3 && <span className="text-[10px] text-stone-500">+{hotel.amenities.length - 3} more</span>}
                        </div>
                      ) : (
                        <span className="text-xs text-stone-500 italic">None</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        hotel.status === "approved" ? "bg-emerald-500/20 text-emerald-400" :
                        hotel.status === "pending" ? "bg-amber-500/20 text-amber-400" :
                        "bg-red-500/20 text-red-400"
                      }`}>
                        {hotel.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(hotel)}
                        className="px-3 py-1 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 rounded-lg transition-colors text-xs font-medium flex items-center gap-1"
                      >
                        <FiEdit2 className="h-3 w-3" />
                        Edit
                      </button>
                      {hotel.status === "approved" && (
                        <>
                          {hotel.isActive ? (
                            <button
                              disabled={actionLoading === hotel._id}
                              onClick={() => handleUpdateStatus(hotel._id, { isActive: false })}
                              className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors text-xs font-medium disabled:opacity-50"
                            >
                              Revoke
                            </button>
                          ) : (
                            <button
                              disabled={actionLoading === hotel._id}
                              onClick={() => handleUpdateStatus(hotel._id, { isActive: true })}
                              className="px-3 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-colors text-xs font-medium disabled:opacity-50"
                            >
                              Resume
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EDIT HOTEL MODAL */}
      {editModalOpen && editHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-950 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0 bg-white/5">
              <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                <FiEdit2 className="text-amber-500" />
                Edit Hotel
              </h2>
              <button 
                onClick={() => { setEditModalOpen(false); setEditHotel(null); }}
                className="text-stone-400 hover:text-white transition-colors"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 overflow-y-auto">
              {/* Hotel Code (read-only) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Hotel Code</label>
                <div className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-amber-400 font-mono text-sm">
                  {editHotel.hotelCode || "Pending Approval"}
                </div>
              </div>

              {/* Hotel Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Hotel Name <span className="text-amber-500">*</span></label>
                <input 
                  required 
                  name="hotelName"
                  value={editFormData.hotelName}
                  onChange={handleEditInputChange}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none transition-colors"
                  placeholder="e.g. Grand Plaza" 
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Description</label>
                <textarea 
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditInputChange}
                  rows="3"
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none resize-none transition-colors"
                  placeholder="Tell us about the hotel..." 
                />
              </div>
              
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Email Address</label>
                <input 
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditInputChange}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none transition-colors"
                  placeholder="hotel@example.com" 
                />
              </div>

              {/* Mobile + Star Rating */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Mobile Number</label>
                  <input 
                    type="tel"
                    name="mobileNumber"
                    value={editFormData.mobileNumber}
                    onChange={handleEditInputChange}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none transition-colors"
                    placeholder="+1 234 567 890" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Star Rating</label>
                  <select
                    name="starRating"
                    value={editFormData.starRating}
                    onChange={handleEditInputChange}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none transition-colors"
                  >
                    <option value="">None</option>
                    <option value="1">1 Star</option>
                    <option value="2">2 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Address</label>
                <input 
                  type="text"
                  name="address"
                  value={editFormData.address}
                  onChange={handleEditInputChange}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none transition-colors"
                  placeholder="123 Main St" 
                />
              </div>

              {/* Amenities */}
              <div className="border-t border-white/10 pt-4">
                <AmenityPicker
                  value={editAmenities}
                  onChange={setEditAmenities}
                  fetchAmenities={fetchAmenities}
                  label="Hotel Amenities"
                  hint="Facilities offered by the hotel. Guests can filter by these."
                />
              </div>

              {/* Divider */}
              <div className="border-t border-white/10 pt-4">
                <h3 className="text-sm font-bold text-white mb-1">Hotel Images</h3>
                <p className="text-xs text-stone-500 mb-4">The cover image appears on hotel cards. Gallery images show room views & interiors.</p>
              </div>

              {/* Cover Image */}
              <CoverImageSection
                coverImage={editCoverImage}
                onRemove={() => setEditCoverImage(null)}
                inputRef={editCoverInputRef}
                onUpload={handleEditCoverUpload}
                uploading={editUploading}
              />

              {/* Gallery Images */}
              <GalleryImagesSection
                galleryImages={editGalleryImages}
                onRemove={handleRemoveGalleryImage}
                inputRef={editGalleryInputRef}
                onUpload={handleEditGalleryUpload}
                uploading={editUploading}
              />

              {/* Action Buttons */}
              <div className="pt-4 flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => { setEditModalOpen(false); setEditHotel(null); }}
                  className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-stone-300 font-medium hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving || editUploading}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50"
                >
                  {editSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE HOTEL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-950 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-serif font-bold text-white">Create New Hotel</h2>
              <button 
                onClick={() => { setIsModalOpen(false); setCreateCoverImage(null); setCreateGalleryImages([]); setCreateAmenities([]); }}
                className="text-stone-400 hover:text-white transition-colors"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Hotel Name <span className="text-amber-500">*</span></label>
                <input 
                  required 
                  name="hotelName"
                  value={formData.hotelName}
                  onChange={handleInputChange}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
                  placeholder="e.g. Grand Plaza" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Description <span className="text-stone-500 font-normal normal-case tracking-normal">(Optional)</span></label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none resize-none"
                  placeholder="Tell us about the hotel..." 
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Email Address <span className="text-stone-500 font-normal normal-case tracking-normal">(Optional)</span></label>
                <input 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
                  placeholder="hotel@example.com" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Mobile Number <span className="text-stone-500 font-normal normal-case tracking-normal">(Optional)</span></label>
                  <input 
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
                    placeholder="+1 234 567 890" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Star Rating <span className="text-stone-500 font-normal normal-case tracking-normal">(Optional)</span></label>
                  <select
                    name="starRating"
                    value={formData.starRating}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">None</option>
                    <option value="1">1 Star</option>
                    <option value="2">2 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Address <span className="text-stone-500 font-normal normal-case tracking-normal">(Optional)</span></label>
                <input 
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
                  placeholder="123 Main St" 
                />
              </div>

              {/* Amenities */}
              <div className="border-t border-white/10 pt-4">
                <AmenityPicker
                  value={createAmenities}
                  onChange={setCreateAmenities}
                  fetchAmenities={fetchAmenities}
                  label="Hotel Amenities"
                  hint="Facilities offered by the hotel. You can also add these later while editing."
                />
              </div>

              {/* Divider */}
              <div className="border-t border-white/10 pt-4">
                <h3 className="text-sm font-bold text-white mb-1">Hotel Images</h3>
                <p className="text-xs text-stone-500 mb-4">Upload a cover image and gallery photos for your hotel.</p>
              </div>

              {/* Cover Image */}
              <CoverImageSection
                coverImage={createCoverImage}
                onRemove={() => setCreateCoverImage(null)}
                inputRef={createCoverInputRef}
                onUpload={handleCreateCoverUpload}
                uploading={createUploading}
              />

              {/* Gallery Images */}
              <GalleryImagesSection
                galleryImages={createGalleryImages}
                onRemove={(index) => setCreateGalleryImages(prev => prev.filter((_, i) => i !== index))}
                inputRef={createGalleryInputRef}
                onUpload={handleCreateGalleryUpload}
                uploading={createUploading}
              />

              <div className="pt-4 flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setCreateCoverImage(null); setCreateGalleryImages([]); setCreateAmenities([]); }}
                  className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-stone-300 font-medium hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || createUploading}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Hotel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHotelsList;
