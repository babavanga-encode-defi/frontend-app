import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CircularTimerProps {
  duration: number;
  onComplete: () => void;
}

const CircularTimer = ({ duration, onComplete }: CircularTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [currentMeme, setCurrentMeme] = useState(0);
  
  const memes = [
    "Building in the Mile High City... 🏔️",
    "Spork you, I'm going in... 🥄",
    "Bufficorn spotted... 🦬",
    "ETHDenver vibes... 🎿",
    "Altitude.tech... ⛰️",
    "Ser, more coffee needed... ☕",
    "Consensus was mid... 👀",
    "Wen hackathon... 🧑‍💻",
    "Surviving 5430ft... 🗻",
    "Looking for frens... 🫂",
    "Casa Bonita after party... 🎉",
    "Touching snow while waiting... ❄️",
    "High altitude, higher vibes... 🚀",
    "Wen Bufficorn NFT... 🎨",
  ];

  useEffect(() => {
    if (timeLeft === 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    const memeTimer = setInterval(() => {
      setCurrentMeme(prev => (prev + 1) % memes.length);
    }, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(memeTimer);
    };
  }, [timeLeft, onComplete, memes.length]);

  const progress = ((duration - timeLeft) / duration) * 100;
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative flex flex-col items-center p-16">
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(circle at center, #DB9AFF 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <div className="relative">
          {/* Purple glow effect with padding */}
          <div className="absolute -inset-8 blur-xl bg-[#DB9AFF] opacity-20 rounded-full" />
          
          <svg className="transform -rotate-90 w-32 h-32 relative">
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke="#1a1a1a"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke="#DB9AFF"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl font-bold text-white"
            >
              {timeLeft}s
            </motion.div>
          </div>
        </div>

        <div className="mt-8 text-center relative z-10">
          <div className="text-xl font-bold text-white mb-2">
            Creating NO Contract in progress...
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMeme}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-white/70 min-h-[24px] flex items-center justify-center"
            >
              {memes[currentMeme]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CircularTimer; 