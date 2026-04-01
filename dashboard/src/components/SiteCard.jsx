import { useState } from 'react';
import { ApiService } from '../services/ApiService';
import { useToast } from '../services/ToastContext';

export default function SiteCard({ site, activeServer, autoStop, onRefresh, onSEO, onSheet }) {
  const { addToast } = useToast();
  const isRunning = !!activeServer;
  const status = site.status || 'local';
  
  const [isHydrating, setIsHydrating] = useState(false);
  const isInstalled = site.isInstalled;

  const handleStartDev = async () => {
    try {
      if (!isInstalled) {
        addToast(`Dormante site gedetecteerd. Auto-hydratie gestart voor ${site.name}...`, 'info');
        setIsHydrating(true);
      } else {
        addToast(`Starten van server voor ${site.name}...`, 'info');
      }
      await ApiService.startSiteDev(site.name, { stopOthers: autoStop });
      setIsHydrating(false);
      setTimeout(onRefresh, 1000);
    } catch (e) {
      setIsHydrating(false);
      addToast("Fout bij starten server: " + e.message, 'error');
    }
  };

  const handleHydrate = async () => {
    try {
      addToast(`Hydratatie van ${site.name} gestart...`, 'info');
      setIsHydrating(true);
      const res = await ApiService.hydrateSite(site.name);
      setIsHydrating(false);
      if (res.success) {
        addToast(`Site ${site.name} is nu gehydrateerd.`, 'success');
        onRefresh();
      } else {
        addToast(`Hydratatie mislukt: ${res.error}`, 'error');
      }
    } catch (e) {
      setIsHydrating(false);
      addToast(`Netwerkfout: ${e.message}`, 'error');
    }
  };

  const handleDehydrate = async () => {
    if (!confirm(`Weet je zeker dat je ${site.name} wilt deshydrateren? Dit verwijdert node_modules om ruimte te besparen.`)) return;
    try {
      addToast(`Deshydratatie van ${site.name}...`, 'info');
      const res = await ApiService.dehydrateSite(site.name);
      if (res.success) {
        addToast(`Site ${site.name} is nu dormant (node_modules verwijderd).`, 'success');
        onRefresh();
      } else {
        addToast(`Deshydratatie mislukt: ${res.error}`, 'error');
      }
    } catch (e) {
      addToast(`Netwerkfout: ${e.message}`, 'error');
    }
  };

  const handleStopDev = async () => {
    if (!activeServer) return;
    try {
      addToast(`Stoppen van server op poort ${activeServer.port}...`, 'info');
      await ApiService.stopSiteServer(activeServer.port);
      setTimeout(onRefresh, 1000);
    } catch (e) {
      addToast("Fout bij stoppen server: " + e.message, 'error');
    }
  };

  const handleDeploy = async () => {
    const msg = prompt("Commit bericht voor deze release:", "Update site content via Athena Dashboard");
    if (!msg) return;

    try {
      addToast(`Deployment van ${site.name} gestart...`, 'info');
      const res = await ApiService.deploy(site.name, msg);
      if (res.success) {
        addToast(`Deployment geslaagd! Site is onderweg naar GitHub Pages.`, 'success');
      } else {
        addToast(`Fout bij deployment: ${res.message || 'Onbekende fout'}`, 'error');
      }
    } catch (e) {
      addToast(`Fout bij deployment: ${e.message}`, 'error');
    }
  };

  return (
    <div className={`bg-athena-panel border border-athena-border rounded-sm transition-all flex flex-col min-h-[160px] group relative ${isRunning ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-amber-500'}`}>
      
      {/* Header Info */}
      <div className="p-3 pb-2 flex justify-between items-start">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white text-[13px] tracking-tight group-hover:text-athena-accent transition-colors">{site.name}</h3>
            {isHydrating && <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping" title="Hydrateren..."></span>}
          </div>
          <p className="text-[10px] text-slate-500 font-medium uppercase flex items-center gap-2">
             <span>{status === 'live' ? 'Live on Pages' : 'Local Project'}</span>
             {site.deployData?.liveUrl && (
               <a href={site.deployData.liveUrl} target="_blank" rel="noopener noreferrer" className="text-athena-accent hover:text-white transition-colors" title="Open Live Site">
                 <span className="text-[10px]">↗️</span>
               </a>
             )}
             <span className="font-mono bg-black/20 px-1 rounded text-slate-400">:{activeServer?.port || site.port || 5000}</span>
          </p>
        </div>
        <div className="flex flex-col gap-1 items-end">
          <Badge type={isRunning ? 'live' : 'local'} label={isRunning ? 'ACTIVE' : 'OFFLINE'} />
          <Badge type={isInstalled ? 'info' : 'local'} label={isInstalled ? '💧 HYDRATED' : '🌵 DORMANT'} />
        </div>
      </div>

      {/* Grid of Actions (Klassieke compacte stijl) */}
      <div className="px-3 pb-3 grid grid-cols-4 gap-1.5 mt-auto">
        <ActionButton 
          icon={isRunning ? "↗️" : (isHydrating ? "⏳" : "▶️")} 
          label={isRunning ? "OPEN" : (isHydrating ? "WAIT" : "DEV")} 
          onClick={isRunning ? () => window.open(activeServer.url, '_blank') : handleStartDev}
          active={isRunning || isHydrating}
          disabled={isHydrating}
        />
        <ActionButton 
          icon="⚓" 
          label="DOCK" 
          onClick={() => ApiService.startDock().then(() => window.open(`http://localhost:5002?site=${site.name}`, '_blank'))}
        />
        <ActionButton 
          icon={isInstalled ? "🌵" : "💧"} 
          label={isInstalled ? "DRY" : "WET"} 
          onClick={isInstalled ? handleDehydrate : handleHydrate}
          disabled={isRunning || isHydrating}
          danger={isInstalled}
        />
        <ActionButton 
          icon="🛑" 
          label="STOP" 
          onClick={handleStopDev}
          disabled={!isRunning}
          danger={true}
        />

        <ActionButton 
          icon="📊" 
          label="SEO" 
          onClick={() => onSEO(site.name)}
        />
        <ActionButton 
          icon="📝" 
          label="SHEET" 
          onClick={() => onSheet(site)}
        />
        <ActionButton 
          icon="🖼️" 
          label="MEDIA" 
          onClick={() => ApiService.startMediaServer(site.name).then(() => window.open(`http://localhost:5004`, '_blank'))}
        />
        <ActionButton 
          icon="🚀" 
 
          label="DEPLOY" 
          highlight={true}
          onClick={handleDeploy}
        />
      </div>
    </div>
  );
}

function Badge({ type, label }) {
  const styles = {
    live: 'text-emerald-500 border-emerald-500/30 bg-emerald-500/5',
    local: 'text-amber-500 border-amber-500/30 bg-amber-500/5',
    info: 'text-blue-400 border-blue-500/30 bg-blue-500/5',
  };
  return (
    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-sm border uppercase tracking-tighter ${styles[type]}`}>
      {label}
    </span>
  );
}

function ActionButton({ icon, label, onClick, active, disabled, danger, highlight }) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center justify-center gap-1 p-1.5 rounded-sm border text-[8px] font-black uppercase tracking-tighter transition-all
        ${disabled ? 'opacity-20 cursor-not-allowed bg-black/20 border-slate-800' : 
          active ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-900/20' : 
          highlight ? 'bg-athena-accent text-white border-blue-400' :
          danger ? 'text-rose-500 border-rose-500/20 bg-rose-500/5 hover:bg-rose-500 hover:text-white' :
          'bg-[#21262d] border-athena-border text-slate-400 hover:bg-[#30363d] hover:border-slate-600 hover:text-white'}`}
    >
      <span className="text-xs">{icon}</span>
      <span className="truncate w-full text-center">{label}</span>
    </button>
  );
}
