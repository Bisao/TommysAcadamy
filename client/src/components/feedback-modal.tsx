import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

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
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl border-4 border-cartoon-mint max-w-md w-full text-center p-8"
      >
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