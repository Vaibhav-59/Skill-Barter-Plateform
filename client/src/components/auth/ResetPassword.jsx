import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

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

const SuccessMessage = ({ show }) => {
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
            Password Reset! 🔒
          </h3>
          <p className="text-slate-300 mb-8 text-lg">
            Your password has been successfully reset. Redirecting to login...
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

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "password":
        if (!value) {
          error = "Password is required";
        } else if (value.length < 6) {
          error = "Must be at least 6 characters";
        }
        break;
      case "confirmPassword":
        if (!value) {
          error = "Please confirm your password";
        } else if (value !== form.password) {
          error = "Passwords do not match";
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

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    setTouched({ password: true, confirmPassword: true });

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_BASE_URL}/auth/reset-password/${token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: form.password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      setShowSuccess(true);
      setForm({ password: "", confirmPassword: "" });
      setErrors({});
      setTouched({});

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setErrors({ submit: err.message || "Failed to reset password" });
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

              <div className="absolute top-10 right-12 w-28 h-28 bg-white/10 rounded-full blur-2xl animate-[float_8s_ease-in-out_infinite]"></div>
              <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/8 rounded-full blur-xl animate-[float_10s_ease-in-out_infinite]"></div>
              <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white/6 rounded-full blur-3xl"></div>

              <div className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)",
                  backgroundSize: "40px 40px",
                }}
              />

              <div className="relative text-center z-10 max-w-md">
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
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                </div>

                <h1 className="text-4xl font-extrabold mb-6 leading-tight">
                  Set New Password 🔐
                  <br />
                  <span className="text-5xl bg-gradient-to-r from-white via-slate-200 to-slate-300 bg-clip-text text-transparent">
                    Almost There
                  </span>
                </h1>

                <p className="text-lg text-white/90 mb-8 leading-relaxed font-medium">
                  Create a strong password for your account. Make sure it's at least 
                  6 characters long and something you'll remember easily.
                </p>

                <div className="flex justify-center space-x-3 mb-10">
                  <div className="w-3.5 h-3.5 bg-white/80 rounded-full"></div>
                  <div className="w-3.5 h-3.5 bg-white/50 rounded-full"></div>
                  <div className="w-3.5 h-3.5 bg-white/80 rounded-full"></div>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center border border-white/25">
                      🔒
                    </div>
                    <span className="text-white/90 font-medium">
                      Secure password protection
                    </span>
                  </div>

                  <div className="flex items-center justify-center space-x-4">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center border border-white/25">
                      ✅
                    </div>
                    <span className="text-white/90 font-medium">
                      6+ characters recommended
                    </span>
                  </div>

                  <div className="flex items-center justify-center space-x-4">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center border border-white/25">
                      🛡️
                    </div>
                    <span className="text-white/90 font-medium">
                      Enhanced account security
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

              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/4 via-transparent to-teal-600/4 pointer-events-none"></div>

              <div
                className="absolute inset-0 opacity-[0.035] pointer-events-none"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)",
                  backgroundSize: "50px 50px",
                }}
              />

              <div className="max-w-md mx-auto w-full space-y-7 relative z-10">

                <div className="text-center">
                  <h2 className="text-3xl font-extrabold
        bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600
        bg-clip-text text-transparent mb-3 relative">
                    New Password
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2
          w-14 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-600 rounded-full opacity-80"></div>
                  </h2>

                  <p className="text-slate-300/90 text-base font-medium">
                    Enter your new password below
                  </p>
                </div>

                <div className="space-y-6">

                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
                      New Password
                    </label>

                    <div className="relative group">
                      <div className="absolute inset-0 bg-emerald-500/10 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>

                      <input
                        type="password"
                        placeholder="Enter new password"
                        className={`${getInputClassName("password")}
                pl-12 py-4 text-base
                bg-gray-950/70
                border border-slate-600/40
                focus:border-emerald-400/70
                transition-all duration-300`}
                        value={form.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        onBlur={() => handleInputBlur("password")}
                        disabled={loading}
                        autoComplete="new-password"
                      />
                    </div>

                    <ErrorMessage message={touched.password ? errors.password : ""} />
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
                      Confirm Password
                    </label>

                    <div className="relative group">
                      <div className="absolute inset-0 bg-green-500/10 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>

                      <input
                        type="password"
                        placeholder="Confirm new password"
                        className={`${getInputClassName("confirmPassword")}
                pl-12 py-4 text-base
                bg-gray-950/70
                border border-slate-600/40
                focus:border-green-400/70
                transition-all duration-300`}
                        value={form.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        onBlur={() => handleInputBlur("confirmPassword")}
                        disabled={loading}
                        autoComplete="new-password"
                      />
                    </div>

                    <ErrorMessage message={touched.confirmPassword ? errors.confirmPassword : ""} />
                  </div>

                  <ErrorMessage message={errors.submit} />

                  <button
                    type="button"
                    onClick={handleSubmit}
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
                      {loading ? "Resetting Password..." : "Reset Password"}
                    </span>
                  </button>

                  <div className="text-center pt-6">
                    <p className="text-slate-300 text-sm">
                      Remember your password?{" "}
                      <button
                        onClick={() => navigate("/login")}
                        className="font-semibold bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600
              bg-clip-text text-transparent hover:underline">
                        Back to Login
                      </button>
                    </p>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <SuccessMessage show={showSuccess} />
    </>
  );
}
