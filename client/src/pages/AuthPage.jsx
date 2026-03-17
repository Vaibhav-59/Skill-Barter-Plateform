import { useState, useContext } from "react";
import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";
import { ThemeContext } from "../contexts/ThemeContext";

export default function AuthPage() {
  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === "dark";
  const [mode, setMode] = useState("login");

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-[#4A6FFF] to-[#34D399]' 
        : 'bg-gradient-to-br from-indigo-50 via-white to-emerald-50/50'
    }`}>
      <div className={`rounded-2xl shadow-xl w-full max-w-md overflow-hidden transition-all duration-500 ${
        isDarkMode ? 'bg-gray-900' : 'bg-white border border-gray-200'
      }`}>
        <div className={`flex justify-between items-center px-6 py-4 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-xl font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            {mode === "login" ? "Welcome Back" : "Join SkillBarter"}
          </h2>
          <button
            className={`text-sm hover:underline transition-colors duration-300 ${
              isDarkMode ? 'text-emerald-400' : 'text-[#4A6FFF]'
            }`}
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </div>
        <div className="px-6 py-6">
          {mode === "login" ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </div>
  );
}
