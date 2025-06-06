import { motion } from "framer-motion";
import { Smile } from "lucide-react";

export default function Mascot() {
  return (
    <motion.div
      animate={{ 
        y: [0, -10, 0],
        rotate: [0, 5, -5, 0]
      }}
      transition={{ 
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="w-24 h-24 bg-gradient-to-br from-cartoon-teal to-cartoon-blue rounded-full flex items-center justify-center shadow-xl border-4 border-white"
    >
      <Smile className="text-white" size={32} />
    </motion.div>
  );
}
