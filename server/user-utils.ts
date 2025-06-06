
export interface RealisticUserData {
  totalXP: number;
  level: number;
  streak: number;
  achievements: string[];
}

export function calculateRealisticUserData(createdAt: Date, currentProgress?: any): RealisticUserData {
  const now = new Date();
  const accountAgeInDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  
  // Novos usuários (criados hoje)
  if (accountAgeInDays === 0) {
    return {
      totalXP: 0,
      level: 1,
      streak: 0,
      achievements: []
    };
  }

  // Calcular XP baseado no progresso real das lições
  const lessonsCompleted = currentProgress?.lessonsCompleted || 0;
  const baseXPPerLesson = 20;
  let totalXP = lessonsCompleted * baseXPPerLesson;

  // Adicionar XP bônus para usuários mais antigos (simulando atividade passada)
  if (accountAgeInDays > 1) {
    const dailyBonusXP = Math.min(accountAgeInDays - 1, 30) * 10; // Máximo 30 dias de bônus
    totalXP += dailyBonusXP;
  }

  // Calcular nível baseado no XP (100 XP por nível)
  const level = Math.max(1, Math.floor(totalXP / 100) + 1);

  // Calcular streak realista
  let streak = 0;
  if (accountAgeInDays >= 1 && lessonsCompleted > 0) {
    // Streak máximo de dias consecutivos, limitado pela idade da conta
    streak = Math.min(accountAgeInDays, Math.floor(lessonsCompleted / 2) + 1);
    // Não pode ter mais de 7 dias seguidos se a conta tem menos de 7 dias
    streak = Math.min(streak, accountAgeInDays);
  }

  // Conquistas baseadas no progresso real
  const achievements: string[] = [];
  
  if (lessonsCompleted >= 1) {
    achievements.push("primeira_licao");
  }
  
  if (streak >= 3 && accountAgeInDays >= 3) {
    achievements.push("tres_dias_seguidos");
  }
  
  if (streak >= 7 && accountAgeInDays >= 7) {
    achievements.push("sete_dias_seguidos");
  }
  
  if (totalXP >= 100) {
    achievements.push("cem_xp");
  }
  
  if (totalXP >= 500 && accountAgeInDays >= 7) {
    achievements.push("quinhentos_xp");
  }
  
  if (lessonsCompleted >= 5) {
    achievements.push("cinco_licoes");
  }

  return {
    totalXP,
    level,
    streak,
    achievements
  };
}

export function getLastActiveDate(createdAt: Date): string {
  const now = new Date();
  const accountAgeInDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  
  if (accountAgeInDays === 0) {
    return now.toISOString().split('T')[0];
  }
  
  // Para contas mais antigas, simular última atividade
  const daysAgo = Math.min(accountAgeInDays, 1);
  const lastActive = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
  return lastActive.toISOString().split('T')[0];
}
