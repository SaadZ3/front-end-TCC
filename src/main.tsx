import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App';
import { AuthProvider } from './auth/AuthProvider';
import MyGlobalStyles from './styles/globalStyles';

createRoot(document.getElementById('root')!).render(
  <StrictMode><BrowserRouter><AuthProvider>
    <MyGlobalStyles /><App />
  </AuthProvider></BrowserRouter></StrictMode>,
);
