// 告示栏「在学 / Learning」——status 控制小圆点颜色和角标文字
export interface LearningItem {
  label: string;
  status?: "doing" | "done" | "next";
}

export const learning: LearningItem[] = [
  { label: "Astro 内容集合 Content Collections", status: "doing" },
  { label: "CSS Grid 子网格 subgrid", status: "doing" },
  { label: "Swiss / 日式实验排版", status: "next" },
  { label: "OpenCV 图像分割", status: "done" },
  { label: "WebGL 着色器入门", status: "next" },
];
