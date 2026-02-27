import { useState, useRef, useEffect } from "react";
import { checkEmail, loginUser, updatePassword } from "../services/authService.jsx";
import { useNavigate } from "react-router-dom";
import loginBg from "../assets/login-bg-smart-gate.png";
import logo from "../assets/zaplogo.png";

const Login = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const emailRef = useRef(null);
  const passRef = useRef(null);
  const newPassRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (step === 1) emailRef.current?.focus();
    else if (step === 2) passRef.current?.focus();
    else if (step === 3) newPassRef.current?.focus();
  }, [step]);

  const handleContinue = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Enter a valid email address");
      return;
    }
    try {
      await checkEmail(email);
      setStep(2);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Email not registered");
    }
  };

  const handleLogin = async () => {
    if (!password) {
      setError("Please enter your password");
      return;
    }
    try {
      const res = await loginUser(email, password);
      const { user, token } = res.data;

      localStorage.setItem("user", JSON.stringify(user));
      if (token) localStorage.setItem("token", token);

      if (user.isFirstLogin) {
        setStep(3);
        return;
      }

      const role =
        user.role ||
        user.user_role ||
        user.role_name ||
        user.userRole;

      navigateByRole(role);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError("Please fill all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      await updatePassword(email, newPassword);
      const res = await loginUser(email, newPassword);
      const { user, token } = res.data;

      localStorage.setItem("user", JSON.stringify(user));
      if (token) localStorage.setItem("token", token);

      const role =
        user.role ||
        user.user_role ||
        user.role_name ||
        user.userRole;

      navigateByRole(role);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password");
    }
  };

  const navigateByRole = (role) => {
    if (!role) {
      setError("User role not assigned. Contact admin.");
      return;
    }

    const r = role.toLowerCase();
    if (r === "student") navigate("/student/dashboard");
    else if (
      r === "staff" ||
      r === "hod" ||
      r === "counsellor" ||
      r === "coordinator" ||
      r === "warden"
    )
      navigate("/staff/dashboard");
      else if (r === "deo") navigate("/deo/dashboard");
      else if (r === "watchman") navigate("/watchman/exit-scan");
    else if (r === "admin") navigate("/admin/dashboard");


    else setError("Invalid user role");
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: `url(${loginBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/10" />

      {/* BOTTOM LEFT – AUTHORIZATION (MOVED + DARKER) */}
      <div className="absolute left-10 bottom-10 text-white/80 max-w-xs space-y-2">
        <h3 className="text-sm font-semibold">🛡️ Secure Authorization</h3>
        <p className="text-xs">📝 Gate Pass & On-Duty workflow</p>
        <p className="text-xs">⏱️ Real-time approval checks</p>
        <p className="text-xs">🚦 Controlled campus access</p>
      </div>

      {/* Halo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[520px] h-[700px] rounded-full bg-cyan-500/15 blur-3xl" />
      </div>

      {/* LOGIN CARD */}
      <div
        className={`relative z-10 w-[460px] min-h-[640px] rounded-2xl p-10
        bg-[#0b1220]/85 backdrop-blur-sm transition-all duration-300
        ${
          error
            ? "border border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.9)]"
            : "border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.8)]"
        }
        flex flex-col`}
      >
        <div className="flex-grow">
          <img src={logo} alt="RMK ZapOut" className="mx-auto h-28 mb-6" />

          <h1 className="text-white text-3xl font-semibold text-center">
            Welcome back!
          </h1>

          <p className="text-cyan-400 text-center mt-2">
            Securely logging you into RMKEC
          </p>

          <p className="text-gray-300 text-sm text-center mt-3">
            {step === 1
              ? "Enter your official email address"
              : step === 2
              ? "Enter your password"
              : "Set a new password"}
          </p>

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <input
                ref={emailRef}
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleContinue()}
                placeholder="Enter Your Mail id"
                className={`mt-8 w-full h-12 px-4 rounded-md bg-white/10 text-white
                placeholder-gray-400 outline-none transition-all
                ${
                  error
                    ? "border border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]"
                    : "border border-cyan-400/50 focus:ring-2 focus:ring-cyan-500"
                }`}
              />

              <button
                onClick={handleContinue}
                className="mt-10 w-full h-12 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              >
                Continue
              </button>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <div className="flex justify-between items-center text-sm text-gray-300 mb-3">
                <span>{email}</span>
                <button
                  onClick={() => setStep(1)}
                  className="text-cyan-400 hover:underline"
                >
                  Change
                </button>
              </div>

              <input
                ref={passRef}
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Enter your password"
                className={`mt-2 w-full h-12 px-4 rounded-md bg-white/10 text-white
                placeholder-gray-400 outline-none transition-all
                ${
                  error
                    ? "border border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]"
                    : "border border-cyan-400/30 focus:ring-2 focus:ring-cyan-500"
                }`}
              />

              <button
                onClick={handleLogin}
                className="mt-10 w-full h-12 rounded-md bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold"
              >
                Login
              </button>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <input
                ref={newPassRef}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="mt-8 w-full h-12 px-4 rounded-md bg-white/10 text-white"
              />

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="mt-4 w-full h-12 px-4 rounded-md bg-white/10 text-white"
              />

              <button
                onClick={handleResetPassword}
                className="mt-10 w-full h-12 rounded-md bg-indigo-600 text-white"
              >
                Update Password
              </button>
            </>
          )}

          {error && (
            <p className="text-red-400 text-xs mt-4 text-center">{error}</p>
          )}
        </div>

        <p className="text-center text-xs text-gray-300 mt-8">
          Designed by IT Department · RMKEC IT
        </p>
      </div>
    </div>
  );
};

export default Login;
