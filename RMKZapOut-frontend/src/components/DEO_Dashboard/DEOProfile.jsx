import { useEffect, useState } from "react";

const DEOProfile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    department: "",
    role: "DEO",
  });

  useEffect(() => {
    // get data from localStorage (adjust if using API later)
    const name = localStorage.getItem("name") || "DEO User";
    const email = localStorage.getItem("email") || "deo@rmk.edu";
    const department = localStorage.getItem("department") || "N/A";

    setProfile({ name, email, department, role: "DEO" });
  }, []);

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-semibold mb-6">My Profile</h1>

      <div className="bg-[#0f172a] rounded-xl shadow-lg p-6 max-w-lg">
        <div className="space-y-4">
          <div>
            <p className="text-gray-400">Name</p>
            <p className="text-lg">{profile.name}</p>
          </div>

          <div>
            <p className="text-gray-400">Email</p>
            <p className="text-lg">{profile.email}</p>
          </div>

          <div>
            <p className="text-gray-400">Department</p>
            <p className="text-lg">{profile.department}</p>
          </div>

          <div>
            <p className="text-gray-400">Role</p>
            <p className="text-lg">{profile.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DEOProfile;