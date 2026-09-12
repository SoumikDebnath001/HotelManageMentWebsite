import { axiosInstance } from "./axios";
import { handleApiRequest } from "./apiHandler";

// Manager uses "Employee" userType for authentication

//========================================================================================= Profile
export const fetchMyProfile = async () => {
  return handleApiRequest(() => axiosInstance("Employee").get("employee/getMyProfile"));
};

export const changePassword = async (data) => {
  return handleApiRequest(() => axiosInstance("Employee").post("employee/changePassword", data));
};

//========================================================================================= Hotel
export const fetchMyHotel = async () => {
  return handleApiRequest(() => axiosInstance("Employee").get("manager/getMyHotels"));
};

//========================================================================================= Rooms
export const fetchHotelRooms = async () => {
  return handleApiRequest(() => axiosInstance("Employee").get("manager/getHotelRooms"));
};

export const createRoom = async (data) => {
  return handleApiRequest(() => axiosInstance("Employee").post("manager/createHotelRoom", data));
};

export const updateRoom = async (data) => {
  return handleApiRequest(() => axiosInstance("Employee").post("manager/updateHotelRoom", data));
};

export const deleteRoom = async (data) => {
  return handleApiRequest(() => axiosInstance("Employee").post("manager/deleteHotelRooms", data));
};

//========================================================================================= Amenities (master list)
export const fetchAmenities = async () => {
  return handleApiRequest(() => axiosInstance("Employee").get("manager/getAmenities", { params: { limit: 200 } }));
};

//========================================================================================= Bookings
export const fetchHotelBookings = async (params = {}) => {
  return handleApiRequest(() => axiosInstance("Employee").get("manager/getHotelBookings", { params }));
};

export const checkInBooking = async (data) => {
  return handleApiRequest(() => axiosInstance("Employee").post("manager/checkInBooking", data));
};

export const checkOutBooking = async (data) => {
  return handleApiRequest(() => axiosInstance("Employee").post("manager/checkOutBooking", data));
};

export const refundPayment = async (data) => {
  return handleApiRequest(() => axiosInstance("Employee").post("manager/refundPayment", data));
};

//========================================================================================= Offers
export const fetchMyOffers = async (params = {}) => {
  return handleApiRequest(() => axiosInstance("Employee").get("manager/getMyOffers", { params }));
};

export const createOffer = async (data) => {
  return handleApiRequest(() => axiosInstance("Employee").post("manager/createOffer", data));
};

export const updateOffer = async (data) => {
  return handleApiRequest(() => axiosInstance("Employee").post("manager/updateOffer", data));
};

export const deleteOffer = async (data) => {
  return handleApiRequest(() => axiosInstance("Employee").post("manager/deleteOffer", data));
};

//========================================================================================= Reviews
export const fetchHotelReviews = async (params = {}) => {
  return handleApiRequest(() => axiosInstance("Employee").get("manager/getHotelReviews", { params }));
};
