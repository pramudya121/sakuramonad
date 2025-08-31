import React, { useEffect, useRef } from 'react';
import sakuraBg from '@/assets/sakura-winter-bg.jpg';

export const SakuraBackground: React.FC = () => {
  const petalsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const createPetal = () => {
      if (!petalsRef.current) return;

      const petal = document.createElement('div');
      petal.className = 'sakura-petal';
      
      const size = Math.random() * 6 + 4; // 4-10px
      const startPosition = Math.random() * window.innerWidth;
      const animationDuration = Math.random() * 5 + 8; // 8-13 seconds
      const delay = Math.random() * 2; // 0-2 seconds delay
      
      petal.style.cssText = `
        left: ${startPosition}px;
        width: ${size}px;
        height: ${size}px;
        animation-duration: ${animationDuration}s;
        animation-delay: ${delay}s;
        opacity: ${Math.random() * 0.6 + 0.3};
      `;
      
      petalsRef.current.appendChild(petal);
      
      // Remove petal after animation
      setTimeout(() => {
        if (petal.parentNode) {
          petal.parentNode.removeChild(petal);
        }
      }, (animationDuration + delay) * 1000);
    };

    // Create initial petals
    for (let i = 0; i < 15; i++) {
      setTimeout(() => createPetal(), i * 200);
    }

    // Continue creating petals
    const interval = setInterval(createPetal, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${sakuraBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'brightness(0.7) contrast(1.1)',
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-background/40 via-background/60 to-background/80" />
      
      {/* Sakura Petals Container */}
      <div ref={petalsRef} className="sakura-petals" />
    </>
  );
};