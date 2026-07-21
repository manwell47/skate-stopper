import React, { useState, useEffect, useRef } from "react";
import MobileSetup from "./components/MobileSetup";
import MobileEditor from "./components/MobileEditor";
import MobilePlayer from "./components/MobilePlayer";
import MobileMenu from "./components/MobileMenu";
import MobileHome from "./components/MobileHome";
import MobileRanking from "./components/MobileRanking";
import MobileStash from "./components/MobileStash";
import MobileLogin from "./components/MobileLogin";
import { LineData, Player, GameState, Challenge } from "./types";

const playlist = [
  "/1980s.mp3",
  "/aaron kyro - sample.mp3",
  "/Akita.wav",
  "/alegre v2.wav",
  "/Baby.wav",
  "/baseRap_sinNotoriousBIG.mp3",
  "/Color.mp3",
  "/crepitar instru.wav",
  "/Gameboy.mp3",
  "/instru arcade soul 20251226.wav",
  "/Intro.wav",
  "/Life.wav",
  "/Mist.mp3",
  "/Nightmares.mp3",
  "/Omino.mp3",
  "/Please don't go.mp3",
  "/prueba high gain long v2 knockedloose denzelcurry-01.mp3",
  "/sample 2 - japanese.mp3",
  "/Schoolyard.wav",
  "/Stab.mp3",
  "/Sus.wav",
  "/Tandem.mp3",
  "/Ten.mp3",
  "/The way it is.mp3",
  "/Vivo.mp3"
];

