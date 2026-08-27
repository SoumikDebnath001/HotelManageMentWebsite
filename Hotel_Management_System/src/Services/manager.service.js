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
