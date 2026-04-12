import { useState, useEffect } from 'react';
import { useToast } from '../services/ToastContext';

export default function BlueprintModal({ blueprint, isOpen, onClose }) {
  const { addToast } = useToast();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [provisioning, setProvisioning] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [status, setStatus] = useState(null); // 'ready', 'not_provisioned'
  useEffect(() => {
    if (isOpen && blueprint) {
      loadDetails();
      checkPreviewStatus();
    } else {
      setDetails(null);
      setStatus(null);
    }
  }, [isOpen, blueprint]);

  const checkPreviewStatus = async () => {
    setCheckingStatus(true);
    try {
      const res = await fetch(`/api/sitetype/${blueprint.name}/preview`, { method: 'POST' });
      const data = await res.json();
      if (data.success && data.status === 'not_provisioned') {
        setStatus('not_provisioned');
      } else if (data.success) {
        setStatus('ready');
      }
    } catch (e) {
      console.error("Status check failed:", e);
    }
    setCheckingStatus(false);
  };

  const loadDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/blueprints/${blueprint.name}`);
      const data = await res.json();
      setDetails(data);
    } catch (e) {
      console.error("Fout bij laden blueprint details:", e);
      addToast("Kon blueprint details niet laden.", "error");
    }
    setLoading(false);
  };

  const handleLivePreview = async () => {
    setPreviewing(true);
    addToast(`🚀 Preview voor ${blueprint.name} wordt gestart...`, 'info');
    try {
      const res = await fetch(`/api/sitetype/${blueprint.name}/preview`, { method: 'POST' });
      const data = await res.json();
      
      if (data.success) {
        if (data.status === 'not_provisioned') {
          setStatus('not_provisioned');
          addToast("ℹ️ Deze preview moet nog gegenereerd worden.", "info");
        } else {
          addToast("✅ Preview server gestart. Preview wordt geopend...", "success");
          window.open(data.url, '_blank');
        }
      } else {
        addToast("❌ Preview mislukt: " + data.error, "error");
      }
    } catch (e) {
      addToast("❌ Netwerkfout bij starten preview: " + e.message, "error");
    }
    setPreviewing(false);
  };

  const handleProvision = async () => {
    setProvisioning(true);
    addToast(`🛠️ Preview voor ${blueprint.name} wordt nu gegenereerd... Dit kan even duren.`, 'info');
    try {
      const res = await fetch(`/api/sitetype/${blueprint.name}/provision`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        addToast("✅ Preview succesvol gegenereerd!", "success");
        setStatus('ready');
        // Automatisch de preview starten na provisioning
        handleLivePreview();
      } else {
        addToast("❌ Generatie mislukt: " + data.error, "error");
      }
    } catch (e) {
      addToast("❌ Netwerkfout bij genereren: " + e.message, "error");
    }
    setProvisioning(false);
  };

  if (!isOpen || !blueprint) return null;

  const displayBlueprint = details || blueprint;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0d1117] border border-athena-border rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-athena-border flex justify-between items-center bg-black/20">
          <div className="flex items-center gap-3">
             <span className="text-2xl">{loading ? '⏳' : '📋'}</span>
             <div>
                <h2 className="text-lg font-bold text-white uppercase tracking-tight">{blueprint.name.replace(/-/g, ' ')}</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Blueprint Specification Sheet</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Summary Section */}
          <section>
             <h3 className="text-[11px] font-black text-athena-accent uppercase tracking-widest mb-3 border-b border-athena-accent/20 pb-1">Introductie</h3>
             <p className="text-slate-300 text-sm leading-relaxed italic">
                "{displayBlueprint.description || 'Bezig met laden van blueprint metadata...'}"
             </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Data Architecture */}
            <section>
               <h3 className="text-[11px] font-black text-emerald-500 uppercase tracking-widest mb-3 border-b border-emerald-500/20 pb-1">Gegevensarchitectuur</h3>
               <div className="space-y-4">
                  <div className="bg-black/20 p-4 border border-athena-border/50 rounded flex justify-between items-center">
                     <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase">Tabellen</p>
                        <p className="text-xl font-bold text-white">{displayBlueprint.data_structure?.length || blueprint.tableCount || 0}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase">Layouts</p>
                        <p className="text-xl font-bold text-white">{blueprint.layoutCount || 0}</p>
                     </div>
                  </div>
                  
                  {displayBlueprint.data_structure && (
                    <div className="text-[11px] text-slate-400 bg-[#161b22] p-3 rounded border border-athena-border/30">
                       <p className="mb-2 font-bold text-slate-300">Schema Architectuur:</p>
                       <div className="space-y-2">
                          {displayBlueprint.data_structure.map((table, tIdx) => (
                            <div key={tIdx} className="border-l-2 border-emerald-500/30 pl-2">
                               <p className="text-white font-bold">{table.table_name}.json</p>
                               <p className="text-[9px] text-slate-500">{table.columns.map(c => c.name).join(', ')}</p>
                            </div>
                          ))}
                       </div>
                    </div>
                  )}
               </div>
            </section>

            {/* Visual DNA & Page Structure */}
            <section>
               <h3 className="text-[11px] font-black text-amber-500 uppercase tracking-widest mb-3 border-b border-amber-500/20 pb-1">Systeem Config</h3>
               <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#161b22] p-3 rounded border border-athena-border/30">
                       <p className="text-[9px] font-black text-slate-500 uppercase mb-2">Track System</p>
                       <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${blueprint.track === 'docked' ? 'bg-emerald-500' : 'bg-athena-accent'}`}></span>
                          <span className="text-xs text-white font-bold uppercase">{blueprint.track}</span>
                       </div>
                    </div>
                    <div className="bg-[#161b22] p-3 rounded border border-athena-border/30">
                       <p className="text-[9px] font-black text-slate-500 uppercase mb-2">Framework</p>
                       <span className="text-xs text-white font-bold uppercase">Athena V10 (Vite)</span>
                    </div>
                  </div>

                  {displayBlueprint.page_structure && (
                    <div className="bg-[#161b22] p-3 rounded border border-athena-border/30">
                       <p className="text-[9px] font-black text-slate-500 uppercase mb-2">Pagina Structuur</p>
                       <div className="flex flex-wrap gap-1">
                          {Object.keys(displayBlueprint.page_structure).map(page => (
                            <span key={page} className="bg-black/40 text-slate-400 px-1.5 py-0.5 rounded text-[9px] border border-white/5">{page}</span>
                          ))}
                       </div>
                    </div>
                  )}
               </div>
            </section>

          </div>

          {/* Action Footer Context */}
          <section className="bg-athena-accent/5 border border-athena-accent/20 p-4 rounded-sm italic text-xs text-slate-400 text-center">
             Dit sitetype wordt gebruikt als dynamische template. De layouts en data-extractie regels zijn vooraf geconfigureerd voor optimale resultaten in de re-integratie workflow.
          </section>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-athena-border bg-black/20 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2 text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-colors"
          >
            SLUITEN
          </button>
          {checkingStatus ? (
            <button disabled className="px-6 py-2 bg-slate-800 text-slate-500 text-[11px] font-black uppercase tracking-widest rounded border border-white/5 flex items-center gap-2">
              <span className="animate-spin text-sm">↻</span> STATUS CHECK...
            </button>
          ) : status === 'not_provisioned' ? (
            <button 
              disabled={provisioning}
              onClick={handleProvision}
              className={`px-6 py-2 ${provisioning ? 'bg-slate-700' : 'bg-emerald-600'} text-white text-[11px] font-black uppercase tracking-widest rounded shadow-lg shadow-emerald-900/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2`}
            >
              {provisioning ? '⏳ GENEREREN...' : 'GENEREREN SHOWCASE'}
            </button>
          ) : (
            <button 
              disabled={previewing}
              onClick={handleLivePreview}
              className={`px-6 py-2 ${previewing ? 'bg-slate-700' : 'bg-emerald-600'} text-white text-[11px] font-black uppercase tracking-widest rounded shadow-lg shadow-emerald-900/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2`}
            >
              {previewing ? '⏳ STARTING...' : 'START SHOWCASE PREVIEW'}
            </button>
          )}
          <button 
            onClick={() => addToast("Coming soon: Blueprint Architect Editor", "info")}
            className="px-6 py-2 bg-athena-accent text-white text-[11px] font-black uppercase tracking-widest rounded shadow-lg shadow-blue-900/20 hover:scale-105 active:scale-95 transition-all"
          >
            OPEN IN ARCHITECT
          </button>
        </div>

      </div>
    </div>
  );
}
