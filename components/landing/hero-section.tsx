export function HeroSection() {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-12 text-center">
      <h1 className="text-5xl font-bold tracking-tight text-balance">
        <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          Architect Your Academic Success
        </span>
      </h1>
      
      <p className="max-w-2xl text-lg text-foreground/80">
        Transform your college reports with AI-powered generation. Upload your sample document and content, 
        and let ClgReportAI create perfectly formatted reports that match your style.
      </p>

      <div className="flex gap-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-cyan-500" />
          Smart Formatting
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-purple-500" />
          AI-Enhanced
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-lime-500" />
          Instant Results
        </span>
      </div>
    </div>
  )
}
