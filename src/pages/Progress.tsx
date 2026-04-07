import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Entry {
  date: string;
  weight: number;
}

export default function ProgressPage() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<Entry[]>(() => {
    const raw = localStorage.getItem("evowell_progress");
    return raw ? JSON.parse(raw) : [];
  });
  const [newWeight, setNewWeight] = useState("");

  const addEntry = () => {
    const w = parseFloat(newWeight);
    if (!w || w < 20 || w > 500) return;
    const updated = [...entries, { date: new Date().toISOString().split("T")[0], weight: w }];
    setEntries(updated);
    localStorage.setItem("evowell_progress", JSON.stringify(updated));
    setNewWeight("");
  };

  const maxW = Math.max(...entries.map(e => e.weight), 100);
  const minW = Math.min(...entries.map(e => e.weight), 40);

  return (
    <div className="min-h-screen p-4 pb-24 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/dashboard")} className="p-2 glass-card rounded-xl">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-heading font-bold">Progress</h1>
      </div>

      {/* Add weight */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 mb-6">
        <p className="text-sm text-muted-foreground mb-3">Log today's weight</p>
        <div className="flex gap-3">
          <input
            type="number"
            value={newWeight}
            onChange={e => setNewWeight(e.target.value)}
            placeholder="70.5"
            className="flex-1 bg-muted rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
          />
          <Button onClick={addEntry} className="gradient-primary text-primary-foreground">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* Simple chart */}
      {entries.length > 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 mb-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Weight Trend</p>
          <div className="h-40 flex items-end gap-1">
            {entries.slice(-14).map((e, i) => {
              const h = ((e.weight - minW) / (maxW - minW)) * 100;
              return (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(h, 5)}%` }}
                  transition={{ delay: i * 0.05 }}
                  className="flex-1 gradient-primary rounded-t-md min-w-[8px]"
                  title={`${e.date}: ${e.weight} kg`}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{entries[Math.max(entries.length - 14, 0)]?.date}</span>
            <span>{entries[entries.length - 1]?.date}</span>
          </div>
        </motion.div>
      )}

      {/* History */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">History</p>
        {entries.length === 0 && (
          <div className="glass-card p-8 text-center text-muted-foreground">
            <p>No entries yet. Log your first weight above!</p>
          </div>
        )}
        {[...entries].reverse().slice(0, 20).map((e, i) => (
          <div key={i} className="glass-card p-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{e.date}</span>
            <span className="font-heading font-bold">{e.weight} kg</span>
          </div>
        ))}
      </div>
    </div>
  );
}
