import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  FileText,
  History,
  Bell,
  User,
  HelpCircle,
  LogOut,
  Users,
} from "lucide-react";

import logo from "../../assets/zaplogo.png";

const SidebarItem = ({ icon, label, onClick, active }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
        ${
active
  ? "bg-[#52dbff]/15 text-[#52dbff]"
  : "text-white/70 hover:bg-white/5 hover:text-white"
}`}
>
  <span className="text-current">{icon}</span>
  <span className="text-sm font-medium">{label}</span>
</button>

  );
};

const StudentLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen w-full text-white bg-gradient-to-br from-[#020617] via-[#041b32] to-[#020617] overflow-hidden">

      {/* ================= SIDEBAR ================= */}
      {/* ❌ removed px-6 py-6 */}
      <aside className="w-[260px] h-screen bg-gradient-to-br from-[#020617] via-[#041b32] to-[#020617] flex flex-col border-r border-white/10">

        {/* logo spacing handled here, not on aside */}
        <div className="px-6 py-6 mb-10 flex justify-center">
          <img
            src={logo}
            alt="RMK ZapOut"
            className="w-44 object-contain"
          />
        </div>

        {/* NAVIGATION */}
        <nav className="space-y-2 flex-1 overflow-y-auto px-3">

          <SidebarItem
            icon={<Home size={18} />}
            label="Dashboard"
            active={isActive("/student/dashboard")}
            onClick={() => navigate("/student/dashboard")}
          />

          <SidebarItem
            icon={<FileText size={18} />}
            label="Requests"
            active={isActive("/student/requests")}
            onClick={() => navigate("/student/requests")}
          />

          <SidebarItem
            icon={<History size={18} />}
            label="History"
            active={isActive("/student/history")}
            onClick={() => navigate("/student/history")}
          />

          <SidebarItem
            icon={<Bell size={18} />}
            label="Notifications"
            active={isActive("/student/notifications")}
            onClick={() => navigate("/student/notifications")}
          />

          {/* <SidebarItem
            icon={<Users size={18} />}
            label="Staffs"
            active={isActive("/student/staffs")}
            onClick={() => navigate("/student/staffs")}
          /> */}

          <SidebarItem
            icon={<User size={18} />}
            label="Profile"
            active={isActive("/student/profile")}
            onClick={() => navigate("/student/profile")}
          />

          <SidebarItem
            icon={<HelpCircle size={18} />}
            label="Need Help"
            active={isActive("/student/help")}
            onClick={() => navigate("/student/help")}
          />
        </nav>

        {/* LOGOUT */}
        <div className="px-4 pb-6">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      {/* ❌ removed p-8 */}
      <main className="flex-1 h-full overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;
