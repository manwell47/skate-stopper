import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry user-agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Curated list of legendary skate clips
const curatedClips = [
  {
    id: "pj-1",
    skater: "PJ Ladd",
    videoId: "6XzLF39Q55I",
    videoTitle: "Wonderful Horrible Life",
    stance: "Regular",
    truco_principal: "BS Tailslide",
    nombres_alternativos_validos: ["backside tailslide", "bs tail", "back tail"],
    opciones_falsas: ["FS Tailslide", "BS Smith", "BS Lipslide"],
    es_controvertido: false,
    analisis_biomecanico: "Acercándose al ledge, prepara el pop. Fíjate cómo va de BS.",
    startTime: 69.5,
    pauseTime: 70.3,
    endTime: 72.0
  },
  {
    id: "pj-2",
    skater: "PJ Ladd",
    videoId: "6XzLF39Q55I",
    videoTitle: "Wonderful Horrible Life",
    stance: "Regular",
    truco_principal: "BS Noseblunt Slide",
    nombres_alternativos_validos: ["bs noseblunt", "backside noseblunt"],
    opciones_falsas: ["FS Noseblunt", "BS Noseslide", "BS Crooked"],
    es_controvertido: false,
    analisis_biomecanico: "Aterriza y se prepara para el siguiente obstáculo. Gira los hombros.",
    startTime: 72.0,
    pauseTime: 75.0,
    endTime: 77.0
  },
  {
    id: "pj-3",
    skater: "PJ Ladd",
    videoId: "6XzLF39Q55I",
    videoTitle: "Wonderful Horrible Life",
    stance: "Regular",
    truco_principal: "Nollie BS Heelflip",
    nombres_alternativos_validos: ["nollie backside heelflip", "nollie bs heel", "nollie backside heel"],
    opciones_falsas: ["Nollie FS Heelflip", "Nollie BS Flip", "Fakie BS Heelflip"],
    es_controvertido: false,
    analisis_biomecanico: "Pica de nollie y raspa de talón. Puro control.",
    startTime: 77.0,
    pauseTime: 81.0,
    endTime: 85.0
  }
];

// GET: Curated clips
app.get("/api/clips", (req, res) => {
  res.json(curatedClips);
});

