import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { Home, History, LogOut } from "lucide-react";
import logo from "../../assets/zaplogo.png"; // ← same logo used in other dashboards

/* ===== Sidebar Item ===== */
const SidebarItem = ({ icon, label, onClick, active }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
        active
          ? "bg-[#53cf57] text-white"
          : "text-gray-300 hover:bg-white/10"
      }`}
    >
      {icon}
      {label}
    </button>
  );
};

export default function WatchmanDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen text-white bg-gradient-to-br from-[#020617] via-[#041b32] to-[#020617]">

      {/* ===== SIDEBAR ===== */}
      <div className="w-64 h-screen flex flex-col bg-black/40 backdrop-blur-2xl border-r border-white/20 p-6">

        {/* LOGO */}
        <div className="flex justify-center mb-12">
  <img
    src={logo}
    alt="RMK ZapOut"
    className="w-24 h-auto object-contain"
  />
</div>

        {/* NAVIGATION */}
        <div className="space-y-2">
          <SidebarItem
            icon={<Home size={18} />}
            label="Dashboard"
            onClick={() => navigate("/watchman/dashboard")}
            active={location.pathname === "/watchman/dashboard"}
          />

          <SidebarItem
            icon={<History size={18} />}
            label="Gate History"
            onClick={() => navigate("/watchman/history")}
            active={location.pathname === "/watchman/history"}
          />
        </div>

        {/* PUSH LOGOUT TO BOTTOM */}
        <div className="mt-auto">
          <SidebarItem
            icon={<LogOut size={18} />}
            label="Logout"
            onClick={handleLogout}
          />
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 px-8 py-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}