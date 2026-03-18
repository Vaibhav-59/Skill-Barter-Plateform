import { useTheme } from "../../hooks/useTheme";

const typeConfig = {
  earned: {
    label: "Earned",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    icon: "↑",
    sign: "+",
    dot: "bg-emerald-400",
  },
  spent: {
    label: "Spent",
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
    icon: "↓",
    sign: "-",
    dot: "bg-rose-400",
  },
  bonus: {
    label: "Bonus",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    icon: "★",
    sign: "+",
    dot: "bg-amber-400",
  },
  debt: {
    label: "Pending",
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
    icon: "⏳",
    sign: "-",
    dot: "bg-orange-400",
  },
};

const statusConfig = {
  completed: { label: "Completed", class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  pending: { label: "Pending", class: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  cancelled: { label: "Cancelled", class: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
};

export default function TransactionItem({ tx }) {
  const { isDarkMode } = useTheme();
  const cfg = typeConfig[tx.type] || typeConfig.earned;
  const stCfg = statusConfig[tx.status] || statusConfig.completed;
  const dateStr = new Date(tx.createdAt).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div
      className={`group flex items-center gap-4 px-4 py-3.5 rounded-2xl border transition-all duration-200 hover:scale-[1.01] hover:shadow-md ${
        isDarkMode
          ? "bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.06] hover:border-white/10"
          : "bg-white border-gray-100 hover:border-gray-200 shadow-sm hover:shadow"
      }`}
    >
      {/* Icon */}
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center border text-lg font-bold flex-shrink-0 ${cfg.bg} ${cfg.color}`}
      >
        {cfg.icon}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`font-semibold text-sm truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            {tx.skillName}
          </p>
          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        </div>
        <p className={`text-xs mt-0.5 ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
          {dateStr} · {tx.duration}h session
          {tx.description ? ` · ${tx.description.substring(0, 40)}${tx.description.length > 40 ? "…" : ""}` : ""}
        </p>
      </div>

      {/* Status badge */}
      <span className={`hidden sm:inline-flex text-[10px] font-semibold px-2.5 py-1 rounded-full border ${stCfg.class}`}>
        {stCfg.label}
      </span>

      {/* Credits */}
      <div className={`text-right flex-shrink-0 font-black text-lg ${cfg.color}`}>
        {cfg.sign}{tx.credits}
        <span className={`block text-[10px] font-normal ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
          credit{tx.credits !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
