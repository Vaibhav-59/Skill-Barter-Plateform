// VerificationBadge – medal-style achievement icon with glow
export default function VerificationBadge({ skillName, size = "sm", showLabel = true }) {
  const sizeCls = {
    xs: "w-4 h-4",
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-10 h-10",
  }[size] || "w-5 h-5";

  const textCls = {
    xs: "text-[9px]",
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
  }[size] || "text-[10px]";

  return (
    <span
      title={`Verified${skillName ? `: ${skillName}` : ""}`}
      className="inline-flex items-center gap-1 flex-shrink-0"
    >
      {/* Medal icon */}
      <span className="relative inline-flex items-center justify-center">
        <svg
          className={`${sizeCls} drop-shadow-[0_0_4px_rgba(16,185,129,0.7)]`}
          viewBox="0 0 24 24"
          fill="none"
        >
          {/* Ribbon left */}
          <path d="M9 2L5 10H9L12 4L9 2Z" fill="#10b981" opacity="0.8" />
          {/* Ribbon right */}
          <path d="M15 2L19 10H15L12 4L15 2Z" fill="#059669" opacity="0.8" />
          {/* Outer ring */}
          <circle cx="12" cy="15" r="7" fill="url(#goldGrad)" />
          {/* Inner ring */}
          <circle cx="12" cy="15" r="5.5" fill="url(#goldGrad2)" strokeWidth="0" />
          {/* Star / Check */}
          <path
            d="M9.5 15l1.8 1.8 3.2-3.2"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="goldGrad" x1="12" y1="8" x2="12" y2="22" gradientUnits="userSpaceOnUse">
              <stop stopColor="#34d399" />
              <stop offset="1" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="goldGrad2" x1="12" y1="9" x2="12" y2="21" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6ee7b7" />
              <stop offset="1" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>
      </span>

      {showLabel && (
        <span className={`font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400 ${textCls}`}>
          Verified
        </span>
      )}
    </span>
  );
}
