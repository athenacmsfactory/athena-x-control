import { useState, useEffect } from 'react';
import { ApiService } from '../services/ApiService';
import { useToast } from '../services/ToastContext';

export default function CodeEditorModal({ isOpen, onClose, filePath, fileName }) {
  const { addToast } = useToast();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && filePath) {
      loadFile();
    }
  }, [isOpen, filePath]);

  const loadFile = async () => {
    setLoading(true);
    try {
      const res = await ApiService.readFile(filePath);
      if (res.success) setContent(res.content);
      else addToast("Kan bestand niet laden: " + res.error, "error");
    } catch (e) {
      addToast("Fout bij laden code: " + e.message, "error");
    }
    setLoading(false);
  };

  const saveFile = async () => {
    setSaving(true);
    try {
      const res = await ApiService.writeFile(filePath, content);
      if (res.success) {
        addToast("Code succesvol opgeslagen", "success");
        onClose();
      } else {
        addToast("Opslaan mislukt: " + res.error, "error");
      }
    } catch (e) {
      addToast("Fout bij opslaan: " + e.message, "error");
    }
    setSaving(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6 backdrop-blur-sm">
      <div className="bg-athena-darker border border-athena-border rounded-sm w-full max-w-6xl h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="bg-athena-panel border-b border-athena-border p-4 flex justify-between items-center flex-shrink-0">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>✏️</span> Athena Code Editor
            </h3>
            <p className="text-[10px] uppercase font-black text-athena-accent tracking-widest mt-1">{fileName}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white px-2">&times;</button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-hidden flex flex-col bg-[#1e1e1e]">
          {loading ? (
            <div className="flex-1 flex items-center justify-center text-slate-500 font-mono text-xs">
              Laden van {fileName}...
            </div>
          ) : (
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 w-full p-4 bg-transparent text-slate-300 font-mono text-sm focus:outline-none resize-none leading-relaxed"
              spellCheck="false"
              placeholder="// Code here..."
            />
          )}
        </div>

        {/* FOOTER */}
        <div className="bg-athena-panel border-t border-athena-border p-4 flex justify-between items-center">
           <div className="text-[10px] font-mono text-slate-500">
             {filePath}
           </div>
           <div className="flex gap-3">
             <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors">
               ANNULEREN
             </button>
             <button 
               onClick={saveFile}
               disabled={saving || loading}
               className="px-6 py-2 bg-athena-accent hover:brightness-110 text-white text-xs font-black uppercase tracking-widest rounded-sm shadow-lg shadow-blue-500/20 disabled:opacity-50"
             >
               {saving ? 'OPSLAAN...' : 'OPSLAAN'}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}
