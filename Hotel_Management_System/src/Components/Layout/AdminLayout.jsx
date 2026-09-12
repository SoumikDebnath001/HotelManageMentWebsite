import { Navigate, useNavigate } from "react-router-dom";
import { FiHome, FiUsers, FiGrid, FiUser } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../Store/Slices/AuthSlice";
import PanelLayout from "./PanelLayout";

const NAV_ITEMS = [
  { name: "Dashboard", path: "/admin/panel/dashboard", icon: FiHome },
  { name: "Managers", path: "/admin/panel/managers", icon: FiUsers },
  { name: "Hotels", path: "/admin/panel/hotels", icon: FiGrid },
  { name: "Profile", path: "/admin/panel/profile", icon: FiUser },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, userType } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/admin/auth");
  };

  // Panel is only for the Admin role; everyone else goes to that role's login
  if (!isAuthenticated || userType !== "Admin") {
    return <Navigate to="/admin/auth" replace />;
  }

  return <PanelLayout roleLabel="Hotel Admin" navItems={NAV_ITEMS} onLogout={handleLogout} />;
};

export default AdminLayout;
