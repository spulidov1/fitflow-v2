import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const FitFlowRunner = () => {
  const [angle, setAngle] = useState(0);
  const [frame, setFrame] = useState(0);

  // Rotate runner around logo
  useEffect(() => {
    const timer = setInterval(() => {
      setAngle(a => (a + 0.02) % (Math.PI * 2));
    }, 30);
    return () => clearInterval(timer);
  }, []);

  // Animate run cycle
  useEffect(() => {
    const timer = setInterval(() => {
      setFrame(f => (f + 1) % 8);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Position on circle - ADJUSTED FOR WEB
  const containerWidth = typeof window !== 'undefined' ? Math.min(900, window.innerWidth - 32) : 900;
  const scale = containerWidth / 900;
  const radius = 280 * scale;
  
  // Move runner left and up on desktop
  const centerX = (containerWidth / 2) - 80; // 80px left
  const centerY = (350 * scale) - 50;          // 50px up
  
  const x = centerX + radius * Math.cos(angle - Math.PI / 2);
  const y = centerY + radius * Math.sin(angle - Math.PI / 2);

  // Detailed pixel runner sprite
  const PixelRunner = ({ frame }) => {
    const cycle = frame % 8;
    
    const legStates = [
      { left: { y: 20, h: 8 }, right: { y: 18, h: 10 } },
      { left: { y: 19, h: 9 }, right: { y: 19, h: 9 } },
      { left: { y: 18, h: 10 }, right: { y: 20, h: 8 } },
      { left: { y: 19, h: 9 }, right: { y: 19, h: 9 } },
      { left: { y: 20, h: 8 }, right: { y: 18, h: 10 } },
      { left: { y: 19, h: 9 }, right: { y: 19, h: 9 } },
      { left: { y: 18, h: 10 }, right: { y: 20, h: 8 } },
      { left: { y: 19, h: 9 }, right: { y: 19, h: 9 } },
    ];
    
    const armStates = [
      { left: 13, right: 15 },
      { left: 14, right: 14 },
      { left: 15, right: 13 },
      { left: 14, right: 14 },
      { left: 13, right: 15 },
      { left: 14, right: 14 },
      { left: 15, right: 13 },
      { left: 14, right: 14 },
    ];

    const legs = legStates[cycle];
    const arms = armStates[cycle];

    return (
      <svg width="64" height="64" viewBox="0 0 32 32" style={{ imageRendering: 'pixelated' }}>
        <ellipse cx="16" cy="30" rx="8" ry="2" fill="black" opacity="0.3" />
        <circle cx="16" cy="6" r="4.5" fill="#fbbf24" />
        <circle cx="14" cy="5" r="1.2" fill="#1f2937" />
        <circle cx="18" cy="5" r="1.2" fill="#1f2937" />
        <circle cx="14.3" cy="4.7" r="0.5" fill="white" opacity="0.8" />
        <circle cx="18.3" cy="4.7" r="0.5" fill="white" opacity="0.8" />
        <path d="M 13 7 Q 16 8 19 7" stroke="#1f2937" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        <rect x="13" y="2" width="6" height="2.5" fill="#92400e" rx="1" />
        <rect x="12" y="2.5" width="2" height="2" fill="#92400e" />
        <rect x="18" y="2.5" width="2" height="2" fill="#92400e" />
        <rect x="15" y="10" width="2" height="2" fill="#fbbf24" />
        <rect x="13" y="12" width="6" height="3" fill="#3b82f6" rx="0.5" />
        <rect x="12" y="15" width="8" height="3" fill="#2563eb" rx="0.5" />
        <rect x="10" y={arms.left} width="2" height="5" fill="#fbbf24" />
        <circle cx="11" cy={arms.left + 5.5} r="1.2" fill="#fde68a" />
        <rect x="20" y={arms.right} width="2" height="5" fill="#fbbf24" />
        <circle cx="21" cy={arms.right + 5.5} r="1.2" fill="#fde68a" />
        <rect x="13" y="18" width="6" height="2" fill="#1e40af" rx="0.3" />
        <rect x="13" y={legs.left.y} width="3" height={legs.left.h} fill="#fbbf24" />
        <rect x="12" y={legs.left.y + legs.left.h} width="4" height="2" fill="#1f2937" rx="0.5" />
        <rect x="12.5" y={legs.left.y + legs.left.h + 0.5} width="2" height="0.8" fill="white" opacity="0.6" />
        <rect x="16" y={legs.right.y} width="3" height={legs.right.h} fill="#fbbf24" />
        <rect x="16" y={legs.right.y + legs.right.h} width="4" height="2" fill="#1f2937" rx="0.5" />
        <rect x="16.5" y={legs.right.y + legs.right.h + 0.5} width="2" height="0.8" fill="white" opacity="0.6" />
      </svg>
    );
  };

  return (
    <div className="w-full px-4 py-8 flex items-center justify-center">
      <div className="relative" style={{ 
        width: '100%',
        maxWidth: '900px',
        height: '700px'
      }}>
        
        {/* Premium FitFlow Logo - BACK 0.5 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute z-10"
          style={{
  left: typeof window !== 'undefined' && window.innerWidth > 768 ? '200px' : '150px',
  top: typeof window !== 'undefined' && window.innerWidth > 768 ? '130px' : '150px',
}}
        >
          <div className="absolute inset-0 -m-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-3xl opacity-20 animate-pulse" />
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl" />
            
            <div className="relative px-8 sm:px-12 md:px-16 py-6 sm:py-8 md:py-12">
              <div className="relative mb-3 sm:mb-4 md:mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl blur-xl opacity-50" />
                <div className="relative text-5xl sm:text-7xl md:text-9xl filter drop-shadow-2xl">💪</div>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 blur-lg opacity-50" />
                
                <h1 className="relative text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter" style={{
                  WebkitTextStroke: '2px rgba(0, 0, 0, 0.8)',
                  paintOrder: 'stroke fill',
                }}>
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl">
                    FIT
                  </span>
                  <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent drop-shadow-2xl">
                    FLOW
                  </span>
                </h1>
              </div>
              
              <p className="mt-2 sm:mt-3 md:mt-4 text-sm sm:text-lg md:text-xl font-semibold text-white/80 tracking-wide text-center">
                Your Fitness Journey
              </p>
              
              <div className="flex justify-center gap-2 mt-3 sm:mt-4 md:mt-6">
                <div className="w-8 sm:w-10 md:w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                <div className="w-8 sm:w-10 md:w-12 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Circular path visualization - REMOVED */}

        {/* Pixel runner */}
        <motion.div
          className="absolute z-50"
          style={{
            left: `${x}px`,
            top: `${y}px`,
            transform: `translate(-50%, -50%) rotate(${angle + Math.PI / 2}rad) scale(1.5)`,
          }}
          animate={{
            scale: [1.5, 1.55, 1.5],
          }}
          transition={{
            duration: 0.3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <PixelRunner frame={frame} />
        </motion.div>

        {/* Sparkles */}
        {[...Array(6)].map((_, i) => {
          const sparkleAngle = (i / 6) * Math.PI * 2;
          const sparkleRadius = 320 * scale;
          const sparkleX = centerX + sparkleRadius * Math.cos(sparkleAngle);
          const sparkleY = centerY + sparkleRadius * Math.sin(sparkleAngle);
          
          return (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full"
              style={{
                left: `${sparkleX}px`,
                top: `${sparkleY}px`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default FitFlowRunner;
