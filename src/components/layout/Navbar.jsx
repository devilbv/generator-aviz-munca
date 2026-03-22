import { Link, useNavigate } from 'react-router-dom'
import { History, LogOut, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Te-ai deconectat cu succes.')
      navigate('/')
    } catch {
      toast.error('Eroare la deconectare.')
    }
  }

  if (!user) return null

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold text-primary">
          <FileText className="h-5 w-5" />
          <span className="hidden sm:inline">Generator Dosare Aviz de Muncă</span>
          <span className="sm:hidden">Aviz Muncă</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link to="/istoric">
            <Button variant="ghost" size="sm" className="gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Istoric</span>
            </Button>
          </Link>
          <span className="hidden sm:inline text-sm text-muted-foreground">{user.email}</span>
          <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Deconectare</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
