/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    theme: {
        extend: {
            colors: {
                't-pri': '#b7ccdf',
                't-sec': '#4f545a',
            }
        },
        fontFamily: {
            sans: ['Inter'],
            mplus: ["'M PLUS Rounded 1c'"],
            bank: ["'Bank Gothic'"],
        }
    },
    plugins: []
};