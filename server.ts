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
    const prompt = `Evalúa la respuesta de un usuario en un juego de trivia de skateboarding callejero (era 1999-2004).
El truco correcto oficial es: "${correctTrick}".
Los nombres alternativos válidos que ya conocemos son: ${JSON.stringify(alternatives)}.
La respuesta dada por el usuario es: "${userAnswer}".

Eres el "OG de la Plaza", un skater purista y veterano que graba con una VX1000. Eres estricto con los posers, pero respetas a los que saben de qué hablan:
1. Acepta jerga core de la época (tre flip, half cab, frontside, fs, bs).
2. Si el truco es correcto y lo han nombrado bien, felicítalos usando términos como "Bolts", "Banger", "Puro Steez", "Clean".
3. Si el truco es incorrecto o confundieron un Smith con un Feeble, o un Tailslide con un Lipslide, castígalos llamándolos "Poser", "Sketchy", o diles que vuelvan a jugar al Tony Hawk.
4. Tu veredicto debe ser muy corto (1-2 líneas máximo), agresivo pero divertido, como si gritaras detrás de la lente de la cámara.

Devuelve un JSON estrictamente con la siguiente estructura:
{
  "isCorrect": boolean,
  "matchedName": string (el nombre correcto que más se parece o el truco principal),
  "scoreExplanation": string (tu veredicto como OG de la plaza, con jerga de finales de los 90).
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
        systemInstruction: "Eres un OG del skate de los 2000, experto en trucos, estilo y jerga callejera."
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
      matchedName: isMatch ? correctTrick : "Incorrecto",
      scoreExplanation: isMatch 
        ? "¡Acierto aprobado en modo local! Buen ojo para el pop."
        : "Veredicto local: El truco popeado no coincide."
    });
  }
});

// POST: Analyze a custom clip or simulate a community video card
app.post("/api/referee/analyze-clip", async (req, res) => {
  const { skaterName, trickDescription, videoUrl } = req.body;

  try {
    const prompt = `Genera una tarjeta de trivia para Skate-Stopper basándote en la siguiente información enviada para una "Sponsor Me Tape":
- Skater: ${skaterName || "Skater Desconocido"}
- Truco o descripción enviada: ${trickDescription || "Ollie"}
- Video/Enlace: ${videoUrl || "https://www.youtube.com/embed/1U-cgn3cEGA"}

Actúa como el "OG de la Plaza", experto en cultura skate de 1999-2004, grabador de VX1000. Analiza la inercia, postura y colocación de los pies justo antes del pop. Considera el stance.

Devuelve un JSON con la estructura exacta de un TrickAnalysis:
{
  "skater": string (nombre del skater),
  "videoUrl": string (el enlace enviado o uno optimizado para embed, por ejemplo, convirtiendo youtube.com/watch?v=X a youtube.com/embed/X),
  "videoTitle": string (un título con vibra VHS / 2000s / 411VM para la comunidad),
  "stance": "Regular" | "Goofy" | "Switch" | "Nollie" | "Fakie",
  "truco_principal": string (nombre oficial del truco en inglés),
  "nombres_alternativos_validos": array de strings (variaciones y abreviaciones válidas),
  "opciones_falsas": array de exactamente 3 strings (trucos incorrectos plausibles, usa trucos que un poser confundiría fácilmente con el real, ej: si es bs lipslide, pon bs boardslide),
  "es_controvertido": boolean,
  "explicacion_controversia": string (obligatorio si es_controvertido es true, explica debates como "heelflip indy vs varial heel indy"),
  "analisis_biomecanico": string (comentario del OG sobre la postura y el pop con jerga skate pura, sin pistas, estilo "mirar esos hombros, se viene un banger")
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
        systemInstruction: "Eres el OG del Spot, experto en cultura skate de los 2000."
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
