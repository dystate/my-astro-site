// src/data/diary.ts
export const meta = { id: "diary", label: "日记", en: "Diary" } as const;

export interface DiaryPost {
  date?: string;
  body: string;
}

export const diary: DiaryPost[] = [
  { date: "2026.06.13", body: "今天我将确定我的网站为1.0版。" },
];
