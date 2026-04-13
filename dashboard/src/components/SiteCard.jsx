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

  return (
    <div className={`bg-athena-panel border border-athena-border rounded-sm transition-all flex flex-col min-h-[150px] group relative ${isRunning ? 'border-l-4 border-l-emerald-500 shadow-lg shadow-emerald-900/10' : 'border-l-4 border-l-amber-500'}`}>
      
      {/* Header Info */}
      <div className="p-3 pb-2 flex justify-between items-start">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white text-[13px] tracking-tight group-hover:text-athena-accent transition-colors">{site.name}</h3>
            {isHydrating && <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>}
          </div>
          <p className="text-[10px] text-slate-500 font-black uppercase flex items-center gap-2 tracking-widest">
             <span>{status === 'live' ? 'LIVE SITE' : 'LOCAL DEV'}</span>
             {site.deployData?.liveUrl && (
               <a href={site.deployData.liveUrl} target="_blank" rel="noopener noreferrer" className="text-athena-accent hover:text-white transition-colors">
                 LINK
               </a>
             )}
             <span className="font-mono bg-black/20 px-1 rounded text-slate-400">:{activeServer?.port || site.port || 5000}</span>
          </p>
        </div>
        <div className="flex flex-col gap-1 items-end">
          <Badge type={isRunning ? 'live' : 'local'} label={isRunning ? 'ACTIVE' : 'OFFLINE'} />
          <Badge type={isInstalled ? 'info' : 'local'} label={isInstalled ? 'WET' : 'DRY'} />
        </div>
      </div>

      {/* Grid of Actions - Dense & Icon-free */}
      <div className="p-2 pt-0 grid grid-cols-2 gap-1 mt-auto">
        <button 
          onClick={isRunning ? () => window.open(activeServer.url, '_blank') : handleStartDev}
          disabled={isHydrating}
          className={`h-7 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all border ${isRunning ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-[#21262d] border-athena-border text-slate-500 hover:text-white'}`}
        >
          {isRunning ? "VIEW" : (isHydrating ? "WAIT" : "START")}
        </button>

        <button 
          onClick={() => ApiService.startDock().then(() => window.open(`http://localhost:5002?site=${site.name}`, '_blank'))}
          className="h-7 bg-[#21262d] border border-athena-border text-slate-500 hover:text-white text-[9px] font-black uppercase tracking-widest rounded-sm"
        >
          DOCK
        </button>

        <button 
          onClick={isInstalled ? handleDehydrate : handleHydrate}
          disabled={isRunning || isHydrating}
          className={`h-7 bg-[#21262d] border text-[9px] font-black uppercase tracking-widest rounded-sm transition-colors ${isInstalled ? 'text-blue-400 border-blue-900/30' : 'text-slate-500 border-athena-border hover:text-white'}`}
        >
          {isInstalled ? "DRY" : "WET"}
        </button>

        <button 
          onClick={() => onSheet(site)}
          className="h-7 bg-[#21262d] border border-athena-border text-slate-500 hover:text-white text-[9px] font-black uppercase tracking-widest rounded-sm"
        >
          SHEET
        </button>

        <button 
          onClick={() => ApiService.startMediaServer(site.name).then(() => window.open(`http://localhost:5004`, '_blank'))}
          className="h-7 bg-[#21262d] border border-athena-border text-slate-500 hover:text-white text-[9px] font-black uppercase tracking-widest rounded-sm"
        >
          MEDIA
        </button>

        <button 
          onClick={async () => {
             const res = await ApiService.parkSite(site.name);
             if (res.success) { onRefresh(); }
          }}
          className="h-7 bg-[#21262d] border border-athena-border text-slate-500 hover:text-white text-[9px] font-black uppercase tracking-widest rounded-sm"
        >
          VAULT
        </button>

        <button 
          onClick={handleStopDev}
          disabled={!isRunning}
          className={`col-span-2 h-7 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[9px] font-black uppercase tracking-widest rounded-sm hover:bg-rose-500 hover:text-white transition-all ${!isRunning ? 'opacity-0 pointer-events-none' : ''}`}
        >
          STOP SERVER
        </button>
      </div>
    </div>
  );
}

function Badge({ type, label }) {
  const styles = {
    live: 'text-emerald-500 border-emerald-500/30',
    local: 'text-amber-500 border-amber-500/30',
    info: 'text-blue-400 border-blue-500/30',
  };
  return (
    <span className={`text-[8.5px] font-black px-1.5 rounded-sm border uppercase tracking-widest ${styles[type]}`}>
      {label}
    </span>
  );
}
