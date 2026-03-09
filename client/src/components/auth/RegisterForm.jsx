import { useState } from "react";
import { useEffect } from "react";
import { validatePassword as validateStrongPassword } from "../../utils/validation";

const Spinner = ({ size }) => (
  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
);

const ErrorMessage = ({ message, show }) => {
  if (!show || !message) return null;

  return (
    <div className="mt-2 flex items-center space-x-2 text-red-400 text-sm animate-in slide-in-from-left-2 duration-300">
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
      <span className="font-medium">{message}</span>
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
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 rounded-full flex items-center justify-center mb-4 animate-pulse shadow-2xl shadow-emerald-500/50 relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 blur-xl opacity-60 animate-pulse"></div>
            <svg
              className="w-8 h-8 text-white relative z-10"
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

          <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 bg-clip-text text-transparent mb-2">
            Registration Successful! 🎉
          </h3>
          <p className="text-slate-300 mb-6">
            Welcome to our community! Redirecting to dashboard...
          </p>

          <div className="w-full bg-gray-800/50 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 h-2 rounded-full transition-all duration-200 ease-out shadow-lg shadow-emerald-500/50"
              style={{ width: "100%" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function RegisterForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Auto-close success modal and redirect after 3 seconds
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        handleSuccessClose();
      }, 1000); // 0.5 seconds = 500 milliseconds

      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  // Validation functions
  const validateName = (name) => {
    if (!name.trim()) return "Full name is required";
    if (name.trim().length < 2)
      return "Name must be at least 2 characters long";
    if (!/^[a-zA-Z\s]+$/.test(name.trim()))
      return "Name can only contain letters and spaces";
    return "";
  };

  const validateEmail = (email) => {
    if (!email.trim()) return "Email address is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (password) => {
    return validateStrongPassword(password);
  };

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) return "Please confirm your password";
    if (confirmPassword !== password) return "Passwords do not match";
    return "";
  };

  // Real-time validation
  const validateField = (field, value) => {
    let error = "";
    switch (field) {
      case "name":
        error = validateName(value);
        break;
      case "email":
        error = validateEmail(value);
        break;
      case "password":
        error = validatePassword(value);
        break;
      case "confirmPassword":
        error = validateConfirmPassword(value, form.password);
        break;
      default:
        break;
    }
    return error;
  };

  const handleInputChange = (field, value) => {
    setForm({ ...form, [field]: value });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }

    // Real-time validation for confirm password
    if (field === "password" && form.confirmPassword) {
      const confirmError = validateConfirmPassword(form.confirmPassword, value);
      setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    const error = validateField(field, form[field]);
    setErrors({ ...errors, [field]: error });
  };

  const validateForm = () => {
    const newErrors = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      confirmPassword: validateConfirmPassword(
        form.confirmPassword,
        form.password
      ),
    };

    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    return !Object.values(newErrors).some((error) => error !== "");
  };

  // Handle success popup close and redirect to login
  const handleSuccessClose = () => {
    setShowSuccess(false);
    // Reset form
    setForm({ name: "", email: "", password: "", confirmPassword: "" });
    setErrors({});
    setTouched({});

    // Redirect to Login page
    window.location.href = "/login";
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Show success popup
      setShowSuccess(true);
    } catch (error) {
      // Handle registration error
      alert(error.message || "Registration failed. Please try again.");
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    // Redirect to login page
    window.location.href = "/login";
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-slate-950 flex items-center justify-center p-6">
        {/* Subtle animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/6 w-64 h-64 bg-emerald-400/8 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/6 w-56 h-56 bg-teal-500/6 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-48 h-48 bg-green-500/4 rounded-full blur-xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative max-w-6xl w-full">
          {/* Subtle outer glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/12 via-teal-600/10 to-green-500/8 rounded-3xl blur-xl animate-pulse"></div>

          {/* Main horizontal container */}
          <div className="relative backdrop-blur-sm bg-gray-950/95 border border-slate-500/60 rounded-3xl shadow-xl hover:shadow-emerald-500/15 transition-all duration-500 overflow-hidden">
            {/* Two-column layout */}
            <div className="grid lg:grid-cols-2 min-h-[600px]">
              {/* Left side - Welcome section */}
              <div className="relative bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600
  p-12 flex flex-col justify-center items-center text-white overflow-hidden">

  {/* ambient glow (calm, premium) */}
  <div className="absolute top-10 right-10 w-28 h-28 bg-white/10 rounded-full blur-2xl animate-[float_10s_ease-in-out_infinite]"></div>
  <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/8 rounded-full blur-xl animate-[float_14s_ease-in-out_infinite]"></div>
  <div className="absolute top-1/2 left-1/4 w-36 h-36 bg-white/6 rounded-full blur-3xl"></div>

  {/* subtle grain */}
  <div
    className="absolute inset-0 opacity-[0.06]"
    style={{
      backgroundImage:
        "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)",
      backgroundSize: "42px 42px",
    }}
  />

  {/* content */}
  <div className="relative text-center z-10 max-w-md">

    {/* icon badge */}
    <div className="inline-flex items-center justify-center w-24 h-24
      bg-white/25 rounded-3xl mb-8 shadow-xl backdrop-blur-sm
      border border-white/30 group">
      <svg
        className="w-12 h-12 text-white group-hover:scale-105 transition-transform duration-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
        />
      </svg>
    </div>

    {/* headline */}
    <h1 className="text-5xl font-extrabold mb-5 leading-tight">
      Join the
      <br />
      <span className="bg-gradient-to-r from-white via-slate-200 to-slate-300 bg-clip-text text-transparent">
        SkillBarter Community
      </span>
    </h1>

    {/* subtext */}
    <p className="text-xl text-white/85 mb-8 leading-relaxed font-medium">
      Learn together, share skills, and grow faster with a global
      community built for ambitious professionals.
    </p>

    {/* progress dots */}
    <div className="flex justify-center space-x-3 mb-10">
      <div className="w-3.5 h-3.5 bg-white/70 rounded-full"></div>
      <div className="w-3.5 h-3.5 bg-white/45 rounded-full"></div>
      <div className="w-3.5 h-3.5 bg-white/70 rounded-full"></div>
    </div>

    {/* trust bullets */}
    <div className="space-y-2 text-sm text-white/85 font-medium">
      <p>✨ Free to get started</p>
      <p>🔒 Secure & privacy-first</p>
      <p>⭐ Trusted by thousands of learners</p>
    </div>

  </div>
</div>


              {/* Right side - Form section */}
<div className="relative p-12 flex flex-col justify-center
  bg-gradient-to-br from-gray-950/95 via-slate-950/95 to-gray-900/95
  backdrop-blur-2xl overflow-hidden">

  {/* ambient edge glow */}
  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/4 via-transparent to-teal-600/4 pointer-events-none"></div>

  {/* calm floating glows (no pulse) */}
  <div className="absolute top-10 right-10 w-20 h-20 bg-emerald-400/12 rounded-full blur-2xl animate-[float_14s_ease-in-out_infinite]"></div>
  <div className="absolute bottom-12 right-14 w-16 h-16 bg-green-400/10 rounded-full blur-xl animate-[float_18s_ease-in-out_infinite]"></div>

  {/* subtle grain */}
  <div
    className="absolute inset-0 opacity-[0.035] pointer-events-none"
    style={{
      backgroundImage:
        "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)",
      backgroundSize: "48px 48px",
    }}
  />

  <div className="relative space-y-8 max-w-md mx-auto w-full z-10">

    {/* Header */}
    <div className="text-center">
      <h2 className="text-3xl font-extrabold
        bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600
        bg-clip-text text-transparent mb-3">
        Create Your Account
      </h2>
      <p className="text-slate-300/90 text-base font-medium">
        Start learning, sharing, and growing today
      </p>
    </div>

    {/* Form */}
    <div className="space-y-6">

      {/* Name */}
      <div className="relative group">
        <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
        <input
          type="text"
          placeholder="Full name"
          className={`relative w-full px-6 py-4 rounded-2xl
            bg-gray-950/70 text-white placeholder-slate-400
            border border-slate-600/40
            focus:outline-none focus:ring-2
            transition-all duration-300 font-medium
            ${
              errors.name && touched.name
                ? "border-red-500/60 focus:ring-red-500/20"
                : "focus:border-emerald-400/70 focus:ring-emerald-500/20"
            }`}
          value={form.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          onBlur={() => handleBlur("name")}
        />
        <ErrorMessage message={errors.name} show={touched.name} />
      </div>

      {/* Email */}
      <div className="relative group">
        <div className="absolute inset-0 bg-teal-500/10 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
        <input
          type="email"
          placeholder="Email address"
          className={`relative w-full px-6 py-4 rounded-2xl
            bg-gray-950/70 text-white placeholder-slate-400
            border border-slate-600/40
            focus:outline-none focus:ring-2
            transition-all duration-300 font-medium
            ${
              errors.email && touched.email
                ? "border-red-500/60 focus:ring-red-500/20"
                : "focus:border-teal-400/70 focus:ring-teal-500/20"
            }`}
          value={form.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          onBlur={() => handleBlur("email")}
        />
        <ErrorMessage message={errors.email} show={touched.email} />
      </div>

      {/* Passwords */}
      <div className="grid md:grid-cols-2 gap-4">

        <div className="relative group">
          <div className="absolute inset-0 bg-green-500/10 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className={`relative w-full px-4 py-4 pr-12 rounded-2xl
              bg-gray-950/70 text-white placeholder-slate-400
              border border-slate-600/40
              focus:outline-none focus:ring-2
              transition-all duration-300 font-medium
              ${
                errors.password && touched.password
                  ? "border-red-500/60 focus:ring-red-500/20"
                  : "focus:border-green-400/70 focus:ring-green-500/20"
              }`}
            value={form.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            onBlur={() => handleBlur("password")}
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
          <ErrorMessage message={errors.password} show={touched.password} />
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm password"
            className={`relative w-full px-4 py-4 pr-12 rounded-2xl
              bg-gray-950/70 text-white placeholder-slate-400
              border border-slate-600/40
              focus:outline-none focus:ring-2
              transition-all duration-300 font-medium
              ${
                errors.confirmPassword && touched.confirmPassword
                  ? "border-red-500/60 focus:ring-red-500/20"
                  : "focus:border-emerald-400/70 focus:ring-emerald-500/20"
              }`}
            value={form.confirmPassword}
            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
            onBlur={() => handleBlur("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400 transition-colors"
          >
            {showConfirmPassword ? (
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
          <ErrorMessage
            message={errors.confirmPassword}
            show={touched.confirmPassword}
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="relative w-full py-4 px-8
          bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600
          hover:from-emerald-500 hover:via-green-600 hover:to-teal-700
          text-white font-bold text-lg rounded-2xl
          transition-all duration-300
          transform hover:scale-[1.015] active:scale-95
          shadow-lg hover:shadow-emerald-500/30
          disabled:opacity-70 disabled:cursor-not-allowed
          overflow-hidden group">

        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0
          -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

        <span className="relative">
          {loading ? "Creating account…" : "Create Account"}
        </span>
      </button>
    </div>

    {/* Footer link */}
    <div className="text-center pt-2">
      <p className="text-slate-300 text-sm">
        Already have an account?{" "}
        <button
          onClick={handleLoginClick}
          className="font-semibold bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600
            bg-clip-text text-transparent hover:underline">
          Sign in
        </button>
      </p>
    </div>

  </div>
</div>

            </div>
          </div>
        </div>
      </div>

      {/* Success Message Modal */}
      <SuccessMessage show={showSuccess} onClose={handleSuccessClose} />
    </>
  );
}