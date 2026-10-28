import { defineConfig } from 'astro/config';

const site = process.env.SITE_URL ?? 'https://caseyisonit.github.io';
const base = process.env.BASE_PATH ?? '/megan-and-ryan';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  devToolbar: { enabled: false },
});
