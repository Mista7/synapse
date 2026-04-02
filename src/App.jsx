import { useState } from 'react';
import UploadZone from './components/UploadZone';
import ConceptGraph from './components/ConceptGraph';
import NodeDetail from './components/NodeDetail';
import { supabase } from './lib/supabase';
import './index.css';

export default function App() {
  const [graphData, setGraphData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [docName, setDocName] = useState('');

  async function handleTextExtracted(text, filename) {
    setLoading(true);
    setError(null);
    setSelectedNode(null);
    setDocName(filename);

    try {
      const res = await fetch('http://localhost:3001/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Server error ${res.status}`);
      }

      const data = await res.json();
      setGraphData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setGraphData(null);
    setSelectedNode(null);
    setError(null);
    setDocName('');
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-logo">⚡</div>
        <div className="header-title">Synapse</div>
        {docName && <div className="header-subtitle" style={{ marginLeft: 16 }}>📄 {docName}</div>}
        <div style={{ flex: 1 }} />
        <button 
          onClick={() => supabase.auth.signOut()}
          style={{ 
            background: 'transparent', 
            border: '1px solid var(--border-color)', 
            color: 'var(--text-color)', 
            padding: '6px 12px', 
            borderRadius: '4px', 
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          Sign Out
        </button>
      </header>

      <main className="main">
        {loading && (
          <div className="loading-overlay">
            <div className="spinner" />
            <div className="loading-label">Extracting concepts…</div>
          </div>
        )}

        {!loading && error && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div className="error-banner">⚠️ {error}</div>
            <button className="reset-btn" style={{ position: 'static', marginTop: 16 }} onClick={handleReset}>
              ← Try again
            </button>
          </div>
        )}

        {!loading && !error && !graphData && (
          <UploadZone onTextExtracted={handleTextExtracted} isLoading={loading} />
        )}

        {!loading && !error && graphData && (
          <div className="workspace">
            <div className="graph-area">
              <button className="reset-btn" onClick={handleReset}>← New PDF</button>
              <ConceptGraph
                graphData={graphData}
                selectedNode={selectedNode}
                onSelectNode={setSelectedNode}
              />
            </div>
            {selectedNode && (
              <NodeDetail node={selectedNode} onClose={() => setSelectedNode(null)} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
