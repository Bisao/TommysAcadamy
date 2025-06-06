import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, Star, Trophy, LogOut, Home } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import Mascot from "./mascot";
import tommyLogoPath from "@assets/Tommy logo.png";

interface HeaderProps {
  user?: {
    username: string;
    streak: number;
    totalXP: number;
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
    <header className="fixed top-0 left-0 right-0 z-[100] bg-white shadow-lg border-b-4 border-cartoon-teal">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center py-2 sm:py-4">
          {/* Logo Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer"
            onClick={() => setLocation("/home")}
          >
            <img 
              src={tommyLogoPath} 
              alt="Tommy's Academy Logo" 
              className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 object-contain"
            />
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-cartoon-dark hidden sm:block">Tommy's Academy</h1>
            <h1 className="text-base font-bold text-cartoon-dark sm:hidden">Tommy's</h1>
          </motion.div>

          {/* Progress and Stats */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6"
          >
            {/* Streak Counter */}
            <Badge className="bg-cartoon-yellow hover:bg-cartoon-yellow/80 text-cartoon-dark font-bold px-2 sm:px-3 lg:px-4 py-1 sm:py-2 text-xs sm:text-sm">
              <Flame className="text-cartoon-red mr-1 wiggle" size={14} />
              <span>{user?.streak || 0}</span>
            </Badge>

            {/* XP Points */}
            <Badge className="bg-cartoon-mint hover:bg-cartoon-mint/80 text-cartoon-dark font-bold px-2 sm:px-3 lg:px-4 py-1 sm:py-2 text-xs sm:text-sm hidden sm:flex">
              <Star className="text-cartoon-yellow mr-1" size={14} />
              <span>{user?.totalXP || 0} XP</span>
            </Badge>

            {/* Profile Avatar */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/profile")}
              className="flex items-center space-x-1 sm:space-x-2 hover:bg-cartoon-teal/10"
            >
              <Avatar className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-cartoon-blue cursor-pointer transform hover:scale-110 transition-transform">
                <AvatarFallback className="bg-cartoon-blue text-white font-bold text-xs sm:text-sm">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>

            <Badge variant="secondary" className="bg-cartoon-yellow text-cartoon-dark hidden lg:flex">
              <Trophy size={14} className="mr-1" />
              Nível {user.level}
            </Badge>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="text-gray-600 hover:text-gray-800 px-2 sm:px-3 text-xs sm:text-sm"
            >
              <Home size={14} className="mr-0 sm:mr-1" />
              <span className="hidden sm:inline">Início</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="text-gray-600 hover:text-gray-800 px-2 sm:px-3 text-xs sm:text-sm"
            >
              <LogOut size={14} className="mr-0 sm:mr-1" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </motion.div>
        </div>
      </div>
    </header>
  );
}