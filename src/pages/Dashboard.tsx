import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getProfile, getPlan, savePlan } from "@/lib/storage";
import { generateMockPlan } from "@/lib/mock-plan";
import { supabase } from "@/integrations/supabase/client";
import { Dumbbell, Utensils, TrendingUp, User, Flame, Zap } from "lucide-react";
import { WeeklyPlan } from "@/lib/types";
import { toast } from "@/components/ui/sonner";

export default function DashboardPage() {
  const navigate = useNavigate();
  const profile = getProfile();
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let existing = getPlan();
    if (!existing) {
      setLoading(true);
      generatePlan();
    } else {
      setPlan(existing);
    }
  }, []);

  async function generatePlan() {
    try {
      const { data, error } = await supabase.functions.invoke("generate-plan", {
        body: profile,
      });

      if (error) throw error;

      const generated: WeeklyPlan = data;
      savePlan(generated);
      setPlan(generated);
    } catch (err) {
      console.error("AI generation failed, falling back to mock plan:", err);
      toast("Using offline plan — AI generation unavailable", {
        description: "Connect your Gemini API key to get personalized AI plans.",
      });
      const fallback = generateMockPlan(profile);
      savePlan(fallback);
      setPlan(fallback);
    } finally {
      setLoading(false);
    }
  }

  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const todayWorkout = plan?.workouts[todayIndex];

  const quickActions = [
    { label: "Workout", icon: Dumbbell, path: "/workout", color: "from-emerald-500 to-teal-600" },
    { label: "Diet", icon: Utensils, path: "/diet", color: "from-amber-500 to-orange-600" },
    { label: "Progress", icon: TrendingUp, path: "/progress", color: "from-blue-500 to-indigo-600" },
    { label: "Profile", icon: User, path: "/profile", color: "from-purple-500 to-pink-600" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full"
        />
        <p className="text-muted-foreground mt-4 font-medium">Generating your personalized plan...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pb-24 max-w-lg mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <p className="text-muted-foreground text-sm">Welcome back</p>
        <h1 className="text-3xl font-heading font-bold gradient-text">EvoWell AI</h1>
      </motion.div>

      {/* Today's Workout Card */}
      {todayWorkout && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5 mb-6 cursor-pointer hover:border-primary/30 transition-all"
          onClick={() => navigate("/workout")}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Today's Workout</span>
            <span className="text-xs text-primary font-medium">{todayWorkout.day}</span>
          </div>
          <h3 className="text-xl font-heading font-bold mb-1">
            {todayWorkout.isRest ? "🧘 Rest Day" : todayWorkout.focus}
          </h3>
          {!todayWorkout.isRest && (
            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Flame className="w-4 h-4 text-primary" /> {todayWorkout.exercises.length} exercises</span>
              <span className="flex items-center gap-1"><Zap className="w-4 h-4 text-primary" /> {todayWorkout.duration}</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Macro Summary */}
      {plan && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5 mb-6 cursor-pointer hover:border-primary/30 transition-all"
          onClick={() => navigate("/diet")}
        >
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Daily Targets</span>
          <div className="grid grid-cols-4 gap-3 mt-3">
            {[
              { label: "Calories", value: plan.diet.targetCalories, unit: "kcal" },
              { label: "Protein", value: plan.diet.targetProtein, unit: "g" },
              { label: "Carbs", value: plan.diet.targetCarbs, unit: "g" },
              { label: "Fat", value: plan.diet.targetFat, unit: "g" },
            ].map(({ label, value, unit }) => (
              <div key={label} className="text-center">
                <p className="text-lg font-heading font-bold text-primary">{value}</p>
                <p className="text-xs text-muted-foreground">{unit}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <span className="text-xs text-muted-foreground uppercase tracking-wider mb-3 block">Quick Actions</span>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map(({ label, icon: Icon, path, color }) => (
            <motion.button
              key={label}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(path)}
              className="glass-card p-4 flex items-center gap-3 hover:border-primary/30 transition-all"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-foreground" />
              </div>
              <span className="font-medium text-sm">{label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Week Overview */}
      {plan && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <span className="text-xs text-muted-foreground uppercase tracking-wider mb-3 block">This Week</span>
          <div className="flex gap-2">
            {plan.workouts.map((w, i) => (
              <div
                key={w.day}
                className={`flex-1 glass-card p-2 text-center rounded-xl ${
                  i === todayIndex ? "border-primary glow-ring" : ""
                }`}
              >
                <p className="text-xs text-muted-foreground">{w.day.slice(0, 3)}</p>
                <p className="text-xs font-medium mt-1">{w.isRest ? "Rest" : w.focus.slice(0, 4)}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
