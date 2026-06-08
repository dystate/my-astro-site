import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  // 告诉 Tailwind 去哪些文件里寻找类名
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {},
  },
  plugins: [
    // 启用排版插件
    require('@tailwindcss/typography'),
  ],
}