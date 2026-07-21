import React, { useEffect } from "react";
import { motion } from "motion/react";

interface Props {
  showWelcomePopup?: boolean;
  onPopupComplete?: () => void;
  onPlayClips: () => void;
  onCreateClip: () => void;
  onRanking: () => void;
  onStash: () => void;
}

export default function MobileHome({ showWelcomePopup, onPopupComplete, onPlayClips, onCreateClip, onRanking, onStash }: Props) {
  useEffect(() => {
    // If it's a fresh login, we trigger the animation, and after 2.5s we clear the flag so it doesn't re-animate
    if (showWelcomePopup && onPopupComplete) {
      const timer = setTimeout(() => {
        onPopupComplete();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [showWelcomePopup, onPopupComplete]);

  // Framer Motion variants for the "Paperboy Throw" effect
  const paperboyVariants = {
    hidden: { 
      scale: 0.1, 
      y: 800, 
      rotate: -180, 
      opacity: 0 
    },
    visible: { 
      scale: 1, 
      y: 0, 
      rotate: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 70,
        damping: 12,
        mass: 1.2
      }
    },
    idle: {
      scale: 1,
      y: 0,
      rotate: 0,
      opacity: 1
    }
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden bg-black font-sans">
      
      {/* 
        The entire magazine container is animated if showWelcomePopup is true.
        Otherwise, it stays idle.
      */}
      <motion.div 
        variants={paperboyVariants}
        initial={showWelcomePopup ? "hidden" : "idle"}
        animate="visible"
        className="absolute inset-0 z-20 flex flex-col"
      >
        {/* Magazine Background Cover */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 filter contrast-125 brightness-75"
          style={{ backgroundImage: 'url("./skate_cover.png")' }}
        />

        {/* Grunge Vignette/Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 z-10 pointer-events-none" />

        {/* Magazine Content Layer */}
        <div className="z-30 w-full h-full flex flex-col justify-between p-4 relative">
          
          {/* Magazine Header - Transworld Aesthetic */}
          <div className="w-full text-center mt-2 border-b-4 border-white pb-2">
            <div className="flex justify-between items-end px-1 mb-1">
              <span className="text-[9px] text-black font-bold tracking-widest bg-white px-1 uppercase">EST. 1999</span>
              <span className="text-[9px] text-black font-bold tracking-widest bg-white px-1 uppercase">ISSUE #1</span>
            </div>
            <h1 
              className="text-6xl text-white leading-none tracking-tighter uppercase"
              style={{ 
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontWeight: 900,
                transform: 'scaleY(1.2)',
                marginTop: '0.2rem'
              }}
            >
              SKATE STOPPER
            </h1>
            <p className="text-white font-sans font-bold text-[10px] tracking-[0.3em] uppercase mt-3 opacity-90">
              The pure skateboarding experience
            </p>
          </div>
          
          {/* Interactive Headlines (Buttons) - Clean Editorial Layout */}
          <div className="flex-1 relative mt-10">
            
            {/* Main Article (Play Tape) */}
            <button 
              onClick={() => {
                onPlayClips();
              }}
              className="absolute top-4 left-0 w-full text-left group"
            >
              <div className="bg-white/90 backdrop-blur-sm text-black font-sans font-black text-4xl uppercase px-4 py-2 border-l-8 border-red-600 transition-colors group-hover:bg-red-600 group-hover:text-white">
                PLAY THE TAPE
              </div>
              <div className="bg-black/80 text-white font-sans font-bold text-xs px-4 py-1 inline-block uppercase tracking-widest">
                Can you guess the trick?
              </div>
            </button>

            {/* Secondary Article (Sponsor Me Tape) */}
            <button 
              onClick={() => {
                onCreateClip();
              }}
              className="absolute top-36 right-0 w-11/12 text-right group flex flex-col items-end"
            >
              <div className="bg-black/90 backdrop-blur-sm text-white font-sans font-black text-3xl uppercase px-4 py-2 border-r-8 border-yellow-500 transition-colors group-hover:bg-yellow-500 group-hover:text-black">
                SEND YOUR TAPE
              </div>
              <div className="bg-white/90 text-black font-sans font-bold text-xs px-4 py-1 inline-block uppercase tracking-widest">
                The OG will judge you
              </div>
            </button>

            {/* Bottom Article (Ranking) */}
            <button 
              onClick={() => {
                onRanking();
              }}
              className="absolute top-72 left-0 w-full text-left group"
            >
              <div className="text-white font-sans font-black text-4xl uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-none mb-1 group-hover:text-yellow-400 transition-colors">
                LOCAL HEROES<br/>REVEALED
              </div>
              <div className="bg-red-600/90 text-white font-sans font-bold text-xs px-3 py-1 inline-block uppercase tracking-widest">
                Who runs the plaza?
              </div>
            </button>
            {/* Bottom Article (Stash) */}
            <button 
              onClick={() => {
                onStash();
              }}
              className="absolute top-[360px] right-0 w-11/12 text-right group flex flex-col items-end"
            >
              <div className="bg-black/90 backdrop-blur-sm text-white font-sans font-black text-2xl uppercase px-4 py-2 border-r-8 border-green-500 transition-colors group-hover:bg-green-500 group-hover:text-black">
                FOOTY MANAGEMENT
              </div>
              <div className="bg-white/90 text-black font-sans font-bold text-xs px-4 py-1 inline-block uppercase tracking-widest">
                Edit & Export Stash
              </div>
            </button>
            
          </div>
          
          {/* Magazine Barcode & Footer details */}
          <div className="absolute bottom-0 right-0 bg-white p-1.5 flex flex-col items-center border-2 border-black z-40">
            {/* Fake Barcode */}
            <div className="flex h-8 items-end gap-[1.5px]">
              <div className="w-1 h-full bg-black"></div>
              <div className="w-0.5 h-full bg-black"></div>
              <div className="w-1.5 h-full bg-black"></div>
              <div className="w-0.5 h-full bg-black"></div>
              <div className="w-1 h-full bg-black"></div>
              <div className="w-0.5 h-6 bg-black"></div>
              <div className="w-2 h-full bg-black"></div>
              <div className="w-0.5 h-full bg-black"></div>
              <div className="w-1 h-6 bg-black"></div>
              <div className="w-1.5 h-full bg-black"></div>
              <div className="w-0.5 h-full bg-black"></div>
              <div className="w-1 h-full bg-black"></div>
            </div>
            <span className="text-[8px] font-mono text-black font-bold tracking-widest mt-0.5">
              4 11099 666
            </span>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
