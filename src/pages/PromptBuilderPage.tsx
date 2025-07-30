'use client';

import React, { useState } from 'react';

export default function PromptBuilderPage() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{ prompt: string; response: string }[]>([]); // ✅ History state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      const aiResponse = data.result || 'No response';

      setResponse(aiResponse);

      // ✅ Add to history
      setHistory((prev) => [
        { prompt, response: aiResponse },
        ...prev,
      ]);
    } catch (err) {
      console.error(err);
      setResponse('Error generating response.');
    }

    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      {/* Top Half: Prompt + Response */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Prompt Input Side */}
        <div style={{ flex: 1, padding: '2rem', borderRight: '1px solid #ddd' }}>
          <h1>PromptPilot IQ</h1>
          <form onSubmit={handleSubmit}>
            <textarea
              rows={10}
              style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
              placeholder="Enter your prompt..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </form>
        </div>

        {/* Preview Side */}
        <div style={{ flex: 1, padding: '2rem' }}>
          <h2>AI Response</h2>
          <div
            style={{
              background: '#f0f9ff',
              border: '1px solid #ccc',
              padding: '1rem',
              minHeight: '300px',
              whiteSpace: 'pre-wrap',
            }}
          >
            {response || 'Response will appear here.'}
          </div>
        </div>
      </div>

      {/* Bottom Half: History */}
      <div style={{ maxHeight: '300px', overflowY: 'auto', borderTop: '1px solid #ddd', padding: '1rem' }}>
        <h3>Prompt History</h3>
        {history.length === 0 ? (
          <p>No prompts yet.</p>
        ) : (
          history.map((item, idx) => (
            <div key={idx} style={{ marginBottom: '1rem' }}>
              <strong>Prompt:</strong>
              <div style={{ background: '#f5f5f5', padding: '0.5rem', marginBottom: '0.25rem' }}>{item.prompt}</div>
              <strong>Response:</strong>
              <div style={{ background: '#e0f7fa', padding: '0.5rem' }}>{item.response}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
