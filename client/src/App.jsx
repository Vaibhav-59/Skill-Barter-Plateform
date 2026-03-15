import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import RegisterForm from "./components/auth/RegisterForm";
import Layout from "./components/layout/Layout";
import AdminLayout from "./components/layout/AdminLayout";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import SkillsPage from "./pages/SkillsPage";
import MatchesPage from "./pages/MatchesPage";
import NotificationsPage from "./pages/NotificationsPage";
import ChatPage from "./pages/ChatPage";
import ReviewsPage from "./pages/ReviewsPage";
import ReviewPage from "./pages/ReviewPage";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./components/admin/UserManagement";
import ReviewManagement from "./components/admin/ReviewManagement";
import SkillManagement from "./components/admin/SkillManagement";
import StatsOverview from "./components/admin/StatsOverview";
import DataAnalysis from "./components/admin/DataAnalysis";
import ActiveMeetings from "./components/admin/ActiveMeetings";
import UserDetailPage from "./pages/UserDetailPage";
import { SocketProvider } from "./contexts/SocketContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import UserReviewsPage from "./pages/UserReviewsPage";
import GlobalCallNotification from "./components/GlobalCallNotification";
import MeetingPage from "./pages/MeetingPage";
import MeetingRoom from "./pages/MeetingRoom";
import SkillMentor from "./components/SkillMentor";
import SessionScheduler from "./pages/SessionScheduler";
import SessionReminder from "./components/session/SessionReminder";
import SmartContractPage from "./pages/SmartContractPage";

export default function App() {
  return (
    <ThemeProvider>
      <SocketProvider>
        <Router>
        <GlobalCallNotification />
        <SkillMentor />
        <SessionReminder />
        <ToastContainer theme="dark" position="top-right" autoClose={5000} />
        <Routes>
          {/* Public Routes */}
          <Route index element={<HomePage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/register" element={<RegisterForm />} />

          {/* Protected Routes wrapped inside layout */}
          <Route path="/" element={<Layout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="skills" element={<SkillsPage />} />
            <Route path="matches" element={<MatchesPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="/chat/:userId" element={<ChatPage />} />
            <Route path="chat/match/:matchId" element={<ChatPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="review/:matchId" element={<ReviewPage />} />
            <Route path="user/:id" element={<UserDetailPage />} />
            <Route path="user/:userId/reviews" element={<UserReviewsPage />} />
            <Route path="meeting" element={<MeetingPage />} />
            <Route path="sessions" element={<SessionScheduler />} />
            <Route path="contracts" element={<SmartContractPage />} />
          </Route>

          {/* Meeting Room - Full screen, outside Layout (no sidebar/footer) */}
          <Route path="/meeting/:meetingId" element={<MeetingRoom />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="reviews" element={<ReviewManagement />} />
            <Route path="skills" element={<SkillManagement />} />
            <Route path="stats" element={<StatsOverview />} />
            <Route path="data-analysis" element={<DataAnalysis />} />
            <Route path="meetings" element={<ActiveMeetings />} />
          </Route>
        </Routes>
      </Router>
    </SocketProvider>
    </ThemeProvider>
  );
}
