
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { calculateRealisticUserData } from "./user-utils";

export async function migrateExistingUsers() {
  try {
    const allUsers = await db.select().from(users);
    
    for (const user of allUsers) {
      // Para usuários sem createdAt, assumir que foram criados hoje
      const createdAt = user.createdAt || new Date();
      
      // Se o usuário foi "criado" hoje, zerar todos os dados
      const today = new Date().toISOString().split('T')[0];
      const userCreatedToday = createdAt.toISOString().split('T')[0] === today;
      
      if (userCreatedToday) {
        await db.update(users)
          .set({
            totalXP: 0,
            level: 1,
            streak: 0,
            achievements: [],
            createdAt: new Date(),
            lastActiveDate: today
          })
          .where(eq(users.id, user.id));
      }
    }
    
    console.log("Migração de usuários concluída com sucesso!");
  } catch (error) {
    console.error("Erro na migração de usuários:", error);
  }
}
