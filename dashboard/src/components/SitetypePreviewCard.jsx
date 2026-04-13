import { useState } from 'react';
import { ApiService } from '../services/ApiService';
import { useToast } from '../services/ToastContext';

export default function SitetypePreviewCard({ type, activeServer, onRefresh }) {
  const { addToast } = useToast();
  const [isProvisioning, setIsProvisioning] = useState(false);
  const isRunning = !!activeServer;

  const handleStartPreview = async () => {
    try {
      setIsProvisioning(true);
      addToast(`Preparing preview environment for ${type.name}...`, 'info');
      
      // 1. Provision (ensure package.json, etc.)
      const provRes = await ApiService.provisionSitetypePreview(type.name);
      if (!provRes.success) throw new Error(provRes.error || "Provisioning failed");
      
      addToast(`Environment ready. Starting Vite server...`, 'info');
      
      // 2. Start Preview
      const startRes = await ApiService.startSitetypePreview(type.name);
      setIsProvisioning(false);
      
      if (startRes.success) {
        addToast(`✅ Preview for ${type.name} is online!`, 'success');
        setTimeout(onRefresh, 1000);
      } else {
        addToast(`❌ Start failed: ${startRes.error}`, 'error');
      }
    } catch (e) {
      setIsProvisioning(false);
      addToast(`❌ Error: ${e.message}`, 'error');
    }
  };

  return (
    <div className={`bg-athena-panel border border-athena-border rounded-sm transition-all flex items-center px-3 py-2 group relative border-l-[3px] ${isRunning ? 'border-l-emerald-500' : 'border-l-slate-700'}`}>
      
      {/* Basic Info - Flat */}
      <div className="flex-1 flex items-center gap-4">
        <h3 className="font-bold text-white text-[12px] tracking-tight group-hover:text-athena-accent transition-colors min-w-[120px]">
          {type.name.toUpperCase()}
        </h3>
        
        {/* Compact Stats */}
        <div className="flex gap-4 border-l border-athena-border/10 pl-4 items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-[7.5px] font-black text-slate-600 uppercase">TBL</span>
            <span className="text-[10px] font-black text-slate-400">{type.tableCount || 0}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[7.5px] font-black text-slate-600 uppercase">LYT</span>
            <span className="text-[10px] font-black text-slate-400">{type.layoutCount || 0}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[7.5px] font-black text-slate-600 uppercase">TRK</span>
            <span className="text-[10px] font-black text-athena-accent">{type.track === 'docked' ? 'FIX' : 'V10'}</span>
          </div>
        </div>
      </div>

      {/* Actions - Inline */}
      <div className="flex items-center gap-1.5">
        {isRunning && (
          <span className="text-emerald-500 text-[8px] font-black pr-2 animate-pulse whitespace-nowrap">
            ONLINE
          </span>
        )}
        
        {isRunning ? (
          <>
            <button 
              onClick={() => window.open(activeServer.url, '_blank')}
              className="px-3 py-1 bg-emerald-600/20 border border-emerald-500/30 text-emerald-500 text-[8.5px] font-black uppercase rounded hover:bg-emerald-500 hover:text-white transition-all"
            >
              VIEW
            </button>
            <button 
              onClick={async () => {
                addToast("Stopping server...", "info");
                await ApiService.stopSiteServer(activeServer.port);
                setTimeout(onRefresh, 1000);
              }}
              className="px-2 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-500 text-[8.5px] font-black rounded hover:bg-rose-500 hover:text-white transition-all"
            >
              STOP
            </button>
          </>
        ) : (
          <button 
            onClick={handleStartPreview}
            disabled={isProvisioning}
            className={`px-4 py-1 ${isProvisioning ? 'bg-slate-800 text-slate-600' : 'bg-athena-accent text-white hover:brightness-110'} text-[8.5px] font-black uppercase rounded transition-all flex items-center gap-2`}
          >
            {isProvisioning ? 'GENERATING...' : 'PREVIEW'}
          </button>
        )}
      </div>
    </div>
  );
}
