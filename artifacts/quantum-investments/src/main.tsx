import { createRoot } from 'react-dom/client';

// Self-hosted fonts — no external network round-trip, no render-blocking CDN request.
// Weights mirror what the app uses: Inter 400–900, Plus Jakarta Sans 600–800.
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/plus-jakarta-sans/800.css';

import App from './App';

import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
