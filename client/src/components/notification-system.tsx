import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Trophy, Star, Flame, Target, BookOpen, Award } from "lucide-react";

interface Notification {
  id: string;
  type: "achievement" | "xp" | "streak" | "level" | "lesson" | "reminder";
  title: string;
  message: string;
  icon: string;
  timestamp: Date;
  read: boolean;
  actionLabel?: string;
  actionCallback?: () => void;
}

interface NotificationSystemProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onClearAll: () => void;
}

const iconMap = {
  trophy: Trophy,
  star: Star,
  flame: Flame,
  target: Target,
  book: BookOpen,
  award: Award,
};

export default function NotificationSystem({
  notifications,
  onMarkRead,
  onDismiss,
  onClearAll,
}: NotificationSystemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "achievement":
        return "from-yellow-500 to-orange-500";
      case "xp":
        return "from-blue-500 to-purple-500";
      case "streak":
        return "from-orange-500 to-red-500";
      case "level":
        return "from-green-500 to-teal-500";
      case "lesson":
        return "from-indigo-500 to-blue-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      onMarkRead(notification.id);
    }
    if (notification.actionCallback) {
      notification.actionCallback();
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-9 w-9 px-0"
      >
        <div className="relative">
          <Trophy size={20} />
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
            >
              <span className="text-xs text-white font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </motion.div>
          )}
        </div>
      </Button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 top-12 w-80 z-50"
          >
            <Card className="cartoon-card border-2 shadow-2xl">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h3 className="font-semibold text-foreground">Notificações</h3>
                  <div className="flex items-center space-x-2">
                    {notifications.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearAll}
                        className="text-xs"
                      >
                        Limpar tudo
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="h-6 w-6 p-0"
                    >
                      <X size={14} />
                    </Button>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center">
                      <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        Nenhuma notificação no momento
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1 p-2">
                      {notifications.map((notification) => {
                        const IconComponent = iconMap[notification.icon as keyof typeof iconMap] || Trophy;
                        
                        return (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            layout
                          >
                            <Card
                              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                                !notification.read
                                  ? "bg-primary/5 border-primary/20"
                                  : "bg-background"
                              }`}
                              onClick={() => handleNotificationClick(notification)}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-start space-x-3">
                                  <div
                                    className={`w-8 h-8 rounded-full bg-gradient-to-r ${getTypeStyles(
                                      notification.type
                                    )} flex items-center justify-center flex-shrink-0`}
                                  >
                                    <IconComponent className="text-white" size={16} />
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                      <h4 className="text-sm font-medium text-foreground truncate">
                                        {notification.title}
                                      </h4>
                                      {!notification.read && (
                                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 ml-2" />
                                      )}
                                    </div>
                                    
                                    <p className="text-xs text-muted-foreground mb-2">
                                      {notification.message}
                                    </p>
                                    
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-muted-foreground">
                                        {notification.timestamp.toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                      
                                      {notification.actionLabel && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-xs h-6 px-2"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (notification.actionCallback) {
                                              notification.actionCallback();
                                            }
                                          }}
                                        >
                                          {notification.actionLabel}
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDismiss(notification.id);
                                    }}
                                    className="h-6 w-6 p-0 flex-shrink-0"
                                  >
                                    <X size={12} />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}