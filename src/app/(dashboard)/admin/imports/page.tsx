'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUserRole } from '@/lib/hooks/use-user-role'
import { Upload, FileUp, Loader2, CheckCircle2, AlertCircle, Zap } from 'lucide-react'
import { toastSuccess, toastError } from '@/lib/toast'

const DEVICE_OPTIONS = [
  { value: 'rapsodo', label: 'Rapsodo', description: 'Pitching/hitting data (velocity, spin rate, break)' },
  { value: 'blast_motion', label: 'Blast Motion', description: 'Bat sensor data (bat speed, attack angle, power)' },
  { value: 'pocket_radar', label: 'Pocket Radar', description: 'Speed readings (velocity)' },
  { value: 'hittrax', label: 'HitTrax', description: 'Batting cage data (exit velo, launch angle, distance)' },
]

export default function AdminImportsPage() {
  const { isCoach, isAdmin, profile } = useUserRole()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [athletes, setAthletes] = useState<any[]>([])
  const [imports, setImports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  const [selectedAthlete, setSelectedAthlete] = useState('')
  const [selectedDevice, setSelectedDevice] = useState('rapsodo')
  const [csvContent, setCsvContent] = useState('')
  const [fileName, setFileName] = useState('')
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    async function fetchData() {
      const [{ data: athleteData }, { data: importData }] = await Promise.all([
        supabase.from('profiles').select('id, full_name').eq('role', 'athlete').order('full_name'),
        supabase.from('device_imports').select('*, athlete:athlete_id(full_name)').order('created_at', { ascending: false }).limit(20),
      ])
      if (athleteData) setAthletes(athleteData)
      if (importData) setImports(importData)
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (ev) => {
      setCsvContent(ev.target?.result as string)
    }
    reader.readAsText(file)
  }

  const handleUpload = async () => {
    if (!selectedAthlete || !csvContent || uploading) return
    setUploading(true)
    setResult(null)

    try {
      const res = await fetch('/api/imports/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          athleteId: selectedAthlete,
          deviceType: selectedDevice,
          csvData: csvContent,
          fileName,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setResult(data)
        toastSuccess(`Imported ${data.processed} records successfully`)
        setCsvContent('')
        setFileName('')
        if (fileInputRef.current) fileInputRef.current.value = ''

        // Refresh imports list
        const { data: importData } = await supabase
          .from('device_imports')
          .select('*, athlete:athlete_id(full_name)')
          .order('created_at', { ascending: false })
          .limit(20)
        if (importData) setImports(importData)
      } else {
        toastError(data.error || 'Import failed')
        setResult(data)
      }
    } catch (err: any) {
      toastError(err.message || 'Import failed')
    } finally {
      setUploading(false)
    }
  }

  if (!isCoach && !isAdmin) {
    return <div className="p-8 text-center text-slate-500">Access denied</div>
  }

  return (
    <div className="min-h-screen px-3 py-4 md:p-8 pb-24 lg:pb-8">
      <div className="flex items-center gap-3 mb-8">
        <Upload className="w-8 h-8 text-purple-400" />
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white">Data Import</h1>
          <p className="text-cyan-800 dark:text-white/60 text-sm">Import data from Rapsodo, Blast Motion, Pocket Radar, HitTrax</p>
        </div>
      </div>

      {/* Upload Form */}
      <div className="glass-card p-6 mb-8">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Import Device Data</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-1">Athlete</label>
            <select
              value={selectedAthlete}
              onChange={(e) => setSelectedAthlete(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-white/10 border border-slate-200 dark:border-white/20 text-slate-900 dark:text-white"
            >
              <option value="">Select athlete...</option>
              {athletes.map(a => (
                <option key={a.id} value={a.id}>{a.full_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-1">Device</label>
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-white/10 border border-slate-200 dark:border-white/20 text-slate-900 dark:text-white"
            >
              {DEVICE_OPTIONS.map(d => (
                <option key={d.value} value={d.value}>{d.label} — {d.description}</option>
              ))}
            </select>
          </div>
        </div>

        {/* File Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-1">CSV File</label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-cyan transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            {fileName ? (
              <div className="flex items-center justify-center gap-2">
                <FileUp className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-slate-900 dark:text-white">{fileName}</span>
                <span className="text-xs text-slate-500">({csvContent.split('\n').length - 1} rows)</span>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-white/50">Click to select a CSV file</p>
                <p className="text-xs text-slate-400 mt-1">Supported: .csv, .txt</p>
              </>
            )}
          </div>
        </div>

        <button
          onClick={handleUpload}
          disabled={!selectedAthlete || !csvContent || uploading}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          {uploading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
          ) : (
            <><Zap className="w-4 h-4" /> Import Data</>
          )}
        </button>

        {/* Result */}
        {result && (
          <div className={`mt-4 p-4 rounded-lg ${result.success ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
            {result.success ? (
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-500">Import Complete</p>
                  <p className="text-xs text-slate-600 dark:text-white/60 mt-1">
                    {result.processed} of {result.totalRecords} records imported
                  </p>
                  {result.errors?.length > 0 && (
                    <p className="text-xs text-orange mt-1">{result.errors.length} warnings</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-400">Import Failed</p>
                  <p className="text-xs text-slate-600 dark:text-white/60 mt-1">{result.error}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Import History */}
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Import History</h3>
      {loading ? (
        <div className="text-center py-8"><Loader2 className="w-6 h-6 text-orange animate-spin mx-auto" /></div>
      ) : imports.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <p className="text-sm text-slate-500 dark:text-white/50">No imports yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {imports.map((imp: any) => (
            <div key={imp.id} className="glass-card p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                imp.status === 'completed' ? 'bg-green-500/20 text-green-500' : imp.status === 'failed' ? 'bg-red-500/20 text-red-400' : 'bg-orange/20 text-orange'
              }`}>
                {imp.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : imp.status === 'failed' ? <AlertCircle className="w-5 h-5" /> : <Loader2 className="w-5 h-5 animate-spin" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {(imp.athlete as any)?.full_name || 'Unknown'} — {imp.device_type}
                </p>
                <p className="text-xs text-slate-500 dark:text-white/50">
                  {imp.records_processed}/{imp.records_count} records • {new Date(imp.created_at).toLocaleDateString()}
                  {imp.file_name && ` • ${imp.file_name}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
