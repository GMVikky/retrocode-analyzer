import React, { useEffect, useRef } from 'react';

export const GlowCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const moveCursor = (e: MouseEvent) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    };

    document.addEventListener('mousemove', moveCursor);

    return () => {
      document.removeEventListener('mousemove', moveCursor);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="fixed w-6 h-6 pointer-events-none z-50 mix-blend-difference"
      style={{
        background: 'radial-gradient(circle, rgba(0, 212, 255, 0.6) 0%, transparent 70%)',
        transform: 'translate(-50%, -50%)',
        transition: 'opacity 0.3s ease'
      }}
    />
  );
};