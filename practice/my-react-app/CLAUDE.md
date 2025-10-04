# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React 19 application bootstrapped with Create React App (CRA). The project uses react-scripts 5.0.1 for build tooling and comes with a complete testing setup.

## Development Commands

### Core Development
```bash
# Start development server (http://localhost:3000)
npm start

# Run all tests in interactive watch mode
npm test

# Build production bundle to build/ folder
npm run build
```

### Testing
```bash
# Run all tests
npm test

# Run tests for a specific file
npm test -- App.test.js

# Run tests with coverage
npm test -- --coverage --watchAll=false
```

## Architecture

### Application Structure
- **Entry Point**: `src/index.js` - React 19 uses `ReactDOM.createRoot()` for rendering, wrapped in `<React.StrictMode>`
- **Main Component**: `src/App.js` - Root application component
- **Styling**: CSS files are imported directly into components (`App.css`, `index.css`)
- **Static Assets**: Located in `public/` folder, referenced from `public/index.html`

### Key Technologies
- **React 19.2.0**: Uses latest React features including Concurrent Rendering
- **Testing Library**: Complete setup with @testing-library/react, @testing-library/jest-dom, and @testing-library/user-event
- **Web Vitals**: Performance monitoring configured via `reportWebVitals.js`

### CRA Configuration
- ESLint extends `react-app` and `react-app/jest` configs
- Browserslist configured for modern browsers in production, latest versions in development
- All build configuration is abstracted by react-scripts (do not eject unless absolutely necessary)

## Important Notes

### React 19 Specifics
- Uses `ReactDOM.createRoot()` instead of legacy `ReactDOM.render()`
- StrictMode is enabled by default for development warnings
- Component files use functional components as the standard pattern

### Testing Setup
- Jest is pre-configured through react-scripts
- Test files should use `.test.js` or `.spec.js` suffix
- Testing utilities from @testing-library are available globally after `setupTests.js` import

### Build System
- Webpack configuration is managed by react-scripts
- Environment variables must be prefixed with `REACT_APP_`
- Source maps and optimizations are handled automatically in production builds
