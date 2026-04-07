import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, Dumbbell, Utensils, TrendingUp, User } from "lucide-react";

const tabs = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { path: "/workout", icon: Dumbbell, label: "Workout" },
  { path: "/diet", icon: Utensils, label: "Diet" },
  { path: "/progress", icon: TrendingUp, label: "Progress" },
  { path: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card rounded-t-2xl border-t border-border">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-1">
        {tabs.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="relative flex flex-col items-center gap-0.5 py-1 px-3"
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNav"
                  className="absolute -top-0.5 w-8 h-0.5 gradient-primary rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-[10px] transition-colors ${isActive ? "text-primary font-medium" : "text-muted-foreground"}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
