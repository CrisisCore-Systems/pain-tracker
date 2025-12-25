import React from 'react';
import './BlackBoxSplashScreen.css';

interface BlackBoxSplashScreenProps {
  message?: string;
}

export const BlackBoxSplashScreen: React.FC<BlackBoxSplashScreenProps> = ({ 
  message = "Localizing Database... Air-Gap Active" 
}) => {
  return (
    <div className="fixed inset-0 w-full h-full bg-[#050505] flex items-center justify-center overflow-hidden z-50 font-mono">
      <div className="glitch-container">
        <div className="glitch-logo"></div>
        <div className="absolute -bottom-10 w-full text-center text-[#00F3FF] text-xs tracking-[2px] uppercase opacity-60">
          {message}
        </div>
      </div>
    </div>
  );
};
