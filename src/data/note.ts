// 告示栏黄色便签——供你说几句话的地方，每行一个数组元素
export interface BoardNote {
  lines: string[];
  signature: string;
  date?: string;
}

export const note: BoardNote = {
  lines: [
    "最近在折腾这块告示栏，",
    "想让首页像一面真的木板，",
    "把更新、在学的东西，",
    "还有随手拍的照片都钉上去。",
  ],
  signature: "夏令时",
  date: "写于初夏",
};
