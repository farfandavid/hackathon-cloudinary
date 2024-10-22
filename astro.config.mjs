// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import tailwind from '@astrojs/tailwind';

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react(), tailwind()],
  server: {
    host: true,
    port: 4321,
    open: true
  },
  adapter: node({
    mode: 'standalone'
  })
});