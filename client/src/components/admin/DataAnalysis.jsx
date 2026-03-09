import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchInactiveUsersAsync,
  cleanupInactiveUsersAsync,
  deleteInactiveUserAsync,
  fetchAdminStatsAsync,
} from "../../redux/slices/adminSlice";
import { showError, showSuccess } from "../../utils/toast";

const AnalysisCard = ({ title, value, subtitle, icon, color = "emerald" }) => {
  const colorClasses = {
    emerald: "bg-emerald-500/20 border-emerald-400/30 text-emerald-400",
    green: "bg-green-500/20 border-green-400/30 text-green-400",
    red: "bg-red-500/20 border-red-400/30 text-red-400",
    yellow: "bg-yellow-400/20 border-yellow-400/30 text-yellow-400",
    blue: "bg-blue-500/20 border-blue-400/30 text-blue-400",
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div
          className={`w-14 h-14 rounded-xl border flex items-center justify-center ${colorClasses[color]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

const InactiveUserRow = ({ user, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "to_be_deleted":
        return "bg-red-500/20 text-red-400 border-red-400/30";
      case "reminder_sent":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-400/30";
      case "inactive":
        return "bg-blue-500/20 text-blue-400 border-blue-400/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-400/30";
    }
  };

  return (
    <tr className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
      <td className="py-4 px-4">
        <div>
          <p className="font-medium text-white">{user.name}</p>
          <p className="text-sm text-slate-400">{user.email}</p>
        </div>
      </td>
      <td className="py-4 px-4 text-slate-300">
        {new Date(user.lastActivity).toLocaleDateString()}
      </td>
      <td className="py-4 px-4 text-slate-300">{user.daysInactive} days</td>
      <td className="py-4 px-4">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
            user.status
          )}`}
        >
          {user.status === "to_be_deleted"
            ? "To Be Deleted"
            : user.status === "reminder_sent"
            ? "Reminder Sent"
            : user.status === "inactive"
            ? "Inactive"
            : "Active"}
        </span>
      </td>
      <td className="py-4 px-4">
        <span className="text-slate-300 font-medium">{user.daysUntilDeletion} days</span>
      </td>
      <td className="py-4 px-4">
        {user.status === "to_be_deleted" && (
          <button
            onClick={() => onDelete(user._id)}
            className="px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-400/30 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
          >
            Delete
          </button>
        )}
      </td>
    </tr>
  );
};

