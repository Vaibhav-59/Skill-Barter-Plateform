import { Outlet, useLocation } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

export default function Layout() {
  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === "dark";
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [location.pathname, isMobile]);
  
  return (
    <div className={`min-h-screen relative transition-colors duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-black via-gray-950 to-slate-950' 
        : 'bg-white'
    }`}>
      {/* Mobile Menu Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className="flex min-h-screen">
        {/* Sidebar - Desktop always visible, Mobile controlled by state */}
        <Sidebar 
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          isMobile={isMobile}
        />
        
        {/* Main Content Area */}
        <div className={`flex flex-col flex-1 min-h-screen transition-all duration-300 ${
          isMobile ? 'w-full' : ''
        } ${isMobile && isMobileMenuOpen ? 'md:ml-0' : ''}`}>
          <main className="flex-1 overflow-hidden bg-transparent">
            <Outlet />
          </main>
        </div>
      </div>
      
      {/* Footer positioned outside flex container to span full width */}
      <div className="w-full">
        <Footer />
      </div>
    </div>
  );
}
