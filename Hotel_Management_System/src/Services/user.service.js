import { axiosInstance } from "./axios";
import { handleApiRequest } from "./apiHandler";

//========================================================================================= Wishlist API Calls
export const addToWishlist = async (data) => {
  return handleApiRequest(() => axiosInstance("User").post(`user/addToWishlist`, data));
};

export const getMyWishlist = async (page = 1, limit = 10) => {
  return handleApiRequest(() => axiosInstance("User").get(`user/getMyWishlist?page=${page}&limit=${limit}`));
};

export const removeFromWishlist = async (data) => {
  return handleApiRequest(() => axiosInstance("User").post(`user/removeFromWishlist`, data));
};

//========================================================================================= Review API Calls (Mocked for now)
export const getReviewsByHotelId = async (hotelId) => {
  return { data: { status: true, data: [] } };
};
