// src/data/album/index.ts
// 自动收录 src/data/album/<相册名>/index.ts 下的所有相册。
// 新增相册 = 新建一个文件夹即可，这里无需改动。
import type { AlbumItem } from "./types";
import { resolvePhotoSrc } from "./cloud";

export * from "./types";
export { PHOTO_BASE } from "./cloud";

const modules = import.meta.glob<{ default: AlbumItem }>("./*/index.ts", {
  eager: true,
});

export const ALBUM_ITEMS: AlbumItem[] = Object.entries(modules)
  .map(([path, mod]) => ({ path, item: mod.default }))
  .sort((a, b) => {
    const oa = a.item.order ?? Number.MAX_SAFE_INTEGER;
    const ob = b.item.order ?? Number.MAX_SAFE_INTEGER;
    return oa !== ob ? oa - ob : a.path.localeCompare(b.path);
  })
  // 构建时把短键解析成完整的七牛 URL（封面 media + 详情页 photos）
  .map(({ item }) => ({
    ...item,
    media: item.media
      ? { ...item.media, src: resolvePhotoSrc(item.id, item.media.src) ?? item.media.src }
      : item.media,
    photos: item.photos?.map((p) => ({ ...p, src: resolvePhotoSrc(item.id, p.src) })),
  }));
