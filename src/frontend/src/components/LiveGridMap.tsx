import React, { useEffect } from 'react'
import {
  MapContainer, TileLayer, Polygon,
  Polyline, Tooltip, Popup, Marker, useMap,
} from 'react-leaflet'
import L from 'leaflet'
import type { ZoneRisk, RiskResult, CrewAssignment } from '../api/types'

// ── Fix Leaflet default icon path broken by Vite ─────────────────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// ── Colours ───────────────────────────────────────────────────────────────────
const SEV_COLOR: Record<string, string> = {
  Critical: '#ef4444',
  High:     '#f97316',
  Medium:   '#eab308',
  Low:      '#22c55e',
}
const SEV_BG: Record<string, string> = {
  Critical: '#fef2f2',
  High:     '#fff7ed',
  Medium:   '#fefce8',
  Low:      '#f0fdf4',
}

// ── Real Gujarat grid asset coordinates ──────────────────────────────────────
const ASSET_COORDS: Record<string, [number, number]> = {
  'T-01': [23.0225, 72.5714],  // Ahmedabad Central   – 250 MVA 32yr
  'T-02': [23.0780, 72.5050],  // Naroda Industrial   – 180 MVA 18yr
  'S-01': [22.9870, 72.6180],  // Vatva Substation    – 500 MVA 35yr
  'T-03': [22.3072, 73.1812],  // Vadodara City       – 320 MVA 27yr
  'T-04': [22.5700, 72.9250],  // Anand               – 150 MVA 8yr
  'S-02': [22.2550, 73.2150],  // Vadodara South      – 300 MVA 20yr
  'F-01': [22.3900, 73.0900],  // Bharuch Feeder      – 50 MVA  19yr
  'T-05': [21.1702, 72.8311],  // Surat City          – 200 MVA 41yr
  'T-06': [21.2400, 72.9000],  // Surat East          – 100 MVA 15yr
  'S-03': [21.0850, 72.7700],  // Hazira Industrial   – 220 MVA 29yr
  'T-07': [22.3039, 70.8022],  // Rajkot              – 400 MVA 22yr
  'S-04': [21.7645, 72.1519],  // Bhavnagar           – 180 MVA 14yr
  'F-02': [22.4900, 71.0300],  // Gondal Feeder       – 75 MVA  24yr
  'T-08': [23.2156, 72.6369],  // Gandhinagar         – 175 MVA 11yr
  'S-05': [23.5900, 72.3700],  // Mehsana             – 120 MVA 7yr
}

// ── Zone boundary polygons ────────────────────────────────────────────────────
const ZONE_POLYGONS: Record<string, [number, number][]> = {
  'Zone-A': [[23.18,72.42],[23.18,72.70],[22.93,72.70],[22.93,72.42]],
  'Zone-B': [[22.68,72.84],[22.68,73.28],[22.18,73.28],[22.18,72.84]],
  'Zone-C': [[21.34,72.62],[21.34,73.02],[20.96,73.02],[20.96,72.62]],
  'Zone-D': [[22.72,70.62],[22.72,72.32],[21.55,72.32],[21.55,70.62]],
  'Zone-E': [[23.72,72.22],[23.72,72.74],[23.12,72.74],[23.12,72.22]],
}

// ── Zone label pin positions ──────────────────────────────────────────────────
const ZONE_LABEL: Record<string, [number, number]> = {
  'Zone-A': [23.055, 72.56],
  'Zone-B': [22.43,  73.06],
  'Zone-C': [21.15,  72.82],
  'Zone-D': [22.13,  71.47],
  'Zone-E': [23.42,  72.48],
}

// ── Crew home base positions ──────────────────────────────────────────────────
const CREW_BASE: Record<string, [number, number]> = {
  'CREW-ALPHA': [23.10, 72.44],
  'CREW-BETA':  [22.62, 72.90],
  'CREW-GAMMA': [21.28, 72.64],
  'CREW-DELTA': [22.64, 70.68],
  'CREW-ECHO':  [23.68, 72.27],
}

