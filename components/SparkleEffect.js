'use client';

import { useEffect } from 'react';

export default function SparkleEffect() {
  useEffect(() => {
    const createSparkle = (e) => {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle';
      
      const x = e.clientX;
      const y = e.clientY;
      
      sparkle.style.left = x + 'px';
      sparkle.style.top = y + 'px';
      
      const colors = ['#ff4d4d', '#ff9d9d', '#ffbdbd', '#ff6b6b', '#ffd93d', '#ff6b9d', '#c44569'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      sparkle.style.setProperty('--sparkle-color', randomColor);
      
      document.body.appendChild(sparkle);
      
      setTimeout(() => {
        sparkle.remove();
      }, 1000);
    };

    document.addEventListener('click', createSparkle);
    
    return () => {
      document.removeEventListener('click', createSparkle);
    };
  }, []);

  return null;
}

