// 告示栏「在学 / Learning」——status 控制小圆点颜色和角标文字
export interface LearningItem {
  label: string;
  status?: "doing" | "done" | "next";
}

export const learning: LearningItem[] = [
  { label: "Content Collections", status: "doing" },
  { label: "厨艺", status: "doing"},
  { label: "拍照技术", status: "doing"},
  { label: "思花", status: "next" },
  { label: "Linux", status: "next" },

];
