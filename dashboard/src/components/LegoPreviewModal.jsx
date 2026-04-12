export default function LegoPreviewModal({ isOpen, onClose, lego }) {
  if (!isOpen || !lego) return null;

  // The Backend runs on port 5000 in dev
  const apiBase = 'http://localhost:5000/api';
  const previewUrl = `${apiBase}/tools/preview-lego?file=${encodeURIComponent(lego.absolutePath)}`;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-6 backdrop-blur-sm">
      <div className="bg-[#111111] border border-athena-border rounded-sm w-full max-w-7xl h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="bg-athena-panel border-b border-athena-border p-3 flex justify-between items-center outline-none">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>👁️</span> Lego Live Preview
            </h3>
            <p className="text-[10px] uppercase font-black text-athena-accent tracking-widest mt-1">
              {lego.category} / {lego.fileName}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white px-2">
             &times;
          </button>
        </div>

        {/* PREVIEW CONTAINER */}
        <div className="flex-1 bg-black relative">
           <iframe 
             src={previewUrl}
             title="Lego Preview"
             className="w-full h-full border-none"
             sandbox="allow-scripts allow-same-origin"
           />
        </div>
      </div>
    </div>
  );
}
