import React from "react";
import { Route, Routes } from "react-router-dom";
import UserLogin from "../../Features/Auth/Pages/UserLogin";
import UserRegistration from "../../Features/Auth/Pages/UserRegistration";
import ForgotPasswordPage from "../../Features/Auth/Pages/ForgotPasswordPage";
import UserDashboard from "../../Pages/User/UserDashboard";
import CheckoutPage from "../../Pages/User/CheckoutPage";

const UserRoutes = () => {
  return (
    <Routes>
      <Route path="auth/login" element={<UserLogin />} />
      <Route path="auth/register" element={<UserRegistration />} />
      <Route path="auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="dashboard" element={<UserDashboard />} />
      <Route path="checkout" element={<CheckoutPage />} />
    </Routes>
  );
};

export default UserRoutes;
