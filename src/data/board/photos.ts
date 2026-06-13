// 告示栏相框照片——src 指向 public/ 下的图片路径
// 例如把图片放到 public/board/handaccount.jpg，这里写 "/board/handaccount.jpg"
// 暂时没图也没关系，PhotoFrame 会显示一个占位框
export interface Photo {
  src: string;
  alt: string;
  caption?: string;
}

export const photos: Photo[] = [
  {
    src: "/images/graduate.jpg",
    alt: "",
    caption: "近期",
  },
];