export default function DataAnalysis() {
  const dispatch = useDispatch();
  const {
    inactiveUsers,
    inactiveUsersSummary,
    inactiveUsersLoading,
    loading,
    adminStats,
  } = useSelector((state) => state.admin);

  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    dispatch(fetchInactiveUsersAsync());
    dispatch(fetchAdminStatsAsync());
  }, [dispatch]);

  const handleCleanup = async () => {
    if (!window.confirm("Are you sure you want to delete all inactive users?")) {
      return;
    }
    try {
      await dispatch(cleanupInactiveUsersAsync()).unwrap();
      showSuccess("Inactive users cleaned up successfully");
      dispatch(fetchInactiveUsersAsync());
      dispatch(fetchAdminStatsAsync());
    } catch (err) {
      showError(err.message || "Failed to cleanup inactive users");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }
    try {
      await dispatch(deleteInactiveUserAsync(userId)).unwrap();
      showSuccess("User deleted successfully");
      dispatch(fetchAdminStatsAsync());
    } catch (err) {
      showError(err.message || "Failed to delete user");
    }
  };

  const stats = adminStats?.overview || {};
  const topSkills = adminStats?.topSkills || [];
  const matchStats = adminStats?.matchStatistics || {};
  const userGrowth = adminStats?.userGrowth || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-slate-200 bg-clip-text text-transparent">
            Data Analysis
          </h2>
          <p className="text-slate-400 mt-2 text-lg">
            Comprehensive platform analytics and insights
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-slate-800 pb-4">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "overview"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-400/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("inactive")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "inactive"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-400/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            Inactive Users
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnalysisCard
                title="Total Users"
                value={stats.totalUsers || 0}
                subtitle="Registered users"
                color="emerald"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                }
              />
              <AnalysisCard
                title="Active Users"
                value={stats.activeUsers || 0}
                subtitle="In last 30 days"
                color="green"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
              <AnalysisCard
                title="Inactive Users"
                value={inactiveUsersSummary.totalInactive || 0}
                subtitle="Not logged in recently"
                color="yellow"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
              <AnalysisCard
                title="At Risk"
                value={inactiveUsersSummary.atRisk || 0}
                subtitle="Within 5 days of deletion"
                color="red"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                }
              />
            </div>

            {/* Platform Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-white mb-6">Match Statistics</h3>
                <div className="space-y-4">
                  {Object.entries(matchStats).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                      <span className="text-slate-300 capitalize">{key}</span>
                      <span className="font-bold text-emerald-400">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-white mb-6">Top Skills</h3>
                <div className="space-y-4">
                  {topSkills.slice(0, 5).map((skill, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                      <span className="text-slate-300 truncate">{skill._id}</span>
                      <span className="font-bold text-emerald-400">{skill.count}</span>
                    </div>
                  ))}
                  {topSkills.length === 0 && (
                    <p className="text-slate-500 text-center py-4">No skills data</p>
                  )}
                </div>
              </div>
            </div>

            {/* User Growth */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-white mb-6">User Growth Trend</h3>
              {userGrowth.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userGrowth.slice(-6).map((month, index) => (
                    <div key={index} className="p-4 bg-slate-800/50 rounded-xl">
                      <p className="text-sm text-slate-400 mb-2">
                        {month._id
                          ? `${month._id.month}/${month._id.year}`
                          : `Month ${index + 1}`}
                      </p>
                      <p className="text-2xl font-bold text-emerald-400">{month.count}</p>
                      <p className="text-xs text-slate-500">new users</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-8">No growth data available</p>
              )}
            </div>

            {/* Platform Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-4">Skill Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Skills</span>
                    <span className="text-emerald-400 font-medium">{stats.totalSkills || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Avg per User</span>
                    <span className="text-emerald-400 font-medium">
                      {stats.totalUsers > 0
                        ? (stats.totalSkills / stats.totalUsers).toFixed(1)
                        : 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-4">Review Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Reviews</span>
                    <span className="text-emerald-400 font-medium">{stats.totalReviews || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Avg Rating</span>
                    <span className="text-emerald-400 font-medium">{stats.averageRating || 0}★</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-4">Activity Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">New Users (30d)</span>
                    <span className="text-emerald-400 font-medium">{stats.recentUsers || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Weekly Users</span>
                    <span className="text-emerald-400 font-medium">{stats.weeklyUsers || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Inactive Users Tab */}
        {activeTab === "inactive" && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <AnalysisCard
                title="Total Inactive"
                value={inactiveUsersSummary.totalInactive || 0}
                subtitle="Users not logged in recently"
                color="yellow"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
              <AnalysisCard
                title="At Risk"
                value={inactiveUsersSummary.atRisk || 0}
                subtitle="Within 5 days of deletion"
                color="red"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                }
              />
              <AnalysisCard
                title="To Be Deleted"
                value={inactiveUsersSummary.toBeDeleted || 0}
                subtitle="15+ days inactive"
                color="red"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                }
              />
              <AnalysisCard
                title="Reminder Day"
                value={inactiveUsersSummary.reminderDay || 10}
                subtitle="Email reminder sent"
                color="blue"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
              />
            </div>

            {/* Cleanup Button */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-white">Inactive Users List</h3>
                <p className="text-slate-400 text-sm mt-1">
                  Users will be deleted after {inactiveUsersSummary.deleteDay || 15} days of inactivity
                </p>
              </div>
              <button
                onClick={handleCleanup}
                disabled={loading || inactiveUsersSummary.toBeDeleted === 0}
                className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-400/30 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Delete All Inactive Users"}
              </button>
            </div>

            {/* Inactive Users Table */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
              {inactiveUsersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : inactiveUsers.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-slate-800/50">
                    <tr>
                      <th className="text-left py-4 px-4 text-slate-400 font-medium">User</th>
                      <th className="text-left py-4 px-4 text-slate-400 font-medium">Last Activity</th>
                      <th className="text-left py-4 px-4 text-slate-400 font-medium">Days Inactive</th>
                      <th className="text-left py-4 px-4 text-slate-400 font-medium">Status</th>
                      <th className="text-left py-4 px-4 text-slate-400 font-medium">Days Until Deletion</th>
                      <th className="text-left py-4 px-4 text-slate-400 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inactiveUsers.map((user) => (
                      <InactiveUserRow
                        key={user._id}
                        user={user}
                        onDelete={handleDeleteUser}
                      />
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12">
                  <svg
                    className="w-16 h-16 text-emerald-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-slate-400 text-lg">No inactive users</p>
                  <p className="text-slate-500 text-sm">All users are active!</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-slate-500 pt-6 border-t border-slate-800">
          <p>
            Data Analysis • SkillBarter Admin • Last updated: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
