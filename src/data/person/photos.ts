// src/data/photos.ts
export const meta = { id: "photos", label: "照片", en: "Photographs" } as const;

export interface PhotoPost {
  caption?: string;
  images: string[];   // 图片地址数组（一张或多张）
  time: string;
}

// 等有图再填，数组为空时板块显示占位
export const photos: PhotoPost[] = [
  // { caption: "周末散步", images: ["/photos/a.jpg", "/photos/b.jpg"], time: "1天前" },
];
