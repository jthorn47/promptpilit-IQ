import React, { useState } from 'react';

export default function Workspace() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');

  const handleRun = async () => {
    // Simulated AI response (replace with OpenAI call later)
    setResponse(`🤖 Response to: "${prompt}"`);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Prompt Panel */}
      <div style={{ flex: 1, padding: '2rem', borderRight: '1px solid #ddd' }}>
        <h2>Prompt</h2>
        <textarea
          style={{ width: '100%', height: '300px' }}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button onClick={handleRun} style={{ marginTop: '1rem' }}>
          Run Prompt
        </button>
      </div>

      {/* Preview Panel */}
      <div style={{ flex: 1, padding: '2rem' }}>
        <h2>Preview</h2>
        <div
          style={{
            whiteSpace: 'pre-wrap',
            border: '1px solid #ccc',
            padding: '1rem',
            minHeight: '300px',
          }}
        >
          {response}
        </div>
      </div>
    </div>
  );
}
