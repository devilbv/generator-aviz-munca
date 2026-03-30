import { useState } from 'react'
import { Check, Zap, Building2, Star, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBilling } from '@/hooks/useBilling'
import { useAuth } from '@/context/AuthContext'
import { Navigate } from 'react-router-dom'

const PLANS = [
  {
    key: 'basic',
    name: 'Basic',
    icon: Zap,
    monthly: 49,
    yearly: 490,
    yearlyDiscount: 16,
    docs: 50,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    features: ['50 documente/lună', 'Toate cele 13 tipuri de documente', 'Import CSV', 'Scanare pașapoarte (OCR)', 'Istoric dosare'],
  },
  {
    key: 'pro',
    name: 'Pro',
    icon: Star,
    monthly: 99,
    yearly: 990,
    yearlyDiscount: 16,
    docs: 200,
    color: 'text-primary',
    bg: 'bg-primary/5',
    border: 'border-primary/30',
    popular: true,
    features: ['200 documente/lună', 'Toate cele 13 tipuri de documente', 'Import CSV + OCR', 'Generare ZIP batch', 'Istoric dosare', 'Prioritate suport'],
  },
  {
    key: 'business',
    name: 'Business',
    icon: Building2,
    monthly: 199,
    yearly: 1990,
    yearlyDiscount: 16,
    docs: -1,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    features: ['Documente nelimitate', 'Toate cele 13 tipuri de documente', 'Import CSV + OCR', 'Generare ZIP batch', 'Istoric dosare', 'Suport dedicat'],
  },
]

const CREDITS = [
  { key: 'credits_10',  credits: 10,  price: 15,  perCredit: '1.50' },
  { key: 'credits_50',  credits: 50,  price: 60,  perCredit: '1.20', popular: true },
  { key: 'credits_100', credits: 100, price: 100, perCredit: '1.00' },
]

export default function PricingPage() {
  const [yearly, setYearly]   = useState(false)
  const [loading, setLoading] = useState({})
  const { checkout, plan: currentPlan } = useBilling()
  const { session } = useAuth()

  if (!session) return <Navigate to="/" replace />

  const handleCheckout = async (type, key) => {
    setLoading(l => ({ ...l, [key]: true }))
    await checkout(type, key)
    setLoading(l => ({ ...l, [key]: false }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-12">

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Planuri și Prețuri</h1>
          <p className="text-gray-500 text-lg">Alege planul potrivit pentru nevoile tale</p>

          {/* Toggle lunar/anual */}
          <div className="inline-flex items-center gap-3 bg-white rounded-xl border p-1 shadow-sm">
            <button onClick={() => setYearly(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!yearly ? 'bg-primary text-white shadow-sm' : 'text-gray-500'}`}>
              Lunar
            </button>
            <button onClick={() => setYearly(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${yearly ? 'bg-primary text-white shadow-sm' : 'text-gray-500'}`}>
              Anual <span className="ml-1 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">-16%</span>
            </button>
          </div>
        </div>

        {/* Planuri abonament */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map(plan => {
            const Icon    = plan.icon
            const price   = yearly ? plan.yearly : plan.monthly
            const priceKey = `${plan.key}_${yearly ? 'yearly' : 'monthly'}`
            const isCurrent = currentPlan === plan.key

            return (
              <div key={plan.key} className={`relative rounded-2xl border-2 bg-white p-6 shadow-sm flex flex-col ${plan.popular ? 'border-primary shadow-lg' : 'border-gray-200'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                    CEL MAI POPULAR
                  </div>
                )}
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${plan.bg}`}>
                  <Icon className={`h-6 w-6 ${plan.color}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-2 mb-4">
                  <span className="text-3xl font-bold text-gray-900">{price}</span>
                  <span className="text-gray-500"> RON/{yearly ? 'an' : 'lună'}</span>
                  {yearly && <p className="text-xs text-green-600 mt-0.5">economisești {Math.round(plan.monthly * 12 - plan.yearly)} RON/an</p>}
                </div>
                <p className={`text-sm font-medium ${plan.color} mb-4`}>
                  {plan.docs === -1 ? 'Documente nelimitate' : `${plan.docs} documente/lună`}
                </p>
                <ul className="space-y-2 flex-1 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="h-4 w-4 text-green-500 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                  disabled={isCurrent || loading[priceKey]}
                  onClick={() => handleCheckout('subscription', priceKey)}
                >
                  {loading[priceKey] ? 'Se procesează...' : isCurrent ? 'Plan activ' : `Alege ${plan.name}`}
                </Button>
              </div>
            )
          })}
        </div>

        {/* Credite prepaid */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Credite Prepaid</h2>
            <p className="text-gray-500 mt-1">1 credit = 1 document generat. Nu expiră niciodată.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CREDITS.map(pkg => (
              <div key={pkg.key} className={`relative rounded-2xl border-2 bg-white p-6 text-center shadow-sm ${pkg.popular ? 'border-primary' : 'border-gray-200'}`}>
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                    CEL MAI BUN PREȚ
                  </div>
                )}
                <CreditCard className="h-8 w-8 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900">{pkg.credits}</div>
                <div className="text-gray-500 text-sm mb-3">credite</div>
                <div className="text-2xl font-bold text-gray-900">{pkg.price} <span className="text-base font-normal text-gray-500">RON</span></div>
                <div className="text-xs text-gray-400 mb-4">{pkg.perCredit} RON/credit</div>
                <Button
                  className="w-full"
                  variant={pkg.popular ? 'default' : 'outline'}
                  disabled={loading[pkg.key]}
                  onClick={() => handleCheckout('credits', pkg.key)}
                >
                  {loading[pkg.key] ? 'Se procesează...' : 'Cumpără'}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Plan gratuit */}
        <div className="rounded-2xl border bg-white p-6 text-center text-sm text-gray-500">
          Planul gratuit include <strong>5 documente</strong> la înregistrare. Creditele rămase se pot folosi oricând.
        </div>
      </div>
    </div>
  )
}
