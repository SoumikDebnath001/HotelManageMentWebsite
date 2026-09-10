import React from "react";
import { Route, Routes } from "react-router-dom";

import PublicLayout from "../../Components/Layout/PublicLayout";
import HomePage from "../../Pages/HomePage";
import Services from "../../Pages/Services";
import About from "../../Pages/About";

import ForgotPasswordPage from "../../Features/Auth/Pages/ForgotPasswordPage";
import DashboardPage from "../../Pages/DashboardPage";
import RoomsPage from "../../Pages/Rooms/RoomsPage";
import StayDetailPage from "../../Pages/StayDetailPage";
import HomeStaysPage from "../../Pages/HomeStaysPage";

const PublicRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="" element={<HomePage />} />
        <Route path="services" element={<Services />} />
        <Route path="about" element={<About />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="stay/:id" element={<StayDetailPage />} />
        <Route path="offer/:id" element={<StayDetailPage />} />
        <Route path="homestays" element={<HomeStaysPage />} />
      </Route>
      {/* Rooms flow has its own custom layout without standard navbar */}
      <Route path="rooms/*" element={<RoomsPage />} />
    </Routes>
  );
};

export default PublicRoutes;