// POST: Technical Referee evaluation for Hardcore Mode
app.post("/api/referee/evaluate", async (req, res) => {
  const { userAnswer, correctTrick, alternatives } = req.body;

  if (!userAnswer) {
    return res.status(400).json({ error: "Falta la respuesta del usuario" });
  }

  try {
    const prompt = `Evaluate a user's answer in a street skateboarding trivia game (1999-2004 era).
The official correct trick is: "${correctTrick}".
The valid alternative names we already know are: ${JSON.stringify(alternatives)}.
The user's answer is: "${userAnswer}".

You are the "OG of the Plaza", a purist veteran skater who films with a VX1000. You are strict with posers, but respect those who know what they are talking about:
1. Accept core slang from the era (tre flip, half cab, frontside, fs, bs).
2. If the trick is correct and named properly, congratulate them using terms like "Bolts", "Banger", "Pure Steez", "Clean".
3. If the trick is incorrect or they confused a Smith with a Feeble, or a Tailslide with a Lipslide, punish them by calling them "Poser", "Sketchy", or tell them to go back to playing Tony Hawk.
4. Your verdict must be very short (1-2 lines maximum), aggressive but fun, like you're yelling from behind the camera lens.

Return a JSON strictly with the following structure:
{
  "isCorrect": boolean,
  "matchedName": string (the correct name that matches closest or the main trick),
  "scoreExplanation": string (your verdict as the OG of the plaza, with late 90s slang).
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN },
            matchedName: { type: Type.STRING },
            scoreExplanation: { type: Type.STRING }
          },
          required: ["isCorrect", "matchedName", "scoreExplanation"]
        },
        systemInstruction: "You are an OG skater from the 2000s, an expert in tricks, style, and street slang."
      }
    });

    const result = JSON.parse(response.text?.trim() || "{}");
    res.json(result);
  } catch (error) {
    console.error("Error en la evaluación del OG:", error);
    // Simple local fallback in case of API failure
    const normalizedUser = userAnswer.toLowerCase().trim().replace(/[^a-z0-9\s]/g, "");
    const correctNormalized = correctTrick.toLowerCase().trim().replace(/[^a-z0-9\s]/g, "");
    const alternativesNormalized = alternatives.map((a: string) => a.toLowerCase().trim().replace(/[^a-z0-9\s]/g, ""));

    const isMatch = normalizedUser === correctNormalized || 
                    alternativesNormalized.some((alt: string) => normalizedUser.includes(alt) || alt.includes(normalizedUser));

    res.json({
      isCorrect: isMatch,
      matchedName: isMatch ? correctTrick : "Incorrect",
      scoreExplanation: isMatch 
        ? "Local match approved! Good eye for the pop."
        : "Local verdict: The popped trick doesn't match."
    });
  }
});

// POST: Analyze a custom clip or simulate a community video card
app.post("/api/referee/analyze-clip", async (req, res) => {
  const { skaterName, trickDescription, videoUrl } = req.body;

  try {
    const prompt = `Generate a trivia card for Skate-Stopper based on the following information submitted for a "Sponsor Me Tape":
- Skater: ${skaterName || "Unknown Skater"}
- Submitted trick or description: ${trickDescription || "Ollie"}
- Video/Link: ${videoUrl || "https://www.youtube.com/embed/1U-cgn3cEGA"}

Act as the "OG of the Plaza", an expert in 1999-2004 skate culture, VX1000 filmer. Analyze the momentum, stance, and foot placement right before the pop. Consider the stance.

Return a JSON with the exact structure of a TrickAnalysis:
{
  "skater": string (skater's name),
  "videoUrl": string (the submitted link or an embed-optimized one, for example converting youtube.com/watch?v=X to youtube.com/embed/X),
  "videoTitle": string (a title with VHS / 2000s / 411VM vibes for the community),
  "stance": "Regular" | "Goofy" | "Switch" | "Nollie" | "Fakie",
  "truco_principal": string (official trick name in English),
  "nombres_alternativos_validos": array of strings (valid variations and abbreviations),
  "opciones_falsas": array of exactly 3 strings (plausible incorrect tricks, use tricks that a poser would easily confuse with the real one, e.g., if it's bs lipslide, put bs boardslide),
  "es_controvertido": boolean,
  "explicacion_controversia": string (mandatory if es_controvertido is true, explains debates like "heelflip indy vs varial heel indy"),
  "analisis_biomecanico": string (comment from the OG about the stance and pop with pure skate slang, no hints, like "look at those shoulders, a banger is coming")
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            skater: { type: Type.STRING },
            videoUrl: { type: Type.STRING },
            videoTitle: { type: Type.STRING },
            stance: { type: Type.STRING, enum: ["Regular", "Goofy", "Switch", "Nollie", "Fakie"] },
            truco_principal: { type: Type.STRING },
            nombres_alternativos_validos: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            opciones_falsas: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Deben ser exactamente 3 opciones de trucos plausibles."
            },
            es_controvertido: { type: Type.BOOLEAN },
            explicacion_controversia: { type: Type.STRING },
            analisis_biomecanico: { type: Type.STRING }
          },
          required: ["skater", "videoUrl", "videoTitle", "stance", "truco_principal", "nombres_alternativos_validos", "opciones_falsas", "es_controvertido", "analisis_biomecanico"]
        },
        systemInstruction: "You are the OG of the Spot, an expert in 2000s skate culture."
      }
    });

    const result = JSON.parse(response.text?.trim() || "{}");
    // Ensure ID and fallback videoUrl formatting
    result.id = "community-" + Date.now();
    
    // Format youtube URLs if they are watch links instead of embed links
    if (result.videoUrl && result.videoUrl.includes("watch?v=")) {
      const videoId = result.videoUrl.split("v=")[1]?.split("&")[0];
      if (videoId) {
        result.videoUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1`;
      }
    } else if (result.videoUrl && result.videoUrl.includes("youtu.be/")) {
      const videoId = result.videoUrl.split("youtu.be/")[1]?.split("?")[0];
      if (videoId) {
        result.videoUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1`;
      }
    }

    // Ensure falses has exactly 3 elements
    if (!result.opciones_falsas || result.opciones_falsas.length < 3) {
      result.opciones_falsas = ["Kickflip", "Heelflip", "Ollie"];
    } else if (result.opciones_falsas.length > 3) {
      result.opciones_falsas = result.opciones_falsas.slice(0, 3);
    }

    res.json(result);
  } catch (error) {
    console.error("Error al analizar clip de comunidad:", error);
    res.status(500).json({ error: "Error de análisis biomecánico del Árbitro Técnico con el clip de comunidad." });
  }
});

// Vite middleware and static asset serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SkateSense Backend] Server running on http://localhost:${PORT}`);
  });
}

startServer();
