import SkillHubCard from "./SkillHubCard";

const features = [
  {
    title: "Time Banking",
    description:
      "Earn and spend skill credits based on teaching and learning sessions. Track your time contributions and rewards.",
    route: "/skill-hub/time-banking",
    gradient: "bg-gradient-to-br from-violet-500 to-purple-700",
    badge: "Popular",
    badgeColor: "bg-violet-400/20 text-violet-300 border border-violet-400/30",
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
        />
      </svg>
    ),
  },
  {
    title: "Group Sessions",
    description:
      "Join or host group learning sessions with multiple participants. Collaborate, share, and grow together.",
    route: "/skill-hub/group-sessions",
    gradient: "bg-gradient-to-br from-blue-500 to-cyan-600",
    badge: "New",
    badgeColor: "bg-blue-400/20 text-blue-300 border border-blue-400/30",
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
  },
  {
    title: "Skill Verification",
    description:
      "Verify your skills using portfolio, certificates, or peer validation. Build credibility and trust.",
    route: "/skill-hub/skill-verification",
    gradient: "bg-gradient-to-br from-emerald-500 to-teal-700",
    badge: null,
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
        />
      </svg>
    ),
  },
  {
    title: "Social Integration",
    description:
      "Connect LinkedIn, GitHub, and other profiles to showcase your work and expand your professional network.",
    route: "/skill-hub/social-integration",
    gradient: "bg-gradient-to-br from-sky-500 to-indigo-600",
    badge: null,
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
        />
      </svg>
    ),
  },
  {
    title: "Gamification",
    description:
      "Earn badges, maintain streaks, and track achievements. Make learning fun and competitive.",
    route: "/skill-hub/gamification",
    gradient: "bg-gradient-to-br from-amber-500 to-orange-600",
    badge: "Hot 🔥",
    badgeColor: "bg-amber-400/20 text-amber-300 border border-amber-400/30",
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
  },
  {
    title: "Learning Path",
    description:
      "Follow structured learning paths to achieve your career goals. Stay on track with progress indicators.",
    route: "/skill-hub/learning-path",
    gradient: "bg-gradient-to-br from-rose-500 to-pink-700",
    badge: null,
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
        />
      </svg>
    ),
  },
  {
    title: "Challenges",
    description:
      "Participate in skill challenges and improve your abilities. Compete, win, and level up your expertise.",
    route: "/skill-hub/challenges",
    gradient: "bg-gradient-to-br from-fuchsia-500 to-purple-700",
    badge: "New",
    badgeColor: "bg-fuchsia-400/20 text-fuchsia-300 border border-fuchsia-400/30",
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
        />
      </svg>
    ),
  },
];

export default function SkillHubGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <SkillHubCard
          key={feature.route}
          title={feature.title}
          description={feature.description}
          icon={feature.icon}
          route={feature.route}
          gradient={feature.gradient}
          badge={feature.badge}
          badgeColor={feature.badgeColor}
          delay={index * 80}
        />
      ))}
    </div>
  );
}
