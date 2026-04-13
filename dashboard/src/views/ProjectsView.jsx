import { useState, useEffect } from 'react'
import { ApiService } from '../services/ApiService'

export default function ProjectsView({ onNewSite }) {
  const [projects, setProjects] = useState([])
  const [sites, setSites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    refresh()
  }, [])

  const refresh = async () => {
    setLoading(true)
    try {
      const [projData, siteData] = await Promise.all([
        ApiService.getProjects(),
        ApiService.getSites()
      ])
      setProjects(projData)
      setSites(siteData)
    } catch (e) { console.error("Projects fetch failed") }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-athena-panel p-5 border border-athena-border rounded-sm shadow-sm">
        <div>
          <h3 className="font-bold text-white text-sm uppercase tracking-wider">Pipeline Architectuur</h3>
          <p className="text-slate-500 text-[11px] font-medium">Flow van Ingestie naar Cloud Deployment.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-[#21262d] border border-athena-border text-slate-400 text-[11px] font-black uppercase rounded hover:text-white transition-colors">
            ADD SOURCE
          </button>
          <button onClick={onNewSite} className="px-4 py-2 bg-athena-accent text-white text-[11px] font-black uppercase rounded hover:brightness-110 shadow-lg shadow-blue-900/20 transition-all tracking-widest">
            NIEUWE SITE
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {projects.map((project, idx) => {
          const site = sites.find(s => s.name === project || s.name === `${project}-site`);
          return (
            <div key={idx} className="bg-athena-panel p-3 border border-athena-border rounded-sm flex flex-col md:flex-row gap-4 items-center group hover:border-athena-accent transition-colors">
              <div className="w-full md:w-40 space-y-1.5">
                 <div>
                    <h4 className="font-bold text-white text-[12.5px] group-hover:text-athena-accent transition-colors truncate">{project.replace(/-/g, ' ')}</h4>
                    <code className="text-[8px] text-slate-600 font-mono tracking-tighter">input/{project}/</code>
                 </div>
                 <div className="flex gap-1">
                    <button className="flex-1 bg-[#21262d] border border-athena-border text-slate-400 text-[8.5px] font-black uppercase py-1 rounded hover:text-white">
                       BUILD
                    </button>
                    <button className="px-1.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded hover:bg-rose-500 hover:text-white transition-all text-[9.5px]">DEL</button>
                 </div>
              </div>

              <div className="flex-1 grid grid-cols-4 gap-1.5 w-full">
                  <PipelineStep label="INGEST" active={true} sub="READY" />
                  <PipelineStep label="PARSE" active={project.includes('ai')} sub={project.includes('ai') ? 'DONE' : 'WAIT'} />
                  <PipelineStep label="CORE" active={!!site} sub={site ? 'LINKED' : 'NONE'} />
                  <PipelineStep label="CLOUD" active={!!site?.sheetUrl} sub={site?.sheetUrl ? 'SYNC' : 'BASE'} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PipelineStep({ label, active, sub }) {
  return (
    <div className={`relative flex flex-col items-center justify-center p-2 rounded-sm border transition-all ${active ? 'bg-black/20 border-emerald-500/30' : 'bg-black/10 border-athena-border/50 opacity-30'}`}>
       <div className={`text-[8.5px] font-black uppercase tracking-tighter ${active ? 'text-white' : 'text-slate-500'}`}>{label}</div>
       <div className={`text-[7.5px] font-bold ${active ? 'text-athena-accent' : 'text-slate-600'}`}>{sub}</div>
       {active && <div className="absolute top-1 right-1 w-1 h-1 bg-emerald-500 rounded-full"></div>}
    </div>
  )
}
