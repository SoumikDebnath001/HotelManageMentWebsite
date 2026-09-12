import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { FiUser, FiMail, FiPhone, FiMapPin, FiSave, FiEdit3, FiInfo, FiCamera, FiUploadCloud } from "react-icons/fi";
import GlassCard from "../../../Features/Auth/Components/GlassCard";
import { getUserProfile, updateUserProfile, uploadUserProfileImage } from "../../../Services/auth.service";
import { updateUserImage } from "../../../Store/Slices/AuthSlice";
import toast from "react-hot-toast";

const UserInfo = () => {
  const dispatch = useDispatch();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    firstMiddleName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    nationalityName: "",
    maritalStatus: "",
    anniversary: "",
    cityName: "",
    stateName: "",
    passportNumber: "",
    passportExpiryDate: "",
    issuingCountry: "",
    panCardNumber: ""
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await getUserProfile();
      if (res?.data?.status && res?.data?.data) {
        const data = res.data.data;
        setProfile(data);
        
        const formatDate = (d) => d ? new Date(d).toISOString().split('T')[0] : "";
        
        setFormData({
          firstMiddleName: data.firstMiddleName || data.name || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.contact?.mobileNumber || data.mobile || "",
          gender: data.gender || "",
          dateOfBirth: formatDate(data.dateOfBirth),
          nationalityName: data.nationalityName || "",
          maritalStatus: data.maritalStatus || "",
          anniversary: formatDate(data.anniversary),
          cityName: data.cityName || "",
          stateName: data.stateName || "",
          passportNumber: data.documents?.passportNumber || "",
          passportExpiryDate: formatDate(data.documents?.passportExpiryDate),
          issuingCountry: data.documents?.issuingCountry || "",
          panCardNumber: data.documents?.panCardNumber || ""
        });
      }
    } catch (error) {
      toast.error("Failed to load user profile");
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        firstMiddleName: formData.firstMiddleName,
        lastName: formData.lastName,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth || null,
        nationalityName: formData.nationalityName,
        maritalStatus: formData.maritalStatus,
        anniversary: formData.anniversary || null,
        cityName: formData.cityName,
        stateName: formData.stateName,
        contact: {
          mobileNumber: formData.phone,
          email: formData.email
        },
        documents: {
          passportNumber: formData.passportNumber,
          passportExpiryDate: formData.passportExpiryDate || null,
          issuingCountry: formData.issuingCountry,
          panCardNumber: formData.panCardNumber
        }
      };

      const res = await updateUserProfile(payload);
      if (res?.data?.status) {
        toast.success("Profile updated successfully");
        setIsEditing(false);
        loadProfile();
      } else {
        toast.error(res?.data?.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Error updating profile");
    }
    setSaving(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const uploadRes = await uploadUserProfileImage(file);
      if (uploadRes?.data?.status && uploadRes?.data?.url) {
        const imageUrl = uploadRes.data.url;
        // Immediately update profile with new image
        const updateRes = await updateUserProfile({ image: imageUrl });
        
        if (updateRes?.data?.status) {
          toast.success("Profile image updated");
          dispatch(updateUserImage(imageUrl)); // Update Redux state
          loadProfile(); // Reload to get fresh data
        } else {
          toast.error(updateRes?.data?.message || "Failed to save profile image");
        }
      } else {
        toast.error("Failed to upload image");
      }
    } catch (error) {
      toast.error("Error uploading image");
    }
    setUploadingImage(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const calculateCompleteness = () => {
    const fieldsToCheck = [
      formData.firstMiddleName,
      formData.lastName,
      formData.phone,
      formData.gender,
      formData.dateOfBirth,
      formData.nationalityName,
      formData.maritalStatus,
      formData.cityName,
      formData.stateName,
      formData.passportNumber,
      formData.panCardNumber
    ];
    
    let totalFields = fieldsToCheck.length;
    let filledFields = fieldsToCheck.filter(v => v && v.trim() !== "").length;
    
    if (formData.maritalStatus === "Married") {
      totalFields++;
      if (formData.anniversary && formData.anniversary.trim() !== "") filledFields++;
    }

    return Math.round((filledFields / totalFields) * 100);
  };

  const completeness = calculateCompleteness();
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completeness / 100) * circumference;

  // Render Field Helper
  const renderField = ({ label, name, type = "text", value, placeholder, options, disabled = false, icon: Icon }) => {
    // VIEW MODE
    if (!isEditing) {
      return (
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-amber-500/80 mb-1">{label}</label>
          <div className="text-sm text-white font-medium py-2 px-1 border-b border-white/5 min-h-[40px] flex items-center">
            {value ? value : <span className="text-stone-600 italic font-normal">Not provided</span>}
          </div>
        </div>
      );
    }

    // EDIT MODE
    return (
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-amber-200/90 mb-2">{label}</label>
        {options ? (
          <select
            name={name}
            value={value}
            onChange={handleInputChange}
            disabled={disabled}
            className="w-full rounded-xl border border-white/15 bg-black/40 py-3 px-4 text-sm text-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:opacity-50 disabled:bg-black/20"
          >
            <option value="">Select {label}</option>
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : Icon ? (
          <div className="relative">
            <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 h-4 w-4" />
            <input
              type={type}
              name={name}
              value={value}
              onChange={handleInputChange}
              disabled={disabled}
              className="w-full rounded-xl border border-white/15 bg-black/40 py-3 pl-11 pr-4 text-sm text-white placeholder:text-stone-600 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:opacity-50 disabled:bg-black/20"
              placeholder={placeholder}
            />
          </div>
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={handleInputChange}
            disabled={disabled}
            className={`w-full rounded-xl border border-white/15 bg-black/40 py-3 px-4 text-sm text-white placeholder:text-stone-600 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:opacity-50 disabled:bg-black/20 ${type === 'date' ? '[color-scheme:dark]' : ''}`}
            placeholder={placeholder}
          />
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div>
        <h2 className="font-serif text-3xl font-bold text-white">My Profile</h2>
        <p className="mt-1 text-sm text-stone-400">View and update your personal information.</p>
      </div>

      <GlassCard className="border-white/15 p-6 sm:p-8 relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/10 blur-[80px]" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-white/10 pb-6 mb-6">
          <div className="flex w-full min-w-0 items-center gap-4 sm:w-auto sm:gap-5">
            
            {/* Circular Progress Avatar */}
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
              {completeness < 100 && (
                <svg className="absolute inset-0 h-24 w-24 -rotate-90 transform" viewBox="0 0 80 80">
                  <circle
                    className="text-stone-800"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="40"
                    cy="40"
                  />
                  <circle
                    className="text-amber-500 transition-all duration-1000 ease-in-out"
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="40"
                    cy="40"
                  />
                </svg>
              )}
              
              <div className="z-10 relative group flex h-20 w-20 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/20 text-amber-300 shadow-inner overflow-hidden cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                {profile?.image ? (
                  <img src={profile.image} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <FiUser className="h-10 w-10" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                  {uploadingImage ? (
                     <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    <FiCamera className="h-6 w-6 text-white" />
                  )}
                </div>
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {completeness < 100 && (
                <div className="absolute -bottom-2 -right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-stone-900 font-bold text-xs text-amber-400 border border-amber-500/30">
                  {completeness}%
                </div>
              )}
            </div>

            <div className="min-w-0">
              <h3 className="font-serif text-xl font-bold text-white break-words sm:text-2xl">
                {formData.firstMiddleName} {formData.lastName}
              </h3>
              <p className="text-stone-400 flex items-center gap-2 mt-1 text-sm min-w-0">
                <FiMail className="h-4 w-4 shrink-0" /> <span className="truncate">{profile?.email}</span>
              </p>
              {completeness < 100 && (
                <p className="mt-2 text-xs text-amber-400/80 flex items-center gap-1">
                  <FiInfo className="h-3 w-3" /> Complete your profile to unlock all features
                </p>
              )}
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
              isEditing ? "bg-stone-800 text-stone-300 hover:bg-stone-700" : "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg hover:from-amber-500 hover:to-amber-600"
            }`}
          >
            {isEditing ? "Cancel Edit" : <><FiEdit3 className="h-4 w-4" /> Edit Profile</>}
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-8 relative z-10">
          
          {/* General Information */}
          <div>
            <h4 className="text-amber-500 font-serif text-lg border-b border-white/5 pb-2 mb-4">General Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {renderField({ label: "First/Middle Name", name: "firstMiddleName", value: formData.firstMiddleName, placeholder: "e.g. John" })}
              {renderField({ label: "Last Name", name: "lastName", value: formData.lastName, placeholder: "e.g. Doe" })}
              {renderField({ label: "Email Address", name: "email", value: formData.email, type: "email", disabled: true })}
              {renderField({ label: "Phone Number", name: "phone", value: formData.phone, type: "tel", placeholder: "Enter phone number", icon: FiPhone })}
              {renderField({ label: "Gender", name: "gender", value: formData.gender, options: [{label: "Male", value: "Male"}, {label: "Female", value: "Female"}, {label: "Other", value: "Other"}] })}
              {renderField({ label: "Date of Birth", name: "dateOfBirth", value: formData.dateOfBirth, type: "date" })}
            </div>
          </div>

          {/* Location & Marital Details */}
          <div>
            <h4 className="text-amber-500 font-serif text-lg border-b border-white/5 pb-2 mb-4 mt-6">Location & Status</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {renderField({ label: "Nationality", name: "nationalityName", value: formData.nationalityName, placeholder: "e.g. American" })}
              {renderField({ label: "Marital Status", name: "maritalStatus", value: formData.maritalStatus, options: [{label: "Single", value: "Single"}, {label: "Married", value: "Married"}] })}
              {formData.maritalStatus === "Married" && renderField({ label: "Anniversary", name: "anniversary", value: formData.anniversary, type: "date" })}
              {renderField({ label: "City", name: "cityName", value: formData.cityName, placeholder: "City Name" })}
              {renderField({ label: "State / Province", name: "stateName", value: formData.stateName, placeholder: "State Name" })}
            </div>
          </div>

          {/* Document Information */}
          <div>
            <h4 className="text-amber-500 font-serif text-lg border-b border-white/5 pb-2 mb-4 mt-6">Identity Documents</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {renderField({ label: "Passport Number", name: "passportNumber", value: formData.passportNumber, placeholder: "Passport Number" })}
              {renderField({ label: "Passport Expiry Date", name: "passportExpiryDate", value: formData.passportExpiryDate, type: "date" })}
              {renderField({ label: "Issuing Country", name: "issuingCountry", value: formData.issuingCountry, placeholder: "Issuing Country" })}
              {renderField({ label: "PAN Card Number", name: "panCardNumber", value: formData.panCardNumber, placeholder: "PAN Number" })}
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end pt-4 border-t border-white/10 mt-8">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:from-emerald-500 hover:to-emerald-600 disabled:opacity-50 transition-all"
              >
                {saving ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <FiSave className="h-4 w-4" />
                )}
                Save Profile
              </button>
            </div>
          )}
        </form>
      </GlassCard>
    </div>
  );
};

export default UserInfo;
