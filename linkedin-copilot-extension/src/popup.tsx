import React from 'react';
import { createRoot } from 'react-dom/client';

const Popup: React.FC = () => {
  return (
    <div style={{ width: '300px', padding: '16px' }}>
      <h1 style={{ fontSize: '18px', marginBottom: '16px' }}>LinkedIn Co-pilot</h1>
      <div style={{ marginBottom: '16px' }}>
        <p>Your AI-powered LinkedIn assistant</p>
      </div>
      <div>
        <button
          style={{
            backgroundColor: '#0a66c2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 16px',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          Open Dashboard
        </button>
      </div>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Popup />);
} 