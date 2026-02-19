import { Check, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface HealthCheckItem {
  name: string
  status: 'pass' | 'warning' | 'fail'
  message: string
}

interface HealthCheckProps {
  items: HealthCheckItem[]
}

export function HealthCheck({ items }: HealthCheckProps) {
  const allPassed = items.every((item) => item.status === 'pass')
  const passedCount = items.filter((item) => item.status === 'pass').length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'text-green-400'
      case 'warning':
        return 'text-amber-400'
      case 'fail':
        return 'text-red-400'
      default:
        return 'text-slate-400'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-500/10'
      case 'warning':
        return 'bg-amber-500/10'
      case 'fail':
        return 'bg-red-500/10'
      default:
        return 'bg-slate-500/10'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Report Health Check
        </h2>

        {/* Summary */}
        <Card className="border-slate-700 bg-slate-900/40 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overall Status</p>
              <p className="text-2xl font-bold text-foreground">
                {passedCount}/{items.length} Checks Passed
              </p>
            </div>
            {allPassed && (
              <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-400" />
              </div>
            )}
          </div>
        </Card>

        {/* Checks List */}
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className={`rounded-lg border p-4 ${getStatusBg(
                item.status
              )} border-slate-700`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 mt-0.5 ${getStatusColor(item.status)}`}>
                  {item.status === 'pass' ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`font-semibold ${getStatusColor(item.status)}`}>
                    {item.name}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
