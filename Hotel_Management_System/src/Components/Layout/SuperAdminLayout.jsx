import { Navigate, useNavigate } from "react-router-dom";
import { FiHome, FiUsers, FiGrid, FiLayers, FiUser, FiCheckSquare, FiCalendar, FiTag, FiBarChart2 } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../Store/Slices/AuthSlice";
import PanelLayout from "./PanelLayout";

const NAV_ITEMS = [
  { name: "Dashboard", path: "/admin/superadmin/dashboard", icon: FiHome },
  { name: "Users", path: "/admin/superadmin/users", icon: FiUser },
  { name: "Admins", path: "/admin/superadmin/admins", icon: FiUsers },
  { name: "Hotels", path: "/admin/superadmin/hotels", icon: FiGrid },
  { name: "Room Types", path: "/admin/superadmin/room-types", icon: FiLayers },
  { name: "Amenities", path: "/admin/superadmin/amenities", icon: FiCheckSquare },
  { name: "Bookings", path: "/admin/superadmin/bookings", icon: FiCalendar },
  { name: "Offers", path: "/admin/superadmin/offers", icon: FiTag },
  { name: "Reports", path: "/admin/superadmin/reports", icon: FiBarChart2 },
];

const SuperAdminLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, userType } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/admin/superadmin/login");
  };

  // Panel is only for the SuperAdmin role; everyone else goes to that role's login
  if (!isAuthenticated || userType !== "SuperAdmin") {
    return <Navigate to="/admin/superadmin/login" replace />;
  }

  return <PanelLayout roleLabel="Super Admin" navItems={NAV_ITEMS} onLogout={handleLogout} />;
};

export default SuperAdminLayout;
