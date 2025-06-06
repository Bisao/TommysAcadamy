import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, Flame, Heart, Trophy, LogOut, Star } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import Mascot from "./mascot";

interface HeaderProps {
  user?: {
    username: string;
    streak: number;
    totalXP: number;
    hearts: number;
    level: number;
  };
}

export default function Header({ user }: HeaderProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout", {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Logout realizado com sucesso!",
        description: "Até logo!",
      });
      // Clear user data from cache
      queryClient.setQueryData(["/api/user"], null);
      // Redirect to login
      setLocation("/login");
    },
    onError: () => {
      // Even if logout fails on server, clear local data
      queryClient.setQueryData(["/api/user"], null);
      setLocation("/login");
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (!user) return null;

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
            <img 
              src="/tommy-logo.png" 
              alt="Tommy's Academy Logo" 
              className="w-12 h-12 object-contain"
            />
            <h1 className="text-2xl font-bold text-cartoon-dark">Tommy's Academy</h1>
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
            
            <Badge variant="secondary" className="bg-cartoon-yellow text-cartoon-dark">
              <Trophy size={16} className="mr-1" />
              Nível {user.level}
            </Badge>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="text-gray-600 hover:text-gray-800"
            >
              <LogOut size={16} className="mr-1" />
              Sair
            </Button>
          </motion.div>
        </div>
      </div>
    </header>
  );
}