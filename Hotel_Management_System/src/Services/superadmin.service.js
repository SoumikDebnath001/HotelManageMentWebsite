import { axiosInstance } from "./axios";
import { handleApiRequest } from "./apiHandler";

//========================================================================================= Admin Management API Calls
export const createAdmin = async (data) => {
  return handleApiRequest(() => axiosInstance("SuperAdmin").post(`superadmin/createAdmin`, data));
};

export const getAllAdmins = async () => {
  return handleApiRequest(() => axiosInstance("SuperAdmin").get(`superadmin/getAllAdmins`));
};

export const updateAdmin = async (data) => {
  return handleApiRequest(() => axiosInstance("SuperAdmin").post("superadmin/updateAdmin", data));
};

// ============================================================================
// USERS API
// ============================================================================
export const fetchAllUsers = async () => {
  return handleApiRequest(() => axiosInstance("SuperAdmin").get("superadmin/getAllUsers"));
};

export const updateUserStatus = async (data) => {
  return handleApiRequest(() => axiosInstance("SuperAdmin").post("superadmin/updateUserStatus", data));
};

export const deleteUser = async (data) => {
  return handleApiRequest(() => axiosInstance("SuperAdmin").post("superadmin/deleteUser", data));
};

export const deleteAdmin = async (data) => {
  return handleApiRequest(() => axiosInstance("SuperAdmin").post(`superadmin/deleteAdmin`, data));
};

//========================================================================================= Hotel Management API Calls
export const getAllHotels = async (params) => {
  return handleApiRequest(() => axiosInstance("SuperAdmin").get(`superadmin/getAllHotels`, { params }));
};

export const toggleHotelStatus = async (data) => {
  return handleApiRequest(() => axiosInstance("SuperAdmin").post("superadmin/toggleHotelStatus", data));
};

// ============================================================================
// ROOM TYPES API
// ============================================================================
export const fetchRoomTypes = async () => {
  return handleApiRequest(() => axiosInstance("SuperAdmin").get("superadmin/getRoomTypes"));
};

export const createRoomType = async (data) => {
  return handleApiRequest(() => axiosInstance("SuperAdmin").post("superadmin/createRoomType", data));
};

export const updateRoomType = async (data) => {
  return handleApiRequest(() => axiosInstance("SuperAdmin").post("superadmin/updateRoomType", data));
};

export const deleteRoomType = async (data) => {
  return handleApiRequest(() => axiosInstance("SuperAdmin").post("superadmin/deleteRoomType", data));
};

export const approveHotel = async (data) => {
  return handleApiRequest(() => axiosInstance("SuperAdmin").post(`superadmin/approveHotel`, data));
};

export const updateHotel = async (data) => {
  return handleApiRequest(() => axiosInstance("SuperAdmin").post(`superadmin/updateHotel`, data));
};

export const deleteHotel = async (data) => {
  return handleApiRequest(() => axiosInstance("SuperAdmin").post(`superadmin/deleteHotel`, data));
};

export const getAllCountryStates = async () => {
  return handleApiRequest(() => axiosInstance("SuperAdmin").get(`superadmin/getAllCountryStates`));
};

// ============================================================================
// AMENITIES API
// ============================================================================
export const fetchAmenities = async (params = {}) => {
  return handleApiRequest(() => axiosInstance("SuperAdmin").get("superadmin/getAmenities", { params: { limit: 200, ...params } }));
};

export const createAmenity = async (data) => {
  return handleApiRequest(() => axiosInstance("SuperAdmin").post("superadmin/createAmenity", data));
};

export const updateAmenity = async (data) => {
  return handleApiRequest(() => axiosInstance("SuperAdmin").post("superadmin/updateAmenity", data));
};

export const deleteAmenity = async (data) => {
  return handleApiRequest(() => axiosInstance("SuperAdmin").post("superadmin/deleteAmenity", data));
};

// ============================================================================
// BOOKINGS & OFFERS API
// ============================================================================
export const getAllBookings = async (params = {}) => {
  return handleApiRequest(() => axiosInstance("SuperAdmin").get("superadmin/getAllBookings", { params }));
};

export const getAllOffers = async (params = {}) => {
  return handleApiRequest(() => axiosInstance("SuperAdmin").get("superadmin/getAllOffers", { params }));
};
