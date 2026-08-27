import { axiosInstance } from "./axios";
import { handleApiRequest } from "./apiHandler";

// Note: The backend checks req.userType in some middlewares, and for Hotel Admin, it expects the userType header to be "Admin"

export const fetchDashboardStats = async () => {
  return handleApiRequest(() => axiosInstance("Admin").get("admin/getMyDashboardStats"));
};

export const fetchMyHotels = async () => {
  return handleApiRequest(() => axiosInstance("Admin").get("admin/getMyHotels"));
};

export const createHotel = async (hotelData) => {
  return handleApiRequest(() => axiosInstance("Admin").post("admin/createHotel", hotelData));
};

export const fetchMyManagers = async () => {
  return handleApiRequest(() => axiosInstance("Admin").get("admin/getMyManagers"));
};

export const createManager = async (managerData) => {
  return handleApiRequest(() => axiosInstance("Admin").post("admin/createManager", managerData));
};

export const updateHotel = async (hotelData) => {
  return handleApiRequest(() => axiosInstance("Admin").post("admin/updateHotel", hotelData));
};

export const updateManager = async (managerData) => {
  return handleApiRequest(() => axiosInstance("Admin").post("admin/updateManager", managerData));
};

export const fetchMyProfile = async () => {
  return handleApiRequest(() => axiosInstance("Admin").get("admin/getMyProfile"));
};

export const sendPasswordOtp = async () => {
  return handleApiRequest(() => axiosInstance("Admin").get("admin/sendChangePasswordOtp"));
};

export const changePasswordWithOtp = async (data) => {
  return handleApiRequest(() => axiosInstance("Admin").post("admin/changePassword", data));
};


