import { useState } from "react";
import { useTheme } from "../../hooks/useTheme";
import TransactionItem from "./TransactionItem";

const FILTERS = ["all", "earned", "spent", "bonus", "debt"];

export default function TransactionList({ transactions, loading, onFilterChange, activeFilter }) {
  const { isDarkMode } = useTheme();
  const [search, setSearch] = useState("");

  const filtered = transactions.filter((tx) =>
    tx.skillName.toLowerCase().includes(search.toLowerCase()) ||
    (tx.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className={`rounded-3xl border p-6 ${
        isDarkMode
          ? "bg-white/[0.03] border-white/[0.07]"
          : "bg-white border-gray-100 shadow-sm"
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="flex-1">
          <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Transaction History
          </h2>
          <p className={`text-sm mt-0.5 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
            {filtered.length} transaction{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${isDarkMode ? "text-slate-400" : "text-gray-400"}`}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`pl-9 pr-4 py-2 rounded-xl text-sm border outline-none transition-colors ${
              isDarkMode
                ? "bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-violet-500/50"
                : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-violet-400"
            }`}
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => onFilterChange(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize border transition-all duration-200 ${
              activeFilter === f
                ? "bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-500/30"
                : isDarkMode
                ? "bg-white/5 border-white/10 text-slate-400 hover:border-violet-500/30 hover:text-violet-300"
                : "bg-gray-50 border-gray-200 text-gray-600 hover:border-violet-300 hover:text-violet-600"
            }`}
          >
            {f === "all" ? "All" : f === "earned" ? "💰 Earned" : f === "spent" ? "📚 Spent" : f === "bonus" ? "⭐ Bonus" : "⏳ Pending"}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`h-16 rounded-2xl animate-pulse ${isDarkMode ? "bg-white/5" : "bg-gray-100"}`} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <div className="text-5xl mb-4">💳</div>
          <p className={`font-semibold ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>No transactions yet</p>
          <p className={`text-sm mt-1 ${isDarkMode ? "text-slate-600" : "text-gray-400"}`}>
            Complete teaching or learning sessions to earn/spend credits.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
          {filtered.map((tx) => (
            <TransactionItem key={tx._id} tx={tx} />
          ))}
        </div>
      )}
    </div>
  );
}
