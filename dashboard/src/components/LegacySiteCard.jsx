import { useState } from 'react';
import { ApiService } from '../services/ApiService';
import { useToast } from '../services/ToastContext';

export default function LegacySiteCard({ site, activeServer, onRefresh }) {
  const { addToast } = useToast();
  const isRunning = !!activeServer;
  const isStatic = site.isStatic;

  const handleStart = async () => {
    try {
      addToast(`Starten van server voor ${site.name}...`, 'info');
      await ApiService.startLegacySite(site.name);
      setTimeout(onRefresh, 1000);
    } catch (e) {
      addToast("Fout bij starten: " + e.message, 'error');
    }
  };

  const handleStop = async () => {
    if (!activeServer) return;
    try {
      await ApiService.stopSiteServer(activeServer.port);
      setTimeout(onRefresh, 1000);
    } catch (e) {
      addToast("Fout bij stoppen: " + e.message, 'error');
    }
  };

  const handleAthenify = async () => {
    if (confirm(`Wil je ${site.name} upgraden naar Athena v10+?`)) {
      addToast("Upgrade proces gestart...", "info");
      // To-be implemented: Migration logic
    }
  };

  return (
    <div className={`bg-athena-panel border border-athena-border rounded-sm transition-all flex flex-col min-h-[140px] group relative ${isRunning ? 'border-l-4 border-l-emerald-500 shadow-lg shadow-emerald-900/10' : 'border-l-4 border-l-slate-700'}`}>
      
      {/* Identity */}
      <div className="p-3 pb-2 flex justify-between items-start">
        <div className="space-y-0.5">
           <h3 className="font-bold text-white text-[13px] tracking-tight truncate w-32">{site.name}</h3>
           <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
             <span className={isStatic ? 'text-blue-400/80' : 'text-teal-400/80'}>{isStatic ? 'STATIC' : 'VITE'}</span>
             <span className="font-mono bg-black/30 px-1 rounded text-slate-400">:{activeServer?.port || site.port || '---'}</span>
          </div>
        </div>
        <span className={`text-[8.5px] font-black px-1.5 rounded-sm border uppercase tracking-widest ${isRunning ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 'text-slate-600 border-athena-border'}`}>
           {isRunning ? 'UP' : 'DOWN'}
        </span>
      </div>

      {/* Actions */}
      <div className="p-2 pt-0 grid grid-cols-2 gap-1 mt-auto">
        <button 
          onClick={isRunning ? () => window.open(activeServer.url, '_blank') : (isStatic ? () => window.open(site.localUrl, '_blank') : handleStart)}
          className={`h-7 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all border ${isRunning ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-[#21262d] border-athena-border text-slate-500 hover:text-white'}`}
        >
          {isRunning ? 'VIEW' : (isStatic ? 'OPEN' : 'START')}
        </button>

        <button 
          onClick={async () => {
             const res = await ApiService.unparkSite(site.name);
             if (res.success) onRefresh();
          }}
          className="h-7 bg-[#21262d] border border-athena-border text-slate-500 hover:text-white text-[9px] font-black uppercase tracking-widest rounded-sm"
        >
          ACTIVATE
        </button>

        {!site.isAthena && (
          <button 
            onClick={handleAthenify}
            className="h-7 bg-[#21262d] border border-athena-border text-slate-500 hover:text-athena-accent text-[9px] font-black uppercase tracking-widest rounded-sm"
          >
            V10+ UP
          </button>
        )}

        <button 
          onClick={async () => {
            if (confirm(`Definitief verwijderen?`)) {
              const res = await ApiService.deleteFromVault(site.name);
              if (res.success) onRefresh();
            }
          }}
          className="h-7 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[9px] font-black uppercase rounded-sm hover:bg-rose-500 hover:text-white"
        >
          DELETE
        </button>

        <button 
          onClick={handleStop}
          disabled={!isRunning}
          className={`col-span-2 h-7 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[9px] font-black uppercase rounded-sm hover:bg-rose-500 hover:text-white transition-all ${!isRunning ? 'opacity-0 pointer-events-none' : ''}`}
        >
          STOP SERVER
        </button>
      </div>
    </div>
  );
}
