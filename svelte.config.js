import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/kit/vite';
import { preprocessThrelte } from '@threlte/preprocess'

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: [vitePreprocess({
        postcss: true,
    }), preprocessThrelte()],

    kit: {
        adapter: adapter(),
    }
};

export default config;