export default function App() {
  const [appState, setAppState] = useState<"LOGIN" | "HOME" | "MENU" | "SETUP" | "EDITOR" | "PLAYER" | "RANKING" | "STASH">("LOGIN");
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  
  const [currentSongIndex, setCurrentSongIndex] = useState(() => Math.floor(Math.random() * playlist.length));

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const tictacRef = useRef<HTMLAudioElement | null>(null);
  const pitchAnimRef = useRef<number | null>(null);

  const [lines, setLines] = useState<LineData[]>(() => {
    const saved = localStorage.getItem("skate_stopper_lines");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [currentLineData, setCurrentLineData] = useState<LineData | null>(null);
  const [editingLineIndex, setEditingLineIndex] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem("skate_stopper_lines", JSON.stringify(lines));
  }, [lines]);

  useEffect(() => {
    if (audioRef.current) {
      // Set preservesPitch for the turntable effect
      (audioRef.current as any).preservesPitch = false;
      (audioRef.current as any).mozPreservesPitch = false;
      (audioRef.current as any).webkitPreservesPitch = false;
      
      const musicStates = ["LOGIN", "HOME", "MENU", "RANKING", "SETUP", "EDITOR", "STASH"];
      if (musicStates.includes(appState)) {
        audioRef.current.volume = 0.1;
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }

    if (tictacRef.current) {
      if (appState === "PLAYER") {
        tictacRef.current.volume = 0.5;
        tictacRef.current.play().catch(() => {});
      } else {
        tictacRef.current.pause();
      }
    }
  }, [appState, currentSongIndex]);

  const pitchDownMusic = () => {
    if (!audioRef.current) return;
    if (pitchAnimRef.current) cancelAnimationFrame(pitchAnimRef.current);
    
    let rate = audioRef.current.playbackRate;
    const animate = () => {
      rate -= 0.03;
      if (rate <= 0.1) {
        if (audioRef.current) {
          audioRef.current.playbackRate = 0.1;
          audioRef.current.pause();
        }
      } else {
        if (audioRef.current) {
          audioRef.current.playbackRate = rate;
          pitchAnimRef.current = requestAnimationFrame(animate);
        }
      }
    };
    animate();
  };

  const pitchUpMusic = () => {
    if (!audioRef.current) return;
    if (pitchAnimRef.current) cancelAnimationFrame(pitchAnimRef.current);
    
    audioRef.current.play().catch(() => {});
    let rate = audioRef.current.playbackRate;
    if (rate >= 1.0) rate = 0.1; // reset if it wasn't pitched down properly

    const animate = () => {
      rate += 0.03;
      if (rate >= 1.0) {
        if (audioRef.current) {
          audioRef.current.playbackRate = 1.0;
        }
      } else {
        if (audioRef.current) {
          audioRef.current.playbackRate = rate;
          pitchAnimRef.current = requestAnimationFrame(animate);
        }
      }
    };
    animate();
  };



  const handleLogin = (alias: string) => {
    setJustLoggedIn(true);
    setAppState("HOME");
    if (audioRef.current) {
      audioRef.current.volume = 0.1;
      audioRef.current.play().catch(() => {});
    }
  };

  const handleGlobalClick = (e: React.MouseEvent) => {
    const musicStates = ["LOGIN", "HOME", "MENU", "RANKING", "SETUP", "EDITOR", "STASH"];
    if (audioRef.current && audioRef.current.paused && musicStates.includes(appState)) {
      audioRef.current.volume = 0.1;
      audioRef.current.play().catch(() => {});
    }
    
    if (tictacRef.current && tictacRef.current.paused && appState === "PLAYER") {
      tictacRef.current.volume = 0.5;
      tictacRef.current.play().catch(() => {});
    }

    const target = e.target as HTMLElement;
    const btn = target.closest('button');
    if (btn && !btn.classList.contains('no-skid')) {
      const audio = new Audio("/skid.wav");
      audio.volume = 0.35;
      audio.preservesPitch = false;
      // Provide a random pitch between 0.8x and 1.2x
      audio.playbackRate = 0.8 + Math.random() * 0.4;
      audio.play().catch(() => {});
    }
  };

  const handleExportStash = async () => {
    try {
      const dataStr = JSON.stringify(lines);
      await navigator.clipboard.writeText(dataStr);
      alert("Tape Stash copiado al portapapeles. ¡Pégalo para compartirlo!");
    } catch (e) {
      prompt("Copia este código de Stash:", JSON.stringify(lines));
    }
  };

  const handleImportStash = () => {
    const text = prompt("Pega aquí el código del Tape Stash que quieres importar:");
    if (!text) return;
    try {
      const importedLines = JSON.parse(text) as LineData[];
      if (Array.isArray(importedLines)) {
        setLines((prev) => [...prev, ...importedLines]);
        alert(`¡${importedLines.length} vídeos importados con éxito!`);
      } else {
        throw new Error("Invalid format");
      }
    } catch (e) {
      alert("Error al importar. Asegúrate de haber pegado un Stash válido.");
    }
  };

  const handleSongEnded = () => {
    setCurrentSongIndex((prevIndex) => (prevIndex + 1) % playlist.length);
  };

  return (
    <div 
      className="min-h-screen bg-zinc-950 flex justify-center items-center font-sans selection:bg-orange-500 selection:text-black"
      onClick={handleGlobalClick}
    >
      <audio 
        ref={audioRef} 
        src={playlist[currentSongIndex]} 
        autoPlay
        preload="auto"
        onEnded={handleSongEnded}
      />
      <audio 
        ref={tictacRef} 
        src="/tictac.wav" 
        loop
        preload="auto"
      />
      
      {/* Mobile Frame Container */}
      <div className="w-full h-screen max-w-md bg-[#050505] shadow-2xl border-x border-zinc-900 flex flex-col relative overflow-hidden">
        
        {appState === "LOGIN" && (
          <MobileLogin onLogin={handleLogin} />
        )}

        {appState === "HOME" && (
          <MobileHome 
            showWelcomePopup={justLoggedIn}
            onPopupComplete={() => setJustLoggedIn(false)}
            onPlayClips={() => setAppState("MENU")}
            onCreateClip={() => {
              if (editingLineIndex !== null) {
                // If they were editing an existing stash item, creating a new one clears it
                setEditingLineIndex(null);
                setCurrentLineData(null);
              }
              setAppState("SETUP");
            }}
            onRanking={() => setAppState("RANKING")}
            onStash={() => setAppState("STASH")}
          />
        )}

        {appState === "RANKING" && (
          <MobileRanking
            onBack={() => setAppState("HOME")}
          />
        )}

        {appState === "STASH" && (
          <MobileStash
            lines={lines}
            onEdit={(index) => {
              setEditingLineIndex(index);
              setCurrentLineData(lines[index]);
              setAppState("EDITOR");
            }}
            onDelete={(index) => {
              if (confirm("¿Seguro que quieres borrar este clip?")) {
                const newLines = [...lines];
                newLines.splice(index, 1);
                setLines(newLines);
              }
            }}
            onExportStash={handleExportStash}
            onImportStash={handleImportStash}
            onBack={() => setAppState("HOME")}
          />
        )}

        {appState === "MENU" && (
          <MobileMenu 
            lines={lines}
            onPlay={(line) => {
              setCurrentLineData(line);
              setAppState("PLAYER");
            }}
            onBack={() => setAppState("HOME")}
          />
        )}

        {appState === "SETUP" && (
          <MobileSetup 
            initialData={currentLineData || undefined}
            onVideoPlay={pitchDownMusic}
            onVideoPause={pitchUpMusic}
            onSetupComplete={(data) => {
              setCurrentLineData(data);
              setAppState("EDITOR");
            }} 
            onBack={(data) => {
              setCurrentLineData(data);
              setAppState("HOME");
            }}
          />
        )}

        {appState === "EDITOR" && currentLineData && (
          <MobileEditor 
            lineData={currentLineData} 
            onVideoPlay={pitchDownMusic}
            onVideoPause={pitchUpMusic}
            onFinish={(data) => {
              const newLines = [...lines];
              if (editingLineIndex !== null) {
                newLines[editingLineIndex] = data;
              } else {
                newLines.push(data);
              }
              setLines(newLines);
              setCurrentLineData(null);
              setEditingLineIndex(null);
              setAppState("HOME");
            }}
            onBack={(data) => {
              setCurrentLineData(data);
              setAppState("SETUP");
            }}
          />
        )}

        {appState === "PLAYER" && currentLineData && (
          <MobilePlayer 
            lineData={currentLineData}
            onBack={() => setAppState("MENU")}
          />
        )}
      </div>
    </div>
  );
}
