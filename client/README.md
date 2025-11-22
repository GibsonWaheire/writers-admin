# Writers Admin Frontend (React + TypeScript)

Frontend application for the Writers Admin system.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (optional, defaults to `http://localhost:5000`):
```bash
VITE_API_URL=http://localhost:5000/api
```

3. Start development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is taken).

## Build

To build for production:
```bash
npm run build
```

The built files will be in the `dist` directory.

## API Integration

The frontend uses the API service (`src/services/api.ts`) to communicate with the Flask backend. The Vite dev server is configured to proxy `/api` requests to `http://localhost:5000`.

## Project Structure

- `src/` - Source code
  - `components/` - React components
  - `contexts/` - React contexts for state management
  - `pages/` - Page components
  - `services/` - API and service files
  - `types/` - TypeScript type definitions
  - `utils/` - Utility functions

