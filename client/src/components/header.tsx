import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Flame, Star, Heart, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

interface HeaderProps {
  user?: {
    username: string;
    streak: number;
    totalXP: number;
    hearts: number;
  };
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="bg-white shadow-lg border-b-4 border-cartoon-teal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="w-12 h-12 bg-cartoon-red rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
              <GraduationCap className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-cartoon-dark">CartoonLingo</h1>
          </motion.div>

          {/* Progress and Stats */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-6"
          >
            {/* Streak Counter */}
            <Badge className="bg-cartoon-yellow hover:bg-cartoon-yellow/80 text-cartoon-dark font-bold px-4 py-2">
              <Flame className="text-cartoon-red mr-1 wiggle" size={16} />
              <span>{user?.streak || 0}</span>
            </Badge>

            {/* XP Points */}
            <Badge className="bg-cartoon-mint hover:bg-cartoon-mint/80 text-cartoon-dark font-bold px-4 py-2">
              <Star className="text-cartoon-yellow mr-1" size={16} />
              <span>{user?.totalXP || 0} XP</span>
            </Badge>

            {/* Hearts */}
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Heart
                  key={i}
                  className={`w-5 h-5 ${
                    i < (user?.hearts || 0)
                      ? "text-red-500 fill-red-500"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>

            {/* Profile Avatar */}
            <Avatar className="w-10 h-10 bg-cartoon-blue cursor-pointer transform hover:scale-110 transition-transform">
              <AvatarFallback className="bg-cartoon-blue text-white font-bold">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
