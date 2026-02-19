'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { HeroSection } from '@/components/landing/hero-section'
import { FileUpload } from '@/components/landing/file-upload'
import { FilePreview } from '@/components/landing/file-preview'
import { useFileUpload } from '@/hooks/use-file-upload'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { toast } from 'sonner'

export default function LandingPage() {
  const router = useRouter()
  const { uploadFile } = useFileUpload()
  
  const [sampleFile, setSampleFile] = useLocalStorage<{
    name: string
    content: string
  } | null>('clg-sample-file', null)
  
  const [contentFile, setContentFile] = useLocalStorage<{
    name: string
    content: string
  } | null>('clg-content-file', null)

  const [isUploading, setIsUploading] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const handleSampleFileSelect = async (file: File) => {
    setIsUploading(true)
    const result = await uploadFile(file)
    if (result) {
      setSampleFile({
        name: result.name,
        content: result.content,
      })
    }
    setIsUploading(false)
  }

  const handleContentFileSelect = async (file: File) => {
    setIsUploading(true)
    const result = await uploadFile(file)
    if (result) {
      setContentFile({
        name: result.name,
        content: result.content,
      })
    }
    setIsUploading(false)
  }

  const handleStartBuilding = () => {
    if (!sampleFile || !contentFile) {
      toast.error('Please upload both sample and content files')
      return
    }

    // Store files for workspace to access
    localStorage.setItem(
      'clg-workspace-initial',
      JSON.stringify({
        sampleDocument: sampleFile,
        newContent: contentFile,
      })
    )

    router.push('/workspace')
  }

  if (!isHydrated) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500" />
              <h1 className="text-xl font-bold text-foreground">ClgReportAI</h1>
            </div>
            <div className="text-sm text-muted-foreground">
              AI-Powered College Report Generation
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <HeroSection />

        {/* File Upload Section */}
        <div className="grid gap-8 py-12 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Step 1: Sample Document
              </h2>
              <p className="text-sm text-muted-foreground">
                Upload a document that matches your desired formatting and style
              </p>
            </div>
            
            {sampleFile ? (
              <FilePreview
                fileName={sampleFile.name}
                content={sampleFile.content}
                onRemove={() => setSampleFile(null)}
              />
            ) : (
              <FileUpload
                label="Upload Sample Document"
                onFileSelect={handleSampleFileSelect}
                disabled={isUploading}
              />
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Step 2: Content to Transform
              </h2>
              <p className="text-sm text-muted-foreground">
                Upload the content that will be transformed using your sample's formatting
              </p>
            </div>
            
            {contentFile ? (
              <FilePreview
                fileName={contentFile.name}
                content={contentFile.content}
                onRemove={() => setContentFile(null)}
              />
            ) : (
              <FileUpload
                label="Upload Content Document"
                onFileSelect={handleContentFileSelect}
                disabled={isUploading}
              />
            )}
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center py-12">
          <Button
            onClick={handleStartBuilding}
            disabled={!sampleFile || !contentFile || isUploading}
            size="lg"
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-8 neon-cyan-glow"
          >
            {isUploading ? 'Processing Files...' : 'Start Building Report'}
          </Button>
        </div>

        {/* Info Cards */}
        <div className="grid gap-6 py-12 md:grid-cols-3">
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6">
            <div className="mb-3 h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <span className="text-lg font-bold text-cyan-400">1</span>
            </div>
            <h3 className="mb-2 font-semibold text-foreground">Analyze Format</h3>
            <p className="text-sm text-muted-foreground">
              AI learns the structure and style from your sample document
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6">
            <div className="mb-3 h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <span className="text-lg font-bold text-purple-400">2</span>
            </div>
            <h3 className="mb-2 font-semibold text-foreground">Transform Content</h3>
            <p className="text-sm text-muted-foreground">
              Apply the learned formatting to your new content automatically
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6">
            <div className="mb-3 h-10 w-10 rounded-lg bg-lime-500/10 flex items-center justify-center">
              <span className="text-lg font-bold text-lime-400">3</span>
            </div>
            <h3 className="mb-2 font-semibold text-foreground">Export & Polish</h3>
            <p className="text-sm text-muted-foreground">
              Download your formatted report in Word, PDF, or HTML
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/80 py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground">
            ClgReportAI © 2024 • Architect Your Academic Success
          </p>
        </div>
      </footer>
    </div>
  )
}
