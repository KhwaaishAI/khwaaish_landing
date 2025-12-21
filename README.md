# Khwaaish AI - Landing Pageb temp for prototype


A modern, ChatGPT-style landing page built with React, TypeScript, and TailwindCSS, matching the Figma design specification.

## Features

- **Dark Theme UI**: Sleek black background with modern design
- **Sidebar Navigation**: Collapsible sidebar with New Chat, History, and Drafts sections
- **Main Content Area**: 
  - Logo and personalized greeting
  - Search bar with 15% opacity white background (#FFFFFF at 0.15)
  - Four category cards: Travel, Groceries, Transport, Shopping
  - Interactive hover effects
- **Responsive Design**: Works on desktop and mobile devices
- **TypeScript**: Type-safe code for better development experience

## Tech Stack

- React 19.1.1
- TypeScript 5.9.3
- Vite 7.1.7
- Tailwind CSS 4.1.14

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
khwaaish_landing/
├── public/
│   └── images/
│       ├── Circle.png    # Logo icon
│       └── LOGO.png      # Sidebar logo
├── src/
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles with Tailwind
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Project dependencies
```

## Design Specifications

- **Search Bar Background**: `rgba(255, 255, 255, 0.15)` - 15% opacity white
- **Category Card Icons**:
  - Travel: Blue (#3B82F6)
  - Groceries: Green (#10B981)
  - Transport: Yellow (#EAB308)
  - Shopping: Purple (#A855F7)
- **Background**: Pure black (#000000)
- **Text**: White with various opacities for hierarchy

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
