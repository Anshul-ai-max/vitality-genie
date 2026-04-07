import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getPlan } from "@/lib/storage";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronDown, ChevronUp } from "lucide-react";

function MacroRing({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center">
      <svg width="88" height="88" className="-rotate-90">
        <circle cx="44" cy="44" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
        <motion.circle
          cx="44" cy="44" r={r} fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <p className="text-lg font-heading font-bold -mt-14">{value}g</p>
      <p className="text-xs text-muted-foreground mt-8">{label}</p>
    </div>
  );
}

export default function DietPage() {
  const navigate = useNavigate();
  const plan = getPlan();
  const [expandedMeal, setExpandedMeal] = useState<number | null>(0);

  if (!plan) {
    navigate("/dashboard");
    return null;
  }

  const { diet } = plan;

  return (
    <div className="min-h-screen p-4 pb-24 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/dashboard")} className="p-2 glass-card rounded-xl">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-heading font-bold">Diet Plan</h1>
      </div>

      {/* Macro rings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 mb-6"
      >
        <div className="text-center mb-4">
          <p className="text-3xl font-heading font-bold text-primary">{diet.targetCalories}</p>
          <p className="text-sm text-muted-foreground">Daily Calories</p>
        </div>
        <div className="flex justify-around">
          <MacroRing label="Protein" value={diet.targetProtein} max={diet.targetProtein} color="hsl(152, 60%, 48%)" />
          <MacroRing label="Carbs" value={diet.targetCarbs} max={diet.targetCarbs} color="hsl(45, 93%, 58%)" />
          <MacroRing label="Fat" value={diet.targetFat} max={diet.targetFat} color="hsl(0, 72%, 51%)" />
        </div>
      </motion.div>

      {/* Protein note */}
      {diet.proteinNote && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-4 mb-4 border-l-2 border-primary"
        >
          <p className="text-sm text-muted-foreground">{diet.proteinNote}</p>
        </motion.div>
      )}

      {/* Meals */}
      <div className="space-y-3">
        {diet.meals.map((meal, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card overflow-hidden"
          >
            <button
              onClick={() => setExpandedMeal(expandedMeal === i ? null : i)}
              className="w-full p-4 flex items-center justify-between"
            >
              <div className="text-left">
                <h3 className="font-medium">{meal.name}</h3>
                <p className="text-xs text-muted-foreground">{meal.time} · {meal.totalCalories} kcal</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-primary font-medium">{meal.totalProtein}g P</span>
                {expandedMeal === i ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>
            <AnimatePresence>
              {expandedMeal === i && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-2">
                    {meal.foods.map((food, j) => (
                      <div key={j} className="flex items-center justify-between py-2 border-t border-border">
                        <div>
                          <p className="text-sm">{food.item}</p>
                          <p className="text-xs text-muted-foreground">{food.portion}</p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <p>{food.calories} kcal</p>
                          <p>P:{food.protein} C:{food.carbs} F:{food.fat}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Supplement suggestions */}
      {diet.supplementSuggestions && diet.supplementSuggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4 mt-6"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Supplement Suggestions</p>
          <div className="flex flex-wrap gap-2">
            {diet.supplementSuggestions.map(s => (
              <span key={s} className="px-3 py-1 rounded-full text-xs gradient-primary text-primary-foreground">{s}</span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