// ── Auto-fit bounds ───────────────────────────────────────────────────────────
function FitBounds() {
  const map = useMap()
  useEffect(() => {
    const pts = Object.values(ASSET_COORDS)
    if (pts.length) map.fitBounds(L.latLngBounds(pts), { padding: [50, 50] })
  }, [map])
  return null
}

// ── Zone label card icon ──────────────────────────────────────────────────────
function zoneIcon(zone: string, sev: string, score: number, customers: number, critical: number) {
  const c = SEV_COLOR[sev] ?? '#94a3b8'
  const b = SEV_BG[sev]   ?? '#f8fafc'
  return L.divIcon({
    className: '',
    iconSize:   [126, 76],
    iconAnchor: [63, 38],
    html: `<div style="
        background:${b};border:2.5px solid ${c};border-radius:12px;
        padding:6px 11px;text-align:center;white-space:nowrap;
        box-shadow:0 4px 18px rgba(0,0,0,0.18);min-width:118px;pointer-events:none;">
      <div style="font-size:11.5px;font-weight:900;color:#0f172a;letter-spacing:.3px">${zone}</div>
      <div style="font-size:20px;font-weight:900;color:${c};font-family:monospace;line-height:1.15">${score}%</div>
      <div style="font-size:9.5px;font-weight:800;color:${c};text-transform:uppercase;letter-spacing:.6px">${sev}</div>
      <div style="font-size:9px;color:#64748b;margin-top:1px;font-weight:600">
        ${Math.round(customers / 1000)}k cust${critical > 0 ? ` · 🔴 ${critical}` : ''}
      </div>
    </div>`,
  })
}

// ── Asset circle icon ─────────────────────────────────────────────────────────
function assetIcon(id: string, sev: string, score: number) {
  const c    = SEV_COLOR[sev] ?? '#94a3b8'
  const sz   = sev === 'Critical' ? 46 : sev === 'High' ? 40 : 34
  const ring = sev === 'Critical'
    ? `<div style="position:absolute;inset:-7px;border-radius:50%;
         border:2px solid ${c};opacity:.35;
         animation:gridPulse 1.8s ease-out infinite;"></div>` : ''
  return L.divIcon({
    className:  '',
    iconSize:   [sz, sz],
    iconAnchor: [sz / 2, sz / 2],
    html: `<div style="position:relative;width:${sz}px;height:${sz}px;">
      ${ring}
      <div style="
          width:${sz}px;height:${sz}px;border-radius:50%;
          background:${c};border:3px solid white;
          box-shadow:0 3px 12px rgba(0,0,0,.28);
          display:flex;flex-direction:column;
          align-items:center;justify-content:center;cursor:pointer;">
        <div style="font-size:${sz < 40 ? 7.5 : 8.5}px;font-weight:900;color:white;line-height:1.1">${id}</div>
        <div style="font-size:${sz < 40 ? 7 : 7.5}px;font-weight:700;color:rgba(255,255,255,.82);line-height:1">${score}</div>
      </div>
    </div>`,
  })
}

