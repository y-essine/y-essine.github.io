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
			'@': path.resolve('./src/lib')
		}
	},
	ssr: {
		noExternal: ['three', 'troika-three-text']
	}
};

export default config;
