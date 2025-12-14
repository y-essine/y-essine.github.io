# Yassine Karoui - Resume Website

A pixel-perfect recreation of a Framer resume website built with Next.js 16, TypeScript, and Tailwind CSS 4. All design tokens were extracted from the original Framer HTML for exact accuracy.

## 🎨 Extraction & Design System

This project uses **279 CSS variables** and **exact design tokens** extracted from the original Framer HTML:

- **Colors**: 8 unique tokens (`#141417` background, `#919191` muted, etc.)
- **Typography**: 21 font sizes, Inter font family
- **Spacing**: 55 unique spacing values
- **Shadows**: 6 exact Framer box shadows
- **460 inline styles** analyzed and categorized

See [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) for complete extraction details.

## Features

- 🎯 **Pixel-Perfect**: Exact colors and spacing from original Framer site
- 🎨 **Dark Theme**: Professional dark mode design (#141417 background)
- 📱 **Responsive**: Fully responsive layout that works on all devices
- ⚡ **Next.js 16**: Built with the latest Next.js features and Turbopack
- 🎯 **Type-Safe**: Written in TypeScript for better developer experience
- 📊 **JSON Data**: All content stored in JSON for easy CMS migration
- 🎭 **Inter Font**: Uses the Inter font family for clean typography
- 🔍 **Extracted Tokens**: 279 CSS variables from original HTML

## Project Structure

```
yessine-portfolio/
├── app/
│   ├── components/          # Reusable UI components
│   │   ├── Card.tsx        # Card component for sections
│   │   ├── List.tsx        # List component for items
│   │   ├── SectionTitle.tsx # Section title component
│   │   └── WorkItem.tsx    # Work experience item component
│   ├── data/
│   │   └── resume.json     # All resume data (easily replaceable with CMS)
│   ├── globals.css         # Global styles and CSS variables
│   ├── layout.tsx          # Root layout with Inter font
│   └── page.tsx            # Main resume page
├── public/                  # Static assets
├── package.json
└── tsconfig.json
```

## Data Structure

The resume data is stored in `app/data/resume.json` with the following structure:

```json
{
  "name": "Your Name",
  "about": {
    "title": "À propos",
    "items": [...],
    "bio": "..."
  },
  "competences": {
    "skills": {...},
    "outils": {...},
    "techStack": {...},
    "langues": {...}
  },
  "experience": {
    "jobs": [...]
  }
}
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to the project directory:
```bash
cd yessine-portfolio
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Customization

### Updating Content

Edit `app/data/resume.json` to update your:
- Name and personal information
- About section
- Skills and competences
- Work experience
- Tools and tech stack
- Languages

### Styling

The design uses CSS variables defined in `app/globals.css`:

```css
:root {
  --background: #0a0a0a;    /* Background color */
  --foreground: #ffffff;     /* Text color */
  --border: #2b2b2b;        /* Border color */
  --muted: #a4a4a4;         /* Muted text */
  --accent: #42342b;        /* Accent background */
  --accent-light: #d0a58b;  /* Accent text */
}
```

### Components

All components are modular and can be customized:

- **Card**: Displays titled sections with borders
- **List**: Renders lists with consistent styling
- **SectionTitle**: Large section headers
- **WorkItem**: Experience cards with icons and metadata

## CMS Integration

To integrate with a headless CMS:

1. Replace the JSON import in `page.tsx` with an API call
2. Use Next.js data fetching methods (`fetch`, `getServerSideProps`, etc.)
3. Update the type definitions to match your CMS schema

Example:
```typescript
// Instead of:
import resumeData from "./data/resume.json";

// Use:
const resumeData = await fetch('your-cms-api/resume').then(r => r.json());
```

## Technologies Used

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **Lucide React** - Icon library
- **Inter Font** - Typography

## License

This project is based on the Jake dark mode resume template and customized for personal use.

## Author

Yassine Karoui - Product Engineer & Fullstack Developer


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
