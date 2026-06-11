// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';


import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  integrations: [mdx(), react()],

  vite: {
    plugins: [tailwindcss()]
  }, 
  output: 'server', // 开启 SSR 模式
  adapter: vercel(),
});