import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { FiHome, FiUsers, FiGrid, FiLogOut, FiUser, FiLayers } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { logout } from "../../Store/Slices/AuthSlice";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/admin/auth");
  };

  const navItems = [
    { name: "Dashboard", path: "/admin/panel/dashboard", icon: FiHome },
    { name: "Managers", path: "/admin/panel/managers", icon: FiUsers },
    { name: "Hotels", path: "/admin/panel/hotels", icon: FiGrid },
    { name: "Profile", path: "/admin/panel/profile", icon: FiUser },
  ];

  return (
    <div className="flex h-screen bg-stone-950 text-white selection:bg-amber-500 selection:text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-white/10 bg-black/40 backdrop-blur-md flex flex-col relative">
        <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-amber-500/10 blur-[100px]" />
        
        <div className="p-6 relative z-10">
          <h2 className="font-serif text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
            ComfyStay
          </h2>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mt-1">Hotel Admin</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 relative z-10">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" 
                    : "text-stone-400 hover:bg-white/5 hover:text-white border border-transparent"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-amber-400" : "text-stone-500"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 relative z-10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 py-3 text-sm font-semibold text-red-300 hover:bg-red-500/20 transition-all"
          >
            <FiLogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Ambient background glows for main content */}
        <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-purple-600/10 blur-[150px]" />
        
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
