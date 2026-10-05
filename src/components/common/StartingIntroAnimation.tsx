import React, { useState, useEffect, useRef } from 'react';

interface StartingIntroAnimationProps {
  onComplete: () => void;
}

export const StartingIntroAnimation: React.FC<StartingIntroAnimationProps> = ({ onComplete }) => {
  const [isFading, setIsFading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const completedRef = useRef(false);

  const handleFinish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    setIsFading(true);
    setTimeout(() => {
      onComplete();
    }, 700); // Smooth 700ms fade transition
  };

  useEffect(() => {
    // 5-second animation timer
    const timer = setTimeout(() => {
      handleFinish();
    }, 5000);

    // Play video automatically on mount
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch((err) => {
        console.warn('Intro video playback notice:', err);
      });
    }

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div 
      className={`fixed inset-0 w-screen h-screen z-[999999] bg-black flex items-center justify-center overflow-hidden transition-all duration-700 ease-in-out ${
        isFading ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Fullscreen Desktop Intro Animation Video */}
      <video
        ref={videoRef}
        src="/presentation_evaluator_refined_5sec.mp4"
        autoPlay
        muted
        playsInline
        onEnded={handleFinish}
        className="w-full h-full object-cover select-none pointer-events-none"
      />
    </div>
  );
};
