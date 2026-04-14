import { useState, useEffect } from 'react'
import { ApiService } from '../services/ApiService'
import { useToast } from '../services/ToastContext'

export default function ServersView() {
  const { addToast } = useToast()
  const [activeServers, setActiveServers] = useState([])
  const [loading, setLoading] = useState(true)

  const systemServers = [
    { id: 'api', label: 'Athena API', port: 5000, icon: '🔌', script: 'start-api' },
    { id: 'dashboard', label: 'Athena Dashboard', port: 5001, icon: '🔱', script: 'start-dashboard' },
    { id: 'dock', label: 'Athena Dock', port: 5002, icon: '⚓', script: 'start-dock' },
    { id: 'layout', label: 'Layout Editor', port: 5003, icon: '🎨', script: 'start-layout-editor' },
    { id: 'media', label: 'Media Visualizer', port: 5004, icon: '🖼️', script: 'start-media-server' },
  ]

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 5000)
    return () => clearInterval(interval)
  }, [])

  const refresh = async () => {
    try {
      const data = await ApiService.getActiveServers()
      setActiveServers(data.servers || [])
    } catch (e) { console.error("Server fetch failed") }
    setLoading(false)
  }

  const handleStart = async (script) => {
    addToast(`Starten van proces...`, 'info');
    await ApiService.runScript(script);
    setTimeout(refresh, 1000);
  }

  const handleStop = async (port) => {
    addToast(`Stoppen van proces op poort ${port}...`, 'info');
    await ApiService.stopSiteServer(port);
    setTimeout(refresh, 1000);
  }

  const isOnline = (port) => activeServers.some(s => s.port === port)

  return (
    <div className="space-y-6">
      {/* HEADER / SUMMARY BAR */}
      <div className="flex items-center justify-between bg-athena-panel/60 p-4 border border-athena-border rounded shadow-lg backdrop-blur-md">
         <div className="flex gap-8">
            <div className="flex flex-col">
               <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Systeem Status</span>
               <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  OPERATIONEEL
               </span>
            </div>
            <div className="flex flex-col border-l border-athena-border/20 pl-8">
               <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Actieve Threads</span>
               <span className="text-[11px] font-bold text-white uppercase">{activeServers.length} PROCESSEN</span>
            </div>
         </div>
         
         <div className="flex gap-2">
            <button 
              onClick={refresh}
              disabled={loading}
              className={`p-2 rounded border border-athena-border hover:bg-white/5 transition-all text-slate-400 ${loading ? 'animate-spin' : ''}`}
              title="Vernieuwen"
            >
              🔄
            </button>
            <button 
              onClick={async () => {
                if (confirm("Gevaar: Dit stopt ALLE actieve site servers. Doorgaan?")) {
                  addToast("Systeem-wide afsluiting gestart...", "info");
                  await ApiService.stopAllSiteServers();
                  refresh();
                }
              }}
              className="bg-rose-500/10 border border-rose-500/30 text-rose-500 px-4 py-1.5 rounded-sm hover:bg-rose-500 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest"
            >
              CRITICAL STOP ALL
            </button>
         </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left: System Core */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
             <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
             Athena Core Services
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {systemServers.map(server => (
              <ServerCard 
                key={server.id}
                {...server}
                online={isOnline(server.port)}
                onStart={() => handleStart(server.script)}
                onStop={() => handleStop(server.port)}
                compact={true}
              />
            ))}
          </div>
        </div>

        {/* Right: Site Servers & Task Threads */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
             <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
             Site Previews & Engine Task Threads
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeServers.filter(s => !systemServers.some(ss => ss.port === s.port)).map((server, idx) => (
              <ServerCard 
                key={idx}
                label={server.siteName || 'Onbekend'}
                port={server.port}
                pid={server.pid}
                type={server.type || 'task'}
                startTime={server.startTime}
                icon={server.type === 'preview' ? '🌐' : '⚙️'}
                online={true}
                url={server.url}
                onStop={() => handleStop(server.port)}
              />
            ))}
            {activeServers.filter(s => !systemServers.some(ss => ss.port === s.port)).length === 0 && (
              <div className="col-span-full py-20 border border-dashed border-athena-border rounded bg-black/10 flex flex-col items-center justify-center text-slate-600 gap-4">
                 <span className="text-4xl opacity-20">⚙️</span>
                 <p className="text-[10px] font-black uppercase tracking-widest">Geen actieve achtergrondtaken</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ServerCard({ label, port, pid, type, startTime, icon, online, url, onStart, onStop, compact }) {
  const [uptime, setUptime] = useState('');

  useEffect(() => {
    if (!startTime || !online) return;
    const update = () => {
      const diff = new Date() - new Date(startTime);
      const sec = Math.floor(diff / 1000);
      const min = Math.floor(sec / 60);
      if (min > 0) setUptime(`${min}m ${sec % 60}s`);
      else setUptime(`${sec % 60}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime, online]);

  return (
    <div className={`bg-athena-panel/40 border border-athena-border rounded-sm transition-all flex flex-col group ${online ? 'border-l-2 border-l-emerald-500 shadow-md shadow-emerald-500/5' : 'border-l-2 border-l-slate-700 opacity-60'}`}>
      <div className={`flex items-center justify-between ${compact ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded flex items-center justify-center text-md bg-black/20 border border-athena-border/50`}>
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
               <h4 className="font-bold text-white text-[12px] group-hover:text-athena-accent transition-colors">{label}</h4>
               {type && <span className="text-[7px] bg-slate-800 text-slate-400 px-1 py-0.5 rounded uppercase font-black">{type}</span>}
            </div>
            <p className="text-[9px] text-slate-500 font-mono">PORT: {port} {pid && ` | PID: ${pid}`}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
             {online && <span className="text-[10px] font-bold text-emerald-500/60 font-mono tracking-tighter">{uptime}</span>}
             <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-sm border uppercase tracking-tighter ${online ? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/5' : 'text-slate-500 border-slate-700 bg-slate-800'}`}>
               {online ? 'LIVE' : 'IDLE'}
             </span>
          </div>
        </div>
      </div>

      <div className={`flex gap-1 border-t border-athena-border/10 ${compact ? 'p-1' : 'p-2'} bg-black/10`}>
        {online ? (
          <>
            {url && (
              <a 
                href={url} 
                target="_blank" 
                rel="noreferrer"
                className="flex-1 py-1 bg-white/5 hover:bg-athena-accent hover:text-white text-[8px] font-black text-center rounded-sm transition-all uppercase tracking-widest text-slate-400"
              >
                Open Site
              </a>
            )}
            <button 
              onClick={onStop}
              className="px-4 py-1 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white text-[8px] font-black rounded-sm transition-all uppercase tracking-widest"
              title="Hard Terminate"
            >
              KILL
            </button>
          </>
        ) : (
          <button 
            onClick={onStart}
            className="flex-1 py-1 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white text-[8px] font-black rounded-sm transition-all uppercase tracking-widest"
          >
            BOOT SERVICE
          </button>
        )}
      </div>
    </div>
  )
}
