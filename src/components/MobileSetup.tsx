import React, { useState, useEffect } from "react";
import { LineData } from "../types";
import { ChevronLeft } from "lucide-react";

interface Props {
  initialData?: LineData;
  onVideoPlay?: () => void;
  onVideoPause?: () => void;
  onSetupComplete: (data: LineData) => void;
  onBack: (data: LineData) => void;
}

export function extractYouTubeID(url: string): string {
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i;
  const match = url.match(regExp);
  return match ? match[1] : url;
}

export default function MobileSetup({ initialData, onVideoPlay, onVideoPause, onSetupComplete, onBack }: Props) {
  const [url, setUrl] = useState(initialData?.videoId ? `https://youtube.com/watch?v=${initialData.videoId}` : "");
  const [skater, setSkater] = useState(initialData?.skater || "");
  const [videoPart, setVideoPart] = useState(initialData?.videoPart || "");
  const [lineName, setLineName] = useState(initialData?.lineName || "");
  const [videoType, setVideoType] = useState<"Ronda" | "Single">(initialData?.videoType || "Ronda");
  const [trickCount, setTrickCount] = useState(initialData?.trickCount || 1);

  useEffect(() => {
    if (!url) return;
    const videoId = extractYouTubeID(url);
    if (videoId && videoId !== url) { // Valid youtube URL
      fetch(`https://noembed.com/embed?url=${url}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.title && !videoPart) {
            setVideoPart(data.title);
          }
        })
        .catch(console.error);
    }
  }, [url]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !skater || !videoPart || !lineName) return;

    const videoId = extractYouTubeID(url);
    const title = `${skater} - ${videoPart} - ${lineName}`;
    const finalTrickCount = videoType === "Single" ? 1 : trickCount;

    onSetupComplete({
      videoId,
      skater,
      videoPart,
      lineName,
      title,
      videoType,
      trickCount: finalTrickCount,
      clipStartTime: initialData?.clipStartTime || 0,
      clipEndTime: initialData?.clipEndTime || 0,
      markers: initialData?.markers || []
    });
  };

  const handleBack = () => {
    const videoId = extractYouTubeID(url);
    const title = skater && videoPart && lineName ? `${skater} - ${videoPart} - ${lineName}` : initialData?.title || "";
    const finalTrickCount = videoType === "Single" ? 1 : trickCount;

    onBack({
      videoId,
      skater,
      videoPart,
      lineName,
      title,
      videoType,
      trickCount: finalTrickCount,
      clipStartTime: initialData?.clipStartTime || 0,
      clipEndTime: initialData?.clipEndTime || 0,
      markers: initialData?.markers || []
    });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-4 relative overflow-hidden bg-black font-sans pt-12">
      {/* VX1000 Overlay Base */}
      <div className="absolute inset-0 z-0 pointer-events-none fisheye-container border-[20px] border-black/90">
        <div className="absolute top-4 right-6 text-white font-bold text-2xl font-sans drop-shadow-md">
          SETUP
        </div>
      </div>
      <div className="absolute inset-0 vhs-overlay z-0 pointer-events-none opacity-50" />

      <button onClick={handleBack} className="absolute top-4 left-4 z-20 text-white hover:text-red-500 transition-colors p-4 group">
        <div className="bg-black p-2 border-2 border-white shadow-[2px_2px_0_0_rgba(255,255,255,1)]">
          <ChevronLeft className="w-6 h-6" strokeWidth={3} />
        </div>
      </button>

      <div className="z-20 space-y-2 mt-4 text-center w-full max-w-sm">
        <h1 className="text-4xl font-display text-white drop-shadow-[2px_2px_0_rgba(255,0,0,0.8)] tracking-widest uppercase">
          TAPE EDITOR
        </h1>
        <p className="text-sm font-sans font-bold text-red-500 uppercase tracking-widest bg-black inline-block px-2">
          REC PARAMETERS
        </p>
      </div>

      <form onSubmit={handleSubmit} className="z-20 space-y-4 w-full max-w-sm mt-8 flex-1 flex flex-col">
        <div className="space-y-4 flex-1">
          <div className="space-y-1">
            <label className="zine-badge-red mb-1">YOUTUBE URL</label>
            <input 
              type="text" 
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="zine-input uppercase"
            />
          </div>

          <div className="space-y-1">
            <label className="zine-badge-red mb-1">SKATER</label>
            <input 
              type="text" 
              value={skater}
              onChange={e => setSkater(e.target.value)}
              placeholder="e.g. PJ LADD"
              className="zine-input uppercase font-display text-lg"
            />
          </div>

          <div className="space-y-1">
            <label className="zine-badge-red mb-1">VIDEO PART</label>
            <input 
              type="text" 
              value={videoPart}
              onChange={e => setVideoPart(e.target.value)}
              placeholder="WONDERFUL HORRIBLE LIFE"
              className="zine-input uppercase font-display text-lg"
            />
          </div>

          <div className="flex gap-2">
            <div className="space-y-1 w-1/2">
              <label className="zine-badge-red mb-1">FORMAT</label>
              <select 
                value={videoType} 
                onChange={e => setVideoType(e.target.value as "Ronda" | "Single")} 
                className="zine-select"
              >
                <option value="Ronda">LINE (RONDA)</option>
                <option value="Single">SINGLE TRICK</option>
              </select>
            </div>
            
            <div className="space-y-1 w-1/2">
              <label className="zine-badge-red mb-1">TÍTULO DEL CLIP</label>
              <input 
                type="text" 
                value={lineName}
                onChange={e => setLineName(e.target.value)}
                placeholder="LEDGE"
                className="zine-input uppercase"
              />
            </div>
          </div>

          {videoType === "Ronda" && (
            <div className="space-y-1">
              <label className="zine-badge-red mb-1">TOTAL TRICKS</label>
              <input 
                type="number" 
                min={2}
                max={20}
                value={trickCount}
                onChange={e => setTrickCount(parseInt(e.target.value) || 2)}
                className="zine-input text-2xl text-center font-display"
              />
            </div>
          )}
        </div>

        <button 
          type="submit"
          disabled={!url || !skater || !videoPart || !lineName || (videoType === "Ronda" && trickCount < 1)}
          className="w-full sticker-button px-4 py-3 mt-4 bg-white torn-edge group mb-8 disabled:opacity-50 disabled:grayscale"
        >
          <div className="bg-black text-white font-display text-2xl px-4 py-2 flex items-center justify-center gap-2 group-hover:bg-red-600 transition-colors uppercase">
            {initialData ? "CONTINUE TAPE" : "START RECORDING"}
          </div>
        </button>
      </form>
    </div>
  );
}
