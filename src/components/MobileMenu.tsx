import React, { useState } from "react";
import { LineData } from "../types";
import { Play, ChevronLeft, Video, Trophy, X, Trash2 } from "lucide-react";

interface Props {
  lines: LineData[];
  onPlay: (line: LineData) => void;
  onBack: () => void;
}

export default function MobileMenu({ lines, onPlay, onBack }: Props) {
  const [activeRankingLine, setActiveRankingLine] = useState<LineData | null>(null);

  const getVideoRanking = (line: LineData): {name: string, score: number}[] => {
    const key = `skate_stopper_ranking_${line.videoId}_${line.clipStartTime}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  };

  return (
    <div 
      className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto bg-zinc-950 relative font-sans pt-4 pb-24"
    >
      <div className="absolute inset-0 vhs-overlay z-0" />

      <button onClick={onBack} className="absolute top-1 left-1 z-10 text-white hover:text-red-500 transition-colors p-5">
        <ChevronLeft className="w-8 h-8" strokeWidth={3} />
      </button>

      <div className="text-center space-y-2 relative z-10 w-full mt-4">
        <div className="flex justify-center mb-4">
          <Video className="w-16 h-16 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" strokeWidth={1.5} />
        </div>
        <h1 className="text-5xl font-display text-white drop-shadow-[2px_2px_0_rgba(255,0,0,0.8)] tracking-widest uppercase">
          TAPE<br/>STASH
        </h1>
        <p className="text-xl text-green-400 font-bold uppercase tracking-widest mt-2">YOUR CLIPS</p>
      </div>

      <div className="relative z-10 w-full space-y-4">
        {lines.length === 0 ? (
          <div className="border-4 border-white/20 p-8 text-center bg-black/50 w-full">
            <p className="text-2xl font-display text-white/50 tracking-widest uppercase">EMPTY STASH</p>
            <p className="text-sm font-sans font-bold text-white/40 mt-4 uppercase tracking-widest">GO BACK AND SEND A TAPE</p>
          </div>
        ) : (
          lines.map((line, i) => {
            const ranking = getVideoRanking(line);
            return (
              <div key={i} className="bg-black/80 border-4 border-white p-4 flex flex-col justify-between shadow-[4px_4px_0_0_rgba(255,0,0,0.8)] relative group transform transition-transform hover:-translate-y-1">
                
                {/* Top-Right Podium Button */}
                <div className="absolute top-3 right-3 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveRankingLine(line);
                    }}
                    className={`px-2.5 py-1 flex items-center gap-1.5 font-sans font-bold text-[10px] uppercase border transition-transform hover:scale-105 shadow-[2px_2px_0px_#000] cursor-pointer ${
                      ranking.length > 0
                        ? "bg-yellow-400 text-black border-black"
                        : "bg-black/80 text-white/50 border-white/30"
                    }`}
                    title="View Clip Ranking"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>PODIUM</span>
                    {ranking.length > 0 && (
                      <span className="bg-black text-yellow-400 px-1 text-[9px] rounded-none ml-0.5">
                        {ranking.length}
                      </span>
                    )}
                  </button>
                </div>

                <div className="mb-4 pr-24 space-y-1">
                  <h3 className="text-3xl font-display text-white truncate uppercase tracking-widest drop-shadow-[1px_1px_0_rgba(255,0,0,0.8)]">{line.skater}</h3>
                  <p className="text-sm font-sans font-bold text-green-400 truncate uppercase tracking-widest">{line.videoPart}</p>
                  <p className="text-sm font-sans font-bold text-zinc-400 truncate uppercase tracking-widest">{line.lineName}</p>
                  <div className="pt-2">
                    <span className="text-xs text-black font-sans font-bold bg-white px-2 py-1 uppercase tracking-widest">
                      {line.videoType === "Single" ? "SINGLE TRICK" : `${line.markers.length} TRICKS`}
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={() => onPlay(line)}
                  className="w-full bg-red-600 text-white py-3 font-display text-2xl flex items-center justify-center gap-2 hover:bg-red-500 transition-colors uppercase tracking-widest shadow-[2px_2px_0_0_rgba(255,255,255,1)]"
                >
                  <Play className="w-5 h-5 fill-current" /> PLAY TAPE
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Video Ranking Podium Modal */}
      {activeRankingLine && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setActiveRankingLine(null)}
        >
          <div 
            className="w-full max-w-sm bg-zinc-950 border-4 border-white p-5 space-y-4 relative shadow-[8px_8px_0_0_rgba(255,0,0,0.8)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setActiveRankingLine(null)}
              className="absolute top-3 right-3 text-white hover:text-red-500 p-1 border border-white/30"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="flex justify-center mb-1">
                <Trophy className="w-10 h-10 text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.6)]" />
              </div>
              <span className="zine-badge-yellow mb-1">CLIP PODIUM</span>
              <h3 className="text-2xl font-display text-white truncate uppercase tracking-widest">{activeRankingLine.skater}</h3>
              <p className="text-xs font-sans font-bold text-green-400 uppercase tracking-widest">{activeRankingLine.lineName}</p>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {(() => {
                const ranking = getVideoRanking(activeRankingLine);
                if (ranking.length === 0) {
                  return (
                    <div className="border-2 border-dashed border-white/20 p-6 text-center">
                      <p className="text-lg font-display text-white/50 uppercase tracking-widest">NO GAMES YET</p>
                      <p className="text-xs font-sans text-white/30 uppercase mt-1">Play this video to claim the podium!</p>
                    </div>
                  );
                }
                return ranking.map((entry, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-black border-b border-white/20">
                    <div className="flex items-center gap-3">
                      <span className="font-display text-xl text-red-500 w-5">{index + 1}.</span>
                      <div className="flex flex-col">
                        <span className="font-sans font-bold text-sm text-white uppercase tracking-wider">{entry.name}</span>
                        <span className="text-[9px] font-display text-white/50 tracking-widest">
                          {index === 0 ? "🏆 PRO STATUS" : index === 1 ? "🥈 AM BASTARD" : index === 2 ? "🥉 SHOP SPONSOR" : index === ranking.length - 1 ? "🤡 MALL GRABBER" : "🛹 FLOW TRASH"}
                        </span>
                      </div>
                    </div>
                    <span className="font-sans text-sm text-green-400 font-bold">{entry.score} PTS</span>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
