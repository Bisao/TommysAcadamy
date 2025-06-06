import { motion } from "framer-motion";
import tommyImage from "@assets/TTommy.png";

export default function Mascot() {
  return (
    <motion.div
      className="mascot-container w-24 h-24 rounded-full flex items-center justify-center shadow-xl border-4 border-white relative overflow-hidden"
      animate={{ 
        y: [0, -10, 0],
        rotate: [0, 2, -2, 0]
      }}
      transition={{ 
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <div className="relative w-full h-full">
        <img 
          src={tommyImage} 
          alt="Teacher Tommy" 
          className="w-full h-full object-cover rounded-full"
        />
      </div>
    </motion.div>
  );
}