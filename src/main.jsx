import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { LangProvider } from './i18n/LangContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import App from './App.jsx';
import './styles/global.css';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <LangProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </LangProvider>
  </BrowserRouter>,
);
