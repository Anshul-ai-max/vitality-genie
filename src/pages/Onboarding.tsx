import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { UserProfile, defaultProfile } from "@/lib/types";
import { saveProfile } from "@/lib/storage";
import { ChevronLeft, ChevronRight, Dumbbell, Target, Flame, Heart, Wind, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  "Gender", "Goals", "Fitness Level", "Age", "Height", "Weight",
  "Workout Frequency", "Environment", "Split Preference", "Diet", "Budget & Supplements"
];

const goalOptions = [
  { id: "lose_weight", label: "Lose Weight", icon: Flame },
  { id: "build_muscle", label: "Build Muscle", icon: Dumbbell },
  { id: "endurance", label: "Endurance", icon: Wind },
  { id: "stay_healthy", label: "Stay Healthy", icon: Heart },
  { id: "flexibility", label: "Flexibility", icon: Zap },
  { id: "athletic", label: "Athletic Performance", icon: Target },
];

const environmentOptions = [
  { id: "home_none", label: "Home (No Equipment)" },
  { id: "home_basic", label: "Home (Basic Equipment)" },
  { id: "gym", label: "Gym" },
  { id: "outdoor", label: "Outdoor" },
  { id: "mixed", label: "Mixed" },
];

const splitOptions = [
  { id: "auto", label: "Auto (AI Decides)" },
  { id: "ppl", label: "Push / Pull / Legs" },
  { id: "bro_split", label: "Bro Split" },
  { id: "upper_lower", label: "Upper / Lower" },
  { id: "full_body", label: "Full Body" },
];

