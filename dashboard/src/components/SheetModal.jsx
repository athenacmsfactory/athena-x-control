import { useState, useEffect } from 'react'
import { ApiService } from '../services/ApiService'
import { useToast } from '../services/ToastContext'

export default function SheetModal({ isOpen, site, onClose }) {
  const { addToast } = useToast()
  const [sheetUrl, setSheetUrl] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && site) {
      setLoading(true)
      setSheetUrl(site.sheetUrl || '')

      // Fetch fresh structure data to get the latest sheetUrl
      ApiService.getSiteStructure(site.name)
        .then(res => {
          if (res && res.sheetUrl) {
            setSheetUrl(res.sheetUrl)
          }
        })
        .finally(() => setLoading(false))
    }
  }, [isOpen, site])

  if (!isOpen || !site) return null

  const handleLink = async () => {
    if (!sheetUrl) return
    setLoading(true)
    try {
      const res = await ApiService.linkSheet(site.name, sheetUrl)
      if (res.success) {
        addToast("Google Sheet succesvol gekoppeld!", "success")
      } else {
        addToast("Fout bij koppelen: " + res.error, "error")
      }
    } catch (e) { addToast("Netwerkfout.", "error") }
    setLoading(false)
  }
  
  const handleAutoProvision = async () => {
    setLoading(true)
    addToast("Bezig met het automatisch aanmaken van een Google Sheet...", "info")
    try {
      const res = await ApiService.autoProvision(site.name)
      if (res.success) {
        addToast("Google Sheet succesvol aangemaakt!", "success")
        // The script might return the new sheetUrl, let's refresh
        const structure = await ApiService.getSiteStructure(site.name)
        if (structure && structure.sheetUrl) {
          setSheetUrl(structure.sheetUrl)
        }
      } else {
        addToast("Fout bij aanmaken: " + (res.error || res.message), "error")
      }
    } catch (e) { addToast("Provisioning fout.", "error") }
    setLoading(false)
  }

  const handlePull = async () => {
    setLoading(true)
    addToast("Data wordt opgehaald uit Google Sheets...", "info")
    try {
      const res = await ApiService.pullFromSheet(site.name)
      if (res.success) {
        addToast("Data succesvol gesynchroniseerd!", "success")
      } else {
        addToast("Fout bij ophalen: " + res.error, "error")
      }
    } catch (e) { addToast("Sync fout.", "error") }
    setLoading(false)
  }

  const handlePush = async () => {
    setLoading(true)
    addToast("Lokale data wordt verzonden naar Google Sheets...", "info")
    try {
      const res = await ApiService.pushToSheet(site.name)
      if (res.success) {
        addToast("Data succesvol verzonden!", "success")
      } else {
        addToast("Fout bij verzenden: " + res.error, "error")
      }
    } catch (e) { addToast("Sync fout.", "error") }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0d1117] border border-athena-border w-full max-w-lg rounded-sm shadow-2xl overflow-hidden flex flex-col">

        {/* Header */}
        <div className="p-6 border-b border-athena-border bg-gradient-to-r from-blue-900/20 to-transparent">
          <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
            <span className="text-2xl">📝</span>
            Google Sheet Manager
          </h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Project: {site.name}</p>
        </div>

        {/* Provision Banner */}
        {!sheetUrl && (
          <div className="mx-6 mt-6 p-4 bg-athena-accent/5 border border-athena-accent/20 rounded-sm flex items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-500">
            <div>
              <p className="text-[10px] font-black text-athena-accent uppercase tracking-widest">Nog geen sheet gekoppeld?</p>
              <p className="text-slate-500 text-[9px] font-bold mt-0.5">Laat Athena automatisch een spreadsheet voor je inrichten.</p>
            </div>
            <button
              onClick={handleAutoProvision}
              disabled={loading}
              className="px-4 py-2 bg-athena-accent text-white text-[9px] font-black uppercase rounded-sm hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? "BEZIG..." : "PROVISION NEW"}
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-8 space-y-8">

          {/* Link Section */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Google Sheet Edit URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="flex-1 bg-black/40 border border-athena-border rounded-sm px-4 py-2.5 text-sm text-white placeholder:text-slate-700 focus:border-athena-accent outline-none transition-all"
              />
              <button
                onClick={handleLink}
                disabled={loading || !sheetUrl}
                className="px-6 bg-athena-accent text-white text-[10px] font-black uppercase rounded-sm hover:opacity-90 disabled:opacity-30 transition-all"
              >
                SAVE
              </button>
            </div>
          </div>

          {/* Sync Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handlePull}
              disabled={loading || !sheetUrl}
              className="flex flex-col items-center gap-3 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-sm hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all group disabled:opacity-10 disabled:grayscale"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">📥</span>
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest text-center">Pull from Cloud<br /><span className="text-[8px] opacity-60">(Cloud → Local)</span></span>
            </button>

            <button
              onClick={handlePush}
              disabled={loading || !sheetUrl}
              className="flex flex-col items-center gap-3 p-6 bg-blue-500/5 border border-blue-500/20 rounded-sm hover:bg-blue-500/10 hover:border-blue-500/40 transition-all group disabled:opacity-10 disabled:grayscale"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">📤</span>
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest text-center">Push to Cloud<br /><span className="text-[8px] opacity-60">(Local → Cloud)</span></span>
            </button>
          </div>

          {sheetUrl && (
            <button
              onClick={() => window.open(sheetUrl, '_blank')}
              className="w-full py-3 bg-black/40 border border-athena-border text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-white hover:border-slate-500 transition-all rounded-sm"
            >
              🌐 Open Sheet in browser
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/20 border-t border-athena-border flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#21262d] border border-athena-border text-slate-400 text-[11px] font-black uppercase rounded-sm hover:text-white transition-colors"
          >
            SLUITEN
          </button>
        </div>
      </div>
    </div>
  )
}
