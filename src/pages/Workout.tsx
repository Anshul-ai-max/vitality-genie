import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getPlan } from "@/lib/storage";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Clock, RotateCcw } from "lucide-react";

export default function WorkoutPage() {
  const navigate = useNavigate();
  const plan = getPlan();
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const [selectedDay, setSelectedDay] = useState(todayIndex);

  if (!plan) {
    navigate("/dashboard");
    return null;
  }

  const workout = plan.workouts[selectedDay];

  return (
    <div className="min-h-screen p-4 pb-24 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/dashboard")} className="p-2 glass-card rounded-xl">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-heading font-bold">Workout Plan</h1>
      </div>

      {/* Day selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {plan.workouts.map((w, i) => (
          <button
            key={w.day}
            onClick={() => setSelectedDay(i)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              i === selectedDay
                ? "gradient-primary text-primary-foreground"
                : "glass-card hover:border-primary/30"
            }`}
          >
            {w.day.slice(0, 3)}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedDay}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* Day header */}
          <div className="glass-card p-5 mb-4">
            <h2 className="text-xl font-heading font-bold">{workout.focus}</h2>
            <p className="text-sm text-muted-foreground">{workout.day}</p>
            {!workout.isRest && (
              <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-primary" /> {workout.duration}</span>
                <span>{workout.exercises.length} exercises</span>
              </div>
            )}
          </div>

          {/* Exercises */}
          {workout.isRest ? (
            <div className="glass-card p-8 text-center">
              <p className="text-4xl mb-3">🧘</p>
              <h3 className="text-lg font-heading font-bold">Rest & Recover</h3>
              <p className="text-sm text-muted-foreground mt-2">Take it easy today. Stretch, walk, or do light mobility work.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {workout.exercises.map((ex, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{ex.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {ex.sets} sets × {ex.reps}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <RotateCcw className="w-3 h-3" />
                      {ex.rest}
                    </div>
                  </div>
                  {ex.notes && (
                    <p className="text-xs text-primary mt-2">{ex.notes}</p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
