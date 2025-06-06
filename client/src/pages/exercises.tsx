import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Zap, Trophy, Clock, Star, CheckCircle2 } from "lucide-react";

export default function Exercises() {
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const { data: dailyStats } = useQuery({
    queryKey: ["/api/stats/daily"],
  });

  const exerciseTypes = [
    {
      id: 1,
      name: "Exercícios Rápidos",
      description: "Exercícios de 5 minutos para praticar diariamente",
      icon: Zap,
      color: "cartoon-yellow",
      duration: "5 min",
      difficulty: "Iniciante",
      available: true,
    },
    {
      id: 2,
      name: "Desafios Semanais",
      description: "Desafios mais longos para testar seus conhecimentos",
      icon: Target,
      color: "cartoon-coral",
      duration: "15-20 min",
      difficulty: "Intermediário",
      available: true,
    },
    {
      id: 3,
      name: "Torneios",
      description: "Compete com outros estudantes em torneios temáticos",
      icon: Trophy,
      color: "cartoon-blue",
      duration: "30 min",
      difficulty: "Avançado",
      available: false,
    },
  ];

  const dailyProgress = dailyStats ? Math.min(((dailyStats as any).lessonsCompleted / 3) * 100, 100) : 0;

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
            Exercícios
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Pratique e teste seus conhecimentos com exercícios interativos
          </p>
        </motion.div>

        {/* Daily Challenge Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="cartoon-card border-2 bg-gradient-to-r from-cartoon-mint/20 to-cartoon-teal/20">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-cartoon-mint flex items-center justify-center mb-4">
                <Star className="text-white" size={32} />
              </div>
              <CardTitle className="text-2xl font-bold text-cartoon-dark">
                Desafio Diário
              </CardTitle>
              <p className="text-gray-600">
                Complete seu desafio diário para manter sua sequência!
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Progresso de hoje</span>
                <span>{Math.round(dailyProgress)}%</span>
              </div>
              <Progress value={dailyProgress} className="h-3" />
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Clock className="text-cartoon-dark" size={16} />
                  <span className="text-sm text-gray-600">Meta: 3 exercícios</span>
                </div>
                <Badge 
                  variant={dailyProgress >= 100 ? "default" : "outline"}
                  className={dailyProgress >= 100 ? "bg-green-500" : ""}
                >
                  {dailyProgress >= 100 ? (
                    <>
                      <CheckCircle2 size={14} className="mr-1" />
                      Concluído!
                    </>
                  ) : (
                    `${(dailyStats as any)?.lessonsCompleted || 0}/3`
                  )}
                </Badge>
              </div>
              <Button 
                className="w-full cartoon-button bg-cartoon-mint hover:bg-cartoon-mint/80"
                disabled={dailyProgress >= 100}
              >
                {dailyProgress >= 100 ? "Desafio Concluído!" : "Começar Desafio"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Exercise Types Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
          {exerciseTypes.map((exercise, index) => {
            const Icon = exercise.icon;
            return (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index + 1) * 0.1 }}
              >
                <Card className={`cartoon-card border-2 hover:shadow-xl transition-all duration-300 h-full ${!exercise.available ? 'opacity-60' : ''}`}>
                  <CardHeader className="text-center pb-4">
                    <div className={`mx-auto w-16 h-16 rounded-full bg-${exercise.color} flex items-center justify-center mb-4`}>
                      <Icon className="text-white" size={32} />
                    </div>
                    <CardTitle className="text-xl sm:text-2xl font-bold text-cartoon-dark">
                      {exercise.name}
                    </CardTitle>
                    <p className="text-gray-600 text-sm sm:text-base">
                      {exercise.description}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold text-cartoon-dark">{exercise.duration}</div>
                        <div className="text-gray-600">Duração</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold text-cartoon-dark">{exercise.difficulty}</div>
                        <div className="text-gray-600">Nível</div>
                      </div>
                    </div>
                    
                    <Button
                      className={`w-full cartoon-button bg-${exercise.color} hover:bg-${exercise.color}/80`}
                      disabled={!exercise.available}
                    >
                      {exercise.available ? "Começar" : "Em Breve"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="cartoon-card border-2">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-cartoon-dark">
                Suas Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-cartoon-blue">
                    {(user as any)?.streak || 0}
                  </div>
                  <div className="text-sm text-gray-600">Dias Seguidos</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-cartoon-mint">
                    {(user as any)?.totalXP || 0}
                  </div>
                  <div className="text-sm text-gray-600">XP Total</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-cartoon-yellow">
                    {(dailyStats as any)?.lessonsCompleted || 0}
                  </div>
                  <div className="text-sm text-gray-600">Exercícios Hoje</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-cartoon-coral">
                    {(user as any)?.level || 1}
                  </div>
                  <div className="text-sm text-gray-600">Nível</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Coming Soon Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 border-2 border-dashed border-gray-300">
            <h3 className="text-xl font-bold text-cartoon-dark mb-2">
              Mais Exercícios em Breve!
            </h3>
            <p className="text-gray-600 mb-4">
              Estamos trabalhando em novos tipos de exercícios para tornar seu aprendizado ainda mais divertido.
            </p>
            <Badge variant="outline" className="text-cartoon-blue border-cartoon-blue">
              Em Desenvolvimento
            </Badge>
          </div>
        </motion.div>
      </main>
    </div>
  );
}