import React from "react";
import { useTheme } from "../hooks/useTheme";

export default function HomePage() {
  const { theme, toggleTheme, isDarkMode } = useTheme();
  
  return (
    <div className={`min-h-screen w-full relative overflow-hidden transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-black via-gray-950 to-slate-950' 
        : 'bg-white'
    }`}>
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Main gradient orbs with pulsing animation */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-400/25 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-teal-600/15 rounded-full blur-2xl animate-bounce"></div>

        {/* Additional atmospheric elements */}
        <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-emerald-300/15 rounded-full blur-xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-green-400/12 rounded-full blur-lg animate-pulse delay-3000"></div>
        <div className="absolute top-3/4 left-1/6 w-32 h-32 bg-teal-500/15 rounded-full blur-xl animate-pulse delay-1500"></div>
        <div className="absolute top-1/6 right-1/3 w-40 h-40 bg-emerald-500/12 rounded-full blur-2xl animate-pulse delay-2500"></div>

        {/* More dynamic floating particles */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-emerald-400/80 rounded-full animate-ping shadow-lg shadow-emerald-400/50"></div>
        <div className="absolute top-40 right-32 w-3 h-3 bg-green-400/90 rounded-full animate-ping delay-1000 shadow-lg shadow-green-400/50"></div>
        <div className="absolute bottom-32 left-1/3 w-3.5 h-3.5 bg-teal-400/70 rounded-full animate-ping delay-2000 shadow-lg shadow-teal-400/50"></div>
        <div className="absolute top-60 right-1/4 w-2.5 h-2.5 bg-emerald-300/80 rounded-full animate-ping delay-3000 shadow-lg shadow-emerald-300/50"></div>
        <div className="absolute bottom-1/3 right-1/6 w-3 h-3 bg-green-300/70 rounded-full animate-ping delay-1500 shadow-lg shadow-green-300/50"></div>
        <div className="absolute top-1/3 left-1/5 w-4 h-4 bg-teal-300/60 rounded-full animate-ping delay-2500 shadow-lg shadow-teal-300/50"></div>

        {/* Enhanced mesh gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/8 to-transparent animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-gray-950/40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-emerald-400/5 to-transparent"></div>

        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(34, 197, 94, 0.4) 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>

        {/* Additional visual enhancement layers */}
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-transparent to-teal-500/5"></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-green-500/5 via-transparent to-emerald-400/5"></div>
      </div>

      {/* Enhanced Navigation with advanced glassmorphism */}
      <nav className="relative z-10 flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="relative group">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 rounded-xl flex items-center justify-center shadow-2xl shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-all duration-300 group-hover:scale-110">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400/80 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300 -z-10"></div>
          </div>
          <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 bg-clip-text text-transparent leading-normal">
            SkillBarter
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-1 bg-gray-950/40 backdrop-blur-xl rounded-2xl p-2 border border-gray-800/40 shadow-xl">
          <a
            href="#"
            className="relative px-4 py-3 text-sm text-slate-300 hover:text-white rounded-xl transition-all duration-300 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-green-500/15 to-teal-600/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative font-medium">About</span>
          </a>
          <a
            href="#"
            className="relative px-4 py-3 text-sm text-slate-300 hover:text-white rounded-xl transition-all duration-300 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-green-500/15 to-teal-600/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative font-medium">Features</span>
          </a>
          <a
            href="#"
            className="relative px-4 py-3 text-sm text-slate-300 hover:text-white rounded-xl transition-all duration-300 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-green-500/15 to-teal-600/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative font-medium">Community</span>
          </a>
          <a
            href="#"
            className="relative px-4 py-3 text-sm text-slate-300 hover:text-white rounded-xl transition-all duration-300 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-green-500/15 to-teal-600/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative font-medium">Contact</span>
          </a>
        </div>

        <div className="flex items-center space-x-4">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`relative p-3 rounded-xl transition-all duration-500 transform hover:scale-110 ${
              isDarkMode 
                ? 'bg-gray-950/40 backdrop-blur-xl border border-gray-800/40 text-yellow-400 hover:text-yellow-300 hover:border-yellow-500/30' 
                : 'bg-white/60 backdrop-blur-xl border border-green-200/40 text-orange-500 hover:text-orange-600 hover:border-orange-300/60'
            } shadow-lg hover:shadow-xl`}
          >
            <div className="relative w-6 h-6 flex items-center justify-center">
              {isDarkMode ? (
                // Sun icon for light mode
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                // Moon icon for dark mode
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </div>
          </button>
          
          <a
            href="/login"
            className={`hidden md:block text-sm font-medium transition-colors duration-300 ${
              isDarkMode 
                ? 'text-slate-300 hover:text-emerald-400' 
                : 'text-gray-700 hover:text-green-600'
            }`}
          >
            Sign In
          </a>
          <a
            href="/register"
            className="relative bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 transform hover:scale-105 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <span className="relative">Get Started</span>
          </a>
        </div>
      </nav>

      {/* Enhanced Hero Section with advanced animations */}
      <div className="relative z-10 flex items-center justify-center px-4 py-20">
        <div className={`max-w-6xl text-center space-y-12 transition-colors duration-500 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          <div className="space-y-8">
            <div className="relative">
              <h1 className="text-6xl md:text-8xl font-black leading-normal">
                <span className={`block mb-6 drop-shadow-2xl pb-4 ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-white via-gray-100 to-slate-200' 
                    : 'bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900'
                } bg-clip-text text-transparent`}>
                  Learn Together.
                </span>
                <span className="block bg-gradient-to-r from-emerald-300 via-green-400 to-teal-400 bg-clip-text text-transparent drop-shadow-2xl pb-4">
                  Grow Faster.
                </span>
              </h1>
              {/* Subtle glow effect behind text */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/5 via-green-500/5 to-teal-600/5 blur-3xl -z-10"></div>
            </div>

            <div className="max-w-4xl mx-auto">
              <p className={`text-3xl md:text-4xl leading-relaxed font-light pb-8 ${
                isDarkMode ? 'text-slate-300' : 'text-gray-600'
              }`}>
                Elevate your career with{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent font-semibold">
                  peer-powered learning
                </span>
                . Be part of a collaborative community where knowledge is shared and growth never stops.
              </p>
            </div>

          </div>

          {/* Enhanced Stats with magnetic hover effects */}
          <div className="flex justify-center gap-6 flex-wrap text-center py-12">

            <div className={`group relative backdrop-blur-xl border rounded-3xl p-8 min-w-[140px] transition-all duration-500 ease-out transform hover:scale-105 hover:-rotate-1 cursor-pointer ${
              isDarkMode 
                ? 'bg-gray-950/40 border-gray-800/40 hover:bg-gray-950/60 hover:border-emerald-500/50 hover:shadow-emerald-500/20' 
                : 'bg-white/60 border-green-200/40 hover:bg-white/80 hover:border-green-400/50 hover:shadow-green-500/20'
            } shadow-2xl`}>

              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 via-green-500/5 to-teal-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400/15 via-green-500/15 to-teal-600/15 rounded-3xl blur opacity-0 group-hover:opacity-40 transition-opacity duration-500 -z-10"></div>

              <div className="relative">
                <div className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent mb-3 pb-2">
                  10K+
                </div>
                <div className={`text-sm font-medium pb-2 ${
                  isDarkMode ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  Active Learners
                </div>
                <div className="w-12 h-1 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full mx-auto mt-3 group-hover:w-16 transition-all duration-300"></div>
              </div>
            </div>

            <div className={`group relative backdrop-blur-xl border rounded-3xl p-8 min-w-[140px] transition-all duration-500 ease-out transform hover:scale-105 cursor-pointer ${
              isDarkMode 
                ? 'bg-gray-950/40 border-gray-800/40 hover:bg-gray-950/60 hover:border-green-500/50 hover:shadow-green-500/20' 
                : 'bg-white/60 border-green-200/40 hover:bg-white/80 hover:border-green-400/50 hover:shadow-green-500/20'
            } shadow-2xl`}>

              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-teal-600/5 to-emerald-400/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-green-500/15 via-teal-600/15 to-emerald-400/15 rounded-3xl blur opacity-0 group-hover:opacity-40 transition-opacity duration-500 -z-10"></div>

              <div className="relative">
                <div className="text-4xl font-black bg-gradient-to-r from-green-500 to-teal-600 bg-clip-text text-transparent mb-3 pb-2">
                  500+
                </div>
                <div className={`text-sm font-medium pb-2 ${
                  isDarkMode ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  Skills Available
                </div>
                <div className="w-12 h-1 bg-gradient-to-r from-green-500 to-teal-600 rounded-full mx-auto mt-3 group-hover:w-16 transition-all duration-300"></div>
              </div>
            </div>

            <div className={`group relative backdrop-blur-xl border rounded-3xl p-8 min-w-[140px] transition-all duration-500 ease-out transform hover:scale-105 hover:rotate-1 cursor-pointer ${
              isDarkMode 
                ? 'bg-gray-950/40 border-gray-800/40 hover:bg-gray-950/60 hover:border-teal-600/50 hover:shadow-teal-500/20' 
                : 'bg-white/60 border-green-200/40 hover:bg-white/80 hover:border-teal-400/50 hover:shadow-teal-500/20'
            } shadow-2xl`}>

              <div className="absolute inset-0 bg-gradient-to-r from-teal-600/10 via-emerald-400/5 to-green-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-teal-600/15 via-emerald-400/15 to-green-500/15 rounded-3xl blur opacity-0 group-hover:opacity-40 transition-opacity duration-500 -z-10"></div>

              <div className="relative">
                <div className="text-4xl font-black bg-gradient-to-r from-teal-600 to-emerald-400 bg-clip-text text-transparent mb-3 pb-2">
                  95%
                </div>
                <div className={`text-sm font-medium pb-2 ${
                  isDarkMode ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  Success Rate
                </div>
                <div className="w-12 h-1 bg-gradient-to-r from-teal-600 to-emerald-400 rounded-full mx-auto mt-3 group-hover:w-16 transition-all duration-300"></div>
              </div>
            </div>

          </div>


          {/* Enhanced CTA Buttons with premium effects */}
          <div className="flex justify-center gap-6 flex-wrap">

            {/* Primary CTA */}
            <a
              href="/register"
              className="group relative bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 hover:from-emerald-500 hover:via-green-600 hover:to-teal-700 text-white font-bold px-12 py-4 rounded-2xl transition-all duration-500 ease-out transform hover:scale-105 shadow-xl hover:shadow-emerald-500/50 flex items-center gap-3 text-lg overflow-hidden"
            >
              {/* Soft shine sweep */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>

              {/* Ambient glow */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 group-hover:ring-emerald-400/40 transition-all duration-500"></div>

              <span className="text-xl relative">🚀</span>
              <span className="relative">Get Started Free</span>
              <span className="text-lg relative group-hover:translate-x-1 transition-transform duration-300">
                →
              </span>
            </a>

            {/* Secondary CTA */}
            <a
              href="/login"
              className="group relative bg-gray-950/40 backdrop-blur-xl border border-gray-800/60 hover:border-emerald-500/60 text-white font-bold px-12 py-4 rounded-2xl hover:bg-gray-950/70 transition-all duration-500 ease-out transform hover:scale-102 nflex items-center gap-3 text-lg shadow-lg hover:shadow-emerald-500/10"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400/0 via-emerald-400/5 to-emerald-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <span className="text-lg relative">👋</span>
              <span className="relative">Sign In</span>
            </a>

          </div>


          {/* Enhanced How It Works Section with 3D effects */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
            <div className="text-center mb-20">

              {/* Badge */}
              <div className="inline-flex items-center gap-2
  bg-gradient-to-r from-emerald-400/10 via-green-500/10 to-teal-600/10
  backdrop-blur-md rounded-full px-6 py-3 mb-6
  border border-emerald-400/30 shadow-lg">
                <span className="text-emerald-400 font-semibold text-sm tracking-wide uppercase">
                  How it works
                </span>
              </div>

              {/* Heading */}
              <h2 className={`text-4xl md:text-5xl font-extrabold mb-6 leading-tight ${
                isDarkMode 
                  ? 'bg-gradient-to-b from-white via-slate-200 to-slate-400' 
                  : 'bg-gradient-to-b from-gray-800 via-gray-700 to-gray-900'
              } bg-clip-text text-transparent`}>
                Learn Faster. Share Smarter.
              </h2>

              {/* Description */}
              <p className={`text-lg md:text-xl max-w-3xl mx-auto leading-relaxed pb-8 ${
                isDarkMode ? 'text-slate-300' : 'text-gray-600'
              }`}>
                Discover a smarter way to grow by exchanging skills in a community designed
                for real learning and meaningful collaboration.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12">

              {/* Step 1 */}
              <div className="group text-center">
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-400/20 via-green-500/15 to-teal-600/20
        backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6
        transition-all duration-500 ease-out
        group-hover:scale-105 group-hover:rotate-3
        shadow-lg group-hover:shadow-emerald-500/25 cursor-pointer">
                    <div className="text-4xl">🎯</div>
                  </div>

                  {/* soft glow */}
                  <div className="absolute inset-0 rounded-3xl bg-emerald-400/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>

                <h3 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${
                  isDarkMode ? 'text-white group-hover:text-emerald-400' : 'text-gray-800 group-hover:text-green-600'
                }`}>
                  Discover Skills
                </h3>

                <p className={`text-base leading-relaxed transition-colors duration-300 ${
                  isDarkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-gray-600 group-hover:text-gray-700'
                }`}>
                  Explore a wide range of skills and connect with people who are eager to
                  learn and share knowledge.
                </p>
              </div>

              {/* Step 2 */}
              <div className="group text-center">
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-500/20 via-teal-600/15 to-emerald-400/20
        backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6
        transition-all duration-500 ease-out
        group-hover:scale-105 group-hover:-rotate-3
        shadow-lg group-hover:shadow-green-500/25 cursor-pointer">
                    <div className="text-4xl">🤝</div>
                  </div>

                  <div className="absolute inset-0 rounded-3xl bg-green-400/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>

                <h3 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${
                  isDarkMode ? 'text-white group-hover:text-green-400' : 'text-gray-800 group-hover:text-emerald-600'
                }`}>
                  Learn Together
                </h3>

                <p className={`text-base leading-relaxed transition-colors duration-300 ${
                  isDarkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-gray-600 group-hover:text-gray-700'
                }`}>
                  Share experiences through conversations, live sessions, and collaborative
                  learning moments.
                </p>
              </div>

              {/* Step 3 */}
              <div className="group text-center">
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-teal-600/20 via-emerald-400/15 to-green-500/20
        backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6
        transition-all duration-500 ease-out
        group-hover:scale-105 group-hover:rotate-3
        shadow-lg group-hover:shadow-teal-500/25 cursor-pointer">
                    <div className="text-4xl">🌟</div>
                  </div>

                  <div className="absolute inset-0 rounded-3xl bg-teal-400/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>

                <h3 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${
                  isDarkMode ? 'text-white group-hover:text-teal-400' : 'text-gray-800 group-hover:text-teal-600'
                }`}>
                  Grow Your Career
                </h3>

                <p className={`text-base leading-relaxed transition-colors duration-300 ${
                  isDarkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-gray-600 group-hover:text-gray-700'
                }`}>
                  Build meaningful connections while strengthening your skills and moving
                  forward with confidence.
                </p>
              </div>

            </div>

          </div>

          {/* Enhanced Features Section with refined effects */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
            <div className="text-center mb-20">
              <h2 className={`text-4xl md:text-5xl font-bold mb-6 drop-shadow leading-tight pb-4 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-white to-slate-200' 
                  : 'bg-gradient-to-r from-gray-800 to-gray-600'
              } bg-clip-text text-transparent`}>
                Why Choose SkillBarter?
              </h2>
              <p className={`text-lg md:text-xl max-w-3xl mx-auto leading-relaxed pb-8 ${
                isDarkMode ? 'text-slate-300' : 'text-gray-600'
              }`}>
                A smarter, more human way to learn and grow through meaningful
                skill-based connections.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">

              {/* Card 1 */}
              <div className={`group backdrop-blur-xl border rounded-3xl p-10 text-center transition-all duration-500 transform hover:scale-[1.03] relative overflow-hidden cursor-pointer ${
                isDarkMode 
                  ? 'bg-gray-950/30 border-gray-800/40 hover:bg-gray-950/45 hover:border-emerald-500/40 hover:shadow-emerald-500/15' 
                  : 'bg-white/60 border-green-200/40 hover:bg-white/80 hover:border-emerald-400/40 hover:shadow-emerald-500/15'
              } shadow-xl`}>

                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/8 via-transparent to-green-500/8
        opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative bg-gradient-to-r from-emerald-400/20 via-green-500/15 to-teal-600/20
        w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8
        group-hover:scale-105 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                  <div className="text-emerald-400 text-3xl">👥</div>
                </div>

                <h3 className={`text-2xl font-bold mb-5 transition-colors duration-300 ${
                  isDarkMode ? 'text-white group-hover:text-emerald-400' : 'text-gray-800 group-hover:text-emerald-600'
                }`}>
                  Community Learning
                </h3>
                <p className={`text-base leading-relaxed transition-colors duration-300 ${
                  isDarkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-gray-600 group-hover:text-gray-700'
                }`}>
                  Learn alongside motivated professionals in a supportive and
                  growth-focused community.
                </p>

                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600
        scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </div>

              {/* Card 2 */}
              <div className={`group backdrop-blur-xl border rounded-3xl p-10 text-center transition-all duration-500 transform hover:scale-[1.03] relative overflow-hidden cursor-pointer ${
                isDarkMode 
                  ? 'bg-gray-950/30 border-gray-800/40 hover:bg-gray-950/45 hover:border-green-500/40 hover:shadow-green-500/15' 
                  : 'bg-white/60 border-green-200/40 hover:bg-white/80 hover:border-green-400/40 hover:shadow-green-500/15'
              } shadow-xl`}>

                <div className="absolute inset-0 bg-gradient-to-br from-green-500/8 via-transparent to-teal-600/8
        opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative bg-gradient-to-r from-green-500/20 via-teal-600/15 to-emerald-400/20
        w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8
        group-hover:scale-105 group-hover:-rotate-6 transition-all duration-500 shadow-lg">
                  <div className="text-green-400 text-3xl">📚</div>
                </div>

                <h3 className={`text-2xl font-bold mb-5 transition-colors duration-300 ${
                  isDarkMode ? 'text-white group-hover:text-green-400' : 'text-gray-800 group-hover:text-green-600'
                }`}>
                  Peer Skill Exchange
                </h3>
                <p className={`text-base leading-relaxed transition-colors duration-300 ${
                  isDarkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-gray-600 group-hover:text-gray-700'
                }`}>
                  Share what you know and gain new skills through flexible,
                  peer-driven learning experiences.
                </p>

                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-green-500 via-teal-600 to-emerald-400
        scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </div>

              {/* Card 3 */}
              <div className={`group backdrop-blur-xl border rounded-3xl p-10 text-center transition-all duration-500 transform hover:scale-[1.03] relative overflow-hidden cursor-pointer ${
                isDarkMode 
                  ? 'bg-gray-950/30 border-gray-800/40 hover:bg-gray-950/45 hover:border-teal-600/40 hover:shadow-teal-500/15' 
                  : 'bg-white/60 border-green-200/40 hover:bg-white/80 hover:border-teal-400/40 hover:shadow-teal-500/15'
              } shadow-xl`}>

                <div className="absolute inset-0 bg-gradient-to-br from-teal-600/8 via-transparent to-emerald-400/8
        opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative bg-gradient-to-r from-teal-600/20 via-emerald-400/15 to-green-500/20
        w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8
        group-hover:scale-105 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                  <div className="text-teal-400 text-3xl">⭐</div>
                </div>

                <h3 className={`text-2xl font-bold mb-5 transition-colors duration-300 ${
                  isDarkMode ? 'text-white group-hover:text-teal-400' : 'text-gray-800 group-hover:text-teal-600'
                }`}>
                  Trusted Quality
                </h3>
                <p className={`text-base leading-relaxed transition-colors duration-300 ${
                  isDarkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-gray-600 group-hover:text-gray-700'
                }`}>
                  Verified profiles, reviews, and ratings ensure a reliable and
                  high-quality learning journey.
                </p>

                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal-600 via-emerald-400 to-green-500
        scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </div>

            </div>
          </div>


          {/* Enhanced Testimonials with premium styling */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-6 drop-shadow-lg leading-normal pb-4">
                Success Stories
              </h2>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto pb-8">
                Real people. Real transformations. Real results.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="group bg-gray-950/30 backdrop-blur-xl border border-gray-800/40 rounded-3xl p-10 hover:bg-gray-950/50 hover:border-emerald-500/50 transition-all duration-500 transform hover:scale-105 relative overflow-hidden shadow-2xl hover:shadow-emerald-500/20 cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400/10 to-green-500/10 rounded-3xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500 -z-10"></div>

                <div className="flex items-center mb-8">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-xl group-hover:shadow-emerald-500/30 transition-all duration-300">
                      S
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-gray-950 animate-pulse shadow-lg shadow-green-400/50"></div>
                  </div>
                  <div className="ml-6">
                    <div className="text-white font-bold text-lg pb-1">Sarah Chen</div>
                    <div className="text-emerald-400 font-semibold text-sm pb-1">
                      UI/UX Designer → Full-Stack Designer
                    </div>
                    <div className="text-slate-400 text-xs">
                      6 months on SkillBarter
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex space-x-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div
                        key={star}
                        className="w-4 h-4 text-yellow-400 animate-pulse"
                      >
                        ⭐
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-slate-300 text-base leading-relaxed italic group-hover:text-slate-200 transition-colors duration-300 pb-8">
                  "SkillBarter completely transformed my career trajectory! I taught
                  design principles and learned coding from amazing developers. Now
                  I'm a full-stack designer earning 40% more. The community here is
                  incredible!"
                </p>
              </div>

              <div className="group bg-gray-950/30 backdrop-blur-xl border border-gray-800/40 rounded-3xl p-10 hover:bg-gray-950/50 hover:border-green-500/50 transition-all duration-500 transform hover:scale-105 relative overflow-hidden shadow-2xl hover:shadow-green-500/20 cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-teal-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute -inset-1 bg-gradient-to-r from-green-500/10 to-teal-600/10 rounded-3xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500 -z-10"></div>

                <div className="flex items-center mb-8">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 via-teal-600 to-emerald-400 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-xl group-hover:shadow-green-500/30 transition-all duration-300">
                      M
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-teal-400 rounded-full border-2 border-gray-950 animate-pulse shadow-lg shadow-teal-400/50"></div>
                  </div>
                  <div className="ml-6">
                    <div className="text-white font-bold text-lg pb-1">
                      Marcus Johnson
                    </div>
                    <div className="text-green-400 font-semibold text-sm pb-1">
                      Marketing Specialist → Growth Expert
                    </div>
                    <div className="text-slate-400 text-xs">
                      1 year on SkillBarter
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex space-x-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div
                        key={star}
                        className="w-4 h-4 text-yellow-400 animate-pulse"
                      >
                        ⭐
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-slate-300 text-base leading-relaxed italic group-hover:text-slate-200 transition-colors duration-300 pb-8">
                  "The connections I've made here are invaluable. I've mastered
                  photography, data analytics, and psychology while teaching digital
                  marketing. It's not just learning - it's building lifelong
                  professional relationships."
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Call to Action with cinematic effects */}
          <div className="relative z-10 text-center py-24 px-4">
            <div className="max-w-5xl mx-auto">
              <div className="mb-12">
                <div className="inline-block bg-gradient-to-r from-emerald-400/15 via-green-500/10 to-teal-600/15 backdrop-blur-sm rounded-full px-8 py-3 mb-8 border border-emerald-400/20 shadow-xl animate-pulse">
                  <span className="text-emerald-400 font-semibold text-lg">
                    ✨ Ready to Transform Your Career?
                  </span>
                </div>

                <div className="relative">
                  <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-8 leading-normal drop-shadow-2xl pb-4">
                    Your Journey Starts Now
                  </h2>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 via-green-500/10 to-teal-600/10 blur-3xl -z-10"></div>
                </div>

                <p className="text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed pb-8">
                  Join thousands of professionals who are already transforming their
                  careers through
                  <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent font-semibold">
                    {" "}
                    skill exchange
                  </span>
                </p>
              </div>

              <div className="flex justify-center gap-8 flex-wrap mb-12">
                <a
                  href="/register"
                  className="group relative bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 hover:from-emerald-500 hover:via-green-600 hover:to-teal-700 text-white font-bold px-16 py-5 rounded-2xl transition-all duration-500 transform hover:scale-110 shadow-2xl hover:shadow-emerald-500/50 flex items-center gap-4 text-xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-60 transition-opacity duration-500"></div>
                  <span className="text-2xl relative">⚡</span>
                  <span className="relative">Start Learning Today</span>
                  <span className="text-xl group-hover:translate-x-3 transition-transform duration-300 relative">
                    →
                  </span>
                </a>
              </div>

              <div className="text-slate-400 text-base flex flex-wrap justify-center gap-6">
                <div className="flex items-center gap-2 group cursor-pointer pb-2">
                  <span className="text-lg">💳</span>
                  <span className="group-hover:text-emerald-400 transition-colors duration-300">
                    No credit card required
                  </span>
                </div>
                <div className="flex items-center gap-2 group cursor-pointer pb-2">
                  <span className="text-lg">🎯</span>
                  <span className="group-hover:text-green-400 transition-colors duration-300">
                    Find your first skill match in minutes
                  </span>
                </div>
                <div className="flex items-center gap-2 group cursor-pointer pb-2">
                  <span className="text-lg">🌟</span>
                  <span className="group-hover:text-teal-400 transition-colors duration-300">
                    Join 1,000+ active learners
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Footer with premium styling */}
          <footer className={`relative z-10 w-screen left-1/2 -ml-[50vw] backdrop-blur-xl border-t shadow-2xl transition-all duration-500 ${
            isDarkMode 
              ? 'bg-black/80 border-gray-800/50' 
              : 'bg-white/80 border-green-200/50'
          }`}>
            <div className="max-w-7xl mx-auto px-4 py-16">
              <div className="grid md:grid-cols-5 gap-12">

                <div className="md:col-span-2">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="relative group">
                      <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 rounded-xl flex items-center justify-center shadow-2xl shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-all duration-300 group-hover:scale-110">
                        <span className="text-white font-bold text-xl">S</span>
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400/80 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300 -z-10"></div>
                    </div>

                    <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 bg-clip-text text-transparent">
                      SkillBarter
                    </div>
                  </div>

                  <p className={`text-base leading-relaxed max-w-sm mb-8 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    Empowering professional growth through collaborative learning
                    and meaningful connections in our global community.
                  </p>

                  <div className="flex gap-4">
                    {["💼", "🌐", "📧", "📱"].map((icon, i) => (
                      <div
                        key={i}
                        className={`w-12 h-12 border rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer group backdrop-blur-sm shadow-lg ${
                          isDarkMode 
                            ? 'bg-gray-950/60 border-gray-800/50 hover:bg-gray-900/70 hover:border-emerald-500/50 hover:shadow-emerald-500/20' 
                            : 'bg-white/60 border-green-200/50 hover:bg-white/80 hover:border-emerald-400/50 hover:shadow-emerald-400/20'
                        }`}
                      >
                        <span className={`text-xl transition-colors duration-300 ${
                          isDarkMode ? 'text-slate-300 group-hover:text-emerald-400' : 'text-gray-600 group-hover:text-emerald-600'
                        }`}>
                          {icon}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Platform */}
                <div>
                  <h4 className={`font-bold text-base mb-6 ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>Platform</h4>
                  <div className={`space-y-4 text-sm ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    {["How it Works", "Find Skills", "Teach Skills", "Community", "Success Stories"].map((item, i) => (
                      <div key={i} className={`cursor-pointer transition-all duration-300 hover:translate-x-1 flex items-center ${
                        isDarkMode ? 'hover:text-emerald-400' : 'hover:text-emerald-600'
                      }`}>
                        → <span className="ml-2">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Support */}
                <div>
                  <h4 className={`font-bold text-base mb-6 ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>Support</h4>
                  <div className={`space-y-4 text-sm ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    {["Help Center", "Contact Us", "Safety Guidelines", "Community Rules", "Privacy Policy"].map((item, i) => (
                      <div key={i} className={`cursor-pointer transition-all duration-300 hover:translate-x-1 flex items-center ${
                        isDarkMode ? 'hover:text-green-400' : 'hover:text-green-600'
                      }`}>
                        → <span className="ml-2">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Company */}
                <div>
                  <h4 className={`font-bold text-base mb-6 ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>Company</h4>
                  <div className={`space-y-4 text-sm ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    {["About Us", "Careers", "Press Kit", "Partnership", "Terms of Service"].map((item, i) => (
                      <div key={i} className={`cursor-pointer transition-all duration-300 hover:translate-x-1 flex items-center ${
                        isDarkMode ? 'hover:text-teal-400' : 'hover:text-teal-600'
                      }`}>
                        → <span className="ml-2">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              <div className={`mt-16 pt-8 flex flex-col md:flex-row justify-between items-center border-t ${
                isDarkMode ? 'border-gray-800/50' : 'border-green-200/50'
              }`}>
                <div className={`text-sm text-center md:text-left ${
                  isDarkMode ? 'text-slate-500' : 'text-gray-500'
                }`}>
                  © 2026 SkillBarter. All rights reserved.
                </div>
                <div className="flex space-x-6 text-sm">
                  <span className={`cursor-pointer ${
                    isDarkMode ? 'text-slate-400 hover:text-emerald-400' : 'text-gray-600 hover:text-emerald-600'
                  }`}>Privacy</span>
                  <span className={`cursor-pointer ${
                    isDarkMode ? 'text-slate-400 hover:text-green-400' : 'text-gray-600 hover:text-green-600'
                  }`}>Terms</span>
                  <span className={`cursor-pointer ${
                    isDarkMode ? 'text-slate-400 hover:text-teal-400' : 'text-gray-600 hover:text-teal-600'
                  }`}>Cookies</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}