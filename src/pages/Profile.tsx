import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getProfile, clearAll } from "@/lib/storage";
import { ChevronLeft, RotateCcw, User, Target, Dumbbell, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const navigate = useNavigate();
  const profile = getProfile();

  const handleReset = () => {
    if (confirm("Reset all data? This will delete your profile and plans.")) {
      clearAll();
      navigate("/onboarding");
    }
  };

  const infoItems = [
    { label: "Gender", value: profile.gender, icon: User },
    { label: "Age", value: `${profile.age} years`, icon: User },
    { label: "Height", value: `${profile.height} cm`, icon: User },
    { label: "Weight", value: `${profile.weight} kg`, icon: User },
    { label: "Fitness Level", value: profile.fitnessLevel, icon: Target },
    { label: "Frequency", value: `${profile.workoutFrequency} days/week`, icon: Dumbbell },
    { label: "Environment", value: profile.environment.replace("_", " "), icon: Dumbbell },
    { label: "Split", value: profile.splitPreference === "auto" ? "AI Decides" : profile.splitPreference, icon: Dumbbell },
    { label: "Budget", value: profile.budget === "no_limit" ? "No Limit" : profile.budget, icon: Utensils },
  ];

  return (
    <div className="min-h-screen p-4 pb-24 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/dashboard")} className="p-2 glass-card rounded-xl">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-heading font-bold">Profile</h1>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="glass-card p-6 mb-6 text-center">
          <div className="w-20 h-20 rounded-full gradient-primary mx-auto flex items-center justify-center mb-3">
            <User className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-heading font-bold">Your Profile</h2>
          <p className="text-sm text-muted-foreground">
            Goals: {profile.goals.map(g => g.replace("_", " ")).join(", ") || "None set"}
          </p>
        </div>

        <div className="space-y-2">
          {infoItems.map(({ label, value, icon: Icon }) => (
            <div key={label} className="glass-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">{label}</span>
              </div>
              <span className="text-sm font-medium capitalize">{value}</span>
            </div>
          ))}
        </div>

        {profile.dietaryPreferences.length > 0 && (
          <div className="glass-card p-4 mt-4">
            <p className="text-sm text-muted-foreground mb-2">Dietary Preferences</p>
            <div className="flex flex-wrap gap-2">
              {profile.dietaryPreferences.map(d => (
                <span key={d} className="px-3 py-1 rounded-full text-xs gradient-primary text-primary-foreground">{d}</span>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={handleReset}
          variant="outline"
          className="w-full mt-6 border-destructive text-destructive hover:bg-destructive/10"
        >
          <RotateCcw className="w-4 h-4 mr-2" /> Reset Everything
        </Button>
      </motion.div>
    </div>
  );
}
