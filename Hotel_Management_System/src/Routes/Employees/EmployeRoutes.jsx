import React from "react";
import { Route, Routes } from "react-router-dom";
import ManagerAuthPage from "../../Features/Auth/Pages/ManagerAuthPage";
import ForgotPasswordPage from "../../Features/Auth/Pages/ForgotPasswordPage";

import ManagerLayout from "../../Components/Layout/ManagerLayout";
import ManagerDashboard from "../../Pages/Manager/ManagerDashboard";
import ManagerRooms from "../../Pages/Manager/ManagerRooms";
import ManagerProfile from "../../Pages/Manager/ManagerProfile";
import ManagerBookings from "../../Pages/Manager/ManagerBookings";
import ManagerOffers from "../../Pages/Manager/ManagerOffers";

const EmployeRoutes = () => {
  return (
    <Routes>
      <Route path="auth/login" element={<ManagerAuthPage />} />
      <Route path="auth/forgot-password" element={<ForgotPasswordPage />} />

      <Route path="panel" element={<ManagerLayout />}>
        <Route path="dashboard" element={<ManagerDashboard />} />
        <Route path="rooms" element={<ManagerRooms />} />
        <Route path="bookings" element={<ManagerBookings />} />
        <Route path="offers" element={<ManagerOffers />} />
        <Route path="profile" element={<ManagerProfile />} />
      </Route>
    </Routes>
  );
};

export default EmployeRoutes;
