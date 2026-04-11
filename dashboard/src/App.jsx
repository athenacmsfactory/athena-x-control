import { useState, useEffect } from 'react'
import { ApiService } from './services/ApiService'
import { useToast } from './services/ToastContext'
import SiteCard from './components/SiteCard'
import LegacySiteCard from './components/LegacySiteCard'
import SheetModal from './components/SheetModal'
import ServersView from './views/ServersView'
import ProjectsView from './views/ProjectsView'
import StorageView from './views/StorageView'
import RepositoriesView from './views/RepositoriesView'
import SiteTypesView from './views/SiteTypesView'
import TodoView from './views/TodoView'
import SettingsView from './views/SettingsView'
import ToolsView from './views/ToolsView'
import WizardView from './views/WizardView'
import GeneratorModal from './components/GeneratorModal'
import MarketingModal from './components/MarketingModal'
import BlogModal from './components/BlogModal'
import './index.css'

function App() {
  const { addToast } = useToast()
  const [currentView, setCurrentView] = useState('sites')
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false)
  const [isMarketingOpen, setIsMarketingOpen] = useState(false)
  const [selectedMarketingSite, setSelectedMarketingSite] = useState(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedSheetSite, setSelectedSheetSite] = useState(null)
  const [isBlogOpen, setIsBlogOpen] = useState(false)

  const [selectedBlogSite, setSelectedBlogSite] = useState('')
  
  const [siteTab, setSiteTab] = useState('werkplaats') // 'werkplaats' or 'vault'
  const [sites, setSites] = useState([])
  const [activeServers, setActiveServers] = useState([])
  const [systemStatus, setSystemStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [autoStop, setAutoStop] = useState(() => localStorage.getItem('athena-auto-stop') !== 'false')

  useEffect(() => {
    refreshData()
    const interval = setInterval(refreshServers, 15000)
    return () => clearInterval(interval)
  }, [])

  const refreshServers = async () => {
    try {
      const data = await ApiService.getActiveServers()
      setActiveServers(data.servers || [])
    } catch (e) { console.error("Server check failed") }
  }

  const refreshData = async () => {
    setLoading(true)
    try {
      const [siteData, statusData, serverData] = await Promise.all([
        ApiService.getSites(),
        ApiService.getSystemStatus(),
        ApiService.getActiveServers()
      ])
      setSites(siteData)
      setSystemStatus(statusData)
      setActiveServers(serverData.servers || [])
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleVaultDeploy = async () => {
    const msg = prompt("Commit bericht voor deze Vault release:", "Batch update via Vault Monorepo");
    if (!msg) return;
    
    // We gebruiken 'vault-sync' als een generieke ID voor het script
    setLoading(true);
    addToast("v9 Monorepo deployment gestart...", "info");
    try {
      const res = await ApiService.deploy('vault-sync', msg);
      if (res.success) {
        addToast("Vault succesvol gepushed naar GitHub!", "success");
      } else {
        addToast(`Fout bij deploy: ${res.message || 'Onbekende fout'}`, "error");
      }
    } catch (e) {
      addToast(`Fout bij deployment: ${e.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const copySiteNames = () => {
    const names = sites.map(s => s.name).join('\n')
    navigator.clipboard.writeText(names)
      .then(() => addToast('Sitenamen gekopieerd naar klembord!', 'success'))
      .catch(e => addToast('Fout bij kopiëren: ' + e.message, 'error'))
  }

  const startTool = async (name, url) => {
    addToast(`Starten van ${name}...`, 'info')
    try {
      if (name === 'Dock') await ApiService.startDock()
      else if (name === 'Layout Editor') await ApiService.startLayoutServer()
      else await ApiService.runScript(`start-${name.toLowerCase().replace(' ', '-')}`)
      window.open(url, '_blank')
    } catch (e) {
      addToast(`Fout bij starten van ${name}: ${e.message}`, 'error')
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-athena-darker text-athena-text-main">
      {/* SIDEBAR */}
      <aside className="w-[180px] bg-athena-panel border-r border-athena-border flex flex-col flex-shrink-0">
        <div className="p-3 border-b border-athena-border flex items-center gap-2.5">
          <div className="w-8 h-8 bg-athena-accent rounded flex items-center justify-center font-bold text-white text-lg">A</div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white leading-tight">ATHENA</h1>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">v8.7 PRO</span>
          </div>
        </div>
        
        <nav className="flex-1 p-1.5 space-y-0.5 overflow-y-auto mt-2 custom-scrollbar">
          <NavBtn id="wizard" label="Architect Wizard" icon="🧙‍♂️" active={currentView === 'wizard'} onClick={() => setCurrentView('wizard')} className="bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500/10 border-emerald-500/20" />
          <NavBtn id="sites" label="Sites" icon="🌐" active={currentView === 'sites'} onClick={() => setCurrentView('sites')} />
          <NavBtn id="projects" label="Data Hub" icon="📁" active={currentView === 'projects'} onClick={() => setCurrentView('projects')} />
          <NavBtn id="sitetypes" label="SiteTypes" icon="🧩" active={currentView === 'sitetypes'} onClick={() => setCurrentView('sitetypes')} />
          
          <div className="h-px bg-athena-border my-2 mx-2 opacity-50"></div>
          
          <NavBtn id="repositories" label="GitHub" icon="🐙" active={currentView === 'repositories'} onClick={() => setCurrentView('repositories')} />
          <NavBtn id="servers" label="Servers" icon="🖥️" active={currentView === 'servers'} onClick={() => setCurrentView('servers')} />
          
          <div className="h-px bg-athena-border my-2 mx-2 opacity-50"></div>
          
          <NavBtn id="storage" label="Opslag" icon="💾" active={currentView === 'storage'} onClick={() => setCurrentView('storage')} />
          <NavBtn id="tools" label="Tools" icon="🛠️" active={currentView === 'tools'} onClick={() => setCurrentView('tools')} />
          <NavBtn id="todo" label="Roadmap" icon="🗺️" active={currentView === 'todo'} onClick={() => setCurrentView('todo')} />
          <NavBtn id="settings" label="Settings" icon="⚙️" active={currentView === 'settings'} onClick={() => setCurrentView('settings')} />

          <div className="mt-6 pt-2 border-t border-athena-border/30 space-y-0.5">
             <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest px-3 mb-2">Snelle Tools</p>
             <NavBtn label="Athena Dock" icon="⚓" onClick={() => startTool('Dock', 'http://localhost:5002')} />
             <NavBtn label="Portfolio Health" icon="🏥" onClick={() => window.open('/portfolio-status.html', '_blank')} />
             <NavBtn label="Reviewer" icon="⚖️" onClick={() => window.open('http://localhost:5001/reviewer.html', '_blank')} />
             <NavBtn label="Layout Editor" icon="🎨" onClick={() => startTool('Layout Editor', 'http://localhost:5003')} />
          </div>
        </nav>

        <div className="p-3 border-t border-athena-border bg-black/10">
           <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mb-1 px-1">
              <span>DISK</span>
              <span>{systemStatus?.percent || '0%'}</span>
           </div>
           <div className="w-full h-1 bg-black rounded-full overflow-hidden border border-athena-border/30">
              <div className="h-full bg-athena-accent transition-all duration-1000" style={{ width: systemStatus?.percent || '0%' }}></div>
           </div>
        </div>
      </aside>

      {/* CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden bg-athena-dark">
        <header className="h-12 bg-athena-panel border-b border-athena-border px-5 flex justify-between items-center flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-6">
            <h2 className="text-[13px] font-semibold text-white uppercase tracking-wider">{currentView.replace('-', ' ')}</h2>
            {currentView === 'sites' && (
              <div className="flex bg-black/20 p-1 rounded border border-athena-border/30">
                <button 
                  onClick={() => setSiteTab('werkplaats')}
                  className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all ${siteTab === 'werkplaats' ? 'bg-athena-accent text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Werkplaats
                </button>
                <button 
                  onClick={() => setSiteTab('vault')}
                  className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all ${siteTab === 'vault' ? 'bg-athena-accent text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Vault
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-2 items-center">
            {currentView === 'sites' && (
              <div className="flex items-center gap-2 mr-4 bg-black/20 px-3 py-1.5 rounded border border-athena-border/50">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Auto-Stop</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={autoStop} 
                    onChange={(e) => {
                      const val = e.target.checked;
                      setAutoStop(val);
                      localStorage.setItem('athena-auto-stop', val);
                    }} 
                  />
                  <div className="w-7 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-athena-accent"></div>
                </label>
              </div>
            )}
            <button 
              onClick={copySiteNames}
              data-tooltip="Kopieer alle sitenamen naar klembord"
              className="px-3 py-1.5 text-[11px] font-bold bg-[#21262d] border border-athena-border text-slate-400 hover:text-athena-accent rounded transition-colors"
            >
              COPY NAMES
            </button>
             <button 
              onClick={refreshData}
              data-tooltip="Ververs alle data van de server"
              className="px-3 py-1.5 text-[11px] font-bold bg-[#21262d] border border-athena-border text-slate-400 hover:text-athena-accent rounded transition-colors"
            >
              REFRESH
            </button>
            <button 
              onClick={() => setIsGeneratorOpen(true)}
              data-tooltip="Handmatig een nieuw leeg project aanmaken"
              className="px-3 py-1.5 text-[11px] font-black bg-athena-accent text-white rounded hover:brightness-110 transition-all shadow-lg shadow-blue-900/20 uppercase tracking-widest"
            >
              NIEUWE SITE
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar">
          <div className="max-w-[1400px] mx-auto">
            {currentView === 'sites' && (
               <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                     <StatBox label="Actief in Werkplaats" value={sites.filter(s => s.isNative).length} />
                     <StatBox label="Geparkeerd in Vault" value={sites.filter(s => !s.isNative).length} color="text-athena-accent" />
                     <StatBox label="Online (Dev)" value={activeServers.filter(s => !s.isSystem && s.siteName !== 'athena-api' && s.siteName !== 'athena-ui').length} color="text-emerald-500" />
                  </div>

                  {/* TABBED SITE LIST */}
                  <div className="space-y-10">
                    {siteTab === 'werkplaats' ? (
                      <>
                        {/* WERKPLAATS SITES (NATIVE) */}
                        <div>
                          <h3 className="text-[11px] font-black text-athena-accent uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 bg-athena-accent rounded-sm rotate-45 animate-pulse"></span>
                            Actieve Werkplaats (Native)
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {sites.filter(s => s.isNative).map((site, idx) => (
                              <SiteCard 
                                key={`werkplaats-${idx}`} 
                                site={site} 
                                activeServer={activeServers.find(s => s.siteName === site.name)}
                                autoStop={autoStop}
                                onRefresh={refreshData}
                                onSEO={(name) => { setSelectedMarketingSite(name); setIsMarketingOpen(true); }}
                                onSheet={(siteObj) => { setSelectedSheetSite(siteObj); setIsSheetOpen(true); }}
                              />
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* VAULT SITES (EXTERNAL / PARKED) */}
                        <div>
                          <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[11px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                              Athena Vault (Geparkeerd)
                            </h3>
                            <button 
                              onClick={handleVaultDeploy}
                              disabled={loading}
                              className="px-6 py-2 bg-athena-accent text-white text-[10px] font-black uppercase tracking-widest rounded shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                            >
                              🚀 DEPLOY MONOREPO (VAULT)
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {sites.filter(s => !s.isNative).map((site, idx) => (
                              <LegacySiteCard 
                                key={`vault-${idx}`} 
                                site={site} 
                                activeServer={activeServers.find(s => s.siteName === site.name)}
                                autoStop={autoStop}
                                onRefresh={refreshData}
                              />
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
               </div>
            )}

            {currentView === 'projects' && <ProjectsView />}
            {currentView === 'servers' && <ServersView />}
            {currentView === 'storage' && <StorageView />}
            {currentView === 'tools' && <ToolsView />}
            {currentView === 'repositories' && <RepositoriesView />}
            {currentView === 'sitetypes' && <SiteTypesView />}
            {currentView === 'wizard' && <WizardView />}
            {currentView === 'todo' && <TodoView />}
            {currentView === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>

      <GeneratorModal isOpen={isGeneratorOpen} onClose={() => setIsGeneratorOpen(false)} onRefresh={refreshData} />
      <MarketingModal isOpen={isMarketingOpen} siteName={selectedMarketingSite} onClose={() => setIsMarketingOpen(false)} />
      <BlogModal isOpen={isBlogOpen} siteName={selectedBlogSite} onClose={() => setIsBlogOpen(false)} />
      <SheetModal isOpen={isSheetOpen} site={selectedSheetSite} onClose={() => { setIsSheetOpen(false); refreshData(); }} />
    </div>
  )
}

function NavBtn({ label, icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded transition-all text-left group ${
        active ? 'bg-[#21262d] text-athena-accent border border-athena-border shadow-inner' : 'text-slate-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      <span className={`text-sm ${active ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'}`}>{icon}</span>
      <span className="text-[12.5px] font-medium">{label}</span>
    </button>
  )
}


function StatBox({ label, value, color = "text-white" }) {
  return (
    <div className="bg-athena-panel border border-athena-border p-4 rounded-sm">
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
    </div>
  )
}

export default App
