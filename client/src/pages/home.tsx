import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Mascot from "@/components/mascot";
import LessonModal from "@/components/lesson-modal";
import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, MessageCircle, Mic, Palette, Trophy, Medal, Star, Flame, Target, Calendar, Clock, Award, TrendingUp, Zap, Brain } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [, setLocation] = useLocation();

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ["/api/lessons"],
  });

  const { data: progress } = useQuery({
    queryKey: ["/api/progress"],
  });

  const { data: dailyStats } = useQuery({
    queryKey: ["/api/stats/daily"],
  });

  const categories = [
    {
      name: "Vocabulário",
      description: "Aprenda novas palavras",
      icon: BookOpen,
      color: "cartoon-coral",
      path: "/vocabulary",
      lessons: (lessons as any[]).filter((l: any) => l.category === "vocabulary"),
    },
    {
      name: "Gramática",
      description: "Domine as regras",
      icon: Palette,
      color: "cartoon-blue",
      path: "/grammar",
      lessons: (lessons as any[]).filter((l: any) => l.category === "grammar"),
    },
    {
      name: "Frases",
      description: "Conversação prática",
      icon: MessageCircle,
      color: "cartoon-mint",
      path: "/phrases",
      lessons: (lessons as any[]).filter((l: any) => l.category === "phrases"),
    },
    {
      name: "Pronúncia",
      description: "Fale como um nativo",
      icon: Mic,
      color: "cartoon-yellow",
      path: "/pronunciation",
      lessons: (lessons as any[]).filter((l: any) => l.category === "pronunciation"),
    },
  ];

  const achievements = [
    { name: "Primeira Lição", icon: Medal, earned: true },
    { name: "7 Dias Seguidos", icon: Flame, earned: true },
    { name: "1000 XP", icon: Star, earned: true },
    { name: "Mestre das Palavras", icon: Trophy, earned: false },
  ];

  const openLesson = (lessonId: number) => {
    setSelectedLesson(lessonId);
    setShowLessonModal(true);
  };

  const closeLesson = () => {
    setShowLessonModal(false);
    setSelectedLesson(null);
  };

  const dailyProgress = dailyStats ? ((dailyStats as any).lessonsCompleted / ((user as any)?.dailyGoal || 4)) * 100 : 0;

  return (
    <div className="min-h-screen bg-background pt-20 sm:pt-24 lg:pt-28">
      <Header user={user as any} />

      {/* Spacing between header and content */}
      <div className="h-6"></div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="inline-block mb-3 sm:mb-4 floating-card">
            <Mascot />
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text mb-4 px-2">
            Olá {(user as any)?.username}! Vamos aprender inglês hoje?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground px-4 mb-6">Continue sua jornada de aprendizado com lições divertidas!</p>

          {/* Daily Progress */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-4 sm:p-6 max-w-md mx-auto mb-8"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">Meta Diária</span>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                {Math.round(dailyProgress)}%
              </Badge>
            </div>
            <Progress value={dailyProgress} className="h-3 mb-2" />
            <p className="text-sm text-muted-foreground">
              {(dailyStats as any)?.lessonsCompleted || 0} de {(user as any)?.dailyGoal || 4} lições completadas hoje
            </p>
          </motion.div>
        </motion.div>

        {/* Quick Stats Dashboard */}
        

        {/* Main Navigation Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8"
        >
          <Card className="cartoon-card group cursor-pointer overflow-hidden" onClick={() => setLocation("/lessons")}>
            <CardContent className="p-0">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 transform rotate-12 translate-x-4 -translate-y-4 group-hover:translate-x-8 transition-transform duration-300"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <BookOpen className="text-white" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Aulas</h3>
                  <p className="text-blue-100 mb-4">Explore lições organizadas por categoria</p>
                </div>
              </div>
              <div className="p-4">
                <Button className="w-full cartoon-button-secondary">
                  Ver Todas as Aulas
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="cartoon-card group cursor-pointer overflow-hidden" onClick={() => setLocation("/exercises")}>
            <CardContent className="p-0">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 transform -rotate-12 -translate-x-4 translate-y-4 group-hover:-translate-x-8 transition-transform duration-300"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Target className="text-white" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Exercícios</h3>
                  <p className="text-orange-100 mb-4">Pratique e teste seus conhecimentos</p>
                </div>
              </div>
              <div className="p-4">
                <Button className="w-full cartoon-button">
                  Fazer Exercícios
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Lesson Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          {categories.map((category, index) => {
            const Icon = category.icon;
            const completedLessons = category.lessons.filter((l: any) => l.completed).length;
            const totalLessons = category.lessons.length;
            const progressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className={`cartoon-card border-${category.color} p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-shadow`}
                onClick={() => setLocation(category.path)}
              >
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-${category.color} rounded-full flex items-center justify-center shadow-lg mr-3 sm:mr-4`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-cartoon-dark">{category.name}</h3>
                    <p className="text-sm sm:text-base text-gray-600">{category.description}</p>
                  </div>
                </div>
                <div className="bg-cartoon-gray rounded-full h-2 sm:h-3 mb-2">
                  <div 
                    className={`bg-${category.color} h-2 sm:h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-xs sm:text-sm text-gray-600">
                  {completedLessons} de {totalLessons} lições concluídas
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Achievements Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="cartoon-card border-cartoon-teal mb-8 p-6"
        >
          <h3 className="text-xl font-bold text-cartoon-dark mb-4 flex items-center">
            <Trophy className="text-cartoon-yellow mr-2" />
            Suas Conquistas
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <motion.div 
                  key={achievement.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className={`text-center p-4 bg-cartoon-gray rounded-xl transition-all duration-300 hover:scale-110 ${
                    achievement.earned ? "" : "opacity-50"
                  }`}
                >
                  <div className={`w-16 h-16 ${
                    achievement.earned 
                      ? "bg-cartoon-yellow" 
                      : "bg-gray-400"
                  } rounded-full flex items-center justify-center shadow-lg mx-auto mb-2`}>
                    <Icon className="text-white text-2xl" size={24} />
                  </div>
                  <p className={`font-semibold text-sm ${
                    achievement.earned 
                      ? "text-cartoon-dark" 
                      : "text-gray-500"
                  }`}>
                    {achievement.name}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Continue Learning Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <Button 
            className="cartoon-button text-xl py-4 px-8 animate-pulse"
            onClick={() => {
              const nextLesson = (lessons as any[]).find((l: any) => !l.completed);
              if (nextLesson) {
                openLesson(nextLesson.id);
              }
            }}
          >
            ▶ Continuar Aprendendo
          </Button>
        </motion.div>
      </main>

      {/* Lesson Modal */}
      {showLessonModal && selectedLesson && (
        <LessonModal
          lessonId={selectedLesson}
          onClose={closeLesson}
        />
      )}
    </div>
  );
}