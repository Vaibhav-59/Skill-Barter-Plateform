import { useState } from "react";
import { validatePassword } from "../../utils/validation";

const Spinner = ({ size }) => (
  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
);

const ErrorMessage = ({ message }) => {
  if (!message) return null;

  return (
    <div className="flex items-center space-x-2 mt-2 text-red-400 text-sm animate-in slide-in-from-left-2 duration-300">
      <svg
        className="w-4 h-4 flex-shrink-0"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      <span>{message}</span>
    </div>
  );
};

const SuccessMessage = ({ show, userRole }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-950/95 via-slate-950/95 to-black/95 backdrop-blur-2xl rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl transform animate-in zoom-in-95 duration-300 border border-emerald-400/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/5 via-green-500/5 to-teal-600/5 animate-pulse"></div>
        <div className="text-center relative z-10">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 rounded-full flex items-center justify-center mb-6 animate-pulse shadow-2xl shadow-emerald-500/50 relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 blur-xl opacity-60 animate-pulse"></div>
            <svg
              className="w-10 h-10 text-white relative z-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h3 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 bg-clip-text text-transparent mb-3">
            Welcome Back! 🎉
          </h3>
          <p className="text-slate-300 mb-8 text-lg">
            Login successful! Redirecting to your{" "}
            {userRole === "admin" ? "admin" : ""} dashboard...
          </p>

          <div className="w-full bg-gray-800/50 rounded-full h-3 mb-6 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 h-3 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"
              style={{ width: "100%" }}
            ></div>
          </div>

          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce shadow-lg shadow-emerald-400/50"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce delay-100 shadow-lg shadow-green-500/50"></div>
            <div className="w-3 h-3 bg-teal-600 rounded-full animate-bounce delay-200 shadow-lg shadow-teal-600/50"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpPanel, setShowOtpPanel] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpInfoMessage, setOtpInfoMessage] = useState("");

  const navigate = (path) => {
    console.log(`Navigating to: ${path}`);
    window.location.href = path;
  };

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "email":
        if (!value.trim()) {
          error = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          error = "Invalid email format";
        }
        break;

      case "password":
        if (!value) {
          error = "Password is required";
        } else {
          error = validatePassword(value);
        }
        break;

      default:
        break;
    }

    return error;
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(form).forEach((key) => {
      const error = validateField(key, form[key]);
      if (error) {
        newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleInputBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, form[name]);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const openOtpPanel = async (e) => {
    if (e) e.preventDefault();
    setTouched({ email: true, password: true });

    // First validate email/password format on client
    if (!validateForm()) return;

    setLoading(true);
    setOtp("");
    setOtpError("");
    setOtpInfoMessage("");

    try {
      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_BASE_URL}/auth/send-login-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        // If backend explicitly says user not found, treat as invalid email for login
        if (res.status === 404) {
          const message =
            data?.message || "This email is not registered. Please create an account.";
          setErrors((prev) => ({ ...prev, email: message }));
          setTouched((prev) => ({ ...prev, email: true }));
        } else {
          // For other errors (like email service / server error), show generic error
          setErrors((prev) => ({
            ...prev,
            submit:
              data?.message ||
              "Something went wrong while sending OTP. Please try again.",
          }));
        }
        return;
      }

      // Email exists and OTP was sent successfully -> open OTP panel
      setShowOtpPanel(true);
      if (data?.message) {
        setOtpInfoMessage(data.message);
      }
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        email: "Could not verify email right now. Please try again.",
      }));
    } finally {
      setLoading(false);
    }
  };

  const performLogin = async () => {
    setLoading(true);
    setErrors({});

    try {
      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // In a real flow you would also send and verify the OTP on the backend.

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUserRole(data.user.role);
      setShowSuccess(true);
      setShowOtpPanel(false);
      setForm({ email: "", password: "" });
      setErrors({});
      setTouched({});

      setTimeout(() => {
        if (data.user.role === "admin") {
          window.location.href = "/admin/dashboard";
        } else {
          window.location.href = "/dashboard";
        }
      }, 200);
    } catch (err) {
      setErrors({ submit: "Invalid email or password. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndLogin = async () => {
    const trimmedOtp = otp.trim();

    if (!trimmedOtp) {
      setOtpError("OTP is required");
      return;
    }

    if (!/^\d{6}$/.test(trimmedOtp)) {
      setOtpError("Enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setOtpError("");

    try {
      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_BASE_URL}/auth/verify-login-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp: trimmedOtp }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid OTP");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUserRole(data.user.role);
      setShowSuccess(true);
      setShowOtpPanel(false);
      setForm({ email: "", password: "" });
      setErrors({});
      setTouched({});
      setOtp("");

      setTimeout(() => {
        if (data.user.role === "admin") {
          window.location.href = "/admin/dashboard";
        } else {
          window.location.href = "/dashboard";
        }
      }, 200);
    } catch (err) {
      setOtpError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getInputClassName = (fieldName) => {
    const baseClass =
      "w-full px-4 py-4 bg-gray-800/70 backdrop-blur-sm border rounded-xl text-white placeholder-slate-400 focus:outline-none transition-all duration-300 text-base font-medium shadow-md";
    const hasError = errors[fieldName] && touched[fieldName];

    if (hasError) {
      return `${baseClass} border-red-500/60 focus:ring-2 focus:ring-red-500/20 focus:border-red-400/80`;
    }

    return `${baseClass} border-slate-500/40 hover:border-emerald-400/50 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400/70 hover:bg-gray-800/80`;
  };

  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-950 to-slate-950 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-96 -right-96 w-[700px] h-[700px] bg-emerald-400/6 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-96 -left-96 w-[700px] h-[700px] bg-green-500/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-400/3 rounded-full blur-3xl"></div>

          <div className="absolute top-20 left-20 w-64 h-64 bg-emerald-500/4 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-green-400/3 rounded-full blur-2xl"></div>

          <div className="absolute top-32 left-40 w-2 h-2 bg-emerald-400/50 rounded-full animate-pulse"></div>
          <div className="absolute top-48 right-40 w-1.5 h-1.5 bg-green-400/40 rounded-full animate-pulse delay-75"></div>
          <div className="absolute bottom-40 left-1/3 w-2 h-2 bg-teal-500/45 rounded-full animate-pulse delay-150"></div>
          <div className="absolute top-72 right-1/4 w-1 h-1 bg-emerald-300/35 rounded-full animate-pulse delay-300"></div>

          <div className="absolute inset-0 opacity-30">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(52, 211, 153, 0.08) 1px, transparent 0)`,
                backgroundSize: "60px 60px",
              }}
            ></div>
          </div>
        </div>

        <div className="relative z-10 h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-0 min-h-[630px] shadow-2xl rounded-2xl overflow-hidden">
            <div className="relative bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600
  rounded-l-2xl lg:rounded-r-none rounded-r-2xl lg:rounded-br-none
  p-14 flex flex-col justify-center items-center text-white overflow-hidden">

              {/* ambient floating lights */}
              <div className="absolute top-10 right-12 w-28 h-28 bg-white/10 rounded-full blur-2xl animate-[float_8s_ease-in-out_infinite]"></div>
              <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/8 rounded-full blur-xl animate-[float_10s_ease-in-out_infinite]"></div>
              <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white/6 rounded-full blur-3xl"></div>

              {/* subtle grain */}
              <div className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)",
                  backgroundSize: "40px 40px",
                }}
              />

              <div className="relative text-center z-10 max-w-md">

                {/* logo badge */}
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/25 rounded-3xl mb-8
      shadow-xl backdrop-blur-sm border border-white/30 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-300/20 via-green-400/20 to-teal-400/20
        opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <svg
                    className="w-10 h-10 text-white relative z-10 group-hover:scale-105 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>

                {/* headline */}
                <h1 className="text-4xl font-extrabold mb-6 leading-tight">
                  Welcome Back 👋
                  <br />
                  <span className="text-5xl bg-gradient-to-r from-white via-slate-200 to-slate-300 bg-clip-text text-transparent">
                    Ready to Level Up?
                  </span>
                </h1>

                {/* subtext */}
                <p className="text-lg text-white/90 mb-8 leading-relaxed font-medium">
                  Pick up right where you left off. Learn new skills, share your expertise,
                  and grow with a community that supports your journey.
                </p>

                {/* progress dots */}
                <div className="flex justify-center space-x-3 mb-10">
                  <div className="w-3.5 h-3.5 bg-white/80 rounded-full"></div>
                  <div className="w-3.5 h-3.5 bg-white/50 rounded-full"></div>
                  <div className="w-3.5 h-3.5 bg-white/80 rounded-full"></div>
                </div>

                {/* feature bullets */}
                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center border border-white/25">
                      🔒
                    </div>
                    <span className="text-white/90 font-medium">
                      Secure & privacy-first by design
                    </span>
                  </div>

                  <div className="flex items-center justify-center space-x-4">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center border border-white/25">
                      ⚡
                    </div>
                    <span className="text-white/90 font-medium">
                      Fast, smooth, and distraction-free
                    </span>
                  </div>

                  <div className="flex items-center justify-center space-x-4">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center border border-white/25">
                      🌟
                    </div>
                    <span className="text-white/90 font-medium">
                      Designed for ambitious professionals
                    </span>
                  </div>
                </div>

              </div>
            </div>


            <div className="relative bg-gradient-to-br from-gray-950/95 via-slate-950/95 to-gray-900/95
  backdrop-blur-2xl rounded-r-2xl lg:rounded-l-none rounded-l-2xl lg:rounded-bl-none
  p-14 flex flex-col justify-center
  border border-slate-500/40
  shadow-xl shadow-black/40
  overflow-hidden">

              {/* ambient edge glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/4 via-transparent to-teal-600/4 pointer-events-none"></div>

              {/* soft noise layer */}
              <div
                className="absolute inset-0 opacity-[0.035] pointer-events-none"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)",
                  backgroundSize: "50px 50px",
                }}
              />

              <div className="max-w-md mx-auto w-full space-y-7 relative z-10">

                {/* header */}
                <div className="text-center">
                  <h2 className="text-3xl font-extrabold
        bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600
        bg-clip-text text-transparent mb-3 relative">
                    Sign In
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2
          w-14 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-600 rounded-full opacity-80"></div>
                  </h2>

                  <p className="text-slate-300/90 text-base font-medium">
                    Welcome back — your workspace is ready
                  </p>
                </div>

                {/* form */}
                <div className="space-y-6">

                  {/* email */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
                      Email Address
                    </label>

                    <div className="relative group">
                      <div className="absolute inset-0 bg-emerald-500/10 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>

                      <input
                        type="email"
                        placeholder="you@example.com"
                        className={`${getInputClassName("email")}
              pl-12 py-4 text-base
              bg-gray-950/70
              border border-slate-600/40
              focus:border-emerald-400/70
              transition-all duration-300`}
                        value={form.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        onBlur={() => handleInputBlur("email")}
                        disabled={loading}
                        autoComplete="email"
                      />
                    </div>

                    <ErrorMessage message={touched.email ? errors.email : ""} />
                  </div>

                  {/* password */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
                      Password
                    </label>

                    <div className="relative group">
                      <div className="absolute inset-0 bg-green-500/10 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>

                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className={`${getInputClassName("password")}
              pl-12 pr-12 py-4 text-base
              bg-gray-950/70
              border border-slate-600/40
              focus:border-green-400/70
              transition-all duration-300`}
                        value={form.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        onBlur={() => handleInputBlur("password")}
                        disabled={loading}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400 transition-colors"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>

                    <ErrorMessage message={touched.password ? errors.password : ""} />
                  </div>

                  {/* submit */}
                  <button
                    type="button"
                    onClick={openOtpPanel}
                    disabled={loading}
                    className="relative w-full py-4 px-8
          bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600
          hover:from-emerald-500 hover:via-green-600 hover:to-teal-700
          text-white font-bold text-base rounded-xl
          transition-all duration-300
          transform hover:scale-[1.015]
          active:scale-95
          shadow-lg hover:shadow-emerald-500/30
          disabled:opacity-70 disabled:cursor-not-allowed
          overflow-hidden group">

                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0
          -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

                    <span className="relative">
                      {loading ? "Signing In…" : "Sign In"}
                    </span>
                  </button>

                  {/* forgot password link */}
                  <div className="text-center pt-2">
                    <button
                      onClick={() => navigate("/forgot-password")}
                      className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors duration-200 hover:underline">
                      Forgot your password?
                    </button>
                  </div>

                  {/* footer text */}
                  <div className="text-center pt-6">
                    <p className="text-slate-300 text-sm">
                      New here?{" "}
                      <button
                        onClick={() => navigate("/register")}
                        className="font-semibold bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600
              bg-clip-text text-transparent hover:underline">
                        Create an account
                      </button>
                    </p>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {showOtpPanel && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-40 p-4">
          <div className="bg-gradient-to-br from-gray-950 via-slate-950 to-black rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-emerald-500/40 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400/10 via-green-500/10 to-teal-500/10 pointer-events-none" />

            <div className="relative z-10 space-y-5">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 bg-clip-text text-transparent">
                  Enter OTP
                </h3>
                <p className="text-xs text-slate-300/80">
                  We&apos;ve sent a one-time code to your registered email / phone.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
                  One-Time Password
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    if (otpError) setOtpError("");
                  }}
                  className="w-full px-4 py-3 bg-gray-900/80 border border-slate-600/60 rounded-xl text-white tracking-[0.3em] text-center text-lg placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30"
                  placeholder="••••••"
                  disabled={loading}
                />
                {otpError && (
                  <p className="text-xs text-red-400 mt-1">{otpError}</p>
                )}
                {otpInfoMessage && !otpError && (
                  <p className="text-xs text-emerald-400 mt-1">{otpInfoMessage}</p>
                )}
                {errors.submit && !otpError && (
                  <p className="text-xs text-red-400 mt-1">{errors.submit}</p>
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (!loading) {
                      setShowOtpPanel(false);
                      setOtp("");
                      setOtpError("");
                    }
                  }}
                  className="w-1/3 py-3 rounded-xl border border-slate-600/70 text-slate-200 text-sm font-medium hover:bg-gray-900/70 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleVerifyAndLogin}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:from-emerald-500 hover:via-green-600 hover:to-teal-700 shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading && <Spinner size="sm" />}
                  <span>{loading ? "Verifying..." : "Verify & Login"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <SuccessMessage show={showSuccess} userRole={userRole} />
    </>
  );
}