const dietOptions = ["Vegetarian", "Vegan", "Keto", "Paleo", "Mediterranean", "No Preference"];
const cuisineOptions = ["Indian", "Mediterranean", "East Asian", "Mexican", "American", "Italian"];
const allergyOptions = ["Dairy", "Gluten", "Nuts", "Soy", "Eggs", "Shellfish"];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>({ ...defaultProfile });

  const update = (partial: Partial<UserProfile>) => setProfile(p => ({ ...p, ...partial }));

  const toggleArray = (key: keyof UserProfile, value: string) => {
    const arr = profile[key] as string[];
    update({ [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] } as any);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return profile.goals.length > 0;
      case 3: return profile.age > 0 && profile.age < 120;
      case 4: return profile.height > 50 && profile.height < 300;
      case 5: return profile.weight > 20 && profile.weight < 500;
      default: return true;
    }
  };

  const handleFinish = () => {
    const completed = { ...profile, onboarded: true };
    saveProfile(completed);
    navigate("/dashboard");
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-heading font-bold">What's your gender?</h2>
            <p className="text-muted-foreground">This helps us calculate your caloric needs accurately.</p>
            <div className="grid grid-cols-3 gap-3 mt-6">
              {(["male", "female", "other"] as const).map(g => (
                <button
                  key={g}
                  onClick={() => update({ gender: g })}
                  className={`glass-card p-4 text-center capitalize transition-all ${
                    profile.gender === g ? "border-primary glow-ring" : "hover:border-primary/30"
                  }`}
                >
                  <span className="text-lg font-medium">{g}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-heading font-bold">What are your goals?</h2>
            <p className="text-muted-foreground">Select all that apply.</p>
            <div className="grid grid-cols-2 gap-3 mt-6">
              {goalOptions.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => toggleArray("goals", id)}
                  className={`glass-card p-4 flex items-center gap-3 transition-all ${
                    profile.goals.includes(id) ? "border-primary glow-ring" : "hover:border-primary/30"
                  }`}
                >
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-heading font-bold">Fitness Level</h2>
            <p className="text-muted-foreground">Be honest — we'll adjust your plan accordingly.</p>
            <div className="space-y-3 mt-6">
              {(["beginner", "intermediate", "advanced"] as const).map(l => (
                <button
                  key={l}
                  onClick={() => update({ fitnessLevel: l })}
                  className={`glass-card w-full p-4 text-left capitalize transition-all ${
                    profile.fitnessLevel === l ? "border-primary glow-ring" : "hover:border-primary/30"
                  }`}
                >
                  <span className="font-medium">{l}</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {l === "beginner" ? "New to exercise or returning after a break" :
                     l === "intermediate" ? "Consistent training for 6+ months" :
                     "Training seriously for 2+ years"}
                  </p>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-heading font-bold">How old are you?</h2>
            <div className="flex items-center justify-center mt-8">
              <div className="glass-card p-8 text-center">
                <input
                  type="number"
                  value={profile.age || ""}
                  onChange={e => update({ age: parseInt(e.target.value) || 0 })}
                  className="bg-transparent text-5xl font-heading font-bold text-center w-32 outline-none border-b-2 border-primary/30 focus:border-primary transition-colors"
                  placeholder="25"
                />
                <p className="text-muted-foreground mt-2">years old</p>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-heading font-bold">Your Height</h2>
            <div className="flex items-center justify-center mt-8">
              <div className="glass-card p-8 text-center">
                <input
                  type="number"
                  value={profile.height || ""}
                  onChange={e => update({ height: parseInt(e.target.value) || 0 })}
                  className="bg-transparent text-5xl font-heading font-bold text-center w-32 outline-none border-b-2 border-primary/30 focus:border-primary transition-colors"
                  placeholder="170"
                />
                <p className="text-muted-foreground mt-2">cm</p>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-heading font-bold">Your Weight</h2>
            <div className="flex items-center justify-center mt-8">
              <div className="glass-card p-8 text-center">
                <input
                  type="number"
                  value={profile.weight || ""}
                  onChange={e => update({ weight: parseInt(e.target.value) || 0 })}
                  className="bg-transparent text-5xl font-heading font-bold text-center w-32 outline-none border-b-2 border-primary/30 focus:border-primary transition-colors"
                  placeholder="70"
                />
                <p className="text-muted-foreground mt-2">kg</p>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-heading font-bold">Workout Frequency</h2>
            <p className="text-muted-foreground">How many days per week can you train?</p>
            <div className="flex items-center justify-center gap-4 mt-8">
              {[2, 3, 4, 5, 6].map(d => (
                <button
                  key={d}
                  onClick={() => update({ workoutFrequency: d })}
                  className={`w-14 h-14 rounded-2xl font-heading text-xl font-bold transition-all ${
                    profile.workoutFrequency === d
                      ? "gradient-primary text-primary-foreground glow-ring"
                      : "glass-card hover:border-primary/30"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <p className="text-center text-muted-foreground text-sm mt-4">days per week</p>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-heading font-bold">Workout Environment</h2>
            <div className="space-y-3 mt-6">
              {environmentOptions.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => update({ environment: id as any })}
                  className={`glass-card w-full p-4 text-left transition-all ${
                    profile.environment === id ? "border-primary glow-ring" : "hover:border-primary/30"
                  }`}
                >
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-heading font-bold">Workout Split</h2>
            <p className="text-muted-foreground">Choose a split or let AI decide.</p>
            <div className="space-y-3 mt-6">
              {splitOptions.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => update({ splitPreference: id })}
                  className={`glass-card w-full p-4 text-left transition-all ${
                    profile.splitPreference === id ? "border-primary glow-ring" : "hover:border-primary/30"
                  }`}
                >
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-heading font-bold">Diet Preferences</h2>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Dietary style</p>
              <div className="flex flex-wrap gap-2">
                {dietOptions.map(d => (
                  <button
                    key={d}
                    onClick={() => toggleArray("dietaryPreferences", d)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      profile.dietaryPreferences.includes(d) ? "gradient-primary text-primary-foreground" : "glass-card hover:border-primary/30"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Allergies</p>
              <div className="flex flex-wrap gap-2">
                {allergyOptions.map(a => (
                  <button
                    key={a}
                    onClick={() => toggleArray("allergies", a)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      profile.allergies.includes(a) ? "bg-destructive text-destructive-foreground" : "glass-card hover:border-primary/30"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Cuisine preferences</p>
              <div className="flex flex-wrap gap-2">
                {cuisineOptions.map(c => (
                  <button
                    key={c}
                    onClick={() => toggleArray("cuisine", c)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      profile.cuisine.includes(c) ? "gradient-primary text-primary-foreground" : "glass-card hover:border-primary/30"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 10:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-heading font-bold">Budget & Supplements</h2>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Food budget</p>
              <div className="grid grid-cols-3 gap-3">
                {(["budget", "moderate", "no_limit"] as const).map(b => (
                  <button
                    key={b}
                    onClick={() => update({ budget: b })}
                    className={`glass-card p-3 text-center capitalize text-sm transition-all ${
                      profile.budget === b ? "border-primary glow-ring" : "hover:border-primary/30"
                    }`}
                  >
                    {b === "no_limit" ? "No Limit" : b}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Supplement willingness</p>
              <div className="grid grid-cols-3 gap-3">
                {(["none", "basic", "open"] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => update({ supplementWillingness: s })}
                    className={`glass-card p-3 text-center capitalize text-sm transition-all ${
                      profile.supplementWillingness === s ? "border-primary glow-ring" : "hover:border-primary/30"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Progress bar */}
      <div className="w-full max-w-md mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Step {step + 1} of {STEPS.length}</span>
          <span className="text-sm text-primary font-medium">{STEPS[step]}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full gradient-primary rounded-full"
            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex gap-4 mt-8 w-full max-w-md">
        {step > 0 && (
          <Button
            variant="outline"
            onClick={() => setStep(s => s - 1)}
            className="flex-1"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        )}
        <Button
          onClick={step === STEPS.length - 1 ? handleFinish : () => setStep(s => s + 1)}
          disabled={!canProceed()}
          className="flex-1 gradient-primary text-primary-foreground hover:opacity-90"
        >
          {step === STEPS.length - 1 ? "Generate My Plan" : "Next"} 
          {step < STEPS.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
        </Button>
      </div>
    </div>
  );
}
