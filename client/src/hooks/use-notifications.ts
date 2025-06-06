import { useState, useCallback } from "react";

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

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 20)); // Limit to 20 notifications
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  // Helper functions for common notification types
  const notifyAchievement = useCallback((title: string, message: string, actionCallback?: () => void) => {
    addNotification({
      type: "achievement",
      title,
      message,
      icon: "trophy",
      actionLabel: actionCallback ? "Ver" : undefined,
      actionCallback,
    });
  }, [addNotification]);

  const notifyXPGain = useCallback((amount: number, source: string) => {
    addNotification({
      type: "xp",
      title: `+${amount} XP!`,
      message: `Você ganhou ${amount} XP por ${source}`,
      icon: "star",
    });
  }, [addNotification]);

  const notifyStreakMilestone = useCallback((days: number) => {
    addNotification({
      type: "streak",
      title: `${days} dias seguidos!`,
      message: `Parabéns por manter sua sequência de estudos!`,
      icon: "flame",
    });
  }, [addNotification]);

  const notifyLevelUp = useCallback((newLevel: number) => {
    addNotification({
      type: "level",
      title: `Nível ${newLevel}!`,
      message: `Você subiu para o nível ${newLevel}! Continue assim!`,
      icon: "award",
    });
  }, [addNotification]);

  const notifyLessonComplete = useCallback((lessonTitle: string, xpGained: number) => {
    addNotification({
      type: "lesson",
      title: "Lição completa!",
      message: `Você completou "${lessonTitle}" e ganhou ${xpGained} XP`,
      icon: "book",
    });
  }, [addNotification]);

  const notifyDailyReminder = useCallback(() => {
    addNotification({
      type: "reminder",
      title: "Hora de estudar!",
      message: "Que tal fazer uma lição hoje para manter sua sequência?",
      icon: "target",
    });
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    markAsRead,
    dismissNotification,
    clearAllNotifications,
    markAllAsRead,
    // Helper functions
    notifyAchievement,
    notifyXPGain,
    notifyStreakMilestone,
    notifyLevelUp,
    notifyLessonComplete,
    notifyDailyReminder,
  };
}