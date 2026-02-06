'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Download, FileText, CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUserRole } from '@/lib/hooks/use-user-role'
import Link from 'next/link'

interface DrillRow {
  title: string
  description: string
  youtube_url: string
  category: string
  difficulty: string
  duration_minutes: string
  tags: string
  equipment: string
  focus_areas: string
}

export default function BulkDrillImportPage() {
  const router = useRouter()
  const { isCoach, isAdmin, loading: profileLoading } = useUserRole()
  const [importing, setImporting] = useState(false)
  const [results, setResults] = useState<{success: number; failed: number; errors: string[]}>({ success: 0, failed: 0, errors: [] })
  const [showResults, setShowResults] = useState(false)

  // Redirect non-coaches
  if (!profileLoading && !isCoach && !isAdmin) {
    router.push('/locker')
    return null
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setShowResults(false)

    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())

      // Skip header row
      const dataLines = lines.slice(1)

      const supabase = createClient()
      let successCount = 0
      let failedCount = 0
      const errors: string[] = []

      for (let i = 0; i < dataLines.length; i++) {
        const line = dataLines[i]
        // Parse CSV (basic - assumes no commas in fields or use proper CSV parser)
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))

        if (values.length < 4) {
          errors.push(`Row ${i + 2}: Invalid format - need at least title, description, youtube_url, category`)
          failedCount++
          continue
        }

        const [title, description, youtube_url, category, difficulty, duration_minutes, tags, equipment, focus_areas] = values

        try {
          // Generate slug from title
          const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

          // Parse tags, equipment, focus_areas (semicolon separated)
          const tagsArray = tags ? tags.split(';').map(t => t.trim()).filter(Boolean) : []
          const equipmentArray = equipment ? equipment.split(';').map(e => e.trim()).filter(Boolean) : []
          const focusAreasArray = focus_areas ? focus_areas.split(';').map(f => f.trim()).filter(Boolean) : []

          const { error } = await supabase.from('drills').insert({
            title: title || 'Untitled Drill',
            slug: slug || `drill-${Date.now()}`,
            description: description || null,
            instructions: null,
            video_url: youtube_url,
            thumbnail_url: null,
            tags: tagsArray,
            category: category || 'mechanics',
            difficulty: difficulty || 'beginner',
            duration_seconds: duration_minutes ? parseInt(duration_minutes) * 60 : 300,
            equipment_needed: equipmentArray,
            focus_areas: focusAreasArray,
            published: true,
            featured: false,
          })

          if (error) throw error
          successCount++
        } catch (err: any) {
          errors.push(`Row ${i + 2} (${title}): ${err.message}`)
          failedCount++
        }
      }

      setResults({ success: successCount, failed: failedCount, errors })
      setShowResults(true)
    } catch (error: any) {
      alert(`Failed to process file: ${error.message}`)
    } finally {
      setImporting(false)
    }
  }

  const downloadTemplate = () => {
    const template = `title,description,youtube_url,category,difficulty,duration_minutes,tags,equipment,focus_areas
Long Toss Progression,Build arm strength through progressive distance throwing,https://youtube.com/watch?v=example1,mechanics,intermediate,15,throwing;arm-strength;velocity,baseball;partner,arm;shoulder;mechanics
Explosive Start Mechanics,Develop explosive first-step quickness,https://youtube.com/watch?v=example2,speed,intermediate,10,speed;baserunning;explosiveness,cones;stopwatch,legs;acceleration
Rotational Power Training,Medicine ball exercises for core rotation,https://youtube.com/watch?v=example3,power,advanced,12,hitting;power;core,medicine-ball;partner,core;rotation;power`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'drill_import_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen p-4 md:p-8 pb-24 lg:pb-8">
      {/* Back Button */}
      <Link href="/admin/drills">
        <button className="btn-ghost mb-6 inline-flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" />
          Back to Drills
        </button>
      </Link>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
          Bulk Drill <span className="text-gradient-orange">Import</span>
        </h1>
        <p className="text-slate-400 text-lg">
          Import multiple drills at once from a CSV file with YouTube links
        </p>
      </div>

      {/* Instructions */}
      <div className="command-panel mb-6">
        <h2 className="text-xl font-bold text-white mb-4">How to Import Drills</h2>
        <ol className="space-y-3 text-slate-300">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange/20 border border-orange/40 flex items-center justify-center text-orange text-sm font-bold">1</span>
            <span>Download the CSV template below</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange/20 border border-orange/40 flex items-center justify-center text-orange text-sm font-bold">2</span>
            <span>Fill in your drill information (one drill per row)</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange/20 border border-orange/40 flex items-center justify-center text-orange text-sm font-bold">3</span>
            <span>Use semicolons (;) to separate multiple tags, equipment, or focus areas</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange/20 border border-orange/40 flex items-center justify-center text-orange text-sm font-bold">4</span>
            <span>Upload your completed CSV file below</span>
          </li>
        </ol>

        <div className="mt-6 p-4 bg-cyan/10 border border-cyan/20 rounded-xl">
          <p className="text-cyan text-sm font-semibold mb-2">💡 Pro Tip: YouTube Video Protection</p>
          <p className="text-slate-300 text-sm">
            YouTube videos are automatically protected - they can't be downloaded by viewers,
            are streamed securely, and you maintain full control through your YouTube channel.
          </p>
        </div>
      </div>

      {/* CSV Format */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Download Template */}
        <div className="command-panel">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
              <Download className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Download Template</h3>
              <p className="text-sm text-slate-400">Get the CSV format with examples</p>
            </div>
          </div>
          <button onClick={downloadTemplate} className="btn-primary w-full">
            <Download className="w-5 h-5 mr-2" />
            Download CSV Template
          </button>
        </div>

        {/* Upload CSV */}
        <div className="command-panel">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange/20 border border-orange/30 flex items-center justify-center">
              <Upload className="w-6 h-6 text-orange" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Upload Drills</h3>
              <p className="text-sm text-slate-400">Import your completed CSV file</p>
            </div>
          </div>
          <label className="block">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={importing}
              className="hidden"
            />
            <div className={`btn-primary w-full text-center cursor-pointer ${importing ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <Upload className="w-5 h-5 mr-2 inline" />
              {importing ? 'Importing...' : 'Upload CSV File'}
            </div>
          </label>
        </div>
      </div>

      {/* CSV Field Reference */}
      <div className="command-panel mb-6">
        <h2 className="text-xl font-bold text-white mb-4">CSV Field Reference</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Field</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Required</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Format</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Example</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5">
                <td className="py-3 px-4 text-white font-mono text-sm">title</td>
                <td className="py-3 px-4"><span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">Required</span></td>
                <td className="py-3 px-4 text-slate-300 text-sm">Text</td>
                <td className="py-3 px-4 text-slate-400 text-sm">Long Toss Progression</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 px-4 text-white font-mono text-sm">description</td>
                <td className="py-3 px-4"><span className="px-2 py-1 bg-slate-700/50 text-slate-400 rounded text-xs">Optional</span></td>
                <td className="py-3 px-4 text-slate-300 text-sm">Text</td>
                <td className="py-3 px-4 text-slate-400 text-sm">Build arm strength and velocity</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 px-4 text-white font-mono text-sm">youtube_url</td>
                <td className="py-3 px-4"><span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">Required</span></td>
                <td className="py-3 px-4 text-slate-300 text-sm">URL</td>
                <td className="py-3 px-4 text-slate-400 text-sm">https://youtube.com/watch?v=abc123</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 px-4 text-white font-mono text-sm">category</td>
                <td className="py-3 px-4"><span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">Required</span></td>
                <td className="py-3 px-4 text-slate-300 text-sm">mechanics | speed | power | recovery | warmup | conditioning</td>
                <td className="py-3 px-4 text-slate-400 text-sm">mechanics</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 px-4 text-white font-mono text-sm">difficulty</td>
                <td className="py-3 px-4"><span className="px-2 py-1 bg-slate-700/50 text-slate-400 rounded text-xs">Optional</span></td>
                <td className="py-3 px-4 text-slate-300 text-sm">beginner | intermediate | advanced</td>
                <td className="py-3 px-4 text-slate-400 text-sm">intermediate</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 px-4 text-white font-mono text-sm">duration_minutes</td>
                <td className="py-3 px-4"><span className="px-2 py-1 bg-slate-700/50 text-slate-400 rounded text-xs">Optional</span></td>
                <td className="py-3 px-4 text-slate-300 text-sm">Number</td>
                <td className="py-3 px-4 text-slate-400 text-sm">15</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 px-4 text-white font-mono text-sm">tags</td>
                <td className="py-3 px-4"><span className="px-2 py-1 bg-slate-700/50 text-slate-400 rounded text-xs">Optional</span></td>
                <td className="py-3 px-4 text-slate-300 text-sm">Semicolon separated</td>
                <td className="py-3 px-4 text-slate-400 text-sm">throwing;arm-strength;velocity</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 px-4 text-white font-mono text-sm">equipment</td>
                <td className="py-3 px-4"><span className="px-2 py-1 bg-slate-700/50 text-slate-400 rounded text-xs">Optional</span></td>
                <td className="py-3 px-4 text-slate-300 text-sm">Semicolon separated</td>
                <td className="py-3 px-4 text-slate-400 text-sm">baseball;partner</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-white font-mono text-sm">focus_areas</td>
                <td className="py-3 px-4"><span className="px-2 py-1 bg-slate-700/50 text-slate-400 rounded text-xs">Optional</span></td>
                <td className="py-3 px-4 text-slate-300 text-sm">Semicolon separated</td>
                <td className="py-3 px-4 text-slate-400 text-sm">arm;shoulder;mechanics</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Import Results */}
      {showResults && (
        <div className="command-panel animate-scale-in">
          <h2 className="text-xl font-bold text-white mb-4">Import Results</h2>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <span className="text-2xl font-bold text-green-400">{results.success}</span>
              </div>
              <p className="text-slate-300 text-sm">Drills imported successfully</p>
            </div>

            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <XCircle className="w-6 h-6 text-red-400" />
                <span className="text-2xl font-bold text-red-400">{results.failed}</span>
              </div>
              <p className="text-slate-300 text-sm">Failed to import</p>
            </div>
          </div>

          {results.errors.length > 0 && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <h3 className="text-red-400 font-semibold">Errors</h3>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {results.errors.map((error, i) => (
                  <p key={i} className="text-sm text-slate-300 font-mono">{error}</p>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <Link href="/admin/drills" className="flex-1">
              <button className="btn-primary w-full">
                View All Drills
              </button>
            </Link>
            <button
              onClick={() => setShowResults(false)}
              className="btn-ghost flex-1"
            >
              Import More
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
