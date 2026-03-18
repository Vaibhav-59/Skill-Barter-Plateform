import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import WalletSummary from "../components/timebanking/WalletSummary";
import TransactionList from "../components/timebanking/TransactionList";
import CreditRules from "../components/timebanking/CreditRules";
import CreditChart from "../components/timebanking/CreditChart";
import CreditRequestModal from "../components/timebanking/CreditRequestModal";
import { getWallet, getTransactions, getWalletStats } from "../services/walletApi";

const NAV_TABS = [
  { id: "overview", label: "Overview", icon: "💳" },
  { id: "transactions", label: "Transactions", icon: "📋" },
  { id: "charts", label: "Activity", icon: "📊" },
  { id: "rules", label: "Rules", icon: "📜" },
];

export default function TimeBanking() {
  const { isDarkMode } = useTheme();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [loadingTx, setLoadingTx] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const fetchWallet = useCallback(async () => {
    try {
      const data = await getWallet();
      setWallet(data.data);
    } catch (err) {
      console.error("fetchWallet error:", err);
    } finally {
      setLoadingWallet(false);
    }
  }, []);

  const fetchTransactions = useCallback(async (filter = "all") => {
    setLoadingTx(true);
    try {
      const data = await getTransactions(filter);
      setTransactions(data.data || []);
    } catch (err) {
      console.error("fetchTransactions error:", err);
    } finally {
      setLoadingTx(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await getWalletStats();
      setStats(data.data || []);
    } catch (err) {
      console.error("fetchStats error:", err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet();
    fetchTransactions("all");
    fetchStats();
  }, [fetchWallet, fetchTransactions, fetchStats]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    fetchTransactions(filter);
  };

  const handleRequestSuccess = () => {
    fetchWallet();
    fetchTransactions(activeFilter);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-950 via-slate-950 to-gray-900"
          : "bg-gradient-to-br from-gray-50 via-slate-50 to-white"
      }`}
    >
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* ── Page Header ── */}
        <div className="mb-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs mb-5">
            <Link to="/skill-hub" className={`font-medium hover:underline ${isDarkMode ? "text-slate-500 hover:text-slate-300" : "text-gray-400 hover:text-gray-600"}`}>
              Skill Hub
            </Link>
            <span className={isDarkMode ? "text-slate-700" : "text-gray-300"}>/</span>
            <span className={`font-semibold ${isDarkMode ? "text-violet-400" : "text-violet-600"}`}>
              Time Banking
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end gap-6">
            <div className="flex-1">
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-400/10 border border-violet-400/20 mb-4">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">
                  Time Credits System
                </span>
              </div>
              <h1
                className={`text-4xl sm:text-5xl font-extrabold tracking-tight ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Time{" "}
                <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  Banking
                </span>
              </h1>
              <p className={`mt-3 text-base sm:text-lg max-w-xl leading-relaxed ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                Earn credits by teaching, spend them to learn. Your time is the currency.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowRequestModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105 active:scale-100"
              >
                <span>🤝</span>
                Request Credit
              </button>
              <Link
                to="/sessions"
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:scale-105 active:scale-100 ${
                  isDarkMode
                    ? "border-white/10 text-slate-300 hover:text-white hover:border-white/20 bg-white/5 hover:bg-white/10"
                    : "border-gray-200 text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 shadow-sm"
                }`}
              >
                <span>📅</span>
                My Sessions
              </Link>
            </div>
          </div>
        </div>

        {/* ── Tab Navigation ── */}
        <div
          className={`flex gap-1 p-1 rounded-2xl mb-8 w-fit ${
            isDarkMode ? "bg-white/5 border border-white/[0.07]" : "bg-gray-100 border border-gray-200"
          }`}
        >
          {NAV_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30"
                  : isDarkMode
                  ? "text-slate-400 hover:text-white hover:bg-white/5"
                  : "text-gray-500 hover:text-gray-900 hover:bg-white"
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── Main Content ── */}
        <div className="space-y-8">
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              <WalletSummary wallet={wallet} loading={loadingWallet} />

              {/* Quick insights */}
              {wallet && !loadingWallet && (
                <div className={`rounded-3xl border p-5 ${isDarkMode ? "bg-white/[0.03] border-white/[0.07]" : "bg-white border-gray-100 shadow-sm"}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-base">
                      💡
                    </div>
                    <h3 className={`font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Quick Insights</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className={`rounded-2xl p-4 ${isDarkMode ? "bg-white/5" : "bg-gray-50"}`}>
                      <p className={`text-xs font-semibold ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>Teach-to-Learn Ratio</p>
                      <p className={`text-2xl font-black mt-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {wallet.spentCredits > 0 ? (wallet.earnedCredits / wallet.spentCredits).toFixed(1) : "∞"}
                        <span className={`text-xs font-normal ml-1 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>x</span>
                      </p>
                    </div>
                    <div className={`rounded-2xl p-4 ${isDarkMode ? "bg-white/5" : "bg-gray-50"}`}>
                      <p className={`text-xs font-semibold ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>Wallet Status</p>
                      <p className={`text-2xl font-black mt-1 ${wallet.balance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {wallet.balance >= 0 ? "Positive ✅" : "In Debt ⚠️"}
                      </p>
                    </div>
                    <div className={`rounded-2xl p-4 ${isDarkMode ? "bg-white/5" : "bg-gray-50"}`}>
                      <p className={`text-xs font-semibold ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>Net Hours Contributed</p>
                      <p className={`text-2xl font-black mt-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {wallet.earnedCredits}
                        <span className={`text-xs font-normal ml-1 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>hrs</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent transactions preview */}
              <div className={`rounded-3xl border p-6 ${isDarkMode ? "bg-white/[0.03] border-white/[0.07]" : "bg-white border-gray-100 shadow-sm"}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-gray-900"}`}>Recent Transactions</h3>
                  <button
                    onClick={() => setActiveTab("transactions")}
                    className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    View All →
                  </button>
                </div>
                {loadingTx ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => <div key={i} className={`h-14 rounded-xl animate-pulse ${isDarkMode ? "bg-white/5" : "bg-gray-100"}`} />)}
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="py-8 text-center">
                    <div className="text-4xl mb-2">💳</div>
                    <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>No transactions yet. Complete a session to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {transactions.slice(0, 5).map((tx) => {
                      const isEarned = tx.type === "earned" || tx.type === "bonus";
                      return (
                        <div
                          key={tx._id}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors ${isDarkMode ? "border-white/5 bg-white/[0.02] hover:bg-white/[0.05]" : "border-gray-50 bg-gray-50 hover:bg-gray-100"}`}
                        >
                          <span className={`text-lg ${isEarned ? "text-emerald-400" : "text-rose-400"}`}>
                            {isEarned ? "↑" : "↓"}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isDarkMode ? "text-slate-200" : "text-gray-800"}`}>
                              {tx.skillName}
                            </p>
                            <p className={`text-[11px] ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
                              {new Date(tx.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short" })} · {tx.duration}h
                            </p>
                          </div>
                          <span className={`font-bold text-sm ${isEarned ? "text-emerald-400" : "text-rose-400"}`}>
                            {isEarned ? "+" : "-"}{tx.credits}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TRANSACTIONS TAB */}
          {activeTab === "transactions" && (
            <TransactionList
              transactions={transactions}
              loading={loadingTx}
              onFilterChange={handleFilterChange}
              activeFilter={activeFilter}
            />
          )}

          {/* CHARTS TAB */}
          {activeTab === "charts" && (
            <CreditChart stats={stats} loading={loadingStats} />
          )}

          {/* RULES TAB */}
          {activeTab === "rules" && <CreditRules />}
        </div>
      </div>

      {/* Credit Request Modal */}
      {showRequestModal && (
        <CreditRequestModal
          walletBalance={wallet?.balance ?? 0}
          onClose={() => setShowRequestModal(false)}
          onSuccess={handleRequestSuccess}
        />
      )}
    </div>
  );
}
