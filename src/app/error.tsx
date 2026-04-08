'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-red-500">500</h1>
        <h2 className="text-xl font-semibold text-white">Algo deu errado</h2>
        <p className="text-slate-400">{error.message || 'Ocorreu um erro inesperado.'}</p>
        <Button
          className="bg-[#4b53bc] hover:bg-[#4b53bc]/90 mt-4"
          onClick={reset}
        >
          Tentar novamente
        </Button>
      </div>
    </div>
  )
}
