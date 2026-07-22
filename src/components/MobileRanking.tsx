import React, { useState, useEffect } from "react";
import { ChevronLeft, Trophy, Trash2 } from "lucide-react";

interface Props {
  onBack: () => void;
}

interface RankingEntry {
  name: string;
  score: number;
}

export default function MobileRanking({ onBack }: Props) {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("skate_stopper_global_ranking");
    if (saved) {
      setRanking(JSON.parse(saved));
    }
  }, []);

  const handleClear = () => {
    if (window.confirm("¿Seguro que quieres limpiar a los Local Heroes?")) {
      localStorage.removeItem("skate_stopper_global_ranking");
      setRanking([]);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 items-center justify-start space-y-6 bg-zinc-950 overflow-y-auto relative font-sans pt-4">
      <div className="absolute inset-0 vhs-overlay z-0" />
      
      <button onClick={onBack} className="absolute top-1 left-1 z-10 text-white hover:text-red-500 transition-colors p-5">
        <ChevronLeft className="w-8 h-8" strokeWidth={3} />
      </button>

      <button onClick={handleClear} className="absolute top-4 right-4 z-10 text-white hover:text-red-500 transition-colors p-2">
        <Trash2 className="w-8 h-8" strokeWidth={3} />
      </button>

      <div className="text-center space-y-2 relative z-10 w-full mt-4">
        <div className="flex justify-center mb-4">
          <Trophy className="w-16 h-16 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" strokeWidth={1.5} />
        </div>
        <h1 className="text-5xl font-display text-white drop-shadow-[2px_2px_0_rgba(255,0,0,0.8)] tracking-widest uppercase">
          LOCAL<br/>HEROES
        </h1>
        <p className="text-xl text-green-400 font-bold uppercase tracking-widest mt-2">PLAZA LEGENDS</p>
      </div>

      <div className="w-full relative z-10 space-y-4 mt-8">
        {ranking.length === 0 ? (
          <div className="border-4 border-white/20 p-8 text-center bg-black/50">
            <p className="text-3xl font-display text-white/50 tracking-widest uppercase">NO TAPES YET</p>
            <p className="text-sm font-sans font-bold text-white/40 mt-4 uppercase tracking-widest">GO SKATE!</p>
          </div>
        ) : (
          ranking.map((entry, i) => (
            <div 
              key={i} 
              className="flex justify-between items-center p-3 border-b-2 border-white/20 last:border-b-0 bg-black/30"
            >
              <div className="flex items-center gap-4">
                <span className={`font-display text-3xl w-8 ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-zinc-300' : i === 2 ? 'text-orange-600' : 'text-red-500'}`}>
                  {i + 1}.
                </span>
                <span className="font-sans font-bold text-white text-xl uppercase tracking-wider truncate max-w-[150px]">{entry.name}</span>
              </div>
              <span className="font-sans text-xl text-green-400 font-bold">
                {entry.score} PTS
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
