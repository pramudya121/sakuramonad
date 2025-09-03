import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  type: 'sakura' | 'snow';
  rotation: number;
  rotationSpeed: number;
}

export const SakuraBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticle = (type: 'sakura' | 'snow'): Particle => {
      return {
        x: Math.random() * canvas.width,
        y: -20,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 2 + 1,
        size: type === 'sakura' ? Math.random() * 8 + 4 : Math.random() * 4 + 2,
        opacity: Math.random() * 0.8 + 0.2,
        type,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
      };
    };

    const initParticles = () => {
      particlesRef.current = [];
      // Add sakura petals (pink)
      for (let i = 0; i < 30; i++) {
        particlesRef.current.push(createParticle('sakura'));
      }
      // Add snow (white)
      for (let i = 0; i < 20; i++) {
        particlesRef.current.push(createParticle('snow'));
      }
    };

    const drawSakuraPetal = (ctx: CanvasRenderingContext2D, particle: Particle) => {
      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);
      ctx.globalAlpha = particle.opacity;

      // Create gradient for sakura petal
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size);
      gradient.addColorStop(0, '#ffb3d9');
      gradient.addColorStop(0.5, '#ff80cc');
      gradient.addColorStop(1, '#ff4db3');

      ctx.fillStyle = gradient;
      
      // Draw petal shape
      ctx.beginPath();
      ctx.ellipse(0, 0, particle.size, particle.size * 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Add petal details
      ctx.fillStyle = '#ff99d6';
      ctx.beginPath();
      ctx.ellipse(0, -particle.size * 0.3, particle.size * 0.3, particle.size * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const drawSnowflake = (ctx: CanvasRenderingContext2D, particle: Particle) => {
      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);
      ctx.globalAlpha = particle.opacity;
      
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 4;
      ctx.shadowColor = '#ffffff';
      
      // Simple snowflake
      ctx.beginPath();
      ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Add sparkle effect
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-particle.size, 0);
      ctx.lineTo(particle.size, 0);
      ctx.moveTo(0, -particle.size);
      ctx.lineTo(0, particle.size);
      ctx.stroke();

      ctx.restore();
    };

    const updateParticles = () => {
      particlesRef.current.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotation += particle.rotationSpeed;

        // Add gentle swaying motion
        particle.vx += Math.sin(particle.y * 0.01) * 0.02;

        // Reset particle if it goes off screen
        if (particle.y > canvas.height + 20 || particle.x < -20 || particle.x > canvas.width + 20) {
          particlesRef.current[index] = createParticle(particle.type);
        }

        // Fade out near bottom
        if (particle.y > canvas.height * 0.8) {
          particle.opacity *= 0.98;
        }
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      updateParticles();
      
      particlesRef.current.forEach(particle => {
        if (particle.type === 'sakura') {
          drawSakuraPetal(ctx, particle);
        } else {
          drawSnowflake(ctx, particle);
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    initParticles();
    animate();

    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Background gradient */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-purple-900/20 via-pink-900/10 to-blue-900/20" />
      
      {/* Animated canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'transparent' }}
      />
    </>
  );
};