// src/data/album/newjourney/index.ts
// NEW JOURNEY 相册的数据。
// 新增相册：在 src/data/album/ 下复制一个这样的文件夹（改个名），
// 填好下面字段即可——index.ts 会自动收录，无需手动登记。
import type { AlbumItem } from "../types";

const album: AlbumItem = {
  id: "newjourney",
  title: "NEW JOURNEY",
  year: "2026",
  client: "新路",
  href: "/album/newjourney",
  media: { type: "video", src: "/images/eye.mp4", poster: "" },
  accent: ["#3a4a4a", "#0b1110"],
  order: 1,
  // ↓ 详情页轮播图集。把照片上传到又拍云服务的 /newjourney/ 目录下，这里只写裸文件名即可，
  //   会自动解析成 又拍云域名/newjourney/<文件名>。留空则显示占位渐变。
  //   例：{ src: "01.jpg", title: "Shadway" }
  photos: [
    { src: "01.jpg", title: "" },
    { src: "02.jpg", title: "" },
    { src: "03.jpg", title: "" },
    { src: "04.jpg", title: "" },
    { src: "05.jpg", title: "" },
    { src: "06.jpg", title: "" },
    { src: "07.jpg", title: "" },
    { src: "08.jpg", title: "" },
    { src: "09.jpg", title: "" },
    { src: "10.jpg", title: "" },
    { src: "11.jpg", title: "" },
    { src: "12.jpg", title: "" },
    { src: "13.jpg", title: "" },
    { src: "14.jpg", title: "" },
    { src: "15.jpg", title: "" },
    { src: "16.jpg", title: "" },
    { src: "17.jpg", title: "" },
    { src: "18.jpg", title: "" },
    { src: "19.jpg", title: "" },
    { src: "20.jpg", title: "" },
    { src: "21.jpg", title: "" },
    { src: "22.jpg", title: "" },
    { src: "23.jpg", title: "" },
    { src: "24.jpg", title: "" },
  ],
};

export default album;
