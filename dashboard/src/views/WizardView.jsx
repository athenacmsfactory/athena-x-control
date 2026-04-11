import { useState } from 'react'
import { ApiService } from '../services/ApiService'
import { useToast } from '../services/ToastContext'

export default function WizardView() {
  const { addToast } = useToast()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  // Data State
  const [input, setInput] = useState('')
  const [siteName, setSiteName] = useState('')
  const [structure, setStructure] = useState(null)
  const [design, setDesign] = useState(null)
  const [siteModel, setSiteModel] = useState('SPA')
  
  const handleNext = async () => {
    if (step === 1) {
      if (!input.trim()) return addToast("Voer a.u.b. een omschrijving in.", "error")
      setLoading(true)
      try {
        const structRes = await ApiService.generateStructure(input)
        const designRes = await ApiService.generateDesign(input)
        
        if (structRes.success && designRes.success) {
          setStructure(structRes.structure)
          setDesign(designRes.design)
          setStep(2)
        } else {
          addToast("AI analyse mislukt. Probeer het opnieuw.", "error")
        }
      } catch (e) {
        addToast("Netwerkfout bij AI analyse.", "error")
      } finally {
        setLoading(false)
      }
    } else if (step === 2) {
      setStep(3)
    }
  }

  const handleFinalize = async () => {
    if (!siteName.trim()) return addToast("Voer a.u.b. een sitenaam in.", "error")
    setLoading(true)
    try {
      // 1. Create Sitetype
      const sitetypeName = `${siteName.toLowerCase().replace(/\s+/g, '-')}-type`
      const siteTypeRes = await ApiService.createSiteType({
        name: sitetypeName,
        description: input,
        dataStructure: structure,
        designSystem: design
      })
      
      if (!siteTypeRes.success) throw new Error(siteTypeRes.error)
      
      // 2. Create Project
      const projectRes = await ApiService.createSiteFromWizard({
        projectName: siteName.toLowerCase().replace(/\s+/g, '-'),
        siteType: sitetypeName,
        siteModel: siteModel
      })
      
      if (projectRes.success) {
        addToast("🎉 Site succesvol aangemaakt!", "success")
        setStep(4)
      } else {
        throw new Error(projectRes.error)
      }
    } catch (e) {
      addToast(`Fout bij genereren: ${e.message}`, "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* HEADER / STEPPER */}
      <div className="mb-12">
        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Architect Wizard</h2>
        <p className="text-slate-500 text-sm mb-8">Zet ruwe data om in een functionele Athena architectuur.</p>
        
        <div className="flex items-center gap-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${step >= s ? 'bg-athena-accent text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 text-slate-500'}`}>
                {s}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s ? 'text-white' : 'text-slate-600'}`}>
                {s === 1 ? 'Discovery' : s === 2 ? 'Analysis' : 'Blueprint'}
              </span>
              {s < 3 && <div className="w-12 h-px bg-slate-800 ml-2"></div>}
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: INPUT */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-athena-panel border border-athena-border p-8 rounded-sm shadow-xl">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Stap 1: Omschrijf de Business</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Plak hier alles wat je weet: gespreknotities, een lijst met producten, of een algemene omschrijving van wat de klant doet.
            </p>
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Bijv: Een hondenpension genaamd 'Woef & Co' in Gent. Ze bieden overnachtingen aan voor 25 euro per nacht, gedragstraining en hebben een trimsalon..."
              className="w-full h-64 bg-black/30 border border-athena-border rounded p-4 text-slate-300 text-sm focus:border-athena-accent focus:outline-none transition-colors resize-none font-mono"
            />
          </div>
          <div className="flex justify-end">
            <button 
              onClick={handleNext}
              disabled={loading}
              data-tooltip="Start de AI analyse van de ingevoerde tekst"
              className={`px-8 py-3 bg-athena-accent text-white font-black uppercase tracking-widest rounded shadow-lg shadow-blue-500/20 hover:brightness-110 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'AI is aan het werk...' : 'Analyseer Data ➔'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: ANALYSIS RESULT */}
      {step === 2 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* DATA STRUCTURE */}
            <div className="bg-athena-panel border border-athena-border p-6 rounded-sm shadow-xl">
              <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                 Voorgestelde Data Hub
              </h3>
              <div className="space-y-4">
                {structure.map((table, i) => (
                  <div key={i} className="p-3 bg-black/20 border border-athena-border rounded">
                    <p className="text-[12px] font-bold text-white mb-2">{table.table_name}</p>
                    <div className="flex flex-wrap gap-1">
                      {table.columns.map((col, j) => (
                        <span key={j} className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                          {col}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DESIGN SYSTEM */}
            <div className="bg-athena-panel border border-athena-border p-6 rounded-sm shadow-xl">
              <h3 className="text-[10px] font-black text-athena-accent uppercase tracking-widest mb-4 flex items-center gap-2">
                 <span className="w-2 h-2 bg-athena-accent rounded-full"></span>
                 Visuele Identiteit
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-5 gap-2">
                  {design.palette.map((color, i) => (
                    <div key={i} className="space-y-1">
                      <div className="h-10 rounded shadow-inner" style={{ backgroundColor: color }}></div>
                      <p className="text-[8px] font-mono text-slate-600 text-center">{color}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Typography</p>
                    <p className="text-xl text-white font-bold" style={{ fontFamily: design.typography.heading }}>{design.typography.heading}</p>
                    <p className="text-xs text-slate-400" style={{ fontFamily: design.typography.body }}>{design.typography.body} (Body Text)</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Aura / Mood</p>
                    <p className="text-xs text-slate-300 italic">"{design.design_md}"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center bg-athena-panel/50 p-4 border border-dashed border-athena-border rounded">
             <p className="text-xs text-slate-500 italic">Tevreden met deze basis? We kunnen nu het project genereren.</p>
             <div className="flex gap-4">
                <button onClick={() => setStep(1)} data-tooltip="Terug naar de discovery fase" className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest">Opnieuw</button>
                <button onClick={handleNext} data-tooltip="Bevestig deze analyse en ga naar de build fase" className="px-6 py-2 bg-athena-accent text-white text-[10px] font-black uppercase tracking-widest rounded shadow-lg shadow-blue-500/20">Ga Verder ➔</button>
             </div>
          </div>
        </div>
      )}

      {/* STEP 3: CONFIRM & BUILD */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="bg-athena-panel border border-athena-border p-8 rounded-sm shadow-xl">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 text-center italic">De Laatste Loodjes</h3>
            
            <div className="max-w-md mx-auto space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Project Naam (Klant)</label>
                <input 
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="Bijv: Gastropub Gent"
                  className="w-full bg-black/40 border border-athena-border rounded p-3 text-white focus:border-athena-accent focus:outline-none transition-all placeholder:text-slate-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Website Model</label>
                <div className="grid grid-cols-2 gap-4">
                  {['SPA', 'MULTI'].map(model => (
                    <button 
                      key={model}
                      onClick={() => setSiteModel(model)}
                      className={`p-4 border rounded text-center transition-all ${siteModel === model ? 'border-athena-accent bg-athena-accent/5 text-athena-accent shadow-lg shadow-athena-accent/10' : 'border-athena-border text-slate-500 hover:border-slate-700'}`}
                    >
                      <p className="text-xs font-black tracking-widest">{model}</p>
                      <p className="text-[9px] opacity-60 mt-1">{model === 'SPA' ? 'Alles op één pagina' : 'Meerdere subpagina\'s'}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
           </div>

           <div className="flex justify-center mt-12">
              <button 
                onClick={handleFinalize}
                disabled={loading}
                data-tooltip="Maak de site en de blueprint definitief aan"
                className={`group relative px-12 py-4 bg-emerald-500 text-white font-black uppercase tracking-[0.2em] rounded-full shadow-2xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all ${loading ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
              >
                {loading ? 'Building Manifestation...' : 'Start Realisatie ⚡'}
                <div className="absolute inset-0 rounded-full border-2 border-emerald-500 animate-ping opacity-20 pointer-events-none"></div>
              </button>
           </div>
        </div>
      )}

      {/* STEP 4: SUCCESS */}
      {step === 4 && (
        <div className="text-center py-20 animate-in zoom-in duration-700">
           <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/20">
              <span className="text-5xl italic font-black">!</span>
           </div>
           <h2 className="text-4xl font-black text-white mb-4">Manifestatie Voltooid</h2>
           <p className="text-slate-500 mb-10 max-w-md mx-auto">De site <strong>{siteName}</strong> is aangemaakt en klaar voor gebruik in de werkplaats.</p>
           
           <div className="flex justify-center gap-4">
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2 border border-athena-border text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
              >
                Nieuwe Wizard
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                className="px-6 py-2 bg-athena-accent text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:brightness-110 transition-all"
              >
                Naar Dashboard ➔
              </button>
           </div>
        </div>
      )}
    </div>
  )
}
