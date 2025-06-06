import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Zap } from "lucide-react";

interface LevelProgressProps {
  level: number;
  currentXP: number;
  xpForNextLevel?: number;
  totalXP: number;
}

export default function LevelProgress({
  level,
  currentXP,
  xpForNextLevel = 1000,
  totalXP,
}: LevelProgressProps) {
  const progressPercent = (currentXP / xpForNextLevel) * 100;
  const xpToNext = xpForNextLevel - currentXP;

  return (
    <Card className="cartoon-card overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Star className="text-white" size={28} />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">Nível {level}</h3>
              <p className="text-sm text-muted-foreground">
                {totalXP.toLocaleString()} XP Total
              </p>
            </div>
          </div>
          
          <motion.div
            className="text-right"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center space-x-1 text-primary">
              <Zap size={16} />
              <span className="text-lg font-bold">{currentXP}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {xpToNext} para próximo nível
            </p>
          </motion.div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-foreground">
              Progresso para Nível {level + 1}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progressPercent)}%
            </span>
          </div>
          
          <div className="relative">
            <Progress value={progressPercent} className="h-3" />
            <motion.div
              className="absolute top-0 left-0 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <p className="text-lg font-bold text-foreground">{currentXP}</p>
            <p className="text-xs text-muted-foreground">XP Atual</p>
          </div>
          <div className="space-y-1">
            <p className="text-lg font-bold text-foreground">{xpForNextLevel}</p>
            <p className="text-xs text-muted-foreground">Para Próximo</p>
          </div>
          <div className="space-y-1">
            <p className="text-lg font-bold text-foreground">{level + 1}</p>
            <p className="text-xs text-muted-foreground">Próximo Nível</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}