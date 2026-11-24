/* ============================================================
   CSharpCodeViewer.jsx — Interactive ASP.NET Core 10 Clean Architecture Explorer
   
   Platview Sprint Kanban Studio
   Architectural Role: C# Domain & Pipeline Code Viewer
   ============================================================ */

import { useState } from 'react'
import { CSHARP_FILES } from '../data/csharpSnippets'

export default function CSharpCodeViewer() {
  const [activeFileId, setActiveFileId] = useState(CSHARP_FILES[0].id)
  const [copied, setCopied] = useState(false)

  const activeFile = CSHARP_FILES.find(f => f.id === activeFileId) || CSHARP_FILES[0]

  function handleCopy() {
    navigator.clipboard.writeText(activeFile.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="csharp-container">
      <div className="csharp-card">
        {/* Header Tabs */}
        <div className="csharp-header-tabs">
          <div className="csharp-tabs-left">
            {CSHARP_FILES.map(file => (
              <button
                key={file.id}
                type="button"
                className={`csharp-tab ${activeFileId === file.id ? 'csharp-tab--active' : ''}`}
                onClick={() => setActiveFileId(file.id)}
              >
                <span>{file.name}</span>
                <span className="csharp-badge">{file.badge}</span>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: '#9CA3AF', fontFamily: 'var(--font-mono)' }}>
              {activeFile.category}
            </span>
            <button
              type="button"
              className="btn"
              style={{ padding: '3px 8px', fontSize: '11px', background: 'rgba(255, 255, 255, 0.08)', color: '#F4F4F5', borderColor: 'rgba(255, 255, 255, 0.12)' }}
              onClick={handleCopy}
              title="Copy C# code to clipboard"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Code Content */}
        <pre className="csharp-code-content">
          <code>{activeFile.code}</code>
        </pre>
      </div>
    </div>
  )
}
