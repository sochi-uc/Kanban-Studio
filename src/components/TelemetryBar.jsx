/* ============================================================
   TelemetryBar.jsx — Live ASP.NET Core 10 Minimal API Telemetry
   
   Platview Sprint Kanban Studio
   Architectural Role: Live Full-Stack Network Telemetry HUD
   ============================================================ */

export default function TelemetryBar({ telemetry }) {
  const { active, verb, endpoint, statusCode, latencyMs, server, signalRConnected } = telemetry

  const verbClass = {
    PATCH: 'telemetry-verb--patch',
    POST: 'telemetry-verb--post',
    GET: 'telemetry-verb--get',
    DELETE: 'telemetry-verb--del'
  }[verb] || 'telemetry-verb--patch'

  return (
    <div className={`telemetry-container ${active ? 'telemetry-container--pulsing' : ''}`}>
      <div className="telemetry-left">
        <span
          className={`pulse-indicator ${active ? 'pulse-indicator--active' : ''}`}
          title={active ? 'Simulating network dispatch' : 'Idle connection'}
        />
        <span className={`telemetry-verb ${verbClass}`}>{verb}</span>
        <code className="telemetry-endpoint">{endpoint}</code>
      </div>

      <div className="telemetry-right">
        <span className="telemetry-status-badge">{statusCode}</span>
        <span className="telemetry-server-badge">{server}</span>
        <span className="telemetry-latency-badge">{latencyMs}ms</span>
        <div className="telemetry-signalr-badge" title="SignalR WebSocket State">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12.55a11 11 0 0 1 14.08 0" />
            <path d="M1.42 9a16 16 0 0 1 21.16 0" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <line x1="12" y1="20" x2="12.01" y2="20" />
          </svg>
          <span>{signalRConnected ? 'SignalR Live' : 'Connecting'}</span>
        </div>
      </div>
    </div>
  )
}
