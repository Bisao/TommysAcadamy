import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Mascot from "@/components/mascot";
import LessonModal from "@/components/lesson-modal";
import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, MessageCircle, Mic, Palette, Trophy, Medal, Star, Flame } from "lucide-react";

export default function Home() {
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [showLessonModal, setShowLessonModal] = useState(false);

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
      lessons: lessons.filter((l: any) => l.category === "vocabulary"),
    },
    {
      name: "Gramática",
      description: "Domine as regras",
      icon: Palette,
      color: "cartoon-blue",
      lessons: lessons.filter((l: any) => l.category === "grammar"),
    },
    {
      name: "Frases",
      description: "Conversação prática",
      icon: MessageCircle,
      color: "cartoon-mint",
      lessons: lessons.filter((l: any) => l.category === "phrases"),
    },
    {
      name: "Pronúncia",
      description: "Fale como um nativo",
      icon: Mic,
      color: "cartoon-yellow",
      lessons: lessons.filter((l: any) => l.category === "pronunciation"),
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

  const dailyProgress = dailyStats ? (dailyStats.lessonsCompleted / (user?.dailyGoal || 4)) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50">
      <Header user={user} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-block mb-4">
            <Mascot />
          </div>
          <h2 className="text-3xl font-bold text-cartoon-dark mb-2">
            Olá! Vamos aprender inglês hoje? 🎉
          </h2>
          <p className="text-lg text-gray-600">Continue sua jornada de aprendizado com lições divertidas!</p>
        </motion.div>

        {/* Progress Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="cartoon-card border-cartoon-teal mb-8 p-6"
        >
          <h3 className="text-xl font-bold text-cartoon-dark mb-4 flex items-center">
            <Trophy className="text-cartoon-teal mr-2" />
            Seu Progresso
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-3 bg-cartoon-red rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">
                  {Math.round(dailyProgress)}%
                </span>
              </div>
              <p className="font-semibold text-cartoon-dark">Progresso Diário</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-3 bg-cartoon-yellow rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-cartoon-dark">
                  {progress?.lessonsCompleted || 0}
                </span>
              </div>
              <p className="font-semibold text-cartoon-dark">Lições Concluídas</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-3 bg-cartoon-mint rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-cartoon-dark">
                  {user?.level || 1}
                </span>
              </div>
              <p className="font-semibold text-cartoon-dark">Nível Atual</p>
            </div>
          </div>
        </motion.div>

        {/* Lesson Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
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
                className={`cartoon-card border-${category.color} p-6 cursor-pointer`}
                onClick={() => {
                  if (category.lessons.length > 0) {
                    openLesson(category.lessons[0].id);
                  }
                }}
              >
                <div className="flex items-center mb-4">
                  <div className={`w-16 h-16 bg-${category.color} rounded-full flex items-center justify-center shadow-lg mr-4`}>
                    <Icon className="text-white text-2xl" size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-cartoon-dark">{category.name}</h3>
                    <p className="text-gray-600">{category.description}</p>
                  </div>
                </div>
                <div className="bg-cartoon-gray rounded-full h-3 mb-2">
                  <div 
                    className={`bg-${category.color} h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600">
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
              const nextLesson = lessons.find((l: any) => !l.completed);
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
