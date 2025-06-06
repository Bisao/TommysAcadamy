import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import tommyImage from "@assets/TTommy.png";
import { useIsMobile } from "@/hooks/use-mobile";

interface MascotProps {
  className?: string;
  followCursor?: boolean;
}

export default function Mascot({ className = "", followCursor = false }: MascotProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const isMobile = useIsMobile();

  const handleBlink = () => {
    setIsBlinking(true);
    setTimeout(() => setIsBlinking(false), 200);
  };

    useEffect(() => {
    if (!followCursor) return;

    const handleMouseMove = (e: MouseEvent) => {
      const mascotElement = document.querySelector('.mascot-container');
      if (!mascotElement) return;

      const rect = mascotElement.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      // Limit eye movement range
      const maxMove = 8;
      const eyeX = Math.max(-maxMove, Math.min(maxMove, deltaX / 20));
      const eyeY = Math.max(-maxMove, Math.min(maxMove, deltaY / 20));

      setEyePosition({ x: eyeX, y: eyeY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [followCursor]);

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
        {/* Interactive eyes overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Left eye */}
            <motion.div
              className="absolute w-1 h-1 bg-black rounded-full"
              style={{
                left: `${-8 + eyePosition.x}px`,
                top: `${-2 + eyePosition.y}px`,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
            {/* Right eye */}
            <motion.div
              className="absolute w-1 h-1 bg-black rounded-full"
              style={{
                left: `${8 + eyePosition.x}px`,
                top: `${-2 + eyePosition.y}px`,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}