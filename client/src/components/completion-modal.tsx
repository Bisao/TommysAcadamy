import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trophy, Star } from "lucide-react";

interface CompletionModalProps {
  results: {
    score: number;
    totalQuestions: number;
    xpEarned: number;
    correct: number;
    incorrect: number;
  };
  lessonTitle: string;
  onNextLesson: () => void;
  onBackToHome: () => void;
}

export default function CompletionModal({ 
  results, 
  lessonTitle, 
  onNextLesson, 
  onBackToHome 
}: CompletionModalProps) {
  const isPassed = results.score >= 70;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl border-4 border-cartoon-yellow max-w-md w-full text-center p-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, duration: 1 }}
          className="w-32 h-32 bg-cartoon-yellow rounded-full flex items-center justify-center mx-auto mb-4 bounce-gentle"
        >
          <Trophy className="text-white" size={64} />
        </motion.div>

        <h3 className="text-3xl font-bold text-cartoon-dark mb-2">
          {isPassed ? "Parabéns! 🎊" : "Quase lá! 💪"}
        </h3>
        <p className="text-gray-600 mb-4">
          {isPassed 
            ? `Você completou a lição "${lessonTitle}"`
            : `Continue praticando a lição "${lessonTitle}"`
          }
        </p>

        {/* Stats */}
        <div className="bg-cartoon-gray rounded-xl p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-cartoon-dark">{results.correct}</div>
              <div className="text-sm text-gray-600">Corretas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-cartoon-red">{results.incorrect}</div>
              <div className="text-sm text-gray-600">Incorretas</div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="text-xl font-bold text-cartoon-dark">{results.score}%</div>
            <div className="text-sm text-gray-600">Pontuação</div>
          </div>
        </div>

        {/* XP Earned */}
        {isPassed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-cartoon-mint rounded-xl p-4 mb-6"
          >
            <div className="text-3xl font-bold text-white mb-1">+{results.xpEarned} XP</div>
            <div className="text-cartoon-dark font-semibold">Experiência Ganha</div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {isPassed ? (
            <Button
              onClick={onNextLesson}
              className="w-full cartoon-button transform hover:scale-105 transition-all"
            >
              Próxima Lição
            </Button>
          ) : (
            <Button
              onClick={onBackToHome}
              className="w-full cartoon-button transform hover:scale-105 transition-all"
            >
              Tentar Novamente
            </Button>
          )}
          <Button
            onClick={onBackToHome}
            variant="outline"
            className="w-full"
          >
            Voltar ao Início
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
