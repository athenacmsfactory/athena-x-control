import { useState, useEffect } from 'react';
import { ApiService } from '../services/ApiService';
import { useToast } from '../services/ToastContext';
import CodeEditorModal from '../components/CodeEditorModal';
import LegoPreviewModal from '../components/LegoPreviewModal';

export default function LegoView() {
  const { addToast } = useToast();
  const [legos, setLegos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [editingLego, setEditingLego] = useState(null);
  const [previewingLego, setPreviewingLego] = useState(null);

  useEffect(() => {
    fetchLegos();
  }, []);

  const fetchLegos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/legos');
      const data = await res.json();
      if (data.success) {
        setLegos(data.legos);
      }
    } catch (e) {
      addToast("Fout bij laden legoblokken: " + e.message, "error");
    }
    setLoading(false);
  };

  const filteredLegos = filter === 'All' ? legos : legos.filter(l => l.category === filter);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">LEGO LIBRARY</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Stap 1: De Bouwstenen (Sections & Components)</p>
        </div>
        <div className="flex gap-2">
          {['All', 'Common', 'Layout', 'Shop'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded border transition-all ${
                filter === cat 
                ? 'bg-athena-accent text-white border-athena-accent shadow-lg shadow-blue-500/20' 
                : 'bg-black/20 text-slate-500 border-athena-border hover:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(idx => (
            <div key={idx} className="h-32 bg-athena-panel border border-athena-border animate-pulse rounded-sm"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredLegos.map((lego, idx) => (
            <div 
              key={idx} 
              className="bg-athena-panel border border-athena-border rounded-sm hover:-translate-y-1 transition-transform p-5 flex flex-col group relative"
            >
              
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#bc6c25] block mb-1">
                    {lego.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-100">{lego.name}</h4>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                 <button 
                   onClick={(e) => { e.stopPropagation(); setEditingLego(lego); }}
                   className="text-[9px] font-bold text-athena-accent uppercase hover:underline z-10 relative">
                   Edit Code
                 </button>
                 <button 
                   onClick={(e) => { e.stopPropagation(); setPreviewingLego(lego); }}
                   className="text-[9px] font-bold text-emerald-500 uppercase hover:underline z-10 relative">
                   Lego Preview
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-athena-accent/5 border border-athena-accent/20 p-5 rounded-sm">
        <h5 className="text-[11px] font-black text-athena-accent uppercase tracking-widest mb-2 flex items-center gap-2">
          <span className="text-sm">💡</span> Hoe dit werkt
        </h5>
        <p className="text-xs text-slate-400 leading-relaxed">
          Dit zijn de ruwe bouwstenen van de <b>Athena Factory</b>. Wanneer je een nieuw sitetype ontwerpt, kies je uit deze collectie de componenten die in de blueprint mogen voorkomen. 
        </p>
      </div>

      <CodeEditorModal 
        isOpen={!!editingLego}
        onClose={() => setEditingLego(null)}
        filePath={editingLego?.absolutePath}
        fileName={editingLego?.fileName}
      />
      
      <LegoPreviewModal 
        isOpen={!!previewingLego}
        onClose={() => setPreviewingLego(null)}
        lego={previewingLego}
      />
    </div>
  );
}
