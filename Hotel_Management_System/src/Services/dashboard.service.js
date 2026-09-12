import { axiosInstance } from "./axios";
import { handleApiRequest } from "./apiHandler";

// Super Admin / Admin Dashboard Stats
export const fetchAdminDashboard = async () => {
  return handleApiRequest(() => axiosInstance("SuperAdmin").get("superadmin/getDashboard"));
};

// Booking Reports
export const fetchBookingReport = async (params = {}) => {
  return handleApiRequest(() => axiosInstance("SuperAdmin").get("superadmin/bookingReport", { params }));
};

// Revenue Reports
export const fetchRevenueReport = async (params = {}) => {
  return handleApiRequest(() => axiosInstance("SuperAdmin").get("superadmin/revenueReport", { params }));
};

// Customer Reports
export const fetchCustomerReport = async (params = {}) => {
  return handleApiRequest(() => axiosInstance("SuperAdmin").get("superadmin/customerReport", { params }));
};

// Hotel Reports
export const fetchHotelReport = async (params = {}) => {
  return handleApiRequest(() => axiosInstance("SuperAdmin").get("superadmin/hotelReport", { params }));
};

// Room Occupancy Reports
export const fetchRoomOccupancyReport = async (params = {}) => {
  return handleApiRequest(() => axiosInstance("SuperAdmin").get("superadmin/roomOccupancyReport", { params }));
};

// Payment Reports
export const fetchPaymentReport = async (params = {}) => {
  return handleApiRequest(() => axiosInstance("SuperAdmin").get("superadmin/paymentReport", { params }));
};

// User Bookings
export const fetchUserBookings = async () => {
  return handleApiRequest(() => axiosInstance("User").get("user/getMyBookings"));
};

// User Payments
export const fetchUserPayments = async () => {
  return handleApiRequest(() => axiosInstance("User").get("user/getMyPayments"));
};

// User Profile
export const fetchUserProfile = async () => {
  return handleApiRequest(() => axiosInstance("User").get("user/getMyProfile"));
};
