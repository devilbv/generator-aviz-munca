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
    <header className="sticky top-0 z-40 border-b bg-white shadow-sm">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="font-semibold text-sm leading-tight text-gray-900">Generator Dosare Aviz de Muncă</p>
            <p className="text-xs text-gray-400 leading-tight">Automatizare completă</p>
          </div>
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
