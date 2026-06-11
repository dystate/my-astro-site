// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// ⚠️ 用 glob loader 的集合不能放在 src/content/ 里，所以内容在 src/data/woaidan/
const woaidan = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/data/woaidan' }),
  schema: z.object({
    book: z.string().optional(),       // 书名；不填则自动用文件夹名
    bookOrder: z.number().optional(),  // 书架上的位置（越小越靠前）
    pageNumber: z.number().optional(), // 书内页码；不填则按文件名 01/02 排
    title: z.string().optional(),      // 单页标题（可选）
    cover: z.string().optional(),      // 这本书的封面图，如 /images/story-cover.png（放 public/images/ 下）
    date: z.string().optional(),
  }),
});

export const collections = { woaidan };