import { Navigate, useNavigate } from "react-router-dom";
import { FiHome, FiGrid, FiUser, FiCalendar, FiTag } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../Store/Slices/AuthSlice";
import PanelLayout from "./PanelLayout";

const NAV_ITEMS = [
  { name: "Dashboard", path: "/employee/panel/dashboard", icon: FiHome },
  { name: "Rooms", path: "/employee/panel/rooms", icon: FiGrid },
  { name: "Bookings", path: "/employee/panel/bookings", icon: FiCalendar },
  { name: "Offers", path: "/employee/panel/offers", icon: FiTag },
  { name: "Profile", path: "/employee/panel/profile", icon: FiUser },
];

const ManagerLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, userType } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/employee/auth/login");
  };

  // Panel is only for the Employee role; everyone else goes to that role's login
  if (!isAuthenticated || userType !== "Employee") {
    return <Navigate to="/employee/auth/login" replace />;
  }

  return <PanelLayout roleLabel="Manager" navItems={NAV_ITEMS} onLogout={handleLogout} />;
};

export default ManagerLayout;
