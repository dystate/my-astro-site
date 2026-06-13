// src/data/music.ts
export const meta = { id: "music", label: "音乐", en: "Music" } as const;

export interface MusicPost {
  title: string;
  artist: string;
  tint: string;       // 卡片底色（不显示专辑图，用纯色卡片）
  duration: number;   // 进度条走完的秒数；接真实音频后可改由 audio 驱动
  src?: string;       // 之后接 R2 音频地址
}

export const music: MusicPost[] = [
  { title: "Blue Moon",   artist: "Hearts2Hearts",  tint: "#6f6168", duration: 30 },
  { title: "Ash",         artist: "LE SSERAFIM",    tint: "#7a674e", duration: 28 },
  { title: "Summer Rain", artist: "IRENE",          tint: "#5c6b71", duration: 35 },
];
