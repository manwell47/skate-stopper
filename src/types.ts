export interface TrickMarker {
  id: string;
  pauseTime: number;
  correctTrick: string;
  falseTricks: string[];
  isCustomText?: boolean;
}

export interface LineData {
  videoId: string;
  skater: string;
  videoPart: string;
  lineName: string;
  title: string;
  videoType: "Ronda" | "Single";
  trickCount: number;
  clipStartTime: number;
  clipEndTime: number;
  markers: TrickMarker[];
}
