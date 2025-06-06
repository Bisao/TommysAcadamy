import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, MessageCircle, Mic, Palette, Play, CheckCircle, Lock } from "lucide-react";
import { useLocation } from "wouter";
import { Volume2 } from "lucide-react";

export default function Lessons() {
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

  const categories = [
    {
      name: "Vocabulário",
      description: "Aprenda novas palavras e expressões",
      icon: BookOpen,
      color: "cartoon-coral",
      category: "vocabulary",
      lessons: (lessons as any[]).filter((l: any) => l.category === "vocabulary"),
    },
    {
      name: "Gramática",
      description: "Domine as regras gramaticais",
      icon: Palette,
      color: "cartoon-blue",
      category: "grammar",
      lessons: (lessons as any[]).filter((l: any) => l.category === "grammar"),
    },
    {
      name: "Frases",
      description: "Conversação prática do dia a dia",
      icon: MessageCircle,
      color: "cartoon-mint",
      category: "phrases",
      lessons: (lessons as any[]).filter((l: any) => l.category === "phrases"),
    },
    {
      name: "Pronúncia",
      description: "Fale como um nativo",
      icon: Mic,
      color: "cartoon-yellow",
      category: "pronunciation",
      lessons: (lessons as any[]).filter((l: any) => l.category === "pronunciation"),
    },
  ];

  const getLessonStatus = (lessonId: number) => {
    const lessonProgress = (progress as any)?.progress?.find((p: any) => p.lessonId === lessonId);
    if (lessonProgress?.completed) return "completed";
    if (lessonProgress?.inProgress) return "in-progress";
    return "locked";
  };

  const getLessonIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="text-green-500" size={20} />;
      case "in-progress":
        return <Play className="text-blue-500" size={20} />;
      default:
        return <Lock className="text-gray-400" size={20} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 pt-16 sm:pt-20">
      <Header user={user as any} />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-cartoon-dark mb-4">
            Aulas
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Explore nossas aulas organizadas por categoria e continue sua jornada de aprendizado
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="cartoon-card border-2 hover:shadow-xl transition-all duration-300 h-full">
                  <CardHeader className="text-center pb-4">
                    <div className={`mx-auto w-16 h-16 rounded-full bg-${category.color} flex items-center justify-center mb-4`}>
                      <Icon className="text-white" size={32} />
                    </div>
                    <CardTitle className="text-xl sm:text-2xl font-bold text-cartoon-dark">
                      {category.name}
                    </CardTitle>
                    <p className="text-gray-600 text-sm sm:text-base">
                      {category.description}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Category Stats */}
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary" className="text-xs">
                        {category.lessons.length} aulas
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {category.lessons.filter((l: any) => getLessonStatus(l.id) === "completed").length} concluídas
                      </Badge>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Progresso</span>
                        <span>
                          {Math.round((category.lessons.filter((l: any) => getLessonStatus(l.id) === "completed").length / Math.max(category.lessons.length, 1)) * 100)}%
                        </span>
                      </div>
                      <Progress 
                        value={(category.lessons.filter((l: any) => getLessonStatus(l.id) === "completed").length / Math.max(category.lessons.length, 1)) * 100}
                        className="h-2"
                      />
                    </div>

                    {/* Lessons List */}
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {category.lessons.length > 0 ? (
                        category.lessons.map((lesson: any) => {
                          const status = getLessonStatus(lesson.id);
                          return (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between p-2 rounded-lg border bg-white/50"
                            >
                              <div className="flex items-center space-x-2">
                                {getLessonIcon(status)}
                                <span className="text-sm font-medium">{lesson.title}</span>
                              </div>
                              <Button
                                size="sm"
                                variant={status === "completed" ? "outline" : "default"}
                                onClick={() => setLocation(`/lesson/${lesson.id}`)}
                                disabled={status === "locked"}
                                className="text-xs"
                              >
                                {status === "completed" ? "Revisar" : status === "in-progress" ? "Continuar" : "Iniciar"}
                              </Button>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          Nenhuma aula disponível ainda
                        </div>
                      )}
                    </div>

                    {/* Category Action Button */}
                    <Button
                      className={`w-full cartoon-button bg-${category.color} hover:bg-${category.color}/80`}
                      onClick={() => setLocation(`/${category.category}`)}
                    >
                      Explorar {category.name}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Overall Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <Card className="cartoon-card border-2">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-cartoon-dark">
                Seu Progresso Geral
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-cartoon-blue">
                    {(progress as any)?.lessonsCompleted || 0}
                  </div>
                  <div className="text-sm text-gray-600">Aulas Concluídas</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-cartoon-mint">
                    {(progress as any)?.totalXP || 0}
                  </div>
                  <div className="text-sm text-gray-600">XP Total</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-cartoon-yellow">
                    {(user as any)?.streak || 0}
                  </div>
                  <div className="text-sm text-gray-600">Dias Seguidos</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}