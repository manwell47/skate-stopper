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
  const [players, setPlayers] = useState<{ name: string, score: number }[]>([]);
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
  const [leaderboard, setLeaderboard] = useState<{ name: string, score: number }[]>([]);

  useEffect(() => {
    if (gameState === "finished" && !leaderboardUpdatedRef.current) {
      leaderboardUpdatedRef.current = true;
      const key = `skate_stopper_ranking_${lineData.videoId}_${lineData.clipStartTime}`;
      const saved = localStorage.getItem(key);
      let currentRanking: { name: string, score: number }[] = saved ? JSON.parse(saved) : [];

      players.forEach(p => {
        currentRanking.push(p);
      });

      currentRanking.sort((a, b) => b.score - a.score);

      localStorage.setItem(key, JSON.stringify(currentRanking));
      setLeaderboard(currentRanking);

      const globalSaved = localStorage.getItem("skate_stopper_global_ranking");
      let globalRanking: { name: string, score: number }[] = globalSaved ? JSON.parse(globalSaved) : [];

      players.forEach(p => {
        const existingPlayer = globalRanking.find(g => g.name === p.name);
        if (existingPlayer) {
          existingPlayer.score += p.score;
        } else {
          globalRanking.push({ ...p });
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

        if ((currentRef.gameState === "playing_feedback" || currentRef.gameState === "replaying_trick" || currentRef.gameState === "replaying_whole") && currentRef.marker && time >= currentRef.marker.pauseTime + 1.4) {
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
            className="text-white hover:text-red-500 transition-colors p-2 active:scale-95 bg-zinc-900 border border-white/30 shadow-[2px_2px_0px_#000] cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3} />
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
          <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#12100e] custom-scrollbar flex flex-col items-center justify-start p-2">

            {/* The container that holds the skateboard SVG */}
            <div className="relative w-full max-w-[650px] mx-auto drop-shadow-2xl">

              {/* Skateboard Background Graphic */}
              <svg viewBox="0 0 1696 2528" className="w-full h-auto block pointer-events-auto">
                <defs>
                  {/* Constrained curves that stay strictly inside the deck boundaries */}
                  <path id="noseCurve" d="M 380,640 Q 848,470 1316,640" fill="transparent" />
                  <path id="memeCurve" d="M 380,860 Q 848,730 1316,860" fill="transparent" />
                </defs>

                <image href={`${import.meta.env.BASE_URL}tabla.png`} x="0" y="0" width="1696" height="2528" />

                {(() => {
                  const rawName = players[currentPlayerGuessingIndex].name.toUpperCase();
                  const nameLen = Math.max(1, rawName.length);
                  // Dynamic font size for pastel bubble graffiti model (DynaPuff)
                  const autoFontSize = Math.min(135, Math.max(48, Math.floor(950 / (nameLen * 0.85))));

                  return (
                    <>
                      {/* Player Name Soft Drop Shadow Layer */}
                      <text fill="#000" opacity="0.2" transform="translate(4, 6)" fontSize={autoFontSize} fontWeight="700" fontFamily="'DynaPuff', cursive" letterSpacing="1">
                        <textPath href="#noseCurve" startOffset="50%" textAnchor="middle">
                          {rawName}
                        </textPath>
                      </text>

                      {/* Main Player Name in Pastel Bubble Graffiti Style */}
                      <text fill="#2a221d" stroke="#2a221d" strokeWidth="2" strokeLinejoin="round" fontSize={autoFontSize} fontWeight="700" fontFamily="'DynaPuff', cursive" letterSpacing="1" opacity="0.95">
                        <textPath href="#noseCurve" startOffset="50%" textAnchor="middle">
                          {rawName}
                        </textPath>
                      </text>
                    </>
                  );
                })()}

                {/* Meme Quote Written on the Nose Wood (Auto-scaled so it never touches edges) */}
                {(() => {
                  const memeLen = Math.max(1, currentMeme.length);
                  const memeFontSize = Math.min(60, Math.max(34, Math.floor(900 / (memeLen * 0.6))));
                  return (
                    <text fill="#2a2520" fontSize={memeFontSize} fontFamily="'Permanent Marker', cursive" opacity="0.85" fontStyle="italic">
                      <textPath href="#memeCurve" startOffset="50%" textAnchor="middle">
                        "{currentMeme}"
                      </textPath>
                    </text>
                  );
                })()}

                {/* Hitboxes inside SVG: Shortened to end 3px past the 0.5x and 0.25x inscriptions with NO red contours */}
                {/* x0.5 Speed - LEFT SIDE (Left wheel + Left Hanger Inscription up to x=730) */}
                <rect
                  x="220" y="1140" width="510" height="210"
                  fill={loopSpeed === 0.5 ? "rgba(255,255,255,0.25)" : "transparent"}
                  stroke="transparent" strokeWidth="0"
                  rx="15" ry="15"
                  className="cursor-pointer transition-colors hover:fill-white/10"
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
                >
                  <title>Replay x0.5</title>
                </rect>

                {/* x0.25 Speed - RIGHT SIDE (Right Hanger Inscription from x=966 + Right Wheel) */}
                <rect
                  x="966" y="1140" width="510" height="210"
                  fill={loopSpeed === 0.25 ? "rgba(255,255,255,0.25)" : "transparent"}
                  stroke="transparent" strokeWidth="0"
                  rx="15" ry="15"
                  className="cursor-pointer transition-colors hover:fill-white/10"
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
                >
                  <title>Replay x0.25</title>
                </rect>

                {/* Trick Options Sticker Layer - Positioned at y=1400 so bottom-right sticker stealthily covers the Gemini logo on the wood graphic */}
                <foreignObject x="30" y="1400" width="1636" height="1050" style={{ overflow: 'visible' }}>
                  <div xmlns="http://www.w3.org/1999/xhtml" className="w-full h-full flex flex-col justify-start items-center p-2 overflow-visible">
                    {marker.isCustomText ? (
                      <div className="flex flex-col w-full space-y-8 pt-20">
                        <input
                          type="text"
                          value={textGuess}
                          onChange={(e) => setTextGuess(e.target.value)}
                          placeholder="Escribe el truco..."
                          className="zine-input text-6xl sm:text-7xl font-marker text-center py-8 rotate-[-1deg] shadow-[15px_15px_40px_rgba(0,0,0,0.6)] w-full text-black bg-zinc-100 border-none"
                        />
                        <button
                          disabled={!textGuess.trim()}
                          onClick={() => handleGuess(textGuess)}
                          className="w-full sticker-button bg-black p-4 torn-edge group disabled:opacity-50 rotate-[1deg] hover:rotate-0 transition-transform shadow-[15px_15px_40px_rgba(0,0,0,0.6)]"
                        >
                          <div className="bg-red-600 text-white font-rock text-6xl sm:text-7xl py-8 tracking-widest group-hover:bg-red-500 transition-colors uppercase text-center border-4 border-dashed border-white/50">
                            COMPROBAR
                          </div>
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-x-8 gap-y-6 w-full px-4 overflow-visible">
                        {shuffledOptions.map((opt, i) => {
                          // 4 clean 2x2 rectangular vinyl sticker designs positioned robustly to cover the Gemini logo on the bottom-right wood:
                          const rowShiftClass = i < 2 ? "mt-[160px]" : "mt-[350px]";

                          const stickerConfigs = [
                            // Sticker 0 (Top-Left): Classic White Slap Tag
                            {
                              outer: "bg-white text-black border-[6px] border-zinc-900 shadow-[12px_12px_25px_rgba(0,0,0,0.85)] rounded-md rotate-[-2deg] hover:rotate-[1deg] px-5 py-4 w-full flex items-center justify-center min-h-[195px]",
                              inner: "font-marker text-[54px] sm:text-[62px] md:text-[70px] text-zinc-950 text-center leading-[1.15] tracking-wide break-words w-full"
                            },
                            // Sticker 1 (Top-Right): Yellow Hazard Vinyl Sticker
                            {
                              outer: "bg-yellow-400 text-black border-[6px] border-black shadow-[12px_12px_25px_rgba(0,0,0,0.85)] rounded-xl rotate-[2deg] hover:rotate-[-1deg] px-5 py-4 w-full flex items-center justify-center min-h-[195px]",
                              inner: "font-graffiti text-[56px] sm:text-[64px] md:text-[72px] text-black text-center leading-[1.15] tracking-tight break-words w-full"
                            },
                            // Sticker 2 (Bottom-Left): Red Thrasher Box Sticker
                            {
                              outer: "bg-red-600 text-white border-[6px] border-white shadow-[12px_12px_25px_rgba(0,0,0,0.85)] torn-edge rotate-[-3deg] hover:rotate-[2deg] px-5 py-4 w-full flex items-center justify-center min-h-[195px]",
                              inner: "font-rock text-[46px] sm:text-[52px] md:text-[58px] text-white text-center leading-[1.15] tracking-normal break-words w-full"
                            },
                            // Sticker 3 (Bottom-Right): Vintage Black Vinyl Tag (Stealthily covers the Gemini logo on the wood)
                            {
                              outer: "bg-zinc-950 text-white border-[6px] border-zinc-300 shadow-[12px_12px_25px_rgba(0,0,0,0.85)] rounded-lg rotate-[2deg] hover:rotate-[-2deg] px-5 py-4 w-full flex items-center justify-center min-h-[195px]",
                              inner: "font-marker text-[54px] sm:text-[62px] md:text-[70px] text-yellow-300 text-center leading-[1.15] tracking-wide break-words w-full"
                            }
                          ];

                          const cfg = stickerConfigs[i % stickerConfigs.length];

                          return (
                            <div key={i} className={`w-full overflow-visible ${rowShiftClass}`}>
                              <button
                                disabled={!!selectedOption && currentPlayerGuessingIndex >= players.length - 1}
                                onClick={() => handleGuess(opt)}
                                className={`
                                  group transition-transform cursor-pointer block text-center
                                  ${cfg.outer}
                                  ${selectedOption && opt === marker.correctTrick ? 'ring-[12px] ring-green-500 scale-105 !z-30' : ''}
                                  ${selectedOption && opt === currentTrickGuesses[currentPlayerGuessingIndex] && opt !== marker.correctTrick ? 'ring-[12px] ring-red-500 opacity-60' : ''}
                                  ${!!selectedOption ? 'opacity-90' : ''}
                                `}
                              >
                                <div className={`
                                  flex items-center justify-center text-center uppercase transition-colors
                                  ${cfg.inner}
                                  ${!selectedOption ? 'group-hover:brightness-110' : ''}
                                  ${selectedOption && opt === marker.correctTrick ? '!text-green-400' : ''}
                                  ${selectedOption && opt === currentTrickGuesses[currentPlayerGuessingIndex] && opt !== marker.correctTrick ? '!text-red-300' : ''}
                                `}>
                                  {opt}
                                </div>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </foreignObject>
              </svg>
            </div>
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
