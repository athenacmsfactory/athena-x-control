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
    <div className={`bg-athena-panel border border-athena-border rounded-sm transition-all flex flex-col min-h-[160px] group relative ${isRunning ? 'border-l-4 border-l-emerald-500 shadow-lg shadow-emerald-900/10' : 'border-l-4 border-l-slate-700'}`}>
      
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="font-bold text-white text-[14px] tracking-tight group-hover:text-athena-accent transition-colors flex items-center gap-2">
              <span className="text-lg">{type.track === 'docked' ? '⚓' : '🚀'}</span>
              {type.name.toUpperCase()}
            </h3>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
              Blueprint Template
            </p>
          </div>
          {isRunning && (
            <span className="bg-emerald-500/10 text-emerald-500 text-[9px] font-black px-2 py-0.5 rounded border border-emerald-500/30 animate-pulse">
              LIVE
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="px-4 py-2 flex-1">
        <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2 italic italic opacity-70">
          {type.description || 'Standaard sitetype blueprint zonder beschrijving.'}
        </p>
      </div>

      {/* Stats row */}
      <div className="px-4 py-2 flex gap-4 border-t border-athena-border/30 bg-black/10">
        <div>
          <p className="text-[8px] font-black text-slate-600 uppercase">Tables</p>
          <p className="text-[11px] font-black text-slate-400">{type.tableCount || 0}</p>
        </div>
        <div className="border-l border-athena-border/30 pl-4">
          <p className="text-[8px] font-black text-slate-600 uppercase">Layouts</p>
          <p className="text-[11px] font-black text-slate-400">{type.layoutCount || 0}</p>
        </div>
        <div className="border-l border-athena-border/30 pl-4">
          <p className="text-[8px] font-black text-slate-600 uppercase">Track</p>
          <p className="text-[11px] font-black text-athena-accent">{type.track?.toUpperCase()}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 bg-black/20 flex gap-2">
        {isRunning ? (
          <>
            <button 
              onClick={() => window.open(activeServer.url, '_blank')}
              className="flex-1 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded hover:brightness-110 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>👁️ OPEN PREVIEW</span>
            </button>
            <button 
              onClick={async () => {
                addToast("Stopping preview server...", "info");
                await ApiService.stopSiteServer(activeServer.port);
                setTimeout(onRefresh, 1000);
              }}
              className="px-3 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-500 text-[10px] font-black rounded hover:bg-rose-500 hover:text-white transition-all"
            >
              🛑
            </button>
          </>
        ) : (
          <button 
            onClick={handleStartPreview}
            disabled={isProvisioning}
            className={`flex-1 py-2 ${isProvisioning ? 'bg-slate-800 text-slate-500' : 'bg-athena-accent text-white hover:brightness-110 shadow-blue-500/20'} text-[10px] font-black uppercase tracking-widest rounded shadow-lg transition-all flex items-center justify-center gap-2`}
          >
            {isProvisioning ? (
              <>
                <span className="w-3 h-3 border-2 border-slate-500 border-t-white rounded-full animate-spin"></span>
                <span>GENERATING...</span>
              </>
            ) : (
              <>
                <span>🚀 START SITETYPE PREVIEW</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
