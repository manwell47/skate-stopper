import React, { useState, useRef, useEffect } from "react";
import YouTube, { YouTubePlayer, YouTubeProps } from "react-youtube";
import { LineData, TrickMarker } from "../types";
import { ChevronLeft, Play, RotateCcw, Trash2 } from "lucide-react";

const VOTE_MEMES = [
  "WHAT THE HELL IS HE TRYING?",
  "SHIT, LOOK AT THOSE SHOULDERS",
  "WAIT, IS HE REGULAR OR GOOFY?",
  "I BET HE BAILS",
  "WATCH THE BACK FOOT",
  "IS THIS A NBD?",
  "HOMIE IS ABOUT TO SEND IT",
  "AINT NO WAY HE LANDS THIS",
  "THAT RUN-UP IS SUS",
  "HE'S BEEN TRYING THIS FOR 3 HOURS",
  "STEEZY INCOMING",
  "RIP HIS ANKLES",
  "BRO THINKS HE'S MULLEN"
];

interface Props {
  lineData: LineData;
  onBack: () => void;
}

export default function MobilePlayer({ lineData, onBack }: Props) {
  const [numPlayers, setNumPlayers] = useState(1);
  const [playerNames, setPlayerNames] = useState<string[]>([localStorage.getItem("skate_stopper_alias") || ""]);
  const [players, setPlayers] = useState<{name: string, score: number}[]>([]);
  const [aliasConfirmed, setAliasConfirmed] = useState(false);

  const [currentPlayerGuessingIndex, setCurrentPlayerGuessingIndex] = useState(0);
  const [currentTrickGuesses, setCurrentTrickGuesses] = useState<Record<number, string>>({});
  const [currentMeme, setCurrentMeme] = useState(VOTE_MEMES[0]);

  const [currentMarkerIndex, setCurrentMarkerIndex] = useState(0);
  const [gameState, setGameState] = useState<"ready" | "playing_to_pause" | "guessing" | "playing_feedback" | "feedback_paused" | "replaying_trick" | "replaying_whole" | "playing_to_end" | "jury" | "finished">("ready");
  
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [textGuess, setTextGuess] = useState("");
  const [loopSpeed, setLoopSpeed] = useState<number>(0);
  
  interface Challenge {
    playerIndex: number;
    playerName: string;
    trickIndex: number;
    guessedTrick: string;
    correctTrick: string;
    status?: "pending" | "accepted" | "rejected";
  }
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  
  const playerRef = useRef<YouTubePlayer | null>(null);
  const intervalRef = useRef<number | null>(null);
  const leaderboardUpdatedRef = useRef(false);
  const [leaderboard, setLeaderboard] = useState<{name: string, score: number}[]>([]);

  useEffect(() => {
    if (gameState === "finished" && !leaderboardUpdatedRef.current) {
      leaderboardUpdatedRef.current = true;
      const key = `skate_stopper_ranking_${lineData.videoId}_${lineData.clipStartTime}`;
      const saved = localStorage.getItem(key);
      let currentRanking: {name: string, score: number}[] = saved ? JSON.parse(saved) : [];
      
      players.forEach(p => {
        currentRanking.push(p);
      });
      
      currentRanking.sort((a, b) => b.score - a.score);
      
      localStorage.setItem(key, JSON.stringify(currentRanking));
      setLeaderboard(currentRanking);

      const globalSaved = localStorage.getItem("skate_stopper_global_ranking");
      let globalRanking: {name: string, score: number}[] = globalSaved ? JSON.parse(globalSaved) : [];
      
      players.forEach(p => {
        const existingPlayer = globalRanking.find(g => g.name === p.name);
        if (existingPlayer) {
          existingPlayer.score += p.score;
        } else {
          globalRanking.push({...p});
        }
      });

      globalRanking.sort((a, b) => b.score - a.score);
      localStorage.setItem("skate_stopper_global_ranking", JSON.stringify(globalRanking));
    }
  }, [gameState, players, lineData]);

  const marker = lineData.markers[currentMarkerIndex];

  const stateRef = useRef({ gameState, marker, clipEndTime: lineData.clipEndTime, trickStartTime: lineData.clipStartTime, loopSpeed, challenges });
  useEffect(() => {
    const trickStartTime = marker ? Math.max(lineData.clipStartTime || 0, marker.pauseTime - 0.6) : lineData.clipStartTime || 0;
    stateRef.current = { gameState, marker, clipEndTime: lineData.clipEndTime, trickStartTime, loopSpeed, challenges };
  }, [gameState, marker, lineData.clipEndTime, currentMarkerIndex, lineData, loopSpeed, challenges]);

  useEffect(() => {
    if (marker && (gameState === "playing_to_pause" || gameState === "ready")) {
      const options = [marker.correctTrick, ...marker.falseTricks];
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }
      setShuffledOptions(options);
      setSelectedOption(null);
    }
  }, [currentMarkerIndex, marker, gameState, lineData]);

  const onReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    event.target.seekTo(lineData.clipStartTime, true);
  };

  const onStateChange: YouTubeProps['onStateChange'] = (event) => {
    if (event.data === 1) { 
      if (stateRef.current.gameState === "ready") {
        setGameState("playing_to_pause");
      }

      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = window.setInterval(() => {
        if (!playerRef.current) return;
        const time = playerRef.current.getCurrentTime();
        const currentRef = stateRef.current;

        if (currentRef.gameState === "playing_to_pause" && currentRef.marker && time >= currentRef.marker.pauseTime) {
          setGameState("guessing");
          setCurrentMeme(VOTE_MEMES[Math.floor(Math.random() * VOTE_MEMES.length)]);
          if (currentRef.loopSpeed > 0) {
            playerRef.current.setPlaybackRate(currentRef.loopSpeed);
            playerRef.current.seekTo(currentRef.trickStartTime, true);
          } else {
            playerRef.current.pauseVideo();
            playerRef.current.seekTo(currentRef.marker.pauseTime, true);
          }
        }

        if (currentRef.gameState === "guessing" && currentRef.marker && currentRef.loopSpeed > 0) {
          if (time >= currentRef.marker.pauseTime || time < currentRef.trickStartTime - 0.5) {
            playerRef.current.seekTo(currentRef.trickStartTime, true);
          }
        }

        if ((currentRef.gameState === "playing_feedback" || currentRef.gameState === "replaying_trick" || currentRef.gameState === "replaying_whole") && currentRef.marker && time >= currentRef.marker.pauseTime + 2.2) {
          playerRef.current.pauseVideo();
          setGameState("feedback_paused");
        }

        if (currentRef.gameState === "playing_to_end" && time >= currentRef.clipEndTime) {
          playerRef.current.pauseVideo();
          if (currentRef.challenges.length > 0) {
            setGameState("jury");
          } else {
            setGameState("finished");
          }
        }
      }, 50);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleNextMarker = () => {
    setSelectedOption(null);
    setTextGuess("");
    setCurrentTrickGuesses({});
    setCurrentPlayerGuessingIndex(0);
    setCurrentMeme(VOTE_MEMES[Math.floor(Math.random() * VOTE_MEMES.length)]);
    if (currentMarkerIndex + 1 < lineData.markers.length) {
      setCurrentMarkerIndex(currentMarkerIndex + 1);
      setGameState("playing_to_pause");
      if (playerRef.current) {
        playerRef.current.setPlaybackRate(1.0);
        playerRef.current.setVolume(100);
        playerRef.current.playVideo();
      }
    } else {
      setGameState("playing_to_end");
      if (playerRef.current) {
        playerRef.current.setPlaybackRate(1.0);
        playerRef.current.setVolume(100);
        playerRef.current.playVideo();
      }
    }
  };

  const handleReplayTrick = () => {
    setGameState("replaying_trick");
    if (playerRef.current) {
      playerRef.current.seekTo(stateRef.current.trickStartTime, true);
      playerRef.current.playVideo();
    }
  };

  const handleReplayWhole = () => {
    setGameState("replaying_whole");
    if (playerRef.current) {
      playerRef.current.seekTo(lineData.clipStartTime, true);
      playerRef.current.playVideo();
    }
  };

  const handleChallenge = (playerIndex: number) => {
    if (!marker) return;
    const guess = currentTrickGuesses[playerIndex] || "NO ANSWER";
    setChallenges(prev => [
      ...prev,
      {
        playerIndex,
        playerName: players[playerIndex].name,
        trickIndex: currentMarkerIndex,
        guessedTrick: guess,
        correctTrick: marker.correctTrick,
        status: "pending"
      }
    ]);
  };

  const resolveChallenge = (challengeIndex: number, accept: boolean) => {
    setChallenges(prev => {
      const next = [...prev];
      next[challengeIndex].status = accept ? "accepted" : "rejected";
      return next;
    });

    if (accept) {
      const c = challenges[challengeIndex];
      setPlayers(prev => {
        const next = [...prev];
        next[c.playerIndex].score += 100;
        return next;
      });
    }
  };

  const finishJury = () => {
    setGameState("finished");
  };

  const checkTrickMatch = (input: string, target: string) => {
    if (!input || !target) return false;

    const standardize = (str: string) => str.toLowerCase().replace(/frontside/g, "fs").replace(/backside/g, "bs");
    const sInput = standardize(input);
    const sTarget = standardize(target);

    const nInput = sInput.replace(/[^a-z0-9]/g, '');
    const nTarget = sTarget.replace(/[^a-z0-9]/g, '');
    if (nInput === nTarget) return true;

    const wordsInput = sInput.replace(/[^a-z0-9\s]/g, '').split(/\s+/).sort().join('');
    const wordsTarget = sTarget.replace(/[^a-z0-9\s]/g, '').split(/\s+/).sort().join('');
    if (wordsInput === wordsTarget) return true;

    const aliases = [
      ["treflip", "360flip", "3flip", "tre"],
      ["laserflip", "360heelflip", "360heel"],
      ["rickflip", "fakiefsbigspinheelflip"],
      ["hardflip", "fsshuvitkickflip", "fspopshuvitkickflip"],
      ["inwardheelflip", "inwardheel", "bsshuvitheelflip", "bspopshuvitheelflip"],
      ["varialkickflip", "varialflip", "shuvitkickflip", "popshuvitkickflip"],
      ["varialheelflip", "varialheel", "fsshuvitheelflip", "fspopshuvitheelflip"],
      ["caballerial", "fullcab", "fakiefs360", "fakie360", "fakiefs360ollie", "fakie360ollie"],
      ["halfcab", "fakiefs180", "fakie180", "fakiefs180ollie", "fakie180ollie"],
      ["bigspin", "360shuvit180", "360popshuvit180"],
      ["biggerspin", "540shuvit180", "540popshuvit180"]
    ];

    for (const group of aliases) {
      if (group.includes(nTarget) && group.includes(nInput)) return true;
    }
    return false;
  };

  const handleGuess = (option: string) => {
    if (gameState !== "guessing") return;
    
    const nextGuesses = { ...currentTrickGuesses, [currentPlayerGuessingIndex]: option };
    setCurrentTrickGuesses(nextGuesses);
    setTextGuess(""); // clear for the next player

    if (currentPlayerGuessingIndex < players.length - 1) {
      setCurrentPlayerGuessingIndex(prev => prev + 1);
    } else {
      setSelectedOption(marker?.correctTrick || "");
      
      setPlayers(prevPlayers => {
        return prevPlayers.map((p, i) => {
          if (marker && checkTrickMatch(nextGuesses[i], marker.correctTrick)) {
            return { ...p, score: p.score + 100 };
          }
          return p;
        });
      });

      setGameState("playing_feedback");
      setTimeout(() => {
        if (playerRef.current) {
          playerRef.current.setPlaybackRate(1.0);
          playerRef.current.setVolume(100);
          playerRef.current.playVideo();
        }
      }, 1000);
    }
  };

  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 0,
      modestbranding: 1,
      rel: 0,
      disablekb: 1,
      playsinline: 1,
      origin: window.location.origin,
    },
  };

  const handleConfirmAlias = (e: React.FormEvent) => {
    e.preventDefault();
    const validNames = playerNames.slice(0, numPlayers).map((n, i) => n.trim() || `Homie ${i + 1}`);
    localStorage.setItem("skate_stopper_alias", validNames[0]);
    setPlayers(validNames.map(name => ({ name, score: 0 })));
    setAliasConfirmed(true);
  };

  if (!aliasConfirmed) {
    return (
      <div className="flex-1 flex flex-col p-6 items-center justify-start space-y-6 bg-zinc-950 relative overflow-y-auto pt-16 font-sans">
        <div className="absolute inset-0 vhs-overlay z-0" />
        <button onClick={onBack} className="absolute top-1 left-1 z-10 text-white hover:text-red-500 transition-colors p-5">
          <ChevronLeft className="w-8 h-8" strokeWidth={3} />
        </button>
        <div className="text-center space-y-2 relative z-10">
          <h2 className="text-5xl font-display text-white drop-shadow-[2px_2px_0_rgba(255,0,0,0.8)] glitch-text" data-text="CREW">CREW</h2>
          <p className="text-xl text-green-400 font-bold uppercase tracking-widest">ADD HOMIES (MAX 10)</p>
        </div>
        
        <form onSubmit={handleConfirmAlias} className="w-full space-y-8 relative z-10 mt-8">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-6 p-2 border-b-2 border-white/30">
              <button type="button" onClick={() => setNumPlayers(Math.max(1, numPlayers - 1))} className="text-white hover:text-red-500 text-4xl font-display">-</button>
              <span className="text-4xl font-display text-white w-8 text-center">{numPlayers}</span>
              <button type="button" onClick={() => setNumPlayers(Math.min(10, numPlayers + 1))} className="text-white hover:text-red-500 text-4xl font-display">+</button>
            </div>
          </div>

          <div className="space-y-4">
            {Array.from({ length: numPlayers }).map((_, i) => (
              <div key={i}>
                <input 
                  type="text" 
                  value={playerNames[i] || ""}
                  onChange={e => {
                    const next = [...playerNames];
                    next[i] = e.target.value;
                    setPlayerNames(next);
                  }}
                  placeholder={`SKATER ${i + 1}`}
                  maxLength={15}
                  className="w-full bg-transparent border-b-2 border-white/50 p-2 text-2xl text-center text-white focus:outline-none focus:border-red-500 font-sans tracking-widest uppercase placeholder:text-white/20"
                />
              </div>
            ))}
          </div>

          <button 
            type="submit"
            className="w-full sticker-button px-4 py-4 mt-8 bg-white torn-edge group"
          >
            <div className="bg-black text-white font-display text-3xl px-4 py-2 flex items-center justify-center gap-2 group-hover:bg-red-600 transition-colors">
              <Play className="w-6 h-6 fill-white" />
              INSERT TAPE
            </div>
          </button>
        </form>
      </div>
    );
  }

  if (gameState === "finished") {
    return (
      <div className="flex-1 flex flex-col p-4 items-center justify-start space-y-4 bg-zinc-950 overflow-y-auto relative font-sans">
        <div className="absolute inset-0 vhs-overlay z-0" />
        <div className="text-center space-y-1 mt-4 relative z-10">
          <h2 className="text-4xl font-display text-white drop-shadow-[2px_2px_0_rgba(255,0,0,0.8)] glitch-text" data-text="TAPE EJECTED">TAPE EJECTED</h2>
          <p className="text-lg text-green-400 font-bold uppercase tracking-widest">{lineData.skater}</p>
        </div>
        
        <div className="w-full relative z-10 mt-4">
          <p className="text-xl text-white font-display text-center mb-4 tracking-widest">RESULTS</p>
          <div className="space-y-2">
            {leaderboard.map((entry, index) => {
              const isCurrentSession = players.some(p => p.name === entry.name && p.score === entry.score);
              return (
                <div key={index} className={`flex flex-col p-2 border-b-2 border-white/20 last:border-b-0 ${isCurrentSession ? 'bg-red-600/20' : ''}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="font-display text-2xl text-red-500 w-6">{index + 1}.</span>
                      <span className="font-sans text-lg text-white uppercase tracking-wider">{entry.name}</span>
                    </div>
                    <span className="font-sans text-lg text-green-400">{entry.score} PTS</span>
                  </div>
                  <div className="text-xs font-display tracking-widest text-white/50 ml-9 mt-1">
                    {index === 0 ? "🏆 PRO STATUS" : index === 1 ? "🥈 AM BASTARD" : index === 2 ? "🥉 SHOP SPONSOR" : index === leaderboard.length - 1 ? "🤡 MALL GRABBER" : "🛹 FLOW TRASH"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button 
          onClick={onBack}
          className="w-full sticker-button px-4 py-4 mt-8 bg-white torn-edge group relative z-10"
        >
           <div className="bg-black text-white font-display text-3xl px-4 py-2 flex items-center justify-center gap-2 group-hover:bg-red-600 transition-colors">
             <RotateCcw className="w-6 h-6" strokeWidth={3} />
             REWIND
           </div>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col landscape:flex-row overflow-hidden bg-zinc-950 font-sans relative">
      <div className="absolute inset-0 vhs-overlay z-40 pointer-events-none" />

      {/* Video & Header Column (Top in Portrait, Left in Landscape) */}
      <div className="w-full landscape:w-1/2 flex flex-col shrink-0 relative z-40 border-b-2 landscape:border-b-0 landscape:border-r-2 border-white/20">
        {/* Dedicated Top Header Bar (100% Reliable Back Arrow) */}
        <div className="p-2.5 sm:p-3 bg-black flex items-center justify-between shrink-0 relative z-50 border-b border-white/20">
          <button 
            onClick={onBack} 
            className="p-3 -ml-3 -my-3 group"
          >
            <div className="text-white group-hover:text-red-500 transition-colors p-1.5 group-active:scale-95 bg-zinc-900/80 border border-white/20 shadow-[2px_2px_0px_#000]">
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3} />
            </div>
          </button>
          <div className="text-center">
            <h2 className="text-lg sm:text-xl font-display text-white tracking-widest uppercase truncate max-w-[180px]">{lineData.skater}</h2>
          </div>
          <div className="flex gap-1 items-center">
            <div className="w-1.5 h-2.5 border border-white" />
            <div className="w-4 h-2.5 border border-white bg-white" />
          </div>
        </div>

        {/* Video Container (Proportional 16:9 Aspect Video) */}
        <div className="relative aspect-video w-full bg-black shrink-0 z-40 fisheye-container flex-1">
          <div className={`w-full h-full transition-all duration-300 relative ${gameState === 'guessing' && loopSpeed > 0 ? 'filter contrast-150 saturate-50 sepia-[.3] blur-[0.5px]' : ''}`}>
            <YouTube
              videoId={lineData.videoId}
              opts={opts}
              onReady={onReady}
              onStateChange={onStateChange}
              className="w-full h-full pointer-events-none"
              iframeClassName="w-full h-full pointer-events-none"
            />
            {gameState === 'guessing' && loopSpeed > 0 && <div className="absolute inset-0 crt-static z-20" />}
          </div>

          {/* Status REC / PAUSE Badge */}
          <div className="absolute bottom-2 left-2 z-30 pointer-events-none">
            {gameState === "playing_to_pause" && (
              <div className="bg-black/80 border border-red-600 px-2 py-0.5 text-red-500 font-bold text-xs flex items-center gap-1.5">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-rec-blink" />
                REC
              </div>
            )}
            {(gameState === "guessing" || gameState === "feedback_paused") && (
              <div className="bg-black/80 border border-white/40 px-2 py-0.5 text-white font-bold text-xs flex items-center gap-1.5">
                PAUSE
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full z-20">
            <div 
              className="h-full bg-red-600 transition-all duration-300 relative" 
              style={{ width: `${((currentMarkerIndex) / lineData.markers.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Controls Column (Bottom in Portrait, Right in Landscape) */}
      <div className="flex-1 w-full landscape:w-1/2 flex flex-col p-3 sm:p-4 overflow-y-auto relative z-30 justify-around">
        {lineData.markers.length > 1 && (
          <div className="text-center mb-1">
            <span className="text-xs font-sans font-bold text-white/50 tracking-widest uppercase">
              TRICK {currentMarkerIndex + 1} / {lineData.markers.length}
            </span>
          </div>
        )}

        {gameState === "ready" ? (
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <p className="text-3xl font-display text-white text-center tracking-widest animate-pulse">
              PRESS <Play className="inline w-8 h-8 mx-1 fill-white" /> TO ROLL
            </p>
          </div>
        ) : gameState === "guessing" ? (
          <div className="flex-1 flex flex-col justify-around py-2">
            {/* Skateboard 3/4 View Pro Model (Replaces Player Name + Slow Mo Row) */}
            <div className="flex justify-center mb-1 mt-0">
              <svg viewBox="0 0 200 240" className="w-full max-w-[170px] sm:max-w-[200px] mx-auto drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] overflow-visible">
                <defs>
                  <path id="noseCurve" d="M 30, 80 Q 100, 10 170, 80" fill="transparent" />
                  <pattern id="wood" patternUnits="userSpaceOnUse" width="100" height="100">
                    <rect width="100" height="100" fill="#d4a373"/>
                    <path d="M0,20 Q50,30 100,10 M0,50 Q50,70 100,40 M0,80 Q50,100 100,70" stroke="#b5835a" strokeWidth="2" fill="none" opacity="0.6"/>
                  </pattern>
                  <filter id="shadow">
                    <feDropShadow dx="0" dy="5" stdDeviation="4" floodOpacity="0.5" />
                  </filter>
                </defs>
                
                {/* Deck Shape (Cut off at the bottom for 3/4 view) */}
                <path d="M 20, 100 C 20, 20 60, 0 100, 0 C 140, 0 180, 20 180, 100 L 180, 240 L 20, 240 Z" fill="url(#wood)" stroke="#5c3a21" strokeWidth="3" />
                
                {/* Grip tape edge detail */}
                <path d="M 23, 100 C 23, 23 63, 3 100, 3 C 137, 3 177, 23 177, 100 L 177, 240 L 23, 240 Z" fill="transparent" stroke="#222" strokeWidth="1" opacity="0.3" />

                {/* Bolts */}
                <circle cx="80" cy="140" r="2" fill="#222" />
                <circle cx="120" cy="140" r="2" fill="#222" />
                <circle cx="80" cy="170" r="2" fill="#222" />
                <circle cx="120" cy="170" r="2" fill="#222" />

                {/* Pro Model Text */}
                <text fill="#111" fontSize={Math.max(12, 24 - Math.max(0, players[currentPlayerGuessingIndex].name.length - 8) * 1.2)} fontWeight="900" fontFamily="sans-serif" letterSpacing="1">
                  <textPath href="#noseCurve" startOffset="50%" textAnchor="middle">
                    {players[currentPlayerGuessingIndex].name.toUpperCase()}
                  </textPath>
                </text>
                
                <text x="100" y="105" fill="#fff" fontSize="10" textAnchor="middle" opacity="0.8" fontWeight="bold" fontFamily="sans-serif" letterSpacing="2">
                  PRO MODEL
                </text>

                {/* Truck Baseplate */}
                <rect x="75" y="145" width="50" height="20" fill="#222" rx="2" />
                
                {/* Truck Hanger & Axle */}
                <path d="M 65,160 L 80, 145 L 120, 145 L 135, 160 Z" fill="#777" />
                <rect x="35" y="155" width="130" height="8" fill="#aaa" rx="2" filter="url(#shadow)" />
                
                {/* Foreign Object for Wheels (Speed Buttons) */}
                <foreignObject x="0" y="141" width="200" height="50">
                  <div className="w-[200px] h-[50px] flex justify-between items-center px-[22px]">
                    {/* Wheel 1: x0.5 */}
                    <button 
                      onClick={() => {
                        const speed = 0.5;
                        const nextSpeed = loopSpeed === speed ? 0 : speed;
                        setLoopSpeed(nextSpeed);
                        if (nextSpeed > 0 && playerRef.current) {
                            playerRef.current.setPlaybackRate(nextSpeed);
                            playerRef.current.setVolume(5);
                            playerRef.current.seekTo(stateRef.current.trickStartTime, true);
                            playerRef.current.playVideo();
                        } else if (nextSpeed === 0 && playerRef.current) {
                            playerRef.current.setPlaybackRate(1.0);
                            playerRef.current.setVolume(100);
                            playerRef.current.seekTo(stateRef.current.marker.pauseTime, true);
                            playerRef.current.pauseVideo();
                        }
                      }}
                      className={`w-[36px] h-[36px] rounded-full border-4 border-zinc-200 flex flex-col items-center justify-center font-bold font-sans transition-transform hover:scale-110 shadow-lg cursor-pointer ${loopSpeed === 0.5 ? 'bg-red-500 text-white' : 'bg-white text-black'}`}
                      style={{ boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)' }}
                    >
                      <span className="text-[10px] leading-none">x0.5</span>
                    </button>
                    
                    {/* Wheel 2: x0.25 */}
                    <button 
                      onClick={() => {
                        const speed = 0.25;
                        const nextSpeed = loopSpeed === speed ? 0 : speed;
                        setLoopSpeed(nextSpeed);
                        if (nextSpeed > 0 && playerRef.current) {
                            playerRef.current.setPlaybackRate(nextSpeed);
                            playerRef.current.setVolume(5);
                            playerRef.current.seekTo(stateRef.current.trickStartTime, true);
                            playerRef.current.playVideo();
                        } else if (nextSpeed === 0 && playerRef.current) {
                            playerRef.current.setPlaybackRate(1.0);
                            playerRef.current.setVolume(100);
                            playerRef.current.seekTo(stateRef.current.marker.pauseTime, true);
                            playerRef.current.pauseVideo();
                        }
                      }}
                      className={`w-[36px] h-[36px] rounded-full border-4 border-zinc-200 flex flex-col items-center justify-center font-bold font-sans transition-transform hover:scale-110 shadow-lg cursor-pointer ${loopSpeed === 0.25 ? 'bg-red-500 text-white' : 'bg-white text-black'}`}
                      style={{ boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)' }}
                    >
                      <span className="text-[9px] leading-none">x0.25</span>
                    </button>
                  </div>
                </foreignObject>
              </svg>
            </div>

            {/* Meme Quote */}
            <p className="text-xs sm:text-sm font-sans font-bold text-green-400 text-center uppercase tracking-wider italic opacity-80 my-1">
              "{currentMeme}"
            </p>

            {/* Trick Options */}
            {marker.isCustomText ? (
              <div className="flex flex-col space-y-3">
                <input 
                  type="text"
                  value={textGuess}
                  onChange={(e) => setTextGuess(e.target.value)}
                  placeholder="Escribe el truco..."
                  className="zine-input text-xl text-center uppercase py-3"
                />
                <button
                  disabled={!textGuess.trim()}
                  onClick={() => handleGuess(textGuess)}
                  className="w-full sticker-button bg-white p-1.5 torn-edge group disabled:opacity-50"
                >
                  <div className="bg-black text-white font-display text-2xl py-3 tracking-widest group-hover:bg-red-600 transition-colors uppercase text-center">
                    COMPROBAR
                  </div>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 my-2">
                {shuffledOptions.map((opt, i) => {
                  return (
                    <button
                      key={i}
                      disabled={!!selectedOption && currentPlayerGuessingIndex >= players.length - 1}
                      onClick={() => handleGuess(opt)}
                      className="w-full sticker-button bg-white p-1.5 torn-edge group transform transition-transform hover:scale-105 active:scale-95"
                    >
                      <div className="bg-black text-white font-display text-sm sm:text-base px-2 py-3 tracking-wider group-hover:bg-red-600 uppercase flex items-center justify-center min-h-[3.8rem] text-center leading-tight">
                        {opt}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : gameState === "feedback_paused" ? (
          <div className="space-y-2 flex-1 flex flex-col justify-start">
             <div className="text-center">
               <p className="text-[10px] font-sans font-bold text-white/50 mb-0.5 uppercase tracking-widest">IT WAS A...</p>
               <p className="text-2xl sm:text-3xl font-display text-white glitch-text tracking-widest uppercase" data-text={marker.correctTrick.toUpperCase()}>{marker.correctTrick.toUpperCase()}</p>
             </div>
             
             <div className="space-y-1.5 max-h-36 overflow-y-auto">
               {players.map((p, i) => {
                 const guess = currentTrickGuesses[i];
                 const isCorrect = marker && checkTrickMatch(guess, marker.correctTrick);
                 const hasChallenged = challenges.some(c => c.playerIndex === i && c.trickIndex === currentMarkerIndex);
                 return (
                   <div key={i} className={`p-1.5 flex justify-between items-center border-l-4 ${isCorrect ? 'border-green-400 bg-green-400/10' : hasChallenged ? 'border-yellow-400 bg-yellow-400/10' : 'border-red-500 bg-red-500/10'}`}>
                     <div className="flex flex-col">
                       <span className="font-display text-base text-white tracking-widest uppercase truncate max-w-[130px]">{p.name}</span>
                       {!isCorrect && !hasChallenged && players.length > 1 && (
                          <button onClick={() => handleChallenge(i)} className="text-[10px] font-sans text-red-400 font-bold uppercase underline text-left hover:text-red-300">
                             REBATIR VOTO
                          </button>
                       )}
                       {hasChallenged && (
                          <span className="text-[10px] font-sans text-yellow-400 font-bold uppercase">EN DISPUTA ⚖️</span>
                       )}
                     </div>
                     <div className="flex flex-col items-end">
                       <span className="font-sans font-bold text-xs text-white/80 uppercase truncate max-w-[110px]">{guess || "NO ANSWER"}</span>
                       <span className="font-sans text-[10px] text-white/50">{p.score} PTS</span>
                     </div>
                   </div>
                 );
               })}
             </div>
             
             <div className="flex flex-col gap-1.5">
               {/* Replay Controls Row */}
               <div className="flex gap-2 w-full">
                 <button 
                   onClick={handleReplayTrick}
                   className="flex-1 sticker-button p-0.5 bg-white torn-edge group"
                 >
                   <div className="bg-black text-white font-sans font-bold text-xs py-1.5 flex items-center justify-center gap-1 group-hover:bg-red-600 transition-colors uppercase">
                     <RotateCcw className="w-3.5 h-3.5" /> REPLAY TRICK
                   </div>
                 </button>
                 {lineData.markers.length > 1 && (
                   <button 
                     onClick={handleReplayWhole}
                     className="flex-1 sticker-button p-0.5 bg-white torn-edge group"
                   >
                     <div className="bg-black text-white font-sans font-bold text-xs py-1.5 flex items-center justify-center gap-1 group-hover:bg-red-600 transition-colors uppercase">
                       <RotateCcw className="w-3.5 h-3.5" /> REPLAY WHOLE
                     </div>
                   </button>
                 )}
               </div>

               {/* Next Trick / Results Button */}
               <button 
                 onClick={handleNextMarker}
                 className="w-full sticker-button p-1 bg-white torn-edge group"
               >
                 <div className="bg-black text-white font-display text-xl py-2 flex items-center justify-center gap-2 group-hover:bg-red-600 transition-colors uppercase">
                   {currentMarkerIndex === lineData.markers.length - 1 ? "VER RESULTADOS" : <><Play className="w-5 h-5 fill-white" /> NEXT TRICK</>}
                 </div>
               </button>
             </div>
          </div>
        ) : gameState === "jury" ? (
          <div className="flex-1 flex flex-col p-2 space-y-4 overflow-y-auto">
             <div className="text-center mb-2">
               <h3 className="text-3xl font-display text-white glitch-text tracking-widest" data-text="EL JURADO">EL JURADO</h3>
               <p className="text-sm font-sans text-white/70 mt-1 uppercase">Dispute Resolution</p>
             </div>
             <div className="space-y-4 flex-1">
               {challenges.map((c, i) => (
                 <div key={i} className={`p-3 border-2 ${c.status === 'accepted' ? 'border-green-500 bg-green-500/10' : c.status === 'rejected' ? 'border-red-500 bg-red-500/10' : 'border-yellow-400 bg-yellow-400/10'}`}>
                   <div className="mb-2">
                     <span className="font-display text-xl text-white uppercase">{c.playerName}</span>
                     <span className="font-sans text-xs text-white/50 ml-2 uppercase">SPOT {c.trickIndex + 1}</span>
                   </div>
                   <div className="grid grid-cols-2 gap-2 text-sm font-sans mb-3">
                     <div>
                       <div className="text-white/50 text-xs uppercase">Dijo:</div>
                       <div className="text-white font-bold">{c.guessedTrick}</div>
                     </div>
                     <div>
                       <div className="text-white/50 text-xs uppercase">Era:</div>
                       <div className="text-white font-bold">{c.correctTrick}</div>
                     </div>
                   </div>
                   
                   {c.status === "pending" ? (
                     <div className="flex gap-2">
                       <button onClick={() => resolveChallenge(i, true)} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-display text-lg py-2 transition-colors uppercase">
                         DAR POR BUENO
                       </button>
                       <button onClick={() => resolveChallenge(i, false)} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-display text-lg py-2 transition-colors uppercase">
                         RECHAZAR
                       </button>
                     </div>
                   ) : (
                     <div className={`text-center font-display text-2xl uppercase tracking-widest ${c.status === 'accepted' ? 'text-green-400' : 'text-red-500'}`}>
                       {c.status === 'accepted' ? 'ACEPTADO (+100 PTS)' : 'RECHAZADO'}
                     </div>
                   )}
                 </div>
               ))}
             </div>
             
             {challenges.every(c => c.status !== "pending") && (
               <button 
                 onClick={finishJury}
                 className="w-full sticker-button px-4 py-4 mt-4 bg-white torn-edge group"
               >
                 <div className="bg-black text-white font-display text-3xl px-4 py-2 flex items-center justify-center gap-2 group-hover:bg-red-600 transition-colors uppercase">
                   VER RESULTADOS
                 </div>
               </button>
             )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <p className="text-3xl font-display text-white/50 tracking-widest animate-pulse">
              {gameState === "playing_feedback" ? "JUDGING..." : "PLAYING..."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
