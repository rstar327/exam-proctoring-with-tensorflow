import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeContextProvider } from './theme/ThemeContext';
import { ClerkProvider } from '@clerk/clerk-react';

// import { BrowserRouter } from 'react-router-dom';

// Get Clerk publishable key from environment variables
const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

// Create root element
const root = ReactDOM.createRoot(document.getElementById('root'));

// Validate that Clerk publishable key is provided
if (!clerkPubKey || clerkPubKey.trim() === '' || clerkPubKey === 'your_clerk_publishable_key_here') {
  console.error(
    '❌ Missing Clerk Publishable Key!\n\n' +
    'Please create a .env file in the frontend directory with:\n' +
    'REACT_APP_CLERK_PUBLISHABLE_KEY=your_actual_key_here\n\n' +
    'Get your key from: https://dashboard.clerk.com/last-active?path=api-keys\n\n' +
    'After adding the key, restart the development server.'
  );
  
  // Show a user-friendly error message in the UI
  root.render(
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      textAlign: 'center',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '40px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        maxWidth: '600px'
      }}>
        <h1 style={{ color: '#d32f2f', marginBottom: '20px' }}>⚠️ Configuration Error</h1>
        <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '20px' }}>
          <strong>Missing Clerk Publishable Key</strong>
        </p>
        <div style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '20px', 
          borderRadius: '4px', 
          marginBottom: '20px',
          textAlign: 'left',
          fontFamily: 'monospace',
          fontSize: '14px'
        }}>
          <p style={{ margin: '0 0 10px 0' }}>Please add your Clerk key to:</p>
          <code style={{ color: '#1976d2' }}>frontend/.env</code>
          <pre style={{ 
            margin: '10px 0 0 0', 
            padding: '10px', 
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '4px',
            overflow: 'auto'
          }}>
{`REACT_APP_CLERK_PUBLISHABLE_KEY=your_key_here`}
          </pre>
        </div>
        <p style={{ fontSize: '14px', color: '#666' }}>
          Get your key from:{' '}
          <a 
            href="https://dashboard.clerk.com/last-active?path=api-keys" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#1976d2' }}
          >
            Clerk Dashboard
          </a>
        </p>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
          After adding the key, <strong>restart the development server</strong>.
        </p>
      </div>
    </div>
  );
} else {
  // Define allowed origins for Clerk based on environment
  const clerkAllowedOrigins = [
    // Production domain
    'https://ai-proctor-sigma.vercel.app',
    // Development domains
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ];

  // Only show LinkedIn as social provider
  const appearance = {
    layout: {
      socialButtonsVariant: "iconButton"
    },
    elements: {
      // Hide all social buttons except LinkedIn
      socialButtons: {
        displayConfig: {
          google: false,
          facebook: false,
          github: false,
          // Only show LinkedIn
          linkedin_oidc: true
        }
      }
    }
  };

  root.render(
    <ClerkProvider 
      publishableKey={clerkPubKey}
      appearance={appearance}
      allowedRedirectOrigins={clerkAllowedOrigins}
    >
      <ThemeContextProvider>
        <Suspense>
            <App />
        </Suspense>
      </ThemeContextProvider>
    </ClerkProvider>
  );
}
