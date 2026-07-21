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

const baseUrl = import.meta.env.BASE_URL;

const playlist = [
  `${baseUrl}1980s.mp3`,
  `${baseUrl}aaron kyro - sample.mp3`,
  `${baseUrl}Akita.wav`,
  `${baseUrl}alegre v2.wav`,
  `${baseUrl}Baby.wav`,
  `${baseUrl}baseRap_sinNotoriousBIG.mp3`,
  `${baseUrl}Color.mp3`,
  `${baseUrl}crepitar instru.wav`,
  `${baseUrl}Gameboy.mp3`,
  `${baseUrl}instru arcade soul 20251226.wav`,
  `${baseUrl}Intro.wav`,
  `${baseUrl}Life.wav`,
  `${baseUrl}Mist.mp3`,
  `${baseUrl}Nightmares.mp3`,
  `${baseUrl}Omino.mp3`,
  `${baseUrl}Please don't go.mp3`,
  `${baseUrl}prueba high gain long v2 knockedloose denzelcurry-01.mp3`,
  `${baseUrl}sample 2 - japanese.mp3`,
  `${baseUrl}Schoolyard.wav`,
  `${baseUrl}Stab.mp3`,
  `${baseUrl}Sus.wav`,
  `${baseUrl}Tandem.mp3`,
  `${baseUrl}Ten.mp3`,
  `${baseUrl}The way it is.mp3`,
  `${baseUrl}Vivo.mp3`
];

const DEFAULT_LINES: LineData[] = [
  {
    "videoId": "fJhqj5fo35Y",
    "skater": "yuto puto horigome",
    "videoPart": "New Balance Numeric | Southerly",
    "lineName": "3 piece",
    "title": "yuto puto horigome - New Balance Numeric | Southerly - 3 piece",
    "videoType": "Ronda",
    "trickCount": 3,
    "clipStartTime": 46.71387408964538,
    "clipEndTime": 61.09999193896484,
    "markers": [
      {
        "id": "1784646742552",
        "pauseTime": 47.14743408964538,
        "correctTrick": "Slappy FS Crooked out Nollie BS 180",
        "falseTricks": ["slappy nose to bs 180 out", "slappy 5-0  shoe-it", "slappy noseblunt"],
        "isCustomText": false
      },
      {
        "id": "1784646952968",
        "pauseTime": 52.68495897138977,
        "correctTrick": "Fakie BS Crooked",
        "falseTricks": ["fakie tailslide", "fakie heelflip tailslide", "fakie ollie bs noseblunt"],
        "isCustomText": false
      },
      {
        "id": "1784647017296",
        "pauseTime": 58.0836670629425,
        "correctTrick": "Fakie Heelflip FS Tailslide",
        "falseTricks": ["half cab heelflip nose", "fakie heelflip sw fs crooked", "fakie fs shove-it to switch 5-0"],
        "isCustomText": false
      }
    ]
  },
  {
    "videoId": "CztI5CLgb7k",
    "skater": "dan murphy",
    "videoPart": "Mystery Skateboards 2026",
    "lineName": "fast feet",
    "title": "dan murphy - Mystery Skateboards 2026 - fast feet",
    "videoType": "Ronda",
    "trickCount": 2,
    "clipStartTime": 35.36857609536742,
    "clipEndTime": 40.90067292561341,
    "markers": [
      {
        "id": "1784648789321",
        "pauseTime": 35.604931045776375,
        "correctTrick": "Ollie Manual",
        "falseTricks": ["Noseslide", "Ollie BS", "kickflip"],
        "isCustomText": false
      },
      {
        "id": "1784648945120",
        "pauseTime": 38.6043310457764,
        "correctTrick": "Nollie BS Tailslide out BS Bigspin to Fakie",
        "falseTricks": ["BS Tailslide out BS Bigspin to Fakie", "Nollie FS Tailslide out BS Bigspin to Fakie", "Nollie BS Crooked out BS Bigspin to Fakie"],
        "isCustomText": false
      }
    ]
  }
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
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_LINES;
  });

  const [currentLineData, setCurrentLineData] = useState<LineData | null>(null);
  const [editingLineIndex, setEditingLineIndex] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem("skate_stopper_lines", JSON.stringify(lines));
  }, [lines]);

  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.muted = next;
      }
      return next;
    });
  };

  useEffect(() => {
    if (audioRef.current) {
      // Set preservesPitch for the turntable effect
      (audioRef.current as any).preservesPitch = false;
      (audioRef.current as any).mozPreservesPitch = false;
      (audioRef.current as any).webkitPreservesPitch = false;
      audioRef.current.muted = isMuted;
      
      const musicStates = ["LOGIN", "HOME", "MENU", "RANKING", "SETUP", "EDITOR", "STASH"];
      if (musicStates.includes(appState) && !isMuted) {
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
  }, [appState, currentSongIndex, isMuted]);

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



  useEffect(() => {
    const unlockAudio = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.volume = 0.1;
        audioRef.current.play().catch(() => {});
      }
    };

    window.addEventListener("pointerdown", unlockAudio, { once: true });
    window.addEventListener("touchstart", unlockAudio, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
    };
  }, []);

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
      const audio = new Audio(`${baseUrl}skid.wav`);
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
    const text = prompt("Pega aquí el código del Tape Stash o clip que quieres importar:");
    if (!text) return;
    try {
      let raw = JSON.parse(text);
      if (!Array.isArray(raw)) raw = [raw];
      const importedLines = raw as LineData[];
      if (importedLines.length > 0 && importedLines[0].videoId) {
        setLines((prev) => {
          const newUnique = importedLines.filter(
            imp => !prev.some(p => p.videoId === imp.videoId && p.clipStartTime === imp.clipStartTime)
          );
          if (newUnique.length === 0) {
            alert("Los clips importados ya existen en tu alijo.");
            return prev;
          }
          alert(`¡${newUnique.length} clip(s) añadido(s) a tu alijo con éxito!`);
          return [...prev, ...newUnique];
        });
      } else {
        throw new Error("Invalid format");
      }
    } catch (e) {
      alert("Error al importar. Asegúrate de haber pegado un código de clip válido.");
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
        src={`${baseUrl}tictac.wav`} 
        loop
        preload="auto"
      />
      
      {/* Mobile Frame Container */}
      <div className="w-full h-[100dvh] max-w-md bg-[#050505] shadow-2xl border-x border-zinc-900 flex flex-col relative overflow-hidden">
        
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
            isMuted={isMuted}
            onToggleMute={toggleMute}
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
