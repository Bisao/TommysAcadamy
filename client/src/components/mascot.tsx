import { motion } from "framer-motion";
import tommyImage from "@assets/TTommy.png";

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
      className="w-24 h-24 rounded-full flex items-center justify-center shadow-xl border-4 border-white relative overflow-hidden"
    >
      <img 
        src={tommyImage} 
        alt="Teacher Tommy" 
        className="w-full h-full object-cover rounded-full"
      />
    </motion.div>
  );
}
