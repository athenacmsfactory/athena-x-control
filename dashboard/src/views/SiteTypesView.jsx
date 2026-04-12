import { useState, useEffect } from 'react'
import { ApiService } from '../services/ApiService'
import { useToast } from '../services/ToastContext'
import BlueprintModal from '../components/BlueprintModal'

export default function SiteTypesView() {
  const { addToast } = useToast()
  const [siteTypes, setSiteTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBlueprint, setSelectedBlueprint] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    refresh()
  }, [])

  const refresh = async () => {
    setLoading(true)
    try {
      const data = await ApiService.getSiteTypeExisting();
      setSiteTypes(data.sitetypes || [])
    } catch (e) {
      console.error("SiteTypes fetch failed", e);
      addToast("Kon blueprint registry niet laden.", "error");
    }
    setLoading(false)
  }

  const handleBuild = async (type) => {
    const name = prompt(`Geef een naam voor de nieuwe ${type.name} site:`, `${type.name}-instance`);
    if (!name) return;

    try {
      addToast(`Bezig met genereren van ${name} op basis van ${type.name}...`, 'info');
      const res = await fetch('/api/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.toLowerCase().replace(/\s+/g, '-'),
          description: `Instantie van ${type.name} blueprint.`,
          siteType: type.name
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast(`✅ Site ${name} succesvol aangemaakt!`, 'success');
        // Optioneel: redirect naar projects of refresh sites
      } else {
        addToast(`❌ Fout: ${data.error || 'Onbekende fout'}`, 'error');
      }
    } catch (e) {
      addToast(`❌ Netwerkfout: ${e.message}`, 'error');
    }
  }

  const handlePreview = (type) => {
    setSelectedBlueprint(type)
    setIsModalOpen(true)
  }

  const handleEdit = (type) => {
    addToast("Blueprint editor wordt geopend...", "info");
    // To-be implemented: Open blueprint JSON editor of Layout Editor
    window.open(`http://localhost:5003?blueprint=${type.name}`, '_blank');
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-athena-panel p-5 border border-athena-border rounded-sm shadow-sm">
        <div>
          <h3 className="font-bold text-white text-sm uppercase tracking-wider">Blueprints Registry</h3>
          <p className="text-slate-500 text-[11px] font-medium">Beschikbare architecturen voor nieuwe generaties.</p>
        </div>
        <div className="flex gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
           <div>DOCKED: <span className="text-emerald-500">{siteTypes.filter(t => t.track === 'docked').length}</span></div>
           <div>AUTO: <span className="text-athena-accent">{siteTypes.filter(t => t.track === 'autonomous').length}</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {siteTypes.map((type, idx) => {
          const isDocked = type.track === 'docked';
          return (
            <div key={idx} className={`bg-athena-panel p-5 rounded-sm border border-athena-border flex flex-col gap-4 relative group hover:border-athena-accent transition-all ${isDocked ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-athena-accent'}`}>
               <div className="flex items-center gap-3">
                  <span className="text-xl">{isDocked ? '⚓' : '🚀'}</span>
                  <h4 className="font-bold text-white text-[13px] uppercase tracking-tight group-hover:text-athena-accent transition-colors">{type.name.replace(/-/g, ' ')}</h4>
               </div>

               <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 italic h-8">
                  {type.description || 'Geen blueprint metadata gevonden.'}
               </p>

               <div className="flex gap-2 py-2 border-y border-athena-border/30 bg-black/10 -mx-5 px-5">
                  <div className="flex-1">
                     <p className="text-[8px] font-black text-slate-600 uppercase">Tables</p>
                     <p className="text-[12px] font-black text-slate-400">{type.tableCount || 0}</p>
                  </div>
                  <div className="flex-1 border-l border-athena-border/30 pl-3">
                     <p className="text-[8px] font-black text-slate-600 uppercase">Layouts</p>
                     <p className="text-[12px] font-black text-slate-400">{type.layoutCount || 0}</p>
                  </div>
               </div>

               <div className="flex gap-1.5 mt-auto">
                  <button 
                    onClick={() => handleBuild(type)}
                    className="flex-1 py-1.5 bg-[#21262d] border border-athena-border text-slate-400 text-[9px] font-black uppercase rounded hover:text-white transition-colors"
                    data-tooltip="Genereer een nieuwe site instantie op basis van deze blueprint"
                  >
                     BUILD SITE
                  </button>
                  <button 
                    onClick={() => handlePreview(type)}
                    className="px-2.5 py-1.5 bg-black/20 text-slate-500 border border-athena-border/50 rounded hover:text-athena-accent transition-colors"
                    data-tooltip="Bekijk WYSIWYG preview van deze blueprint"
                  >
                     👁️
                  </button>
                  <button 
                    onClick={() => handleEdit(type)}
                    className="px-2.5 py-1.5 bg-black/20 text-slate-500 border border-athena-border/50 rounded hover:text-athena-accent transition-colors"
                    data-tooltip="Bewerk blueprint configuratie"
                  >
                     ✏️
                  </button>
               </div>
            </div>
          )
        })}
      </div>

      <BlueprintModal 
        blueprint={selectedBlueprint} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  )
}
