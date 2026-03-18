import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useTheme } from "../../hooks/useTheme";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Transform raw stats array from API into chart-ready data
const transformStats = (rawStats) => {
  if (!rawStats || rawStats.length === 0) return [];

  // Build a map: "YYYY-M" -> { earned: 0, spent: 0, count: 0 }
  const map = {};
  rawStats.forEach((item) => {
    const key = `${item._id.year}-${item._id.month}`;
    if (!map[key]) {
      map[key] = { year: item._id.year, month: item._id.month, earned: 0, spent: 0, sessions: 0 };
    }
    if (item._id.type === "earned" || item._id.type === "bonus") {
      map[key].earned += item.total;
      map[key].sessions += item.count;
    } else if (item._id.type === "spent" || item._id.type === "debt") {
      map[key].spent += item.total;
      map[key].sessions += item.count;
    }
  });

  return Object.values(map)
    .sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month)
    .map((d) => ({
      month: `${MONTHS[d.month - 1]} ${d.year}`,
      earned: d.earned,
      spent: d.spent,
      sessions: d.sessions,
    }));
};

const CustomTooltip = ({ active, payload, label, isDarkMode }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className={`rounded-xl p-3 text-xs shadow-xl border backdrop-blur-sm ${
        isDarkMode ? "bg-gray-900/90 border-white/10 text-white" : "bg-white border-gray-100 text-gray-900"
      }`}
    >
      <p className={`font-bold mb-2 ${isDarkMode ? "text-slate-300" : "text-gray-600"}`}>{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="capitalize">{entry.name}:</span>
          <span className="font-bold ml-auto">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function CreditChart({ stats, loading }) {
  const { isDarkMode } = useTheme();
  const chartData = transformStats(stats);

  const gridColor = isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const axisColor = isDarkMode ? "#64748b" : "#9ca3af";

  if (loading) {
    return (
      <div className={`rounded-3xl border p-6 ${isDarkMode ? "bg-white/[0.03] border-white/[0.07]" : "bg-white border-gray-100 shadow-sm"}`}>
        <div className={`h-72 rounded-2xl animate-pulse ${isDarkMode ? "bg-white/5" : "bg-gray-100"}`} />
      </div>
    );
  }

  return (
    <div className={`rounded-3xl border p-6 ${isDarkMode ? "bg-white/[0.03] border-white/[0.07]" : "bg-white border-gray-100 shadow-sm"}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Activity Chart
          </h2>
          <p className={`text-sm mt-0.5 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
            Credits earned & spent over the last 6 months
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xl">
          📊
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3">
          <div className="text-5xl">📈</div>
          <p className={`font-semibold ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>No activity yet</p>
          <p className={`text-xs ${isDarkMode ? "text-slate-600" : "text-gray-400"}`}>
            Complete sessions to see your progress chart
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Area Chart */}
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
              Credits Over Time
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="earnedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="spentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="month" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(v) => <span style={{ color: axisColor, fontSize: 12, textTransform: "capitalize" }}>{v}</span>}
                />
                <Area type="monotone" dataKey="earned" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#earnedGrad)" dot={{ r: 4, fill: "#8b5cf6" }} activeDot={{ r: 6 }} />
                <Area type="monotone" dataKey="spent" stroke="#f43f5e" strokeWidth={2.5} fill="url(#spentGrad)" dot={{ r: 4, fill: "#f43f5e" }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart for sessions */}
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
              Sessions Completed
            </p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="month" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} />
                <Bar dataKey="sessions" fill="#06b6d4" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
