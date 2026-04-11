import { ApiService } from '../services/ApiService'
import { useToast } from '../services/ToastContext'

export default function ToolsView() {
  const { addToast } = useToast()

  const toolCategories = [
    {
      title: "Content & Branding",
      tools: [
        { id: 'update-all-logos', label: "Logo Standardizer", desc: "Zet alle logo-slots op 'contain' voor betere transparantie.", icon: "🎨" },
        { id: 'bulk-image-fix', label: "Image Path Fixer", desc: "Herstel gebroken afbeeldingspaden in legacy componenten.", icon: "⚡" },
      ]
    },
    {
      title: "Maintenance & Core",
      tools: [
        { id: 'storage-audit-deep', label: "Deep Storage Audit", desc: "Gedetailleerde analyse van schijfruimte per site.", icon: "💾" },
        { id: 'storage-prune', label: "Storage Prune", desc: "Dehydrateer sites en ruim pnpm store op.", icon: "🧹" },
        { id: 'nightly-maintenance', label: "Nightly Sync", desc: "Draai alle onderhoudstaken en backups.", icon: "🌙" },
        { id: 'regenerate-site-passports', label: "Update Site Passports", desc: "Genereer nieuwe README's op basis van V10 standaard.", icon: "📄" },
      ]
    },
    {
      title: "AI & Generation",
      tools: [
        { id: 'automatic-showcase-generator', label: "Showcase Gen", desc: "Genereer automatisch 15 portfolio screenshots met AI.", icon: "📸" },
      ]
    }
  ]

  const runTool = async (id, label) => {
    addToast(`Tool gestart: ${label}...`, 'info')
    try {
      const res = await ApiService.runScript(id)
      if (res.success) addToast(`✅ ${label} succesvol afgerond!`, 'success')
      else addToast(`❌ Fout bij ${label}: ${res.error}`, 'error')
    } catch (e) { addToast("Netwerkfout bij uitvoeren tool.", "error") }
  }

  return (
    <div className="space-y-10">
      {toolCategories.map((cat, idx) => (
        <div key={idx}>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 border-b border-athena-border pb-2">{cat.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cat.tools.map(tool => (
              <div 
                key={tool.id}
                onClick={() => runTool(tool.id, tool.label)}
                data-tooltip={tool.desc}
                className="bg-athena-panel p-5 border border-athena-border rounded-sm hover:border-athena-accent group cursor-pointer transition-all shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl grayscale group-hover:grayscale-0 transition-all">{tool.icon}</div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-[13px] group-hover:text-athena-accent">{tool.label}</h4>
                    <p className="text-[11px] text-slate-500 leading-tight">{tool.desc}</p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-athena-border/30 flex justify-end">
                   <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest group-hover:text-athena-accent">Run Script ➔</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
