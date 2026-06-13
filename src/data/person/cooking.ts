// src/data/cooking.ts
export const meta = { id: "cooking", label: "厨艺", en: "Cooking" } as const;

export interface CookingPost {
  dish: string;
  image?: string;
  note?: string;
  time: string;
}

// 等有图再填，数组为空时板块显示占位
export const cooking: CookingPost[] = [
  //{ dish: "番茄牛腩", image: "/cooking/a.jpg", note: "炖了两小时", time: "3天前" },
];
