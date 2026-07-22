import React, { useState } from "react";
import { LineData } from "../types";
import { Trash2, MoreVertical, Edit2, ChevronLeft, Video, Download, Upload, Trophy, X, Share2 } from "lucide-react";

interface Props {
  lines: LineData[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onExportStash: () => void;
  onImportStash: () => void;
  onBack: () => void;
}

export default function MobileStash({ lines, onEdit, onDelete, onExportStash, onImportStash, onBack }: Props) {
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [activeRankingLine, setActiveRankingLine] = useState<LineData | null>(null);

  const handleExportSingleLine = async (line: LineData) => {
    const dataStr = JSON.stringify([line]);
    try {
      await navigator.clipboard.writeText(dataStr);
      alert(`Clip "${line.lineName}" copied to clipboard! Send this text to your friend.`);
    } catch (e) {
      prompt("Copy the code for this clip:", dataStr);
    }
  };

  const getVideoRanking = (line: LineData): {name: string, score: number}[] => {
    const key = `skate_stopper_ranking_${line.videoId}_${line.clipStartTime}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  };

  const handleClearRanking = (line: LineData) => {
    if (window.confirm(`Clear ranking for "${line.lineName}"?`)) {
      const key = `skate_stopper_ranking_${line.videoId}_${line.clipStartTime}`;
      localStorage.removeItem(key);
      setActiveRankingLine(null);
    }
  };

  return (
    <div 
      className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto bg-zinc-950 relative font-sans pt-4 pb-24"
      onClick={() => setMenuOpen(null)}
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
          FOOTY<br/>STASH
        </h1>
        <p className="text-xl text-green-400 font-bold uppercase tracking-widest mt-2">MANAGEMENT</p>
      </div>

      <div className="relative z-10 w-full flex justify-between gap-2 mt-4">
        <button 
          onClick={(e) => { e.stopPropagation(); onExportStash(); }}
          className="flex-1 bg-black/80 border border-white/50 text-white font-sans font-bold text-xs py-2 uppercase tracking-wider hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" /> EXPORT
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onImportStash(); }}
          className="flex-1 bg-black/80 border border-white/50 text-white font-sans font-bold text-xs py-2 uppercase tracking-wider hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" /> IMPORT
        </button>
      </div>

      <div className="relative z-10 w-full space-y-4">
        {lines.length === 0 ? (
          <div className="border-4 border-white/20 p-8 text-center bg-black/50 w-full">
            <p className="text-2xl font-display text-white/50 tracking-widest uppercase">EMPTY STASH</p>
            <p className="text-sm font-sans font-bold text-white/40 mt-4 uppercase tracking-widest">NO SAVED CLIPS</p>
          </div>
        ) : (
          lines.map((line, i) => {
            const ranking = getVideoRanking(line);
            return (
              <div key={i} className={`bg-black/80 border-4 border-zinc-500 p-4 flex flex-col justify-between relative group transform transition-transform hover:-translate-y-1 ${menuOpen === i ? "z-30" : "z-0"}`}>
                
                {/* Header Action Controls */}
                <div className="absolute top-3 right-3 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(menuOpen === i ? null : i);
                    }}
                    className="p-1 text-white hover:text-red-500 transition-colors"
                  >
                    <MoreVertical className="w-6 h-6" />
                  </button>

                  {menuOpen === i && (
                    <div className="absolute right-0 mt-1 w-48 bg-zinc-950 border-2 border-white shadow-[6px_6px_0_0_rgba(255,0,0,0.9)] z-50 flex flex-col overflow-hidden">
                      <button
                        onClick={(e) => { e.stopPropagation(); setMenuOpen(null); onEdit(i); }}
                        className="flex items-center gap-2 px-3 py-2.5 text-xs text-white hover:bg-zinc-800 text-left font-sans font-bold uppercase tracking-widest border-b border-white/20"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> EDIT
                      </button>
                      <button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setMenuOpen(null); 
                          handleExportSingleLine(line);
                        }}
                        className="flex items-center gap-2 px-3 py-2.5 text-xs text-green-400 hover:bg-zinc-800 text-left font-sans font-bold uppercase tracking-widest border-b border-white/20"
                      >
                        <Share2 className="w-3.5 h-3.5" /> SHARE CLIP
                      </button>
                      <button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setMenuOpen(null); 
                          setActiveRankingLine(line);
                        }}
                        className="flex items-center gap-2 px-3 py-2.5 text-xs text-yellow-400 hover:bg-zinc-800 text-left font-sans font-bold uppercase tracking-widest border-b border-white/20"
                      >
                        <Trophy className="w-3.5 h-3.5" /> RANKING
                      </button>
                      <button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setMenuOpen(null); 
                          onDelete(i);
                        }}
                        className="flex items-center gap-2 px-3 py-2.5 text-xs text-red-500 hover:bg-zinc-800 text-left font-sans font-bold uppercase tracking-widest"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> DELETE CLIP
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="pr-12 space-y-1">
                  <h3 className="text-3xl font-display text-white truncate uppercase tracking-widest">{line.skater}</h3>
                  <p className="text-sm font-sans font-bold text-green-400 truncate uppercase tracking-widest">{line.videoPart}</p>
                  <p className="text-sm font-sans font-bold text-zinc-400 truncate uppercase tracking-widest">{line.lineName}</p>
                  <div className="pt-2">
                    <span className="text-xs text-black font-sans font-bold bg-white px-2 py-1 uppercase tracking-widest">
                      {line.videoType === "Single" ? "SINGLE TRICK" : `${line.markers.length} TRICKS`}
                    </span>
                  </div>
                </div>
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

            {getVideoRanking(activeRankingLine).length > 0 && (
              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => handleClearRanking(activeRankingLine)}
                  className="w-full zine-badge-red py-2 text-center hover:scale-105 transition-transform cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 inline mr-1" /> CLEAR VIDEO RANKING
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
