import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export default function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeClass = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-10 w-10' : 'h-6 w-6'
  return (
    <div className="flex items-center justify-center gap-2 py-8" role="status" aria-live="polite">
      <Loader2 className={`${sizeClass} animate-spin text-blue-600`} aria-hidden="true" />
      {text && <span className="text-gray-600 text-sm">{text}</span>}
    </div>
  )
}