// ── Crew truck badge icon ─────────────────────────────────────────────────────
function crewIcon(status: string, name: string) {
  const bg = status === 'DISPATCHED' ? '#4f46e5'
           : status === 'STAGING'    ? '#d97706' : '#16a34a'
  return L.divIcon({
    className:  '',
    iconSize:   [92, 32],
    iconAnchor: [46, 16],
    html: `<div style="
        background:${bg};border:2.5px solid white;border-radius:10px;
        padding:4px 8px;display:flex;align-items:center;gap:4px;
        box-shadow:0 3px 12px rgba(0,0,0,.3);white-space:nowrap;cursor:pointer;">
      <span style="font-size:14px">🚒</span>
      <span style="font-size:9.5px;font-weight:800;color:white">${name.replace(' Team', '')}</span>
    </div>`,
  })
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  zones:          ZoneRisk[]
  assets:         RiskResult[]
  crew:           CrewAssignment[]
  onSelectAsset?: (assetId: string) => void
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function LiveGridMap({ zones, assets, crew, onSelectAsset }: Props) {
  const zoneMap  = Object.fromEntries(zones.map(z  => [z.zone,     z]))
  const assetMap = Object.fromEntries(assets.map(a => [a.asset_id, a]))
  const active   = crew.filter(c => ['DISPATCHED','STAGING','SCHEDULED'].includes(c.status))

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            🗺️ Live Grid Operations Map
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Gujarat Power Grid · 15 assets · 5 zones · live risk scores · active crew dispatch routes
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-xs font-semibold flex-wrap justify-end">
          {Object.entries(SEV_COLOR).map(([lbl, col]) => (
            <span key={lbl} className="flex items-center gap-1.5 text-gray-600">
              <span className="w-3 h-3 rounded-full border-2 border-white shadow-sm inline-block"
                style={{ background: col }} />
              {lbl}
            </span>
          ))}
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold text-white"
            style={{ background: '#4f46e5' }}>🚒 Crew</span>
        </div>
      </div>

      {/* Map container — needs explicit height for Leaflet */}
      <div style={{ height: 560, position: 'relative' }}>
        <MapContainer
          center={[22.3, 72.0]}
          zoom={7}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom
          zoomControl>

          {/* Esri World Street Map — closest free look to Google Maps */}
          <TileLayer
            attribution='Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Esri, DeLorme, NAVTEQ'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
            maxZoom={20}
          />

          <FitBounds />

          {/* 1 ── Zone coloured boundary polygons */}
          {Object.entries(ZONE_POLYGONS).map(([name, coords]) => {
            const z   = zoneMap[name]
            const col = z ? SEV_COLOR[z.zone_severity] : '#94a3b8'
            return (
              <Polygon key={name} positions={coords}
                pathOptions={{ color: col, fillColor: col, fillOpacity: .11, weight: 2.5, opacity: .75, dashArray: '8 5' }} />
            )
          })}

          {/* 2 ── Zone label cards */}
          {Object.entries(ZONE_LABEL).map(([name, pos]) => {
            const z = zoneMap[name]
            if (!z) return null
            const score = Math.round(z.zone_risk_score * 100)
            return (
              <Marker key={`lbl-${name}`} position={pos}
                icon={zoneIcon(name, z.zone_severity, score, z.total_customers, z.critical_assets)}>
                <Popup maxWidth={260}>
                  <div>
                    <div style={{
                      background: SEV_COLOR[z.zone_severity], color: 'white',
                      margin: '-9px -12px 10px', padding: '8px 14px',
                      borderRadius: '8px 8px 0 0', fontWeight: 800, fontSize: 15,
                    }}>📍 {name}</div>
                    <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                      <tbody>
                        {([
                          ['Risk Score',   `${score} / 100`],
                          ['Severity',     z.zone_severity],
                          ['Assets',       `${z.asset_count}`],
                          ['Customers',    z.total_customers.toLocaleString()],
                          ['Capacity',     `${z.total_capacity_mva} MVA`],
                          ['🔴 Critical',  `${z.critical_assets}`],
                          ['🟠 High',      `${z.high_assets}`],
                        ] as [string,string][]).map(([k,v]) => (
                          <tr key={k} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ color:'#64748b', padding:'3px 8px 3px 0', fontWeight:600, whiteSpace:'nowrap' }}>{k}</td>
                            <td style={{ fontWeight:700, color: k==='Severity' ? SEV_COLOR[z.zone_severity] : '#0f172a' }}>{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ marginTop:8, fontSize:11, color:'#64748b', fontWeight:600 }}>
                      Assets: {z.asset_ids.join(' · ')}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}

          {/* 3 ── Crew dispatch lines */}
          {active.map(c => {
            const home = CREW_BASE[c.crew_id]
            const dest = ASSET_COORDS[c.assigned_asset_id]
            if (!home || !dest) return null
            return (
              <Polyline key={`ln-${c.crew_id}`} positions={[home, dest]}
                pathOptions={{ color:'#4f46e5', weight:2.5, opacity:.8, dashArray:'10 6' }}>
                <Tooltip sticky>
                  <strong>🚒 {c.crew_name}</strong> → {c.assigned_asset_id} · {c.travel_minutes} min
                </Tooltip>
              </Polyline>
            )
          })}

          {/* 4 ── Asset markers */}
          {assets.map(a => {
            const pos = ASSET_COORDS[a.asset_id]
            if (!pos) return null
            const score = Math.round(a.priority_score)
            const col   = SEV_COLOR[a.severity_label] ?? '#94a3b8'
            return (
              <Marker key={a.asset_id} position={pos}
                icon={assetIcon(a.asset_id, a.severity_label, score)}
                eventHandlers={{ click: () => onSelectAsset?.(a.asset_id) }}>
                <Tooltip direction="top" offset={[0, -22]}>
                  <strong>{a.asset_id}</strong> · {a.asset_type} · {a.severity_label} · {score}/100
                </Tooltip>
                <Popup maxWidth={240}>
                  <div>
                    <div style={{
                      background: col, color:'white',
                      margin:'-9px -12px 10px', padding:'8px 14px',
                      borderRadius:'8px 8px 0 0', fontWeight:800, fontSize:14,
                    }}>⚡ {a.asset_id} — {a.asset_type.charAt(0).toUpperCase()+a.asset_type.slice(1)}</div>
                    <div style={{
                      display:'inline-block', marginBottom:8,
                      background: SEV_BG[a.severity_label],
                      border:`1.5px solid ${col}`, borderRadius:8,
                      padding:'3px 10px', fontWeight:800, fontSize:12, color:col,
                    }}>{a.severity_label} — {score}/100</div>
                    <table style={{ width:'100%', fontSize:12, borderCollapse:'collapse' }}>
                      <tbody>
                        {([
                          ['Zone',              a.zone],
                          ['Temperature',       `${a.latest_temperature_c} °C`],
                          ['Vibration',         `${a.latest_vibration_mms} mm/s`],
                          ['Partial Discharge', `${a.latest_partial_discharge_pc} pC`],
                          ['Oil Quality',       `${a.latest_oil_quality_index} / 100`],
                          ['Load',              `${a.latest_load_percent} %`],
                          ['Age',               `${a.age_years} yrs`],
                          ['Capacity',          `${a.capacity_mva} MVA`],
                          ['Customers',         a.customers_served.toLocaleString()],
                        ] as [string,string][]).map(([k,v]) => (
                          <tr key={k} style={{ borderBottom:'1px solid #f1f5f9' }}>
                            <td style={{ color:'#64748b', padding:'3px 8px 3px 0', fontWeight:600, whiteSpace:'nowrap' }}>{k}</td>
                            <td style={{ fontWeight:700, color:'#0f172a' }}>{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <button onClick={() => onSelectAsset?.(a.asset_id)}
                      style={{
                        marginTop:10, width:'100%', background:col, color:'white',
                        border:'none', borderRadius:8, padding:'8px 0',
                        fontWeight:800, fontSize:12, cursor:'pointer',
                      }}>View Full Asset Details →</button>
                  </div>
                </Popup>
              </Marker>
            )
          })}

          {/* 5 ── Crew truck markers */}
          {active.map(c => {
            const home = CREW_BASE[c.crew_id]
            if (!home) return null
            const da   = assetMap[c.assigned_asset_id]
            const dc   = da ? SEV_COLOR[da.severity_label] : '#4f46e5'
            return (
              <Marker key={c.crew_id} position={home}
                icon={crewIcon(c.status, c.crew_name)}>
                <Tooltip direction="top" offset={[0, -20]}>
                  🚒 <strong>{c.crew_name}</strong> → {c.assigned_asset_id} ({c.travel_minutes} min · {c.status})
                </Tooltip>
                <Popup maxWidth={250}>
                  <div>
                    <div style={{
                      background:'#4f46e5', color:'white',
                      margin:'-9px -12px 10px', padding:'8px 14px',
                      borderRadius:'8px 8px 0 0', fontWeight:800, fontSize:14,
                    }}>🚒 {c.crew_name}</div>
                    <table style={{ width:'100%', fontSize:12, borderCollapse:'collapse' }}>
                      <tbody>
                        {([
                          ['Status',      c.status],
                          ['Assigned To', c.assigned_asset_id],
                          ['Type',        c.assigned_asset_type],
                          ['Zone',        c.zone],
                          ['Travel',      `${c.travel_minutes} min`],
                          ['ETA',         new Date(c.estimated_arrival_iso).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})],
                          ['Mission',     c.action],
                        ] as [string,string][]).map(([k,v]) => (
                          <tr key={k} style={{ borderBottom:'1px solid #f1f5f9' }}>
                            <td style={{ color:'#64748b', padding:'3px 8px 3px 0', fontWeight:600, whiteSpace:'nowrap' }}>{k}</td>
                            <td style={{
                              fontWeight:700,
                              color: k==='Status' ? '#4f46e5' : k==='Assigned To' ? dc : '#0f172a',
                            }}>{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {da && (
                      <div style={{
                        marginTop:8, padding:'6px 10px',
                        background:`${dc}15`, borderRadius:8,
                        borderLeft:`3px solid ${dc}`,
                        fontSize:11, fontWeight:600, color:'#0f172a',
                      }}>
                        🎯 <strong>{c.assigned_asset_id}</strong> is{' '}
                        <span style={{ color:dc, fontWeight:800 }}>{da.severity_label}</span>
                        {' '}— Score {Math.round(da.priority_score)}/100
                      </div>
                    )}
                    <button onClick={() => onSelectAsset?.(c.assigned_asset_id)}
                      style={{
                        marginTop:10, width:'100%', background:dc, color:'white',
                        border:'none', borderRadius:8, padding:'7px 0',
                        fontWeight:800, fontSize:12, cursor:'pointer',
                      }}>View Target Asset →</button>
                  </div>
                </Popup>
              </Marker>
            )
          })}

        </MapContainer>
      </div>

      {/* Crew dispatch summary strip */}
      {active.length > 0 && (
        <div className="px-5 py-3 border-t border-gray-100 bg-slate-50">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Active Dispatch</span>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {active.length} teams deployed
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {active.map(c => {
              const da  = assetMap[c.assigned_asset_id]
              const col = da ? SEV_COLOR[da.severity_label] : '#4f46e5'
              return (
                <div key={c.crew_id}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs shadow-sm">
                  <span>🚒</span>
                  <span className="font-extrabold text-indigo-800">{c.crew_name}</span>
                  <span className="text-gray-400 font-bold">→</span>
                  <button onClick={() => onSelectAsset?.(c.assigned_asset_id)}
                    className="font-mono font-extrabold hover:underline" style={{ color: col }}>
                    {c.assigned_asset_id}
                  </button>
                  <span className="text-gray-500">{c.zone}</span>
                  <span className="font-bold text-indigo-500">{c.travel_minutes} min</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold text-white"
                    style={{ background:'#4f46e5' }}>{c.status}</span>
                  {da && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold text-white"
                      style={{ background: col }}>{da.severity_label}</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Pulse animation for Critical asset rings */}
      <style>{`
        @keyframes gridPulse {
          0%   { transform:scale(1);   opacity:.5; }
          70%  { transform:scale(1.6); opacity:0;  }
          100% { transform:scale(1);   opacity:0;  }
        }
        .leaflet-container { font-family: system-ui, sans-serif !important; }
        .leaflet-popup-content { margin: 9px 12px !important; }
        .leaflet-popup-content-wrapper { border-radius: 12px !important; box-shadow: 0 8px 30px rgba(0,0,0,.18) !important; }
        .leaflet-popup-tip-container { margin-top: -1px !important; }
      `}</style>
    </div>
  )
}
