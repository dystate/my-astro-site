import type { AlbumPage, AlbumPageMedia } from "./types";

const mediaPattern = /^!(image|video|audio)?\[([^\]]*)\]\(([^)]+)\)\s*$/i;

/**
 * 简易书本格式：
 * - `---` 单独一行分隔页面
 * - 普通段落成为页面文字
 * - `![说明](路径)` 添加图片
 * - `!video[说明](路径)` 添加视频
 * - `!audio[说明](路径)` 添加音频
 * - 页面第一行 `# 标题` 可选
 */
export function parseAlbumBook(source: string): AlbumPage[] {
  return source
    .replace(/^\uFEFF/, "")
    .split(/^\s*---\s*$/m)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, pageIndex) => {
      const textLines: string[] = [];
      const media: AlbumPageMedia[] = [];
      let title: string | undefined;

      for (const line of block.split(/\r?\n/)) {
        const mediaMatch = line.trim().match(mediaPattern);
        if (mediaMatch) {
          const [, rawType, caption, rawSrc] = mediaMatch;
          media.push({
            type: (rawType?.toLowerCase() || "image") as AlbumPageMedia["type"],
            src: rawSrc.trim(),
            ...(caption.trim() ? { caption: caption.trim() } : {}),
          });
          continue;
        }

        const headingMatch = line.match(/^#\s+(.+)$/);
        if (!title && headingMatch) {
          title = headingMatch[1].trim();
          continue;
        }
        textLines.push(line);
      }

      return {
        id: `newjourney-page-${pageIndex + 1}`,
        ...(title ? { title } : {}),
        ...(textLines.join("\n").trim() ? { text: textLines.join("\n").trim() } : {}),
        ...(media.length ? { media } : {}),
      };
    });
}
