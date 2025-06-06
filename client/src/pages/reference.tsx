
import Header from "@/components/header";
import SVOTable from "@/components/svo-table";
import RememberTable from "@/components/remember-table";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, MessageCircle, Mic, Palette } from "lucide-react";
import { motion } from "framer-motion";

export default function Reference() {
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ["/api/lessons"],
  });

  const { data: progress } = useQuery({
    queryKey: ["/api/progress"],
  });

  // Filter lessons by progress
  const lessonsWithProgress = lessons.map((lesson: any) => {
    const lessonProgress = progress?.progress?.find((p: any) => p.lessonId === lesson.id);
    return {
      ...lesson,
      completed: lessonProgress?.completed || false
    };
  });

  const categories = [
    {
      name: "Vocabulário",
      description: "Aprenda novas palavras",
      icon: BookOpen,
      color: "cartoon-coral",
      lessons: lessonsWithProgress.filter((l: any) => l.category === "vocabulary"),
    },
    {
      name: "Gramática", 
      description: "Domine as regras",
      icon: Palette,
      color: "cartoon-blue",
      lessons: lessonsWithProgress.filter((l: any) => l.category === "grammar"),
    },
    {
      name: "Frases",
      description: "Conversação prática",
      icon: MessageCircle,
      color: "cartoon-mint",
      lessons: lessonsWithProgress.filter((l: any) => l.category === "phrases"),
    },
    {
      name: "Pronúncia",
      description: "Fale como um nativo",
      icon: Mic,
      color: "cartoon-yellow",
      lessons: lessonsWithProgress.filter((l: any) => l.category === "pronunciation"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 pt-16 sm:pt-20">
      <Header user={user} />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-cartoon-dark mb-4">
            Referência de Estudo
          </h1>
          <p className="text-gray-600 text-lg">
            Tabelas de referência e progresso por categoria
          </p>
        </motion.div>

        {/* Categories Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-cartoon-dark mb-6 text-center">
            Progresso por Categoria
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((category, index) => {
              const Icon = category.icon;
              const completedLessons = category.lessons.filter((l: any) => l.completed).length;
              const totalLessons = category.lessons.length;
              const progressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

              return (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card className={`border-2 border-${category.color} bg-white hover:shadow-lg transition-all duration-300`}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className={`w-12 h-12 rounded-xl bg-${category.color} flex items-center justify-center`}>
                          <Icon className="text-white" size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-cartoon-dark">{category.name}</h3>
                          <p className="text-gray-600 text-sm">{category.description}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progresso</span>
                          <span>{completedLessons} de {totalLessons} lições</span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                        <p className="text-xs text-gray-600 text-center">
                          {Math.round(progressPercent)}% concluído
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Reference Tables */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-12"
        >
          <div>
            <h2 className="text-2xl font-bold text-cartoon-dark mb-6 text-center">
              Tabela S.V.O. (Subject-Verb-Object)
            </h2>
            <SVOTable />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-cartoon-dark mb-6 text-center">
              Vocabulário de Conectores
            </h2>
            <RememberTable />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
