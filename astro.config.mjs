// @ts-check

import worker from "@astropub/worker"

import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    integrations:[worker()]
});
