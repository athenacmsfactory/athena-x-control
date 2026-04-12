import { useState, useEffect } from 'react';
import { ApiService } from '../services/ApiService';
import { useToast } from '../services/ToastContext';
import SitetypePreviewCard from '../components/SitetypePreviewCard';

export default function SitetypePreviewsView() {
  const { addToast } = useToast();
  const [siteTypes, setSiteTypes] = useState([]);
  const [activeServers, setActiveServers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [typesRes, serversRes] = await Promise.all([
        ApiService.getSitetypePreviews(),
        ApiService.getActiveServers()
      ]);
      setSiteTypes(typesRes || []);
      setActiveServers(serversRes.servers || []);
    } catch (e) {
      console.error("Fetch failed", e);
      addToast("Failed to sync sitetype data.", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex justify-between items-center bg-athena-panel p-6 border border-athena-border rounded-sm shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-athena-accent/10 rounded flex items-center justify-center border border-athena-accent/30 text-athena-accent text-xl">
             🧪
          </div>
          <div>
            <h3 className="font-black text-white text-lg uppercase tracking-widest">Sitetype Preview Center</h3>
            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-tighter">
              Validate and test blueprint architectures in isolated environments.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-8 pr-4">
           <div className="text-right">
              <p className="text-[9px] font-black text-slate-600 uppercase">Blueprints</p>
              <p className="text-xl font-black text-white">{siteTypes.length}</p>
           </div>
           <div className="text-right border-l border-athena-border/30 pl-8">
              <p className="text-[9px] font-black text-slate-600 uppercase">Active Sitetype Previews</p>
              <p className="text-xl font-black text-emerald-500">
                {activeServers.filter(s => s.siteName && s.siteName.startsWith('showcase-')).length}
              </p>
           </div>
        </div>
      </div>

      {loading && siteTypes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-40">
           <div className="w-12 h-12 border-4 border-athena-accent border-t-transparent rounded-full animate-spin mb-4"></div>
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scanning Blueprint Registry...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {siteTypes.map((type) => {
            // Showcase servers are named showcase-<typename> in the process manager
            const showcaseId = `preview-${type.name}`;
            const activeServer = activeServers.find(s => s.siteName === showcaseId);
            
            return (
              <SitetypePreviewCard 
                key={type.name} 
                type={type} 
                activeServer={activeServer}
                onRefresh={fetchData}
              />
            );
          })}
        </div>
      )}
      
      {siteTypes.length === 0 && !loading && (
        <div className="bg-athena-panel border border-dashed border-athena-border p-20 rounded flex flex-col items-center text-center">
           <p className="text-slate-500 text-sm font-bold uppercase">No sitetypes found in registry.</p>
           <p className="text-[10px] text-slate-600 mt-2">Create your first sitetype using the Architect Wizard.</p>
        </div>
      )}
    </div>
  );
}
