import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import tommyImage from "@assets/TTommy.png";
import { useIsMobile } from "@/hooks/use-mobile";

interface MascotProps {
  className?: string;
  followCursor?: boolean;
}

export default function Mascot({ className = "", followCursor = false }: MascotProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [avatarPosition, setAvatarPosition] = useState({ x: 0, y: 0 });
  const isMobile = useIsMobile();

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
    if (!followCursor || mousePosition.x === 0 && mousePosition.y === 0) return;
    
    // Calculate the movement with smooth following
    const targetX = mousePosition.x - window.innerWidth / 2;
    const targetY = mousePosition.y - window.innerHeight / 2;
    
    // Limit movement range and apply smoothing
    const maxMove = 50;
    const smoothingFactor = 0.1;
    
    const limitedX = Math.max(-maxMove, Math.min(maxMove, targetX * smoothingFactor));
    const limitedY = Math.max(-maxMove, Math.min(maxMove, targetY * smoothingFactor));
    
    setAvatarPosition({ x: limitedX, y: limitedY });
  }, [mousePosition, followCursor]);

  return (
    <motion.div
      className="mascot-container w-24 h-24 rounded-full flex items-center justify-center shadow-xl border-4 border-white relative overflow-hidden"
      animate={followCursor ? {
        x: avatarPosition.x,
        y: avatarPosition.y,
        rotate: [0, 2, -2, 0]
      } : { 
        y: [0, -10, 0],
        rotate: [0, 2, -2, 0]
      }}
      transition={{ 
        duration: followCursor ? 0.6 : 3,
        repeat: Infinity,
        ease: "easeInOut",
        type: followCursor ? "spring" : "tween",
        stiffness: followCursor ? 100 : undefined,
        damping: followCursor ? 20 : undefined
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