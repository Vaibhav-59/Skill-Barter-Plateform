// client/src/pages/SmartContractPage.jsx
import { useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import { showError } from "../utils/toast";
import ContractForm from "../components/contract/ContractForm";
import ContractList from "../components/contract/ContractList";
import ContractDetails from "../components/contract/ContractDetails";

const TABS = [
  { key: "all",       label: "All Contracts",   emoji: "📋" },
  { key: "pending",   label: "Pending",         emoji: "⏳" },
  { key: "active",    label: "Active",          emoji: "🔄" },
  { key: "completed", label: "Completed",       emoji: "🎉" },
  { key: "cancelled", label: "Cancelled",       emoji: "❌" },
];

export default function SmartContractPage() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);

  const myId = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}")._id || ""; }
    catch { return ""; }
  })();

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/contracts/user");
      setContracts(res.data.data || []);
    } catch {
      showError("Failed to load contracts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchContracts(); }, [fetchContracts]);

  const handleUpdate = () => {
    fetchContracts();
    if (selected) {
      api.get(`/contracts/${selected._id}`).then((r) => setSelected(r.data.data)).catch(() => {});
    }
  };

  // Stats
  const stats = {
    total:     contracts.length,
    active:    contracts.filter((c) => c.status === "active").length,
    pending:   contracts.filter((c) => c.status === "pending").length,
    completed: contracts.filter((c) => c.status === "completed").length,
  };

  const needsApproval = contracts.filter((c) => {
    const myApproved = c.userA._id === myId ? c.approvedByA : c.approvedByB;
    return !myApproved && c.status === "pending";
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-slate-950 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/6 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/6 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-10 pb-24">
        {/* ── Hero Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <span className="text-2xl">🤝</span>
              </div>
              <div>
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-400 to-teal-500 leading-tight">
                  Skill Contracts
                </h1>
                <p className="text-gray-400 text-sm font-medium">Skill exchange agreements between learners</p>
              </div>
            </div>
          </div>

          <button
            id="create-contract-btn"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/30">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Contract
          </button>
        </div>

        {/* ── Stats Strip ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: stats.total, color: "from-gray-600 to-gray-700", text: "text-white" },
            { label: "Active", value: stats.active, color: "from-emerald-500 to-teal-600", text: "text-white" },
            { label: "Pending", value: stats.pending, color: "from-amber-500 to-orange-500", text: "text-white" },
            { label: "Completed", value: stats.completed, color: "from-blue-500 to-indigo-600", text: "text-white" },
          ].map((s) => (
            <div key={s.label}
              className="bg-gray-900/60 border border-gray-700/40 rounded-2xl p-5 relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${s.color} opacity-10 rounded-bl-3xl`} />
              <p className="text-3xl font-black text-white">{s.value}</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Needs approval banner */}
        {needsApproval > 0 && (
          <div className="mb-6 bg-purple-500/10 border border-purple-500/30 rounded-2xl px-5 py-4 flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <p className="text-purple-300 font-semibold text-sm">
              You have <span className="font-black text-white">{needsApproval}</span> contract{needsApproval > 1 ? "s" : ""} waiting for your approval.
              <button onClick={() => setActiveTab("pending")} className="ml-2 text-purple-400 underline hover:text-purple-300">View pending</button>
            </p>
          </div>
        )}

        {/* ── Tab Bar ── */}
        <div className="flex gap-2 flex-wrap mb-8 bg-gray-900/40 border border-gray-700/40 rounded-2xl p-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                activeTab === t.key
                  ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-300"
                  : "text-gray-500 hover:text-gray-300"
              }`}>
              <span>{t.emoji}</span>
              {t.label}
              <span className={`text-xs font-black px-1.5 py-0.5 rounded-md ${activeTab === t.key ? "bg-emerald-500/20 text-emerald-300" : "bg-gray-700/60 text-gray-500"}`}>
                {t.key === "all" ? contracts.length : contracts.filter((c) => c.status === t.key).length}
              </span>
            </button>
          ))}
        </div>

        {/* ── Contract List ── */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin shadow-lg shadow-emerald-400/20" />
          </div>
        ) : (
          <ContractList
            contracts={contracts}
            myId={myId}
            onSelect={setSelected}
            filterStatus={activeTab}
          />
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <ContractForm
          onCreated={fetchContracts}
          onClose={() => setShowForm(false)}
        />
      )}

      {selected && (
        <ContractDetails
          contract={selected}
          myId={myId}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
