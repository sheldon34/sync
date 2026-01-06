import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Auth0Provider } from '@auth0/auth0-react';

// Fix: Define ImportMeta types manually as vite/client types are missing
declare global {
  interface ImportMetaEnv {
    readonly VITE_AUTH0_DOMAIN: string;
    readonly VITE_AUTH0_CLIENT_ID: string;
    readonly VITE_AUTH0_AUDIENCE?: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

const root = ReactDOM.createRoot(rootElement);

if (!domain || !clientId) {
    const errorMsg = "Missing Auth0 configuration. Please set VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID in .env.local (or .env).";
    console.error(errorMsg);
    root.render(
      <div style={{ padding: 20, fontFamily: 'monospace', backgroundColor: 'black', color: '#FFC300', height: '100vh' }}>
        <h1>Configuration Error</h1>
        <p>{errorMsg}</p>
      </div>
    );
} else {
    root.render(
      <React.StrictMode>
        <Auth0Provider
          domain={domain}
          clientId={clientId}
          authorizationParams={{
            redirect_uri: window.location.origin,
            ...(audience ? { audience } : {}),
          }}
        >
          <App />
        </Auth0Provider>
      </React.StrictMode>
    );
}