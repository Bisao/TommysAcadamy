import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Star, Flame, Medal, Award, Target, Clock, BookOpen } from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  progress?: number;
  total?: number;
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: "sm" | "md" | "lg";
}

const iconMap = {
  trophy: Trophy,
  star: Star,
  flame: Flame,
  medal: Medal,
  award: Award,
  target: Target,
  clock: Clock,
  book: BookOpen,
};

const rarityColors = {
  common: "from-gray-400 to-gray-600",
  rare: "from-blue-400 to-blue-600",
  epic: "from-purple-400 to-purple-600",
  legendary: "from-yellow-400 to-orange-600",
};

export default function AchievementBadge({ achievement, size = "md" }: AchievementBadgeProps) {
  const IconComponent = iconMap[achievement.icon as keyof typeof iconMap] || Trophy;
  const sizeClasses = {
    sm: "w-16 h-20",
    md: "w-20 h-24",
    lg: "w-24 h-28",
  };

  const iconSizes = {
    sm: 20,
    md: 24,
    lg: 28,
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} relative`}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className={`h-full ${!achievement.earned ? "opacity-50 grayscale" : ""} cursor-pointer`}>
        <CardContent className="p-3 text-center h-full flex flex-col justify-between">
          <div className="flex-1 flex flex-col items-center justify-center">
            <div
              className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                rarityColors[achievement.rarity]
              } flex items-center justify-center mb-2 ${
                achievement.earned ? "shadow-lg" : ""
              }`}
            >
              <IconComponent
                className={`text-white ${achievement.earned ? "" : "opacity-50"}`}
                size={iconSizes[size]}
              />
            </div>
            <h4 className="text-xs font-semibold text-foreground mb-1 leading-tight">
              {achievement.name}
            </h4>
          </div>

          {achievement.progress !== undefined && achievement.total && (
            <div className="w-full mt-2">
              <div className="bg-muted rounded-full h-1.5">
                <div
                  className={`bg-gradient-to-r ${rarityColors[achievement.rarity]} h-1.5 rounded-full transition-all duration-300`}
                  style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {achievement.progress}/{achievement.total}
              </p>
            </div>
          )}

          {achievement.earned && (
            <Badge
              variant="secondary"
              className={`text-xs mt-1 bg-gradient-to-r ${rarityColors[achievement.rarity]} text-white border-0`}
            >
              {achievement.rarity}
            </Badge>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}