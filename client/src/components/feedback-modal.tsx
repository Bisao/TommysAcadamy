import { motion } from "framer-motion";
import { CheckCircle, XCircle, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudio } from "@/hooks/use-audio";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface FeedbackModalProps {
  isCorrect: boolean;
  correctAnswer: string;
  explanation?: string;
  onContinue: () => void;
}

export default function FeedbackModal({ 
  isCorrect, 
  correctAnswer, 
  explanation, 
  onContinue 
}: FeedbackModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl border-4 border-cartoon-yellow max-w-md w-full text-center p-8"
      >
        {/* Teacher Tommy Avatar */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-4"
        >
          <Avatar className="w-16 h-16 border-4 border-cartoon-teal">
            <AvatarImage src="/teacher-tommy.png" alt="Teacher Tommy" />
            <AvatarFallback className="bg-cartoon-yellow text-cartoon-dark text-xl font-bold">
              T
            </AvatarFallback>
          </Avatar>
        </motion.div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: isCorrect ? 360 : 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isCorrect ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {isCorrect ? (
            <CheckCircle className="text-white" size={64} />
          ) : (
            <XCircle className="text-white" size={64} />
          )}
        </motion.div>
        {isCorrect ? (
          <div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 bg-cartoon-mint rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="text-white" size={48} />
            </motion.div>
            <h3 className="text-2xl font-bold text-cartoon-dark mb-2">Muito bem! 🎉</h3>
            <p className="text-gray-600 mb-4">
              Você acertou! A resposta correta é "{correctAnswer}"
            </p>
            <div className="text-cartoon-mint font-bold text-lg">+10 XP</div>
          </div>
        ) : (
          <div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, -10, 10, -10, 0] }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 bg-cartoon-red rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <XCircle className="text-white" size={48} />
            </motion.div>
            <h3 className="text-2xl font-bold text-cartoon-dark mb-2">Ops! Tente novamente 🤔</h3>
            <p className="text-gray-600 mb-4">
              A resposta correta é "{correctAnswer}"
            </p>
            <div className="text-cartoon-red font-bold text-lg">Continue tentando!</div>
          </div>
        )}

        {explanation && (
          <div className="mt-4 p-3 bg-cartoon-gray rounded-lg">
            <p className="text-sm text-gray-700">{explanation}</p>
          </div>
        )}

        <Button
          onClick={onContinue}
          className="cartoon-button mt-6 transform hover:scale-110 transition-all"
        >
          Continuar
        </Button>
      </motion.div>
    </motion.div>
  );
}