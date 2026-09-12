import { axiosInstance } from "./axios";
import { handleApiRequest } from "./apiHandler";

export const getPublicHotels = async (params = {}) => {
  return handleApiRequest(() => axiosInstance("Public").get("/public/getAllHotels", { params }));
};

export const getHotelFilterOptions = async () => {
  return handleApiRequest(() => axiosInstance("Public").get("/public/getHotelFilterOptions"));
};

export const searchPublicHotels = async (search) => {
  return handleApiRequest(() => axiosInstance("Public").get("/public/search", { params: { search } }));
};

export const getPublicHotelById = async (hotelId) => {
  return handleApiRequest(() => axiosInstance("Public").get(`/public/getHotelById`, { params: { hotelId } }));
};

export const getPublicRoomsByHotelId = async (hotelId) => {
  return handleApiRequest(() => axiosInstance("Public").get(`/public/getRoomsByHotelId`, { params: { hotelId } }));
};

export const checkRoomAvailability = async (hotelId, availabilityStatus = "available") => {
  return handleApiRequest(() => axiosInstance("Public").get(`/public/roomAvailability`, { params: { hotelId, availabilityStatus } }));
};

export const getRoomBookedDates = async (roomId) => {
  return handleApiRequest(() => axiosInstance("Public").get(`/public/getRoomBookedDates`, { params: { roomId } }));
};

// Requires Auth
export const bookRoom = async (data) => {
  return handleApiRequest(() => axiosInstance("User").post("/user/bookRoom", data));
};

export const createRazorpayOrder = async (data) => {
  return handleApiRequest(() => axiosInstance("User").post("/user/createRazorpayOrder", data));
};

export const makePayment = async (data) => {
  return handleApiRequest(() => axiosInstance("User").post("/user/makePayment", data));
};

export const cancelBooking = async (data) => {
  return handleApiRequest(() => axiosInstance("User").post("/user/cancelBooking", data));
};

export const getActiveOffers = async (hotelId) => {
  return handleApiRequest(() => axiosInstance("Public").get("/public/getActiveOffers", { params: { hotelId, limit: 50 } }));
};

export const getBookingById = async (bookingId) => {
  return handleApiRequest(() => axiosInstance("User").get("/user/getBookingById", { params: { bookingId } }));
};
