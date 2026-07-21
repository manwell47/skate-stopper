# 🛹 SKATE STOPPER - The Pure Skateboarding Game

<div align="center">
  <img src="public/skate_cover.png" width="400" alt="Skate Stopper Cover" />
  <p><em>90s VHS Tape & Skate Zine Trivia Experience</em></p>

  <br />

  <a href="https://manwell47.github.io/skate-stopper/">
    <img src="https://img.shields.io/badge/PLAY_ONLINE-JUGAR_AHORA-red?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Play Online" />
  </a>
</div>

---

## 🌐 ¿Cómo Jugar en Cualquier Navegador? (Cero Instalación)

Cualquier usuario o tester puede jugar al instante sin instalar nada ni requerir cuentas:

👉 **[https://manwell47.github.io/skate-stopper/](https://manwell47.github.io/skate-stopper/)**

### 📱 Instalar como App Móvil (PWA):
Puedes instalar **Skate Stopper** como una aplicación nativa a pantalla completa en tu teléfono:
- **iPhone (Safari)**: Toca el botón **Compartir** (icono de la caja con flecha) y selecciona **"Añadir a la pantalla de inicio"**.
- **Android (Chrome / Brave)**: Toca los **3 puntos** del navegador y selecciona **"Instalar aplicación"** o **"Añadir a pantalla de inicio"**.

---

## 📹 ¿Qué es Skate Stopper?

**Skate Stopper** es un juego interactivo de trivia y catalogación de trucos de skate con una estética retro de cinta VHS y revista de los 90 (estilo *Transworld Skateboarding* / *Thrasher*).

Permite importar partes de vídeo de YouTube (o rondas completas de skate), catalogar el momento exacto en el que el skater hace el pop, etiquetar el truco detalladamente (con stance, rotación, flips, grinds, manuals, stalls, endings to fakie/revert, etc.) y retar a amigos o jugar en solitario a adivinar los trucos justo antes de que ocurran.

---

## ✨ Características Principales

- **📼 Editor de Cintas VHS (Tape Editor)**:
  - Importación directa de enlaces de YouTube (partes de vídeo o rondas).
  - Ajuste fino por fotogramas (`+1 frame`, `-1 frame`, `+5 frames`, `-5 frames`) para pausar el vídeo exactamente antes del pop.
  - Generador avanzado de trucos (con combinaciones reales: Slappy, Hippy Jump, Boneless, Casper, Primo, Darkslide, BS/FS Bigspins, endings to Fakie y Revert).
  - **⚡ Generar Similares**: Generación automática con 1 clic de trucos falsos realistas para desafiar a los jugadores.

- **🎮 Modo Juego & Juicio (Play Mode)**:
  - Partidas multijugador locales (o modo solitario).
  - Reproducción a velocidad reducida (**0.5X** y **0.25X**) con efecto visual CRT static.
  - Memes y frases de reacción skate aleatorias durante la votación ("*What the hell is he trying?*", "*Shit look at those shoulders*", etc.).
  - Sistema de retos y votos (*Rebatir Voto*).
  - **↩️ Navegación Infalible**: Barra superior dedicada para retornar al alijo o menú principal en cualquier momento.

- **📱 Maquetación Fluida & Modo Tablet / Horizontal (Landscape)**:
  - **Diseño Adaptativo**: Titulares en portada adaptables automáticamente a la altura disponible en navegadores móviles (iOS Safari, Android Chrome, Brave con barra inferior).
  - **Modo Tablet / Horizontal**: Vista automática en **2 columnas paralelas** (vídeo a la izquierda, trucos y controles a la derecha) ideal para jugar en grupo apoyando la tablet o el teléfono.

- **🏆 Podios por Vídeo & Footy Stash**:
  - Clasificación propia guardada para cada cinta/vídeo en `localStorage`.
  - Botón **`🏆 PODIUM`** en el menú de selección de cinta para consultar la tabla de líderes en cualquier momento.
  - Borrado de rankings de vídeo exclusivo desde la zona de gestión **Footy Stash**.

- **🔊 Sonidos, Estética VHS 90s & Botón Mute**:
  - Botón **`🔊 MUSIC` / `🔇 MUTED`** en la portada para activar o silenciar la música noventera en cualquier momento.
  - Sonidos retro (`skid.wav`, `tictac.wav`), animaciones CRT, insignias de pegatina rasgada, código de barras vintage (`4 7 0 1 4 6 6 6`) y tipografía retro pixel (`VT323`).

---

## 🤝 Biblioteca Comunitaria & Compartir Clips

El juego viene precargado por defecto con **cintas de demostración iniciales** (*Yuto Horigome* y *Dan Murphy*), listas para jugar nada más abrir la web.

Cualquier usuario puede colaborar para expandir la biblioteca:
1. Crea o cataloga una nueva cinta o ronda en la app.
2. Entra en **Footy Stash** -> haz clic en los 3 puntos de la cinta -> **`🔗 COMPARTIR CLIP`** (o en **`EXPORTAR`** para enviar todo el alijo).
3. Envía ese texto a cualquier compañero para que lo agregue en su app mediante **`IMPORTAR`**, o compártelo para integrarlo en la lista global oficial.

---

## 🚀 Cómo Ejecutar en Local (Desarrolladores)

### Requisitos Previos
- **Node.js** (v18 o superior)
- **npm** (o yarn/pnpm)

### Pasos:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/manwell47/skate-stopper.git
   cd skate-stopper
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```

4. Abre tu navegador en la URL indicada por Vite (normalmente `http://localhost:5173`).

---

## 🛠️ Tecnologías Utilizadas

- **React 18** + **TypeScript**
- **Vite** (Build tool)
- **TailwindCSS** + CSS Custom Design System (Skate Zine Tokens)
- **Framer Motion** (Animaciones estilo tirada de periódico / revista)
- **Lucide React** (Iconografía retro)
