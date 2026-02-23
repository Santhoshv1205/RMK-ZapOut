import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  FileText,
  History,
  Bell,
  Users,
  User,
  HelpCircle,
  LogOut,
} from "lucide-react";

import logo from "../../assets/zaplogo.png";
import { useNotifications } from "../context/NotificationContext.jsx";
import { useRequestBadge } from "../context/RequestBadgeContext";

/* ================= SIDEBAR ITEM ================= */
const SidebarItem = ({ icon, label, onClick, active, badge }) => {
 

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
        ${
          active
            ? "bg-[#53cf57]/15 text-[#53cf57]"
            : "text-white/70 hover:bg-white/5 hover:text-white"
        }`}
    >
      <span className={active ? "text-[#53cf57]" : "relative"}>
        {icon}
        {badge > 0 && (
          <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-[10px] text-white font-semibold flex items-center justify-center rounded-full">
            {badge}
          </span>
        )}
      </span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};

const StaffLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useNotifications(); // ✅ get unread notifications
 const { newRequestCount } = useRequestBadge();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex min-h-screen w-full text-white bg-gradient-to-br from-[#020617] via-[#041b32] to-[#020617]">
      
      {/* ================= SIDEBAR ================= */}
<aside className="fixed left-0 top-0 h-screen w-[260px] bg-gradient-to-br from-[#020617] via-[#041b32] to-[#020617] px-6 py-6 flex flex-col border-r border-white/10">
        {/* LOGO */}
        <div className="mb-10 flex justify-center">
          <img src={logo} alt="RMK ZapOut" className="w-44 object-contain" />
        </div>

        {/* NAVIGATION */}
        <nav className="space-y-2 flex-1 overflow-y-auto">
          <SidebarItem
            icon={<Home size={18} />}
            label="Home"
            active={isActive("/staff/dashboard")}
            onClick={() => navigate("/staff/dashboard")}
          />

          <SidebarItem
            icon={<FileText size={18} />}
            label="Requests"
            active={isActive("/staff/requests")}
            onClick={() => navigate("/staff/requests")}
             badge={newRequestCount}
          />

          <SidebarItem
            icon={<History size={18} />}
            label="History"
            active={isActive("/staff/history")}
            onClick={() => navigate("/staff/history")}
          />

          <SidebarItem
            icon={<Bell size={18} />}
            label="Notifications"
            active={isActive("/staff/notifications")}
            onClick={() => navigate("/staff/notifications")}
            badge={unreadCount} // ✅ add badge here
          />

          <SidebarItem
            icon={<Users size={18} />}
            label="Students"
            active={isActive("/staff/students")}
            onClick={() => navigate("/staff/students")}
          />

          <SidebarItem
            icon={<User size={18} />}
            label="Profile"
            active={isActive("/staff/profile")}
            onClick={() => navigate("/staff/profile")}
          />

          <SidebarItem
            icon={<HelpCircle size={18} />}
            label="Need Help"
            active={isActive("/staff/need-help")}
            onClick={() => navigate("/staff/need-help")}
          />
        </nav>

        {/* LOGOUT */}
        <button
          onClick={() => navigate("/")}
          className="mt-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
<main className="flex-1 ml-[260px] overflow-y-auto">     
     <Outlet />
      </main>
    </div>
  );
};

export default StaffLayout;
