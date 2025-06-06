import { motion } from "framer-motion";

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
      className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl border-4 border-white relative overflow-hidden"
    >
      {/* Teacher Tommy's face */}
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        {/* Eyes */}
        <div className="flex gap-1 mb-1">
          <div className="w-2 h-2 bg-black rounded-full"></div>
          <div className="w-2 h-2 bg-black rounded-full"></div>
        </div>
        {/* Smile */}
        <div className="w-6 h-3 border-b-2 border-black rounded-b-full"></div>
        {/* Teacher hat */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-3 bg-red-600 rounded-t-lg border-2 border-white"></div>
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-red-600 rounded-full border border-white"></div>
      </div>
    </motion.div>
  );
}
