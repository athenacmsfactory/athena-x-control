import { useState, useEffect } from 'react';
import { ApiService } from '../services/ApiService';
import { useToast } from '../services/ToastContext';
import SitetypePreviewCard from '../components/SitetypePreviewCard';

export default function SitetypeBuilderView() {
  const { addToast } = useToast();
  const [siteTypes, setSiteTypes] = useState([]);
  const [activeServers, setActiveServers] = useState([]);
  const [legos, setLegos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(null);
  const [settingsLego, setSettingsLego] = useState(null);
  const [settingsJson, setSettingsJson] = useState('{}');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [typesRes, serversRes, legosRes] = await Promise.all([
        ApiService.getSiteTypeExisting(),
        ApiService.getActiveServers(),
        fetch('/api/legos').then(res => res.json())
      ]);
      setSiteTypes(typesRes.sitetypes || []);
      setActiveServers(serversRes.servers || []);
      if (legosRes.success) setLegos(legosRes.legos);
    } catch (e) {
      console.error("Fetch failed", e);
      // We check if the server is actually reachable before screaming
      if (navigator.onLine) {
         // Silently fail for polling in builder if background, only toast on manual actions
         // addToast("Failed to sync builder data.", "error");
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const [blueprintLegos, setBlueprintLegos] = useState([]);

  useEffect(() => {
    if (siteTypes.length > 0 && !selectedType) {
       setSelectedType(siteTypes[0]);
    }
  }, [siteTypes]);

  useEffect(() => {
    if (selectedType) {
      const loadBlueprint = async () => {
        try {
          const res = await fetch(`/api/blueprints/${selectedType.name}`);
          const data = await res.json();
          if (data && data.sections) {
            setBlueprintLegos(data.sections.map((s, idx) => ({
               id: s.id || `init-${idx}`,
               name: s.component || s.id, // Fallback to id for older blueprints
               category: s.category || 'Common',
               props: s.props || s.fields || {} // Fallback to fields for older blueprints
            })));
          } else {
            setBlueprintLegos([]);
          }
        } catch (e) {
          console.error("Failed to load blueprint", e);
          setBlueprintLegos([]);
        }
      };
      loadBlueprint();
    }
  }, [selectedType]);

  const onDragStart = (e, lego) => {
    e.dataTransfer.setData('lego', JSON.stringify(lego));
  };

  const onDrop = (e) => {
    e.preventDefault();
    const legoData = e.dataTransfer.getData('lego');
    if (!legoData) return;
    const lego = JSON.parse(legoData);
    setBlueprintLegos([...blueprintLegos, { ...lego, id: Math.random().toString(36).substr(2, 9) }]);
    addToast(`${lego.name} added to blueprint.`, 'success');
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const removeLego = (id) => {
    setBlueprintLegos(blueprintLegos.filter(l => l.id !== id));
  };

  const activePreviews = activeServers.filter(s => s.siteName && s.siteName.startsWith('showcase-'));

  const handleSaveBlueprint = async () => {
    if (!selectedType) return;
    try {
      addToast(`Opslaan van blueprint ${selectedType.name}...`, 'info');
      
      let existingData = {};
      try {
        const fetchRes = await fetch(`/api/blueprints/${selectedType.name}`);
        if(fetchRes.ok){
           existingData = await fetchRes.json();
        }
      } catch(e) {}

      const blueprintData = {
        ...existingData,
        blueprint_name: selectedType.name,
        sections: blueprintLegos.map(l => ({
          component: l.name,
          category: l.category,
          props: l.props || {},
          id: l.id || l.name,
          title: l.title || l.name,
          fields: l.props || {}
        }))
      };

      const res = await fetch(`/api/blueprints/${selectedType.name}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blueprintData)
      });
      
      const data = await res.json();
      if (data.success) {
        addToast("Blueprint succesvol opgeslagen.", "success");
      } else {
        addToast("Fout bij opslaan: " + data.error, "error");
      }
    } catch (e) {
      addToast("Netwerkfout bij opslaan.", "error");
    }
  };

  const handleStartPreview = async () => {
    if (!selectedType) return;
    try {
      addToast(`Starten van showcase server voor ${selectedType.name}...`, 'info');
      const res = await ApiService.startSitetypePreview(selectedType.name);
      
      if (res.status === 'not_provisioned') {
        addToast("Showcase site niet gevonden. Bezig met genereren...", "info");
        const provRes = await ApiService.provisionSitetypePreview(selectedType.name);
        if (provRes.success) {
           addToast("Showcase site gegenereerd. Starten...", "success");
           await ApiService.startSitetypePreview(selectedType.name);
        } else {
           addToast("Genereren mislukt: " + provRes.error, "error");
        }
      }
      
      // Auto-refresh soon
      setTimeout(fetchData, 2000);
    } catch (e) {
      addToast("Fout bij starten preview: " + e.message, "error");
    }
  };

  const handleSyncPreview = async () => {
    if (!selectedType) return;
    try {
      addToast(`Synchroniseren van preview voor ${selectedType.name}...`, 'info');
      await handleSaveBlueprint();
      const res = await ApiService.syncSitetypePreview(selectedType.name);
      if (res.success) {
        addToast("Preview succesvol bijgewerkt!", "success");
        // We hoeven startPreview niet opnieuw te roepen als Vite HMR doet, 
        // maar we checken of de server draait.
        await handleStartPreview();
      } else {
        addToast("Fout bij synchroniseren: " + res.error, "error");
      }
    } catch (e) {
      addToast("Fout bij sync: " + e.message, "error");
    }
  };

  const handleCreateNew = async () => {
    const name = prompt("Geef een unieke naam voor het nieuwe Sitetype (bv. 'real-estate-v10'):");
    if (!name) return;
    
    const description = prompt("Korte beschrijving van dit sitetype:", "Een modern bedrijfsprofiel.");
    
    try {
      addToast(`Bezig met initialiseren van ${name}...`, 'info');
      
      const res = await fetch('/api/sitetype/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.toLowerCase().replace(/\s+/g, '-'),
          description,
          dataStructure: [
            {
              table_name: "inhoud",
              columns: [
                { name: "titel", description: "Hoofdtekst van de sectie" },
                { name: "omschrijving", description: "Ondersteunende tekst" }
              ]
            }
          ],
          designSystem: {
            colors: { primary: "#3b82f6", secondary: "#1e293b", accent: "#10b981", background: "#000000", surface: "#111111" },
            radius: "0.25rem",
            font_sans: "Inter",
            font_serif: "Inter"
          }
        })
      });
      
      const data = await res.json();
      if (data.success) {
        addToast("Sitetype succesvol aangemaakt!", "success");
        await fetchData(); // Refresh list
      } else {
        addToast("Fout bij aanmaken: " + data.error, "error");
      }
    } catch (e) {
      addToast("Netwerkfout bij aanmaken.", "error");
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4 overflow-hidden">
      {/* Header Panel - Compact */}
      <div className="flex justify-between items-center bg-athena-panel p-3 border border-athena-border rounded-sm shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-athena-accent/10 rounded flex items-center justify-center border border-athena-accent/30 text-athena-accent text-lg">
             ⚒️
          </div>
          <div>
            <h3 className="font-bold text-white text-xs uppercase tracking-widest">Sitetype Builder</h3>
            <p className="text-slate-500 text-[8px] font-black uppercase tracking-tighter">
              Drag bricks to the canvas to assemble blueprints.
            </p>
          </div>
          <select 
            className="ml-4 bg-black/40 border border-athena-border text-white text-[10px] rounded px-2 py-1 outline-none focus:border-athena-accent"
            value={selectedType?.id || ''}
            onChange={(e) => {
              const type = siteTypes.find(t => t.id === e.target.value);
              setSelectedType(type);
            }}
          >
            {siteTypes.map((t, idx) => <option key={t.id || `type-${idx}`} value={t.id}>{t.name}</option>)}
          </select>
          <button 
            onClick={handleCreateNew}
            className="ml-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-black uppercase rounded px-3 py-1.5 transition-colors shadow-lg shadow-emerald-500/10"
          >
            + NEW
          </button>
        </div>
        
        <div className="flex items-center gap-6 pr-2">
           <div className="text-right">
              <p className="text-[7px] font-black text-slate-600 uppercase">Blueprints</p>
              <p className="text-xs font-black text-white">{siteTypes.length}</p>
           </div>
           <div className="text-right border-l border-athena-border/20 pl-6">
              <p className="text-[7px] font-black text-slate-600 uppercase">Palette</p>
              <p className="text-xs font-black text-athena-accent">{legos.length}</p>
           </div>
           <div className="text-right border-l border-athena-border/20 pl-6 text-emerald-500">
              <p className="text-[7px] font-black text-slate-600 uppercase">Active</p>
              <p className="text-xs font-black">{activePreviews.length}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 flex-1">
        {/* Left: Palette & Registry */}
        <div className="col-span-12 md:col-span-3 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar max-h-[calc(100vh-250px)]">
          
          {/* Section: Lego Palette */}
          <div className="space-y-3">
            <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
               <span className="flex items-center gap-2">
                 <span className="w-1.5 h-1.5 bg-[#bc6c25] rounded-full"></span>
                 Lego Palette
               </span>
               <span className="text-[8px] opacity-60">DRAG BRICKS</span>
            </h4>
            <div className="grid grid-cols-1 gap-1.5">
              {legos.map((lego, idx) => (
                <div 
                  key={idx} 
                  draggable
                  onDragStart={(e) => onDragStart(e, lego)}
                  className="bg-athena-panel border border-athena-border p-2 rounded-sm cursor-grab active:cursor-grabbing hover:border-athena-accent transition-all group flex flex-col"
                >
                   <div className="flex justify-between items-start">
                     <p className="text-[7px] font-black text-slate-600 uppercase">{lego.category}</p>
                     <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">☰</span>
                   </div>
                   <h5 className="text-[10px] font-bold text-slate-300 leading-tight">{lego.name}</h5>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle: Canvas (Drag & Drop Zone) */}
        <div className="col-span-12 md:col-span-3 flex flex-col gap-3 min-h-[400px]">
           <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
               <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
               Blueprint Canvas: {selectedType?.name || '---'}
            </h4>
           
           <div 
             onDrop={onDrop}
             onDragOver={onDragOver}
             className="flex-1 bg-black/40 border-2 border-dashed border-athena-border/50 rounded-sm p-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar relative"
           >
              {blueprintLegos.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-20 pointer-events-none p-12">
                   <div className="text-4xl mb-4">🏗️</div>
                   <p className="text-xs font-black uppercase tracking-[0.2em] text-white">Empty Blueprint</p>
                   <p className="text-[10px] text-slate-500 mt-2">Drag lego bricks from the left palette to start building your site structure.</p>
                </div>
              )}

              {blueprintLegos.map((lego, idx) => (
                <div key={lego.id} className="bg-athena-panel border border-athena-border p-3 rounded-sm flex items-center justify-between group shadow-lg animate-in fade-in slide-in-from-left-2 duration-300">
                   <div className="flex items-center gap-4">
                      <div className="w-6 h-6 bg-black/40 text-[10px] font-black flex items-center justify-center text-slate-600 rounded">
                         {idx + 1}
                      </div>
                      <div>
                        <p className="text-[7px] font-black text-athena-accent uppercase tracking-widest">{lego.category}</p>
                        <h5 className="text-[11px] font-bold text-white">{lego.name}</h5>
                      </div>
                   </div>
                   <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => {
                          setSettingsLego(lego);
                          setSettingsJson(JSON.stringify(lego.props || {}, null, 2));
                        }}
                        className="p-1 px-2 bg-black/40 text-[9px] text-slate-500 rounded hover:text-white" 
                        title="Configure"
                      >
                        SETTINGS
                      </button>
                      <button onClick={() => removeLego(lego.id)} className="p-1 px-2 bg-rose-500/10 text-rose-500 text-[9px] rounded hover:bg-rose-500 hover:text-white" title="Remove">REMOVE</button>
                   </div>
                </div>
              ))}
            </div>

            <div className="bg-athena-panel border border-athena-border p-1.5 px-2 flex justify-between items-center rounded-sm">
               <div className="flex gap-4 items-center">
                 <div className="flex flex-col">
                    <p className="text-[7px] font-black text-slate-600 uppercase tracking-tighter">Size</p>
                    <p className="text-[10px] font-bold text-white leading-none">1.2kb</p>
                 </div>
                 <div className="flex flex-col border-l border-athena-border/20 pl-3">
                    <p className="text-[7px] font-black text-slate-600 uppercase tracking-tighter">Sect</p>
                    <p className="text-[10px] font-bold text-athena-accent leading-none">{blueprintLegos.length}</p>
                 </div>
               </div>
               
               <div className="flex gap-1">
                 <button 
                   onClick={() => setBlueprintLegos([])}
                   className="px-2 py-1.5 bg-[#21262d] border border-athena-border text-slate-500 text-[8px] font-black uppercase rounded hover:text-white transition-colors"
                 >
                    RESET
                 </button>
                 <button 
                   onClick={handleSaveBlueprint}
                   className="px-3 py-1.5 bg-athena-accent text-white text-[8px] font-black uppercase rounded hover:brightness-110 shadow-lg shadow-blue-500/20 transition-all font-mono"
                 >
                    SAVE
                 </button>
               </div>
            </div>
         </div>

        {/* Right: Registry/Preview */}
        <div className="col-span-12 md:col-span-6 flex flex-col gap-4 overflow-hidden min-h-[500px]">
           <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
               <span className="w-1.5 h-1.5 bg-athena-accent rounded-full"></span>
               Preview Site
            </h4>
           <div className="flex-1 bg-athena-panel border border-athena-border rounded-sm flex flex-col overflow-hidden">
              <div className="p-3 border-b border-athena-border bg-black/10 flex justify-between items-center">
                <h4 className="text-[9px] font-black text-white uppercase tracking-widest">Live Integration</h4>
                {activePreviews.length > 0 && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>}
              </div>
              <div className="flex-1 p-3">
                 {activePreviews.length > 0 ? (
                   <div className="h-full flex flex-col space-y-3">
                      <div className="flex-1 bg-black rounded border border-athena-border overflow-hidden relative group">
                        <iframe src={activePreviews[0].url} className="w-full h-full scale-[0.6] origin-top-left" style={{ width: '166.666%', height: '166.666%' }} title="Mini Preview"></iframe>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[7px] font-black text-slate-600 uppercase">Synchronizing with</p>
                         <p className="text-[10px] font-bold text-emerald-500 truncate">{activePreviews[0].siteName}</p>
                      </div>
                      <button 
                        onClick={handleSyncPreview}
                        className="w-full py-2 bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 text-[8px] font-black uppercase rounded hover:bg-emerald-600 hover:text-white transition-all"
                      >
                        DEPLOY TO LIVE PREVIEW
                      </button>
                   </div>
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center space-y-4">
                      <div className="text-3xl opacity-20">🔭</div>
                      <p className="text-[8px] font-black uppercase opacity-20 text-center">No active previews for {selectedType?.name || 'this blueprint'}</p>
                      <button 
                        onClick={handleStartPreview}
                        className="px-4 py-2 bg-athena-accent text-white text-[9px] font-black uppercase rounded shadow-lg shadow-blue-500/20 hover:brightness-110 transition-all"
                      >
                        START PREVIEW SERVER
                      </button>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>

      {/* Settings Modal */}
      {settingsLego && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-athena-dark border border-athena-border rounded-sm w-[400px] shadow-2xl flex flex-col">
             <div className="p-3 border-b border-athena-border bg-athena-panel flex justify-between items-center">
                <h3 className="text-xs font-bold text-white tracking-widest uppercase">
                  Configure Settings: <span className="text-athena-accent">{settingsLego.name}</span>
                </h3>
                <button onClick={() => setSettingsLego(null)} className="text-slate-500 hover:text-white text-sm font-black">✕</button>
             </div>
             <div className="p-4 flex-1">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex justify-between">
                  Properties (JSON Options)
                </label>
                <textarea
                   className="w-full h-48 bg-black/50 border border-athena-border rounded-sm text-[11px] font-mono text-emerald-400 p-3 focus:outline-none focus:border-athena-accent custom-scrollbar leading-relaxed"
                   value={settingsJson}
                   onChange={(e) => setSettingsJson(e.target.value)}
                   spellCheck="false"
                />
             </div>
             <div className="p-3 border-t border-athena-border bg-athena-panel flex justify-end gap-2">
                <button onClick={() => setSettingsLego(null)} className="px-4 py-1.5 text-[10px] font-black text-slate-400 uppercase hover:text-white">Annuleer</button>
                <button 
                   onClick={() => {
                     try {
                       const parsed = JSON.parse(settingsJson);
                       setBlueprintLegos(blueprintLegos.map(l => l.id === settingsLego.id ? { ...l, props: parsed } : l));
                       setSettingsLego(null);
                       addToast('Settings succesvol gepast.', 'success');
                     } catch(e) {
                       addToast("Ongeldige JSON syntax.", "error");
                     }
                   }} 
                   className="px-4 py-1.5 text-[10px] font-black text-white bg-emerald-600 hover:bg-emerald-500 rounded shadow-lg shadow-emerald-500/20 uppercase transition-all"
                >
                   SAVE PROPS
                </button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
