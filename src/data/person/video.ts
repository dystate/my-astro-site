// src/data/video.ts
export const meta = { id: "video", label: "视频", en: "Video" } as const;

export interface VideoPost {
  title?: string;
  time: string;
  src: string;        // 视频地址（R2）。封面会自动取开头一帧，无需单独封面图
}

export const video: VideoPost[] = [
  { title: "海边的傍晚", time: "5分钟前", src: "/videos/sample-1.mp4" },
  { title: "厨房日常",   time: "1小时前", src: "/videos/sample-2.mp4" },
];
