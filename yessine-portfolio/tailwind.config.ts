import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Exact colors from Framer extraction
        background: '#141417',
        foreground: '#ffffff',
        muted: '#919191',
        border: '#292929',
        surface: '#19191a',
        'surface-border': '#2e2e2e',
        accent: '#42342b',
        'accent-light': '#d0a58b',
      },
      fontSize: {
        // Typography from extraction
        '5xl': '48px',
        '6xl': '60px',
        '7xl': '72px',
        '8xl': '96px',
        '9xl': '120px',
      },
      lineHeight: {
        tight: '1.2',
      },
      backdropBlur: {
        '10': '10px',
      },
      boxShadow: {
        // Exact Framer shadow
        card: '0px 0.6021873017743928px 1.5656869846134214px -1.1666666666666665px rgba(0, 0, 0, 0.27), 0px 2.288533303243457px 5.950186588432988px -2.333333333333333px rgba(0, 0, 0, 0.24), 0px 10px 26px -3.5px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
