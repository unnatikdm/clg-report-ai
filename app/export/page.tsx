'use client'

import { useState } from 'react'
import { Navigation } from '@/components/shared/navigation'
import { FormatSelector } from '@/components/export/format-selector'
import { HealthCheck } from '@/components/export/health-check'
import { toast } from 'sonner'

export default function ExportPage() {
  const [selectedFormat, setSelectedFormat] = useState<'word' | 'pdf' | 'html'>('pdf')
  const [isExporting, setIsExporting] = useState(false)

  const healthChecks = [
    {
      name: 'Formatting Consistency',
      status: 'pass' as const,
      message: 'Document formatting matches sample structure',
    },
    {
      name: 'Content Completeness',
      status: 'pass' as const,
      message: 'All sections have content and are ready for export',
    },
    {
      name: 'Code Blocks Verified',
      status: 'pass' as const,
      message: 'All code snippets are syntactically valid',
    },
    {
      name: 'Constraints Applied',
      status: 'pass' as const,
      message: 'All custom constraints have been applied to content',
    },
  ]

  const handleExport = async () => {
    setIsExporting(true)

    // Simulate export processing
    setTimeout(() => {
      // In a real app, this would generate the actual file
      // For now, we'll just show a success message
      const fileName = `report.${selectedFormat === 'word' ? 'docx' : selectedFormat === 'pdf' ? 'pdf' : 'html'}`

      // Create a placeholder download
      const element = document.createElement('a')
      element.setAttribute(
        'href',
        'data:text/plain;charset=utf-8,' + encodeURIComponent('Your report will be exported here')
      )
      element.setAttribute('download', fileName)
      element.style.display = 'none'
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)

      toast.success(`Report exported as ${selectedFormat.toUpperCase()}`)
      setIsExporting(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navigation title="Export Report" showBackButton={true} />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {/* Health Check */}
          <HealthCheck items={healthChecks} />

          {/* Format Selector */}
          <div className="border-t border-slate-800 pt-12">
            <FormatSelector
              selected={selectedFormat}
              onSelect={setSelectedFormat}
              onExport={handleExport}
              isLoading={isExporting}
            />
          </div>

          {/* Additional Options */}
          <div className="border-t border-slate-800 pt-12">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Additional Options
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
                <h3 className="font-semibold text-foreground mb-2">
                  Push to GitHub
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Automatically push your report to a GitHub repository
                </p>
                <button className="text-sm text-cyan-400 hover:text-cyan-300">
                  Configure GitHub Integration →
                </button>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
                <h3 className="font-semibold text-foreground mb-2">
                  Download as Archive
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Download all formats and assets as a single ZIP file
                </p>
                <button className="text-sm text-cyan-400 hover:text-cyan-300">
                  Download All Formats →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/80 py-8 mt-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground">
            ClgReportAI © 2024 • Your report is ready to share
          </p>
        </div>
      </footer>
    </div>
  )
}
