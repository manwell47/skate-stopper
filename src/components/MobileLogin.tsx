import React, { useState } from "react";
import { Play } from "lucide-react";
import { motion } from "motion/react";

interface Props {
  onLogin: (alias: string) => void;
}

export default function MobileLogin({ onLogin }: Props) {
  const [alias, setAlias] = useState(() => localStorage.getItem("skate_stopper_alias") || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (alias.trim()) {
      localStorage.setItem("skate_stopper_alias", alias.trim());
      onLogin(alias.trim());
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-zinc-950 font-sans">
      {/* VX1000 Overlay Base */}
      <div className="absolute inset-0 z-10 pointer-events-none fisheye-container border-[20px] border-black/90">
        <div className="absolute top-4 left-6 text-red-500 font-bold text-2xl flex items-center gap-2 drop-shadow-[0_0_8px_rgba(255,0,0,0.8)]">
          <div className="w-4 h-4 bg-red-500 rounded-full animate-rec-blink" />
          REC
        </div>
        <div className="absolute top-4 right-6 text-white font-bold text-2xl font-sans drop-shadow-md flex flex-col items-end">
          <div className="flex gap-1 mb-1 animate-battery-blink">
            <div className="w-3 h-5 border-2 border-white" />
            <div className="w-8 h-5 border-2 border-white bg-white" />
          </div>
          <span>SP</span>
        </div>
        <div className="absolute bottom-6 left-6 text-white font-bold text-3xl font-sans drop-shadow-md">
          12:43:08
        </div>
        <div className="absolute bottom-6 right-6 text-white font-bold text-2xl font-sans drop-shadow-md">
          OCT 18 1999
        </div>
        {/* Safe area lines */}
        <div className="absolute top-[10%] left-[10%] right-[10%] bottom-[10%] border border-white/20" />
        <div className="absolute top-1/2 left-[8%] right-[8%] h-px bg-white/20" />
        <div className="absolute left-1/2 top-[8%] bottom-[8%] w-px bg-white/20" />
      </div>

      <div className="absolute inset-0 vhs-overlay z-20" />

      {/* Main Content */}
      <div className="z-30 w-full max-w-sm px-8 space-y-12">
        <motion.div 
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 1 }}
          className="text-center space-y-4"
        >
          <h1 className="text-6xl font-display text-white drop-shadow-[2px_2px_0_rgba(255,0,0,0.8)] tracking-wider">
            SKATE<br/>STOPPER
          </h1>
          <p className="text-2xl font-sans text-green-400 font-bold uppercase tracking-widest drop-shadow-[0_0_5px_rgba(0,255,0,0.5)]">
            Insert Tape
          </p>
        </motion.div>
        
        <form onSubmit={handleSubmit} className="w-full space-y-8 relative">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <label className="block text-white/50 text-sm mb-2 font-mono uppercase tracking-widest">Local Alias:</label>
            <input 
              type="text" 
              value={alias}
              onChange={e => setAlias(e.target.value)}
              placeholder="e.g. Muska"
              maxLength={15}
              className="w-full bg-transparent border-b-2 border-white/50 text-4xl text-center text-white focus:outline-none focus:border-red-500 font-sans tracking-widest placeholder:text-white/20 transition-colors uppercase"
            />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex justify-center"
          >
            <button 
              type="submit"
              disabled={!alias.trim()}
              className="sticker-button disabled:opacity-50 disabled:grayscale transition-transform px-8 py-4 bg-white torn-edge"
            >
              <div className="bg-red-600 text-white font-display text-4xl px-4 py-1 transform -rotate-2 flex items-center gap-2">
                <Play className="w-8 h-8 fill-white" />
                PLAY
              </div>
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
