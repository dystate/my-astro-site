// src/data/diary.ts
export const meta = { id: "diary", label: "日记", en: "Diary" } as const;

export interface DiaryPost {
  id: string;
  date?: string;
  time?: string;
  body: string;
}

export const diary: DiaryPost[] = [
  { id: "diary-1", date: "2026.06.13", time: "23:15", body: "今天我将确定我的网站为1.0版。" },
  { id: "diary-2", date: "", time: "", body: ""}
];
