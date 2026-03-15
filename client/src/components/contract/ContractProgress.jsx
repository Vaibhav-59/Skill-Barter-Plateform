// client/src/components/contract/ContractProgress.jsx
export default function ContractProgress({ completed, total }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Progress</span>
        <span className="text-sm font-bold text-emerald-400">{completed}/{total} sessions</span>
      </div>
      <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500 transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-right text-xs text-gray-500 mt-1">{pct}% complete</p>
    </div>
  );
}
