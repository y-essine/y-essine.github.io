/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				't-pri': '#a3c2e9',
				't-sec': '#455669'
			}
		},
		fontFamily: {
			sans: ['Inter'],
			mplus: ["'M PLUS Rounded 1c'"],
			bank: ["'Bank Gothic'"],
			beckett: ["'Beckett'"]
		}
	},
	plugins: []
};
