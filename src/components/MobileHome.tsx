import React, { useEffect } from "react";
import { motion } from "motion/react";
import { Volume2, VolumeX } from "lucide-react";

interface Props {
  showWelcomePopup?: boolean;
  onPopupComplete?: () => void;
  onPlayClips: () => void;
  onCreateClip: () => void;
  onRanking: () => void;
  onStash: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

export default function MobileHome({ showWelcomePopup, onPopupComplete, onPlayClips, onCreateClip, onRanking, onStash, isMuted, onToggleMute }: Props) {
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
        <img 
          src={`${import.meta.env.BASE_URL}skate_cover.png`} 
          alt="Skate Cover" 
          className="absolute inset-0 w-full h-full object-cover z-0 filter contrast-125 brightness-75 pointer-events-none"
        />

        {/* Grunge Vignette/Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 z-10 pointer-events-none" />

        {/* Mute/Unmute Music Toggle */}
        {onToggleMute && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleMute();
            }}
            className="absolute top-3 right-3 z-50 p-2 bg-black/90 border-2 border-white text-white hover:bg-white hover:text-black transition-transform active:scale-95 shadow-[3px_3px_0px_#000] flex items-center justify-center gap-1.5 text-xs font-sans font-bold uppercase tracking-wider cursor-pointer"
            title={isMuted ? "Enable music" : "Disable music"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-green-400" />}
            <span>{isMuted ? "MUTED" : "MUSIC"}</span>
          </button>
        )}

        {/* Magazine Content Layer */}
        <div className="z-30 w-full h-full flex flex-col justify-between p-4 relative">
          
          {/* Magazine Header - Transworld Aesthetic */}
          <div className="w-full text-center mt-2 border-b-4 border-white pb-2">
            <div className="flex justify-between items-end px-1 mb-1">
              <span className="text-[9px] text-black font-bold tracking-widest bg-white px-1 uppercase">EST. 1989</span>
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
          
          {/* Interactive Headlines (Buttons) - Fluid Responsive Editorial Layout */}
          <div className="flex-1 flex flex-col justify-between py-3 my-1 relative z-30">
            
            {/* Main Article (Play Tape) */}
            <button 
              onClick={() => {
                onPlayClips();
              }}
              className="w-full text-left group"
            >
              <div className="bg-white/90 backdrop-blur-sm text-black font-sans font-black text-4xl sm:text-5xl uppercase px-5 py-3 border-l-8 border-red-600 transition-colors group-hover:bg-red-600 group-hover:text-white inline-block">
                PLAY THE TAPE
              </div>
              <div className="bg-black/80 text-white font-sans font-bold text-[13px] px-4 py-1 block w-max uppercase tracking-widest mt-0.5">
                Can you guess the trick?
              </div>
            </button>

            {/* Secondary Article (Sponsor Me Tape) */}
            <button 
              onClick={() => {
                onCreateClip();
              }}
              className="w-full text-right group flex flex-col items-end"
            >
              <div className="bg-black/90 backdrop-blur-sm text-white font-sans font-black text-3xl sm:text-4xl uppercase px-5 py-2 border-r-8 border-yellow-500 transition-colors group-hover:bg-yellow-500 group-hover:text-black inline-block">
                SEND YOUR TAPE
              </div>
              <div className="bg-white/90 text-black font-sans font-bold text-[12px] px-4 py-1 inline-block uppercase tracking-widest mt-0.5">
                The OG will judge you
              </div>
            </button>

            {/* Bottom Article (Ranking) */}
            <button 
              onClick={() => {
                onRanking();
              }}
              className="w-full text-left group"
            >
              <div className="text-white font-sans font-black text-4xl sm:text-5xl uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] leading-none mb-1.5 group-hover:text-yellow-400 transition-colors">
                LOCAL HEROES<br/>REVEALED
              </div>
              <div className="bg-red-600/90 text-white font-sans font-bold text-[12px] px-3 py-1 inline-block uppercase tracking-widest">
                Who runs the plaza?
              </div>
            </button>

            {/* Bottom Article (Stash) */}
            <button 
              onClick={() => {
                onStash();
              }}
              className="w-full text-right group flex flex-col items-end"
            >
              <div className="bg-black/90 backdrop-blur-sm text-white font-sans font-black text-2xl sm:text-3xl uppercase px-4 py-2 border-r-8 border-green-500 transition-colors group-hover:bg-green-500 group-hover:text-black inline-block">
                FOOTY MANAGEMENT
              </div>
              <div className="bg-white/90 text-black font-sans font-bold text-[12px] px-4 py-1 inline-block uppercase tracking-widest mt-0.5">
                Edit & Export Stash
              </div>
            </button>
            
          </div>
          
          {/* Magazine Barcode (Lower Left - Vintage Print Overlay & Precise Digit Alignment) */}
          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm p-1 border border-black/80 z-40 shadow-[1px_1px_0px_#000] flex flex-col items-center">
            {/* Fake Barcode */}
            <div className="flex h-6 items-end gap-[1.5px] px-1">
              <div className="w-1 h-full bg-black"></div>
              <div className="w-0.5 h-full bg-black"></div>
              <div className="w-1.5 h-full bg-black"></div>
              <div className="w-0.5 h-full bg-black"></div>
              <div className="w-1 h-full bg-black"></div>
              <div className="w-0.5 h-4 bg-black"></div>
              <div className="w-1.5 h-full bg-black"></div>
              <div className="w-0.5 h-full bg-black"></div>
              <div className="w-1 h-4 bg-black"></div>
              <div className="w-1.5 h-full bg-black"></div>
              <div className="w-0.5 h-full bg-black"></div>
              <div className="w-1 h-full bg-black"></div>
            </div>
            <div className="flex w-full justify-between px-0.5 text-[8px] font-mono text-black font-bold leading-none mt-0.5">
              <span>4</span>
              <span className="tracking-[0.15em]">7014</span>
              <span>666</span>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
