import React, { useEffect, useState } from 'react';

export default function CursorGlow() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return !window.matchMedia('(hover: hover)').matches;
      } catch (e) {
        return true;
      }
    }
    return true;
  });

  useEffect(() => {
    const checkViewportAndTouch = () => {
      try {
        const worksWithHover = window.matchMedia('(hover: hover)').matches;
        setIsMobile(!worksWithHover);
      } catch (e) {
        setIsMobile(true);
      }
    };

    window.addEventListener('resize', checkViewportAndTouch);

    if (isMobile) {
      return () => {
        window.removeEventListener('resize', checkViewportAndTouch);
      };
    }

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setVisible(true);
    };

    const handleMouseLeave = () => {
      setVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('resize', checkViewportAndTouch);
      window.removeEventListener('mousemove', handleMouseMove);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isMobile]);

  if (isMobile || !visible) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-50 mix-blend-screen transition-opacity duration-700"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none duration-100 ease-out"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '320px',
          height: '320px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 30%, transparent 70%)',
          transition: 'left 0.1s ease-out, top 0.1s ease-out',
        }}
      />
    </div>
  );
}
