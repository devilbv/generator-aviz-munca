import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useBilling } from '@/hooks/useBilling'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function BillingSuccessPage() {
  const [searchParams] = useSearchParams()
  const { fetchProfile } = useBilling()
  const [loading, setLoading] = useState(true)

  const type    = searchParams.get('type')
  const plan    = searchParams.get('plan')
  const credits = searchParams.get('credits')

  useEffect(() => {
    const timer = setTimeout(async () => {
      await fetchProfile()
      setLoading(false)
    }, 2000) // asteapta webhook-ul sa proceseze
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border p-10 max-w-md w-full text-center space-y-5">
        {loading ? (
          <>
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-gray-900">Se procesează plata...</h2>
            <p className="text-sm text-gray-500">Un moment, activăm contul tău.</p>
          </>
        ) : (
          <>
            <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900">Plată reușită!</h2>
            {type === 'subscription' && plan && (
              <p className="text-sm text-gray-600">
                Planul <strong className="capitalize">{plan}</strong> a fost activat cu succes.
              </p>
            )}
            {type === 'credits' && credits && (
              <p className="text-sm text-gray-600">
                Ai primit <strong>{credits} credite</strong> în cont.
              </p>
            )}
            <Button asChild className="w-full mt-2">
              <Link to="/">Mergi la aplicație</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
