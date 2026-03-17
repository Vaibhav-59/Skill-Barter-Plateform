import { useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";

export const useTheme = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDarkMode = theme === "dark";
  
  return {
    theme,
    isDarkMode,
    toggleTheme,
    // Helper classes for common theme patterns
    bgClass: isDarkMode ? "bg-gray-900" : "bg-slate-50",
    textClass: isDarkMode ? "text-white" : "text-gray-800",
    borderClass: isDarkMode ? "border-gray-700" : "border-gray-200",
    cardClass: isDarkMode 
      ? "bg-gray-800/50 border-gray-700/50" 
      : "bg-white/50 border-gray-200/50",
    inputClass: isDarkMode 
      ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400" 
      : "bg-white border-gray-300 text-gray-800 placeholder-gray-500",
  };
};