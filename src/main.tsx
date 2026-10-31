import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {DemoProvider} from './demo/DemoContext.tsx';
import './index.css';
import './desi.css';
import './demo/demo.css';
import './companion.css';
import './operations.css';

createRoot(document.getElementById('root')!).render(<DemoProvider><App /></DemoProvider>);

import './saathi.css';
