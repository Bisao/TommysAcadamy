import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AchievementBadge from "@/components/achievement-badge";
import LevelProgress from "@/components/level-progress";
import DailyStreak from "@/components/daily-streak";
import { 
  User, 
  Mail, 
  Trophy, 
  Target, 
  Settings, 
  BarChart3,
  Award,
  Star,
  Flame
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    dailyGoal: 15,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/user"],
  });

  const updateUserMutation = useMutation({
    mutationFn: async (userData: typeof formData) => {
      const response = await apiRequest("PATCH", "/api/user", userData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateUserMutation.mutate(formData);
  };

  const achievements = [
    {
      id: "first-lesson",
      name: "Primeira Lição",
      description: "Complete sua primeira lição",
      icon: "book",
      earned: true,
      rarity: "common" as const,
    },
    {
      id: "week-streak",
      name: "7 Dias Seguidos", 
      description: "Mantenha uma sequência de 7 dias",
      icon: "flame",
      earned: true,
      rarity: "rare" as const,
    },
    {
      id: "thousand-xp",
      name: "1000 XP",
      description: "Acumule 1000 pontos de experiência",
      icon: "star",
      earned: ((user as any)?.totalXP || 0) >= 1000,
      progress: (user as any)?.totalXP || 0,
      total: 1000,
      rarity: "epic" as const,
    },
    {
      id: "word-master",
      name: "Mestre das Palavras",
      description: "Complete 50 lições de vocabulário",
      icon: "trophy",
      earned: false,
      progress: 23,
      total: 50,
      rarity: "legendary" as const,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Header user={user} />
      <div className="min-h-screen bg-background pt-20 sm:pt-24 pb-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">
              Meu Perfil
            </h1>
            <p className="text-muted-foreground text-lg">
              Acompanhe seu progresso e conquistas no aprendizado
            </p>
          </motion.div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:w-96 mx-auto">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <User size={16} />
                <span className="hidden sm:inline">Visão Geral</span>
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex items-center space-x-2">
                <Trophy size={16} />
                <span className="hidden sm:inline">Conquistas</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center space-x-2">
                <BarChart3 size={16} />
                <span className="hidden sm:inline">Estatísticas</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center space-x-2">
                <Settings size={16} />
                <span className="hidden sm:inline">Configurações</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="lg:col-span-1"
                >
                  <Card className="cartoon-card">
                    <CardContent className="p-6 text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="text-white" size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        {(user as any)?.username || "Usuário"}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {(user as any)?.email || "email@exemplo.com"}
                      </p>
                      <div className="flex justify-center space-x-4">
                        <div className="text-center">
                          <p className="text-lg font-bold text-foreground">{(user as any)?.level || 1}</p>
                          <p className="text-xs text-muted-foreground">Nível</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-foreground">{(user as any)?.streak || 0}</p>
                          <p className="text-xs text-muted-foreground">Sequência</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="lg:col-span-2"
                >
                  <LevelProgress
                    level={(user as any)?.level || 1}
                    currentXP={((user as any)?.totalXP || 0) % 1000}
                    xpForNextLevel={1000}
                    totalXP={(user as any)?.totalXP || 0}
                  />
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <DailyStreak
                  currentStreak={(user as any)?.streak || 0}
                  longestStreak={(user as any)?.streak || 0}
                  weeklyGoal={7}
                  weeklyProgress={5}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
              >
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <AchievementBadge achievement={achievement} />
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="cartoon-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="text-blue-500" size={20} />
                      <span>Estatísticas Gerais</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">XP Total:</span>
                      <span className="font-semibold">{(user as any)?.totalXP || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nível Atual:</span>
                      <span className="font-semibold">{(user as any)?.level || 1}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sequência:</span>
                      <span className="font-semibold">{(user as any)?.streak || 0} dias</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card className="cartoon-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="text-gray-500" size={20} />
                    <span>Configurações</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Nome de usuário</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex items-center justify-between pt-4">
                    <Button
                      onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                      disabled={updateUserMutation.isPending}
                      className="cartoon-button"
                    >
                      {isEditing ? "Salvar" : "Editar Perfil"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}