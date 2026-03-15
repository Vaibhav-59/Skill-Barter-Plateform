import { useState, useEffect } from "react";
import api from "../../utils/api";
import { showError } from "../../utils/toast";

export default function ContractManagement() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/contracts");
      if (response.data.success) {
        setContracts(response.data.data);
      } else {
        showError("Failed to fetch contracts");
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to fetch contracts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const totalContracts = contracts.length;
  const activeCount = contracts.filter(c => c.status === "active").length;
  const completedCount = contracts.filter(c => c.status === "completed").length;
  const pendingCount = contracts.filter(c => c.status === "pending").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Smart Contracts Management
          </h1>
          <button
            onClick={fetchContracts}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500/80 to-teal-500/80 text-white rounded-xl hover:from-emerald-500 hover:to-teal-500 transition-all font-medium border border-emerald-400/30 shadow-lg"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </button>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-gray-950/95 via-slate-950/90 to-black/95 rounded-2xl border border-slate-500/30 p-6 shadow-lg shadow-black/20">
            <h3 className="text-sm font-medium text-slate-400 mb-2">Total Contracts</h3>
            <div className="text-4xl font-bold text-white">{totalContracts}</div>
          </div>
          <div className="bg-gradient-to-br from-gray-950/95 via-slate-950/90 to-black/95 rounded-2xl border border-emerald-400/30 p-6 shadow-lg shadow-emerald-500/10">
            <h3 className="text-sm font-medium text-emerald-400 mb-2">Active</h3>
            <div className="text-4xl font-bold text-white">{activeCount}</div>
          </div>
          <div className="bg-gradient-to-br from-gray-950/95 via-slate-950/90 to-black/95 rounded-2xl border border-amber-400/30 p-6 shadow-lg shadow-amber-500/10">
            <h3 className="text-sm font-medium text-amber-400 mb-2">Pending</h3>
            <div className="text-4xl font-bold text-white">{pendingCount}</div>
          </div>
          <div className="bg-gradient-to-br from-gray-950/95 via-slate-950/90 to-black/95 rounded-2xl border border-blue-400/30 p-6 shadow-lg shadow-blue-500/10">
            <h3 className="text-sm font-medium text-blue-400 mb-2">Completed</h3>
            <div className="text-4xl font-bold text-white">{completedCount}</div>
          </div>
        </div>

        {/* Contracts List */}
        <div className="bg-gradient-to-br from-gray-950/95 via-slate-950/90 to-black/95 rounded-3xl border border-slate-500/30 overflow-hidden backdrop-blur-sm shadow-2xl">
          {loading && contracts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-16 h-16 border-4 border-slate-600/30 border-t-emerald-400 rounded-full animate-spin mb-6"></div>
              <p className="text-slate-400 font-medium text-lg">Loading contracts data...</p>
            </div>
          ) : contracts.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-500/30 to-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-400/30 shadow-lg">
                <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-slate-300 mb-3 text-2xl font-semibold">No Contracts Data</div>
              <p className="text-slate-500 text-lg">There are no smart contracts in the system.</p>
            </div>
          ) : (
            <div className="overflow-x-auto p-4 sm:p-6">
              <table className="min-w-full divide-y divide-slate-500/20">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Users</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Skills</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Progress</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Start Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-500/20">
                  {contracts.map((contract) => (
                    <tr key={contract._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border
                          ${contract.status === 'completed' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 
                            contract.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                            contract.status === 'pending' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                            'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                          {contract.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="text-white">{contract.userA?.name || 'Unknown'} <span className="text-slate-500 mx-2">↔</span> {contract.userB?.name || 'Unknown'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        <div>{contract.skillTeach} <span className="text-emerald-400 mx-1">↔</span> {contract.skillLearn}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-slate-700/50 rounded-full h-2 min-w-[100px] max-w-[150px]">
                          <div 
                            className="bg-emerald-400 h-2 rounded-full" 
                            style={{ width: `${(contract.completedSessions / contract.totalSessions) * 100}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">{contract.completedSessions} / {contract.totalSessions} Sessions</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {new Date(contract.startDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
