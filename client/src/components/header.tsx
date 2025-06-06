import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, Star, Trophy, LogOut, Home, BookOpen, Target } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import NotificationSystem from "@/components/notification-system";
import { useNotifications } from "@/hooks/use-notifications";
import Mascot from "./mascot";
import tommyLogoPath from "@assets/Tommy logo.png";

interface HeaderProps {
  user?: {
    username: string;
    streak: number;
    totalXP: number;
    level: number;
  };
  audioControls?: React.ReactNode;
  showAudioControls?: boolean;
}

export default function Header({ user, audioControls, showAudioControls }: HeaderProps) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const {
    notifications,
    markAsRead,
    dismissNotification,
    clearAllNotifications,
    notifyAchievement,
  } = useNotifications();

  // Check if we're on the home page
  const isHomePage = location === "/home";

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
    <header className="fixed top-0 left-0 right-0 z-[200] glass-card border-b border-border/50 backdrop-blur-md">
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
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold gradient-text hidden sm:block">Tommy's Academy</h1>
            <h1 className="text-base font-bold gradient-text sm:hidden">Tommy's</h1>
          </motion.div>

          {/* Audio Controls for Reading Lesson */}
          {showAudioControls && audioControls && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center"
            >
              {audioControls}
            </motion.div>
          )}

          {/* User Stats and Profile */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2 sm:space-x-4"
          >
            {/* Show stats only on home page */}
            {isHomePage && (
              <>
                {/* Streak */}
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center space-x-1 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full border border-orange-200 dark:border-orange-800"
                >
                  <Flame className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                  <span className="text-orange-700 dark:text-orange-300 font-bold text-sm">{user.streak}</span>
                </motion.div>

                {/* XP */}
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center space-x-1 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full border border-blue-200 dark:border-blue-800"
                >
                  <Star className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  <span className="text-blue-700 dark:text-blue-300 font-bold text-sm">{user.totalXP}</span>
                </motion.div>

                {/* Level */}
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center space-x-1 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full border border-green-200 dark:border-green-800"
                >
                  <Trophy className="w-4 h-4 text-green-500 dark:text-green-400" />
                  <span className="text-green-700 dark:text-green-300 font-bold text-sm">{user.level}</span>
                </motion.div>

                {/* Notifications */}
                <NotificationSystem
                  notifications={notifications}
                  onMarkRead={markAsRead}
                  onDismiss={dismissNotification}
                  onClearAll={clearAllNotifications}
                />

                {/* Theme Toggle */}
                <ThemeToggle />
              </>
            )}

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