import { Link, useNavigate } from 'react-router-dom'
import { History, LogOut, FileText, Zap, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { useBilling } from '@/hooks/useBilling'
import { toast } from 'sonner'

const PLAN_COLORS = { free: 'bg-gray-100 text-gray-600', basic: 'bg-blue-100 text-blue-700', pro: 'bg-primary/10 text-primary', business: 'bg-purple-100 text-purple-700' }

export default function Navbar() {
  const { user, signOut } = useAuth()
  const { plan, planLabel, docsUsed, docsLimit, credits, loading } = useBilling()
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

  const showWarning = docsLimit !== -1 && !loading && (docsUsed >= docsLimit && credits === 0)

  return (
    <>
      {showWarning && (
        <div className="bg-red-500 text-white text-center text-sm py-2 px-4">
          Ai atins limita de documente.{' '}
          <Link to="/pricing" className="underline font-semibold">Upgradează planul</Link> sau cumpără credite.
        </div>
      )}
      <header className="sticky top-0 z-40 border-b bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex h-14 items-center justify-between">
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
            {/* Badge plan */}
            {!loading && (
              <Link to="/pricing">
                <span className={`hidden sm:inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer hover:opacity-80 transition ${PLAN_COLORS[plan] || PLAN_COLORS.free}`}>
                  <Zap className="h-3 w-3" />
                  {planLabel}
                  {docsLimit !== -1 && ` · ${docsUsed}/${docsLimit}`}
                </span>
              </Link>
            )}

            {/* Credite / Generări rămase */}
            {!loading && credits > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700">
                <CreditCard className="h-3 w-3" />
                {plan === 'free' ? `${credits} generări gratuite` : `${credits} credite`}
              </span>
            )}

            <Link to="/istoric">
              <Button variant="ghost" size="sm" className="gap-2">
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">Istoric</span>
              </Button>
            </Link>

            <Link to="/pricing">
              <Button variant="ghost" size="sm" className="gap-1 hidden sm:flex">
                <Zap className="h-4 w-4" /> Upgrade
              </Button>
            </Link>

            <span className="hidden lg:inline text-sm text-muted-foreground">{user.email}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Deconectare</span>
            </Button>
          </div>
        </div>
      </header>
    </>
  )
}
