import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Calendar, Target, TrendingUp } from "lucide-react";

interface DailyStreakProps {
  currentStreak: number;
  longestStreak: number;
  weeklyGoal: number;
  weeklyProgress: number;
  lastActiveDate?: string;
}

export default function DailyStreak({
  currentStreak,
  longestStreak,
  weeklyGoal,
  weeklyProgress,
  lastActiveDate,
}: DailyStreakProps) {
  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];
  const today = new Date().getDay();
  
  // Simular atividade da semana (substitua por dados reais)
  const weekActivity = [true, true, false, true, true, false, false];

  return (
    <Card className="cartoon-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <Flame className="text-orange-500" size={24} />
          <span>Sequência Diária</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Streak */}
        <div className="text-center">
          <motion.div
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 px-4 py-2 rounded-full border border-orange-200 dark:border-orange-800"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Flame className="text-orange-500" size={20} />
            <span className="text-2xl font-bold text-orange-700 dark:text-orange-300">
              {currentStreak}
            </span>
            <span className="text-sm text-orange-600 dark:text-orange-400">
              {currentStreak === 1 ? "dia" : "dias"}
            </span>
          </motion.div>
        </div>

        {/* Week Calendar */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground flex items-center">
            <Calendar size={16} className="mr-2" />
            Esta Semana
          </h4>
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day, index) => (
              <motion.div
                key={index}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                  weekActivity[index]
                    ? "bg-green-500 text-white"
                    : index === today
                    ? "bg-blue-500 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {day}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center space-x-1">
              <TrendingUp size={16} className="text-green-500" />
              <span className="text-lg font-bold text-foreground">{longestStreak}</span>
            </div>
            <p className="text-xs text-muted-foreground">Maior Sequência</p>
          </div>
          
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center space-x-1">
              <Target size={16} className="text-blue-500" />
              <span className="text-lg font-bold text-foreground">
                {weeklyProgress}/{weeklyGoal}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Meta Semanal</p>
          </div>
        </div>

        {/* Weekly Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-foreground">Progresso Semanal</span>
            <Badge variant="secondary" className="text-xs">
              {Math.round((weeklyProgress / weeklyGoal) * 100)}%
            </Badge>
          </div>
          <div className="bg-muted rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(weeklyProgress / weeklyGoal) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}