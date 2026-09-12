import React from "react";
import { Route, Routes } from "react-router-dom";
import AdminLogin from "../../Features/Auth/Pages/AdminLogin";
import SuperAdminLayout from "../../Components/Layout/SuperAdminLayout";
import SuperAdminDashboard from "../../Pages/SuperAdmin/SuperAdminDashboard";
import SuperAdminUsersList from "../../Pages/SuperAdmin/SuperAdminUsersList";
import AdminsList from "../../Pages/SuperAdmin/AdminsList";
import HotelsList from "../../Pages/SuperAdmin/HotelsList";

import AdminLayout from "../../Components/Layout/AdminLayout";
import AdminDashboard from "../../Pages/Admin/AdminDashboard";
import AdminManagersList from "../../Pages/Admin/AdminManagersList";
import AdminHotelsList from "../../Pages/Admin/AdminHotelsList";
import AdminProfile from "../../Pages/Admin/AdminProfile";
import SuperAdminRoomTypes from "../../Pages/SuperAdmin/SuperAdminRoomTypes";
import SuperAdminAmenities from "../../Pages/SuperAdmin/SuperAdminAmenities";
import SuperAdminBookings from "../../Pages/SuperAdmin/SuperAdminBookings";
import SuperAdminOffers from "../../Pages/SuperAdmin/SuperAdminOffers";
import SuperAdminReports from "../../Pages/SuperAdmin/SuperAdminReports";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="auth" element={<AdminLogin />} />
      <Route path="superadmin/login" element={<AdminLogin />} />
      
      <Route path="superadmin" element={<SuperAdminLayout />}>
        <Route path="dashboard" element={<SuperAdminDashboard />} />
        <Route path="users" element={<SuperAdminUsersList />} />
        <Route path="admins" element={<AdminsList />} />
        <Route path="hotels" element={<HotelsList />} />
        <Route path="room-types" element={<SuperAdminRoomTypes />} />
        <Route path="amenities" element={<SuperAdminAmenities />} />
        <Route path="bookings" element={<SuperAdminBookings />} />
        <Route path="offers" element={<SuperAdminOffers />} />
        <Route path="reports" element={<SuperAdminReports />} />
      </Route>

      <Route path="panel" element={<AdminLayout />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="managers" element={<AdminManagersList />} />
        <Route path="hotels" element={<AdminHotelsList />} />

        <Route path="profile" element={<AdminProfile />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
