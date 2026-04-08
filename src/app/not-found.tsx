import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-[#4b53bc]">404</h1>
        <h2 className="text-xl font-semibold text-white">Página não encontrada</h2>
        <p className="text-slate-400">A página que você está procurando não existe.</p>
        <Button asChild className="bg-[#4b53bc] hover:bg-[#4b53bc]/90 mt-4">
          <Link href="/dashboard">Ir para o Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
