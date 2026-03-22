import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center text-center p-4">
      <div>
        <p className="text-8xl font-black text-muted-foreground/20">404</p>
        <h1 className="mt-2 text-2xl font-bold">Pagina nu a fost găsită</h1>
        <p className="mt-2 text-muted-foreground">Pagina pe care o cauți nu există.</p>
        <Link to="/" className="mt-6 inline-block">
          <Button className="gap-2"><Home className="h-4 w-4" /> Acasă</Button>
        </Link>
      </div>
    </div>
  )
}
