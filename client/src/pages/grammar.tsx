
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import LessonModal from "@/components/lesson-modal";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Palette, Lock, CheckCircle } from "lucide-react";

export default function Grammar() {
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [showLessonModal, setShowLessonModal] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ["/api/lessons"],
  });

  const grammarLessons = lessons.filter((l: any) => l.category === "grammar");

  const openLesson = (lessonId: number) => {
    setSelectedLesson(lessonId);
    setShowLessonModal(true);
  };

  const closeLesson = () => {
    setShowLessonModal(false);
    setSelectedLesson(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 pt-16 sm:pt-20">
      <Header user={user} />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-cartoon-blue rounded-full mb-4">
            <Palette className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-cartoon-dark mb-2">Gramática</h1>
          <p className="text-gray-600">Domine as regras do inglês</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {grammarLessons.map((lesson: any, index: number) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`cursor-pointer hover:shadow-lg transition-all duration-300 border-2 ${
                  lesson.completed ? 'border-green-300 bg-green-50' : 'border-cartoon-blue'
                }`}
                onClick={() => openLesson(lesson.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-cartoon-dark mb-2">
                        {lesson.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {lesson.description}
                      </p>
                    </div>
                    <div className="ml-4">
                      {lesson.completed ? (
                        <CheckCircle className="text-green-500" size={24} />
                      ) : lesson.isLocked ? (
                        <Lock className="text-gray-400" size={24} />
                      ) : (
                        <div className="w-6 h-6 bg-cartoon-blue rounded-full" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Nível {lesson.level}</span>
                    <span className="text-cartoon-blue font-semibold">+{lesson.xpReward} XP</span>
                  </div>
                  
                  {lesson.completed && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Pontuação: {lesson.score || 0}%</span>
                        <span>Tentativas: {lesson.attempts || 0}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {grammarLessons.length === 0 && (
          <div className="text-center py-12">
            <Palette className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">Nenhuma lição de gramática disponível ainda.</p>
          </div>
        )}
      </main>

      {showLessonModal && selectedLesson && (
        <LessonModal
          lessonId={selectedLesson}
          onClose={closeLesson}
        />
      )}
    </div>
  );
}
