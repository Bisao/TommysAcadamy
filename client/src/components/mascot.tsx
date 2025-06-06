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
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        setMousePosition({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [followCursor]);

  useEffect(() => {
    if (!followCursor) return;
    
    const mascotElement = document.querySelector('.mascot-container');
    if (mascotElement && mousePosition.x !== 0 && mousePosition.y !== 0) {
      const rect = mascotElement.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = mousePosition.x - centerX;
      const deltaY = mousePosition.y - centerY;
      
      // Limit eye movement range
      const maxMove = 8;
      const eyeX = Math.max(-maxMove, Math.min(maxMove, deltaX / 20));
      const eyeY = Math.max(-maxMove, Math.min(maxMove, deltaY / 20));
      
      setEyePosition({ x: eyeX, y: eyeY });
    }
  }, [mousePosition, followCursor]);

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
        {followCursor && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative">
              {/* Left eye background */}
              <div 
                className="absolute w-3 h-3 bg-white rounded-full border border-gray-300"
                style={{
                  left: `${-10}px`,
                  top: `${-4}px`,
                }}
              />
              {/* Right eye background */}
              <div 
                className="absolute w-3 h-3 bg-white rounded-full border border-gray-300"
                style={{
                  left: `${6}px`,
                  top: `${-4}px`,
                }}
              />
              {/* Left pupil */}
              <motion.div
                className="absolute w-1.5 h-1.5 bg-black rounded-full z-10"
                style={{
                  left: `${-8.5 + eyePosition.x}px`,
                  top: `${-2.5 + eyePosition.y}px`,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />
              {/* Right pupil */}
              <motion.div
                className="absolute w-1.5 h-1.5 bg-black rounded-full z-10"
                style={{
                  left: `${7.5 + eyePosition.x}px`,
                  top: `${-2.5 + eyePosition.y}px`,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}