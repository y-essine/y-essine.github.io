import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import path from 'path';

const config: UserConfig = {
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	resolve: {
		alias: {
			$lib: path.resolve('./src/lib'),
			$shared: path.resolve('./src/lib/shared'),
			$components: path.resolve('./src/lib/components'),
			$assets: path.resolve('./src/assets')
		}
	},
	ssr: {
		noExternal: ['three', 'troika-three-text']
	}
};

export default config;
