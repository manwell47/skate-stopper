import React, { useState, useRef, useEffect } from "react";
import YouTube, { YouTubePlayer, YouTubeProps } from "react-youtube";
import { LineData, TrickMarker } from "../types";
import { Play, ChevronLeft, Check, FastForward, Rewind, Trash2, Pencil } from "lucide-react";

interface Props {
  lineData: LineData;
  onFinish: (data: LineData) => void;
  onVideoPlay?: () => void;
  onVideoPause?: () => void;
  onBack: (data: LineData) => void;
}

type EditorStep = "overview" | "clip_bounds" | "trick_time" | "trick_labels" | "done";

export default function MobileEditor({ lineData, onFinish, onVideoPlay, onVideoPause, onBack }: Props) {
  const [data, setData] = useState<LineData>(lineData);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  
  const [step, setStep] = useState<EditorStep>(lineData.markers.length > 0 ? "overview" : "clip_bounds");
  const [currentTrickIndex, setCurrentTrickIndex] = useState(lineData.markers.length > 0 ? lineData.markers.length : 0);

  const [editingTrick, setEditingTrick] = useState<Partial<TrickMarker>>({
    id: Date.now().toString(),
    pauseTime: 0,
  });

  const [stance, setStance] = useState("Normal");
  const [direction, setDirection] = useState("None");
  const [rotation, setRotation] = useState("None");
  const [pressure, setPressure] = useState("None");
  const [trickType, setTrickType] = useState("Fliptrick");
  const [flip, setFlip] = useState("None");
  const [grind, setGrind] = useState("None");
  const [grind2, setGrind2] = useState("None");
  const [manual, setManual] = useState("None");
  const [manual2, setManual2] = useState("None");
  const [grab, setGrab] = useState("None");
  const [stall, setStall] = useState("None");
  const [wall, setWall] = useState("None");
  const [customTrick, setCustomTrick] = useState("");
  const [flipIn, setFlipIn] = useState("None");
  const [stanceMid, setStanceMid] = useState("Normal");
  const [dirMid, setDirMid] = useState("None");
  const [rotMid, setRotMid] = useState("None");
  const [flipMid, setFlipMid] = useState("None");
  const [stanceOut, setStanceOut] = useState("Normal");
  const [dirOut, setDirOut] = useState("None");
  const [rotOut, setRotOut] = useState("None");
  const [flipOut, setFlipOut] = useState("None");
  const [ending, setEnding] = useState("None");
  const [false1, setFalse1] = useState("");
  const [false2, setFalse2] = useState("");
  const [false3, setFalse3] = useState("");
  const [forceManualEntry, setForceManualEntry] = useState(false);

  const resetDropdowns = () => {
    setStance("Normal");
    setDirection("None");
    setRotation("None");
    setPressure("None");
    setTrickType("Fliptrick");
    setFlip("None");
    setGrind("None");
    setGrind2("None");
    setManual("None");
    setManual2("None");
    setGrab("None");
    setStall("None");
    setWall("None");
    setCustomTrick("");
    setFlipIn("None");
    setStanceMid("Normal");
    setDirMid("None");
    setRotMid("None");
    setFlipMid("None");
    setStanceOut("Normal");
    setDirOut("None");
    setRotOut("None");
    setFlipOut("None");
    setEnding("None");
    setFalse1("");
    setFalse2("");
    setFalse3("");
    setForceManualEntry(false);
  };

  const playerRef = useRef<YouTubePlayer | null>(null);
  const intervalRef = useRef<number | null>(null);
  const targetEndTimeRef = useRef<number | null>(null);

  const onReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
  };

  const onStateChange: YouTubeProps['onStateChange'] = (event) => {
    if (event.data === 1) {
      setIsPlaying(true);
      onVideoPlay?.();
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = window.setInterval(() => {
        if (playerRef.current) {
          const cTime = playerRef.current.getCurrentTime();
          setCurrentTime(cTime);
          if (targetEndTimeRef.current !== null && cTime >= targetEndTimeRef.current) {
            playerRef.current.pauseVideo();
            targetEndTimeRef.current = null;
          }
        }
      }, 50);
    } else {
      setIsPlaying(false);
      onVideoPause?.();
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const setTimeFor = (field: "clipStartTime" | "clipEndTime" | "pauseTime") => {
    const actualCurrentTime = playerRef.current?.getCurrentTime() || currentTime;
    if (field === "clipStartTime" || field === "clipEndTime") {
      setData({ ...data, [field]: actualCurrentTime });
    } else {
      setEditingTrick({ ...editingTrick, [field]: actualCurrentTime });
      if (playerRef.current) playerRef.current.pauseVideo();
    }
  };

  const adjustTime = (field: "clipStartTime" | "clipEndTime" | "pauseTime", frames: number) => {
    const actualCurrentTime = playerRef.current?.getCurrentTime() || currentTime;
    const f = 0.01666; // approx 1 frame at 60fps
    const seconds = frames * f;
    if (field === "clipStartTime" || field === "clipEndTime") {
      const current = data[field] !== undefined ? data[field] : actualCurrentTime;
      const newVal = Math.max(0, current + seconds);
      setData({ ...data, [field]: newVal });
      setCurrentTime(newVal);
      if (playerRef.current) {
        playerRef.current.playVideo();
        playerRef.current.seekTo(newVal, true);
        setTimeout(() => {
          if (playerRef.current) playerRef.current.pauseVideo();
        }, 150);
      }
    } else {
      const current = editingTrick[field] !== undefined ? editingTrick[field] : actualCurrentTime;
      const newVal = Math.max(0, current + seconds);
      setEditingTrick({ ...editingTrick, [field]: newVal });
      setCurrentTime(newVal);
      if (playerRef.current) {
        playerRef.current.playVideo();
        playerRef.current.seekTo(newVal, true);
        setTimeout(() => {
          if (playerRef.current) playerRef.current.pauseVideo();
        }, 150);
      }
    }
  };

  const FrameAdjuster = ({ field }: { field: "clipStartTime" | "clipEndTime" | "pauseTime" }) => (
    <div className="flex flex-col mt-2 w-full">
      <p className="text-[8px] text-zinc-400 font-sans uppercase tracking-widest text-center mb-1">Ajuste Fino por Fotogramas (60fps)</p>
      <div className="flex w-full border-2 border-zinc-700 bg-black shadow-[2px_2px_0_0_rgba(255,255,255,0.2)]">
        {[-10, -5, -2, -1].map((f, i) => (
          <button 
            key={f}
            onClick={() => adjustTime(field, f)} 
            className={`no-skid flex-1 py-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white text-[9px] sm:text-[10px] font-sans font-bold transition-colors ${i < 3 ? 'border-r border-zinc-800' : ''}`}
          >
            {f}f
          </button>
        ))}
        <div className="w-1 bg-red-600 shrink-0" />
        {[1, 2, 5, 10].map((f, i) => (
          <button 
            key={f}
            onClick={() => adjustTime(field, f)} 
            className={`no-skid flex-1 py-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white text-[9px] sm:text-[10px] font-sans font-bold transition-colors ${i < 3 ? 'border-r border-zinc-800' : ''}`}
          >
            +{f}f
          </button>
        ))}
      </div>
    </div>
  );

  const playRange = (start: number, end: number) => {
    if (playerRef.current) {
      targetEndTimeRef.current = end;
      playerRef.current.seekTo(start, true);
      playerRef.current.playVideo();
    }
  };

  const goToTrickTime = (targetTrickIndex: number, currentData: LineData = data) => {
    setStep("trick_time");
    let targetTime = currentData.clipStartTime || 0;
    if (targetTrickIndex === 0) {
      targetTime += 1;
    } else if (targetTrickIndex > 0 && currentData.markers[targetTrickIndex - 1]) {
      targetTime = currentData.markers[targetTrickIndex - 1].pauseTime + 1.5;
    }
    
    setEditingTrick(prev => ({ ...prev, pauseTime: targetTime }));
    
    if (playerRef.current) {
      playerRef.current.playVideo();
      playerRef.current.seekTo(targetTime, true);
      setTimeout(() => {
        if (playerRef.current) playerRef.current.pauseVideo();
      }, 150);
    }
  };

  const buildTrick = (s: string, d: string, r: string, t: string, pr: string, f: string, g: string, g2: string, m: string, m2: string, gr: string, st: string, w: string, fi: string, sm: string, dm: string, rm: string, fm: string, so: string, doOut: string, ro: string, fo: string, en: string) => {
    const parts: string[] = [];
    if (s !== "Normal") parts.push(s);
    if (r !== "None") parts.push(r);
    
    if (t === "Fliptrick" || t === "Stall") {
      if (pr !== "None") parts.push("Pressure");
      if (f !== "None") parts.push(f);
    }
    
    if (t === "Grab" && gr !== "None") parts.push(gr);
    
    if (t === "Grind/Slide" || t === "Manual") {
      if (fi !== "None") {
        parts.push(fi);
      }
      if (d !== "None") parts.push(d);
      
      if (t === "Grind/Slide" && g !== "None") parts.push(g);
      if (t === "Manual" && m !== "None") parts.push(m);
      
      if (fm !== "None" || sm !== "Normal" || dm !== "None" || rm !== "None") { 
        parts.push("mid"); 
        if (sm !== "Normal") parts.push(sm);
        if (rm !== "None") parts.push(rm);
        if (fm !== "None") parts.push(fm);
        if (dm !== "None") parts.push(dm);
      }
      if (t === "Grind/Slide" && g2 !== "None") { parts.push("to"); parts.push(g2); }
      if (t === "Manual" && m2 !== "None") { parts.push("to"); parts.push(m2); }
      if (fo !== "None" || so !== "Normal" || doOut !== "None" || ro !== "None") { 
        parts.push("to"); 
        if (so !== "Normal") parts.push(so);
        if (doOut !== "None") parts.push(doOut);
        if (ro !== "None") parts.push(ro);
        if (fo !== "None") parts.push(fo); 
        parts.push("out");
      }
    }
    
    if (t === "Stall" && st !== "None") parts.push(st);
    if (t === "Wallride/Other" && w !== "None") parts.push(w);
    if (t === "Caída") return "Caída";
    
    if (en !== "None") parts.push(en);
    
    return parts.join(" ") || "Ollie";
  };

  const autoGenerateFalseTricks = () => {
    const correctTrick = customTrick.trim() || buildTrick(stance, direction, rotation, trickType, pressure, flip, grind, grind2, manual, manual2, grab, stall, wall, flipIn, stanceMid, dirMid, rotMid, flipMid, stanceOut, dirOut, rotOut, flipOut, ending);
    const options = new Set<string>();

    const stances = ["Normal", "Switch", "Nollie", "Fakie"];
    const flips = ["Kickflip", "Heelflip", "Tre Flip", "Shove-it", "Hardflip", "BS Bigspin", "FS Bigspin", "Bigspin Flip", "Bigspin Heelflip", "Biggerspin Flip", "Biggerspin Heelflip"];
    const grinds = ["50-50", "5-0", "Nosegrind", "Crooked", "Boardslide"];
    const grabs = ["Indy", "Melon", "Mute", "Tailgrab", "Nosegrab"];
    const stalls = ["Rock to Fakie", "Disaster", "Blunt Stall", "Noseblunt Stall"];
    const manuals = ["Manual", "Nose Manual", "Casper", "Primo"];
    const walls = ["Wallride", "Wallie", "No-Comply", "Boneless", "Fastplant"];
    const dirs = ["None", "FS", "BS"];

    // Trick variants with the same stance to be credible
    for (const f of flips) {
      if (f !== flip) options.add(buildTrick(stance, direction, rotation, trickType, pressure, f, grind, grind2, manual, manual2, grab, stall, wall, flipIn, stanceMid, dirMid, rotMid, flipMid, stanceOut, dirOut, rotOut, flipOut, ending));
    }
    if (trickType === "Grind/Slide") {
      for (const g of grinds) {
        if (g !== grind && grind !== "None") options.add(buildTrick(stance, direction, rotation, trickType, pressure, flip, g, grind2, manual, manual2, grab, stall, wall, flipIn, stanceMid, dirMid, rotMid, flipMid, stanceOut, dirOut, rotOut, flipOut, ending));
      }
    }
    if (trickType === "Manual") {
      for (const m of manuals) {
        if (m !== manual && manual !== "None") options.add(buildTrick(stance, direction, rotation, trickType, pressure, flip, grind, grind2, m, manual2, grab, stall, wall, flipIn, stanceMid, dirMid, rotMid, flipMid, stanceOut, dirOut, rotOut, flipOut, ending));
      }
    }
    if (trickType === "Grab") {
      for (const gr of grabs) {
        if (gr !== grab && grab !== "None") options.add(buildTrick(stance, direction, rotation, trickType, pressure, flip, grind, grind2, manual, manual2, gr, stall, wall, "None", "Normal", "None", "None", "None", "Normal", "None", "None", "None", ending));
      }
    }
    if (trickType === "Stall") {
      for (const st of stalls) {
        if (st !== stall && stall !== "None") options.add(buildTrick(stance, direction, rotation, trickType, pressure, flip, grind, grind2, manual, manual2, grab, st, wall, "None", "Normal", "None", "None", "None", "Normal", "None", "None", "None", ending));
      }
    }
    if (trickType === "Wallride/Other") {
      for (const w of walls) {
        if (w !== wall && wall !== "None") options.add(buildTrick(stance, direction, rotation, trickType, pressure, flip, grind, grind2, manual, manual2, grab, stall, w, "None", "Normal", "None", "None", "None", "Normal", "None", "None", "None", ending));
      }
    }
    for (const d of dirs) {
      if (d !== direction) options.add(buildTrick(stance, d, rotation, trickType, pressure, flip, grind, grind2, manual, manual2, grab, stall, wall, flipIn, stanceMid, dirMid, rotMid, flipMid, stanceOut, dirOut, rotOut, flipOut, ending));
    }

    if (customTrick.trim()) {
       options.add("Kickflip");
       options.add("Tre Flip");
       options.add("BS 50-50");
       options.add("Noseslide");
       options.add("FS Shove-it");
    } else if (options.size === 0) {
      options.add("Kickflip");
      options.add("Heelflip");
      options.add("Tre Flip");
      options.add("Ollie");
    }

    options.delete(correctTrick);
    const optionsArray = Array.from(options).sort(() => Math.random() - 0.5);
    
    setFalse1(optionsArray[0] || "");
    setFalse2(optionsArray[1] || "");
    setFalse3(optionsArray[2] || "");
  };

  const saveTrick = () => {
    const correctTrick = customTrick.trim() || buildTrick(stance, direction, rotation, trickType, pressure, flip, grind, grind2, manual, manual2, grab, stall, wall, flipIn, stanceMid, dirMid, rotMid, flipMid, stanceOut, dirOut, rotOut, flipOut, ending);

    const providedFalseTricks = [false1, false2, false3].map(t => t.trim()).filter(Boolean);
    const options = new Set<string>(providedFalseTricks);

    if (options.size < 3) {
      const stances = ["Normal", "Switch", "Nollie", "Fakie"];
      const flips = ["Kickflip", "Heelflip", "Tre Flip", "Shove-it", "Hardflip", "BS Bigspin", "FS Bigspin", "Bigspin Flip", "Bigspin Heelflip", "Biggerspin Flip", "Biggerspin Heelflip"];
      const grinds = ["50-50", "5-0", "Nosegrind", "Crooked", "Boardslide"];
      const grabs = ["Indy", "Melon", "Mute", "Tailgrab", "Nosegrab"];
      const stalls = ["Rock to Fakie", "Disaster", "Blunt Stall", "Noseblunt Stall"];
      const manuals = ["Manual", "Nose Manual"];
      const walls = ["Wallride", "Wallie", "No-Comply", "Boneless", "Fastplant"];
      const dirs = ["None", "FS", "BS"];

      // Trick variants with the same stance to be credible
      for (const f of flips) {
        if (f !== flip) options.add(buildTrick(stance, direction, rotation, trickType, pressure, f, grind, grind2, manual, manual2, grab, stall, wall, flipIn, stanceMid, dirMid, rotMid, flipMid, stanceOut, dirOut, rotOut, flipOut, ending));
      }
      if (trickType === "Grind/Slide") {
        for (const g of grinds) {
          if (g !== grind && grind !== "None") options.add(buildTrick(stance, direction, rotation, trickType, pressure, flip, g, grind2, manual, manual2, grab, stall, wall, flipIn, stanceMid, dirMid, rotMid, flipMid, stanceOut, dirOut, rotOut, flipOut, ending));
        }
      }
      if (trickType === "Manual") {
        for (const m of manuals) {
          if (m !== manual && manual !== "None") options.add(buildTrick(stance, direction, rotation, trickType, pressure, flip, grind, grind2, m, manual2, grab, stall, wall, flipIn, stanceMid, dirMid, rotMid, flipMid, stanceOut, dirOut, rotOut, flipOut, ending));
        }
      }
      if (trickType === "Grab") {
        for (const gr of grabs) {
          if (gr !== grab && grab !== "None") options.add(buildTrick(stance, direction, rotation, trickType, pressure, flip, grind, grind2, manual, manual2, gr, stall, wall, "None", "Normal", "None", "None", "None", "Normal", "None", "None", "None", ending));
        }
      }
      if (trickType === "Stall") {
        for (const st of stalls) {
          if (st !== stall && stall !== "None") options.add(buildTrick(stance, direction, rotation, trickType, pressure, flip, grind, grind2, manual, manual2, grab, st, wall, "None", "Normal", "None", "None", "None", "Normal", "None", "None", "None", ending));
        }
      }
      if (trickType === "Wallride/Other") {
        for (const w of walls) {
          if (w !== wall && wall !== "None") options.add(buildTrick(stance, direction, rotation, trickType, pressure, flip, grind, grind2, manual, manual2, grab, stall, w, "None", "Normal", "None", "None", "None", "Normal", "None", "None", "None", ending));
        }
      }
      for (const d of dirs) {
        if (d !== direction) options.add(buildTrick(stance, d, rotation, trickType, pressure, flip, grind, grind2, manual, manual2, grab, stall, wall, flipIn, stanceMid, dirMid, rotMid, flipMid, stanceOut, dirOut, rotOut, flipOut, ending));
      }
      
      if (customTrick.trim()) {
         options.add("Kickflip");
         options.add("Tre Flip");
         options.add("BS 50-50");
         options.add("Noseslide");
         options.add("FS Shove-it");
      } else {
        options.add("Kickflip");
        options.add("Heelflip");
        options.add("Tre Flip");
        options.add("Ollie");
      }
    }
    
    options.delete(correctTrick);

    const falseTricks = Array.from(options).slice(0, 3);

    const newMarker: TrickMarker = {
      id: editingTrick.id || Date.now().toString(),
      pauseTime: editingTrick.pauseTime || 0,
      correctTrick,
      falseTricks,
      isCustomText: !!customTrick.trim() && forceManualEntry,
    };

    const updatedMarkers = [...data.markers];
    if (currentTrickIndex < updatedMarkers.length) {
      updatedMarkers[currentTrickIndex] = newMarker;
      const updatedData = { ...data, markers: updatedMarkers };
      setData(updatedData);
      setStep("overview");
      return;
    }

    updatedMarkers.push(newMarker);
    const updatedData = { ...data, markers: updatedMarkers };
    setData(updatedData);
    
    if (currentTrickIndex + 1 < data.trickCount) {
      const nextIndex = currentTrickIndex + 1;
      setCurrentTrickIndex(nextIndex);
      setEditingTrick({
        id: Date.now().toString(),
        pauseTime: currentTime,
      });
      resetDropdowns();
      goToTrickTime(nextIndex, updatedData);
    } else {
      setStep("overview");
    }
  };

  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 1,
      modestbranding: 1,
      rel: 0,
      playsinline: 1,
      origin: window.location.origin,
    },
  };

  const handleBack = () => {
    if (step === "overview") {
      onBack(data);
    } else if (step === "clip_bounds" && data.markers.length > 0) {
      setStep("overview");
    } else if (step === "trick_time" || step === "trick_labels" || step === "done") {
      if (data.markers.length > 0) {
        setStep("overview");
      } else {
        if (step === "trick_labels") setStep("trick_time");
        else if (step === "trick_time") setStep("clip_bounds");
        else onBack(data);
      }
    } else {
      onBack(data);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-black font-sans relative">
      {/* Header */}
      <div className="p-4 border-b-2 border-white bg-black z-10 flex items-center justify-between shrink-0  z-10">
        <button onClick={handleBack} className="text-white hover:text-red-600 transition-colors p-4 -ml-4 -my-4">
          <ChevronLeft className="w-8 h-8" strokeWidth={3} />
        </button>
        <div className="text-center ">
          <h2 className="text-xl font-display text-white drop-">{data.title}</h2>
          <p className="text-sm text-white bg-red-600 px-1 uppercase tracking-widest font-sans font-bold">
            Paso {step === "clip_bounds" ? "1" : step === "done" ? "4" : step === "trick_time" ? "2" : "3"}
          </p>
        </div>
        <div className="w-8" />
      </div>

      {/* Video Player */}
      <div className="relative aspect-video w-full bg-black shrink-0 border-b-4 border-black  z-0">
        <YouTube
          videoId={data.videoId}
          opts={opts}
          onReady={onReady}
          onStateChange={onStateChange}
          className="w-full h-full"
          iframeClassName="w-full h-full"
        />
        <div className="absolute top-2 right-2 bg-black px-2 py-1 text-sm font-display text-red-600 border-2 border-orange-500 rounded-none ">
          {currentTime.toFixed(2)}s
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-2 px-4 flex flex-col">
        {step === "overview" && (
          <div className="space-y-4 flex-1 flex flex-col pt-2">
            <button
              onClick={() => setStep("clip_bounds")}
              className="w-full bg-red-600 text-black p-3 font-display text-2xl border-2 border-white hover:scale-[1.02] transition-transform uppercase"
            >
              Límites del Clip
            </button>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {Array.from({ length: data.trickCount }).map((_, i) => {
                const marker = data.markers[i];
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentTrickIndex(i);
                      if (marker) {
                        setEditingTrick({ id: marker.id, pauseTime: marker.pauseTime });
                        setCustomTrick(marker.correctTrick);
                        if (marker.falseTricks[0]) setFalse1(marker.falseTricks[0]);
                        if (marker.falseTricks[1]) setFalse2(marker.falseTricks[1]);
                        if (marker.falseTricks[2]) setFalse3(marker.falseTricks[2]);
                      } else {
                        setEditingTrick({ id: Date.now().toString(), pauseTime: data.clipStartTime || 0 });
                        setCustomTrick("");
                        resetDropdowns();
                      }
                      goToTrickTime(i);
                    }}
                    className={`p-3 flex flex-col items-center justify-center border-2 border-white transition-all transform hover:-skew-x-3 ${marker ? "bg-zinc-900" : "bg-black/50 border-dashed"}`}
                  >
                    <span className="font-display text-2xl text-red-600">TRICK {i + 1}</span>
                    <span className="text-[10px] uppercase font-sans font-bold text-zinc-400 mt-1">
                      {marker ? "EDITAR" : "PENDIENTE"}
                    </span>
                  </button>
                );
              })}
            </div>
            
            {data.markers.length === data.trickCount && (
              <div className="mt-auto pt-4">
                <button
                  onClick={() => setStep("done")}
                  className="w-full bg-white text-black p-3 font-display text-3xl hover:bg-red-600 hover:text-white transition-colors uppercase border-2 border-black"
                >
                  Finalizar
                </button>
              </div>
            )}
          </div>
        )}

        {step === "clip_bounds" && (
          <div className="space-y-2 flex-1 flex flex-col">
            <div className="text-center space-y-1">
              <h3 className="text-xl font-display text-red-600 drop-">Límites del Clip</h3>
              <p className="text-[10px] text-white font-sans font-bold bg-red-600 px-2 inline-block rounded-none uppercase tracking-widest">Establece el inicio y el final del clip</p>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                <button onClick={() => setTimeFor("clipStartTime")} className="w-full bg-black/90 border-2 border-white p-3 text-center hover:border-orange-500 rounded-none transition-all flex flex-col items-center">
                  <span className="block text-[10px] text-white bg-red-600 px-2 py-1 uppercase tracking-widest font-sans font-bold mb-1">Inicio Clip</span>
                  <span className="block text-3xl font-display text-white drop-">{data.clipStartTime?.toFixed(2) || "0.00"}s</span>
                </button>
                <FrameAdjuster field="clipStartTime" />
              </div>
              <div className="flex flex-col">
                <button onClick={() => setTimeFor("clipEndTime")} className="w-full bg-black/90 border-2 border-white p-3 text-center hover:border-orange-500 rounded-none transition-all flex flex-col items-center">
                  <span className="block text-[10px] text-white bg-red-600 px-2 py-1 uppercase tracking-widest font-sans font-bold mb-1">Fin Clip</span>
                  <span className="block text-3xl font-display text-white drop-">{data.clipEndTime?.toFixed(2) || "0.00"}s</span>
                </button>
                <FrameAdjuster field="clipEndTime" />
              </div>
            </div>

            <button 
              onClick={() => playRange(data.clipStartTime || 0, data.clipEndTime || 0)} 
              className="bg-black/90 border-2 border-white p-2 text-sm font-sans font-bold text-white border-2 border-white flex items-center justify-center gap-2  rounded-none transform hover:scale-105 transition-transform"
            >
              <Play className="w-4 h-4 fill-current" /> Probar Rango
            </button>

            <div className="mt-auto pt-2">
              <button 
                onClick={() => {
                  if (data.markers.length > 0) {
                    setStep("overview");
                  } else {
                    goToTrickTime(currentTrickIndex);
                  }
                }}
                disabled={!data.clipEndTime || data.clipEndTime <= (data.clipStartTime || 0)}
                className="w-full bg-red-600 text-black p-2 font-display text-xl border-2 border-white  rounded-none disabled:opacity-50 disabled:grayscale transform hover:scale-105 transition-transform"
              >
                {data.markers.length > 0 ? "Volver al Resumen" : "Siguiente: Truco 1"}
              </button>
            </div>
          </div>
        )}

        {step === "trick_time" && (
          <div className="space-y-2 flex-1 flex flex-col">
            <div className="text-center space-y-1 ">
              <h3 className="text-xl font-display text-red-600 drop-">Truco {currentTrickIndex + 1} de {data.trickCount}</h3>
              <p className="text-[10px] text-zinc-300 font-sans font-bold bg-black px-2 inline-block rounded-none">Pausa el vídeo justo antes del pop.</p>
            </div>

            <div className="flex flex-col">
              <button onClick={() => setTimeFor("pauseTime")} className="w-full bg-black/90 border-2 border-white p-3 text-center border-2 border-red-600 rounded-none">
                <span className="block text-[10px] text-white bg-red-600 px-1 uppercase tracking-widest font-sans font-bold mb-1 inline-block">Momento de Pop (Pausa)</span>
                <span className="block text-3xl font-display text-white drop-">{editingTrick.pauseTime?.toFixed(2) || "0.00"}s</span>
              </button>
              <FrameAdjuster field="pauseTime" />
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => {
                  const endTime = editingTrick.pauseTime || 0;
                  let startTime = endTime - 2;
                  const clipStart = data.clipStartTime || 0;
                  if (startTime < clipStart) startTime = clipStart;
                  playRange(startTime, endTime);
                }} 
                className="flex-1 bg-black/90 border-2 border-white p-2 text-[10px] font-sans font-bold text-white flex items-center justify-center gap-1 rounded-none hover:scale-105 transition-transform"
              >
                <Play className="w-3 h-3 fill-current" /> Ver Aproximación
              </button>

              <button 
                onClick={() => {
                  const startTime = editingTrick.pauseTime || 0;
                  let endTime = startTime + 2;
                  if (data.clipEndTime && endTime > data.clipEndTime) endTime = data.clipEndTime;
                  playRange(startTime, endTime);
                }} 
                className="flex-1 bg-black/90 border-2 border-white p-2 text-[10px] font-sans font-bold text-white flex items-center justify-center gap-1 rounded-none hover:scale-105 transition-transform"
              >
                <Play className="w-3 h-3 fill-current" /> Ver Aterrizaje
              </button>
            </div>

            <div className="mt-auto pt-2">
              <button 
                onClick={() => setStep("trick_labels")}
                className="w-full bg-red-600 text-black p-2 font-display text-xl border-2 border-white  rounded-none  hover:scale-105 transition-transform"
              >
                Etiquetar Opciones
              </button>
            </div>
          </div>
        )}

        {step === "trick_labels" && (
          <div className="space-y-1 flex-1 flex flex-col overflow-hidden">
            <div className="text-center ">
              <h3 className="text-lg font-display text-red-600 drop-">Opciones: Truco {currentTrickIndex + 1}</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-1.5 pb-1 overflow-y-auto">
              <div className="space-y-0.5 col-span-2">
                <label className="zine-badge-red mb-1">Categoría</label>
                <select value={trickType} onChange={e => setTrickType(e.target.value)} className="zine-select">
                  <option>Fliptrick</option><option>Grind/Slide</option><option>Manual</option><option>Grab</option><option>Stall</option><option>Wallride/Other</option><option>Caída</option>
                </select>
              </div>

              <div className="space-y-0.5">
                <label className="zine-badge-red mb-1">Stance</label>
                <select value={stance} onChange={e => setStance(e.target.value)} className="zine-select">
                  <option>Normal</option><option>Switch</option><option>Nollie</option><option>Fakie</option>
                </select>
              </div>

              <div className="space-y-0.5">
                <label className="zine-badge-red mb-1">Rotación</label>
                <select value={rotation} onChange={e => setRotation(e.target.value)} className="zine-select">
                  <option>None</option><option>FS 180</option><option>BS 180</option><option>FS 360</option><option>BS 360</option>
                </select>
              </div>

              {(trickType === "Grind/Slide" || trickType === "Manual") && (
                <div className="space-y-0.5">
                  <label className="zine-badge-red mb-1">FS or BS</label>
                  <select value={direction} onChange={e => setDirection(e.target.value)} className="zine-select">
                    <option>None</option><option>FS</option><option>BS</option>
                  </select>
                </div>
              )}

              <div className="space-y-0.5">
                <label className="zine-badge-red mb-1">Pressure</label>
                <select value={pressure} onChange={e => setPressure(e.target.value)} className="zine-select">
                  <option>None</option><option>Pressure</option>
                </select>
              </div>

              {(trickType === "Fliptrick" || trickType === "Stall") && (
                <div className="space-y-0.5">
                  <label className="zine-badge-red mb-1">Flip</label>
                  <select value={flip} onChange={e => setFlip(e.target.value)} className="zine-select">
                    <option>None</option><option>Ollie</option><option>No-Comply</option><option>Slappy</option><option>Hippy Jump</option><option>Boneless</option><option>Beanplant</option><option>Kickflip</option><option>Heelflip</option><option>Tre Flip</option><option>Shove-it</option><option>FS Shove-it</option><option>Hardflip</option><option>Inward Heelflip</option><option>Varial Kickflip</option><option>Varial Heelflip</option><option>Lazer Flip</option><option>BS Bigspin</option><option>FS Bigspin</option><option>Bigspin Flip</option><option>Bigspin Heelflip</option><option>Biggerspin Flip</option><option>Biggerspin Heelflip</option>
                  </select>
                </div>
              )}

              {trickType === "Grab" && (
                <div className="space-y-0.5">
                  <label className="zine-badge-red mb-1">Grab</label>
                  <select value={grab} onChange={e => setGrab(e.target.value)} className="zine-select">
                    <option>None</option><option>Indy</option><option>Melon</option><option>Mute</option><option>Tailgrab</option><option>Nosegrab</option>
                  </select>
                </div>
              )}

              {(trickType === "Grind/Slide" || trickType === "Manual") && (
                <div className="space-y-1 col-span-2 flex flex-col gap-1">
                  <div className="flex gap-1 w-full">
                    <div className="w-1/2">
                      <label className="zine-badge-red mb-1">Flip In</label>
                      <select value={flipIn} onChange={e => setFlipIn(e.target.value)} className="zine-select">
                        <option>None</option><option>Ollie</option><option>No-Comply</option><option>Slappy</option><option>Hippy Jump</option><option>Boneless</option><option>Beanplant</option><option>Kickflip</option><option>Heelflip</option><option>Tre Flip</option><option>Shove-it</option><option>FS Shove-it</option><option>Hardflip</option><option>Inward Heelflip</option><option>Varial Kickflip</option><option>Varial Heelflip</option><option>Lazer Flip</option><option>BS Bigspin</option><option>FS Bigspin</option><option>Bigspin Flip</option><option>Bigspin Heelflip</option><option>Biggerspin Flip</option><option>Biggerspin Heelflip</option>
                      </select>
                    </div>
                    {trickType === "Grind/Slide" && (
                      <div className="w-1/2">
                        <label className="zine-badge-red mb-1">Grind</label>
                        <select value={grind} onChange={e => setGrind(e.target.value)} className="zine-select">
                          <option>None</option><option>50-50</option><option>5-0</option><option>Nosegrind</option><option>Crooked</option><option>Overcrook</option><option>Feeble</option><option>Smith</option><option>Boardslide</option><option>Lipslide</option><option>Noseslide</option><option>Tailslide</option><option>Bluntslide</option><option>Noseblunt</option><option>Darkslide</option>
                        </select>
                      </div>
                    )}
                    {trickType === "Manual" && (
                      <div className="w-1/2">
                        <label className="zine-badge-red mb-1">Manual</label>
                        <select value={manual} onChange={e => setManual(e.target.value)} className="zine-select">
                          <option>None</option><option>Manual</option><option>Nose Manual</option><option>Casper</option><option>Primo</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {(trickType === "Grind/Slide" ? grind !== "None" : manual !== "None") && (
                    <div className="flex flex-col gap-1 w-full bg-black/90 border-2 border-white/30 p-1.5 rounded-md border-2 border-dashed border-zinc-700">
                      <div className="grid grid-cols-2 gap-1 w-full">
                        <div className="w-full">
                          <label className="text-[9px] font-sans font-bold text-red-400">Stance Mid</label>
                          <select value={stanceMid} onChange={e => setStanceMid(e.target.value)} className="zine-select">
                            <option>Normal</option><option>Switch</option><option>Nollie</option><option>Fakie</option>
                          </select>
                        </div>
                        <div className="w-full">
                          <label className="text-[9px] font-sans font-bold text-red-400">FS or BS Mid</label>
                          <select value={dirMid} onChange={e => setDirMid(e.target.value)} className="zine-select">
                            <option>None</option><option>FS</option><option>BS</option>
                          </select>
                        </div>
                        <div className="w-full">
                          <label className="text-[9px] font-sans font-bold text-red-400">Rot Mid</label>
                          <select value={rotMid} onChange={e => setRotMid(e.target.value)} className="zine-select">
                            <option>None</option><option>FS 180</option><option>BS 180</option><option>FS 360</option><option>BS 360</option>
                          </select>
                        </div>
                        <div className="w-full">
                          <label className="text-[9px] font-sans font-bold text-red-400">Flip Mid</label>
                          <select value={flipMid} onChange={e => setFlipMid(e.target.value)} className="zine-select">
                            <option>None</option><option>Ollie</option><option>No-Comply</option><option>Slappy</option><option>Hippy Jump</option><option>Boneless</option><option>Beanplant</option><option>Kickflip</option><option>Heelflip</option><option>Tre Flip</option><option>Shove-it</option><option>FS Shove-it</option><option>Hardflip</option><option>Inward Heelflip</option><option>Varial Kickflip</option><option>Varial Heelflip</option><option>Lazer Flip</option><option>BS Bigspin</option><option>FS Bigspin</option><option>Bigspin Flip</option><option>Bigspin Heelflip</option><option>Biggerspin Flip</option><option>Biggerspin Heelflip</option>
                          </select>
                        </div>
                      </div>
                      <div className="w-full mt-1">
                        {trickType === "Grind/Slide" ? (
                          <>
                            <label className="text-[9px] font-sans font-bold text-red-400">To Grind</label>
                            <select value={grind2} onChange={e => setGrind2(e.target.value)} className="zine-select">
                              <option>None</option><option>50-50</option><option>5-0</option><option>Nosegrind</option><option>Crooked</option><option>Overcrook</option><option>Feeble</option><option>Smith</option><option>Boardslide</option><option>Lipslide</option><option>Noseslide</option><option>Tailslide</option><option>Bluntslide</option><option>Noseblunt</option><option>Darkslide</option>
                            </select>
                          </>
                        ) : (
                          <>
                            <label className="text-[9px] font-sans font-bold text-red-400">To Manual</label>
                            <select value={manual2} onChange={e => setManual2(e.target.value)} className="zine-select">
                              <option>None</option><option>Manual</option><option>Nose Manual</option><option>Casper</option><option>Primo</option>
                            </select>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {((trickType === "Grind/Slide" && (grind !== "None" || grind2 !== "None")) || (trickType === "Manual" && (manual !== "None" || manual2 !== "None"))) && (
                    <div className="grid grid-cols-2 gap-1 w-full bg-black/90 border-2 border-white/30 p-1.5 rounded-md border-2 border-dashed border-zinc-700">
                      <div className="w-full">
                        <label className="text-[9px] font-sans font-bold text-red-400">Stance Out</label>
                        <select value={stanceOut} onChange={e => setStanceOut(e.target.value)} className="zine-select">
                          <option>Normal</option><option>Switch</option><option>Nollie</option><option>Fakie</option>
                        </select>
                      </div>
                      <div className="w-full">
                        <label className="text-[9px] font-sans font-bold text-red-400">FS or BS Out</label>
                        <select value={dirOut} onChange={e => setDirOut(e.target.value)} className="zine-select">
                          <option>None</option><option>FS</option><option>BS</option>
                        </select>
                      </div>
                      <div className="w-full">
                        <label className="text-[9px] font-sans font-bold text-red-400">Rot Out</label>
                        <select value={rotOut} onChange={e => setRotOut(e.target.value)} className="zine-select">
                          <option>None</option><option>FS 180</option><option>BS 180</option><option>FS 360</option><option>BS 360</option>
                        </select>
                      </div>
                      <div className="w-full">
                        <label className="text-[9px] font-sans font-bold text-red-400">Flip Out</label>
                        <select value={flipOut} onChange={e => setFlipOut(e.target.value)} className="zine-select">
                          <option>None</option><option>Ollie</option><option>No-Comply</option><option>Slappy</option><option>Hippy Jump</option><option>Boneless</option><option>Beanplant</option><option>Kickflip</option><option>Heelflip</option><option>Tre Flip</option><option>Shove-it</option><option>FS Shove-it</option><option>Hardflip</option><option>Inward Heelflip</option><option>Varial Kickflip</option><option>Varial Heelflip</option><option>Lazer Flip</option><option>BS Bigspin</option><option>FS Bigspin</option><option>Bigspin Flip</option><option>Bigspin Heelflip</option><option>Biggerspin Flip</option><option>Biggerspin Heelflip</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {trickType === "Stall" && (
                <div className="space-y-0.5 ">
                  <label className="text-[9px] font-sans font-bold text-white bg-red-600 px-1 uppercase tracking-widest bg-black px-1 rounded-none">Manual / Stall</label>
                  <select value={stall} onChange={e => setStall(e.target.value)} className="w-full bg-black/90 border-2 border-white border-2 border-black px-1 text-[10px] text-white focus:outline-none font-display  rounded-none">
                    <option>None</option><option>Manual</option><option>Nose Manual</option><option>Rock to Fakie</option><option>Rock and Roll</option><option>Axle Stall</option><option>Disaster</option><option>Blunt Stall</option>
                  </select>
                </div>
              )}

              {trickType === "Wallride/Other" && (
                <div className="space-y-0.5 ">
                  <label className="text-[9px] font-sans font-bold text-white bg-red-600 px-1 uppercase tracking-widest bg-black px-1 rounded-none">Truco</label>
                  <select value={wall} onChange={e => setWall(e.target.value)} className="w-full bg-black/90 border-2 border-white border-2 border-black px-1 text-[10px] text-white focus:outline-none font-display  rounded-none">
                    <option>None</option><option>Wallride</option><option>Wallie</option><option>No-Comply</option><option>Boneless</option><option>Fastplant</option>
                  </select>
                </div>
              )}

              <div className="space-y-0.5 mt-1">
                <label className="zine-badge-red mb-1">Ending</label>
                <select value={ending} onChange={e => setEnding(e.target.value)} className="zine-select">
                  <option>None</option><option>to Fakie</option><option>Revert</option>
                </select>
              </div>

              <div className="space-y-0.5 col-span-2 mt-1">
                <label className="zine-badge-green mb-1">O texto libre</label>
                <input 
                  type="text" 
                  value={customTrick}
                  onChange={e => setCustomTrick(e.target.value)}
                  placeholder="ej. BS 5-0 mid kickflip BS 5-0"
                  className="zine-input"
                />
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="forceManualEntry"
                    checked={forceManualEntry}
                    onChange={(e) => setForceManualEntry(e.target.checked)}
                    className="w-4 h-4 accent-red-600"
                  />
                  <label htmlFor="forceManualEntry" className="text-[10px] font-sans font-bold text-white cursor-pointer select-none">
                    Modo Hardcore (forzar escritura manual)
                  </label>
                </div>
              </div>

              <div className="space-y-0.5 col-span-2 mt-1 mb-1">
                <div className="flex justify-between items-end mb-1">
                  <label className="zine-badge-red">Trucos falsos (opcional)</label>
                  <button onClick={autoGenerateFalseTricks} className="zine-badge-yellow hover:scale-105 transition-transform cursor-pointer">
                    ⚡ Generar Similares
                  </button>
                </div>
                <div className="flex gap-1">
                  <input type="text" value={false1} onChange={e => setFalse1(e.target.value)} placeholder="Falso 1" className="w-1/3 zine-input" />
                  <input type="text" value={false2} onChange={e => setFalse2(e.target.value)} placeholder="Falso 2" className="w-1/3 zine-input" />
                  <input type="text" value={false3} onChange={e => setFalse3(e.target.value)} placeholder="Falso 3" className="w-1/3 zine-input" />
                </div>
              </div>
            </div>

            <div className="mt-auto pt-1 flex gap-2">
              <button 
                onClick={() => goToTrickTime(currentTrickIndex)}
                className="flex-1 bg-black/90 border-2 border-white text-white p-3 font-display text-xl border-2 border-white  rounded-none  hover:scale-105 transition-transform"
              >
                Volver
              </button>
              <button 
                onClick={saveTrick}
                className="flex-1 bg-green-500 text-black p-3 font-display text-xl border-2 border-white  rounded-none hover:scale-105 transition-transform"
              >
                Guardar
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="space-y-4 flex-1 flex flex-col items-center justify-start text-center py-2 overflow-y-auto">
            <Check className="w-16 h-16 text-green-500 mb-2  drop- shrink-0" strokeWidth={3} />
            <h3 className="text-3xl font-display text-red-600 drop- shrink-0">
              {data.markers.length >= data.trickCount ? "¡Línea Creada!" : "Progreso de Cinta"}
            </h3>
            
            <div className="w-full space-y-2 mt-4 text-left px-1 pb-4">
              <div className="flex justify-between items-center mb-2 px-1">
                 <h4 className="font-display text-white text-lg drop-">Marcadores ({data.markers.length})</h4>
                 <button onClick={() => setStep("overview")} className="text-xs bg-black/90 border-2 border-white border-2 border-black text-white bg-red-600 px-1 uppercase tracking-widest px-3 py-1.5 font-sans font-bold rounded-none hover:scale-105 transition-transform">
                   Cuadrícula
                 </button>
              </div>
              {data.markers.map((m, i) => (
                <div key={m.id} className="bg-black/90 border-2 border-white p-2.5 border-2 border-white  rounded-none flex justify-between items-center transform transition-transform hover:-translate-y-0.5">
                  <div className="flex-1 overflow-hidden pr-2">
                    <p className="text-[10px] text-white bg-red-600 px-1 uppercase tracking-widest font-sans font-bold">{m.pauseTime.toFixed(1)}s</p>
                    <p className="text-sm text-white font-sans font-bold truncate">{m.correctTrick}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => {
                      setCurrentTrickIndex(i);
                      setEditingTrick({ id: m.id, pauseTime: m.pauseTime });
                      resetDropdowns();
                      setCustomTrick(m.correctTrick);
                      if (m.falseTricks[0]) setFalse1(m.falseTricks[0]);
                      if (m.falseTricks[1]) setFalse2(m.falseTricks[1]);
                      if (m.falseTricks[2]) setFalse3(m.falseTricks[2]);
                      goToTrickTime(i);
                    }} className="p-2 bg-blue-500 text-white border-2 border-black rounded-none hover:scale-110 transition-transform">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => {
                      const newMarkers = [...data.markers];
                      newMarkers.splice(i, 1);
                      setData({ ...data, markers: newMarkers });
                      if (newMarkers.length === 0) {
                        setCurrentTrickIndex(0);
                        goToTrickTime(0);
                      }
                    }} className="p-2 bg-red-500 text-white border-2 border-black rounded-none hover:scale-110 transition-transform">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-auto pt-2 w-full shrink-0">
              <button 
                onClick={() => onFinish(data)}
                disabled={data.markers.length === 0}
                className="w-full bg-white text-black p-3 font-display text-2xl flex items-center justify-center gap-2 border-2 border-white  rounded-none disabled:opacity-50 disabled:grayscale  hover:scale-105 transition-transform"
              >
                Guardar Clip
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
