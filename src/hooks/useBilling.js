import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

const PLAN_LIMITS = { free: 10, basic: 50, pro: 200, business: -1 }
const PLAN_LABELS = { free: 'Gratuit', basic: 'Basic', pro: 'Pro', business: 'Business' }

export function useBilling() {
  const { user, session } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading]  = useState(true)

  useEffect(() => {
    if (user) fetchProfile()
  }, [user])

  const fetchProfile = async () => {
    const { data } = await supabase.from('user_profiles').select('*').eq('id', user.id).single()
    setProfile(data)
    setLoading(false)
  }

  const canGenerate = () => {
    if (!profile) return false
    const limit = PLAN_LIMITS[profile.plan] ?? 5
    if (limit === -1) return true
    // Verifica reset lunar
    const resetAt = new Date(profile.month_reset_at)
    const now     = new Date()
    if (now.getFullYear() !== resetAt.getFullYear() || now.getMonth() !== resetAt.getMonth()) return true
    return (profile.docs_this_month || 0) < limit || (profile.credits || 0) > 0
  }

  const recordUsage = async () => {
    if (!profile) return
    const limit = PLAN_LIMITS[profile.plan] ?? 5
    if (limit === -1) return // business - nelimitat

    const now     = new Date()
    const resetAt = new Date(profile.month_reset_at)
    const sameMonth = now.getFullYear() === resetAt.getFullYear() && now.getMonth() === resetAt.getMonth()

    if (!sameMonth) {
      // Reset lunar
      await supabase.from('user_profiles').update({
        docs_this_month: 1,
        month_reset_at:  now.toISOString().split('T')[0].slice(0, 7) + '-01',
      }).eq('id', user.id)
    } else if ((profile.docs_this_month || 0) < limit) {
      await supabase.from('user_profiles').update({ docs_this_month: (profile.docs_this_month || 0) + 1 }).eq('id', user.id)
    } else if ((profile.credits || 0) > 0) {
      // Foloseste credit
      await supabase.from('user_profiles').update({ credits: profile.credits - 1 }).eq('id', user.id)
      await supabase.from('credit_transactions').insert({
        user_id: user.id, amount: -1, type: 'usage', description: 'Generare document',
      })
    }
    await fetchProfile()
  }

  const docsUsed  = profile?.docs_this_month || 0
  const docsLimit = PLAN_LIMITS[profile?.plan || 'free']
  const credits   = profile?.credits || 0
  const plan      = profile?.plan || 'free'
  const planLabel = PLAN_LABELS[plan]

  const checkout = async (type, priceKey) => {
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession()
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          type,
          priceKey,
          successUrl: window.location.origin + '/billing/success',
          cancelUrl:  window.location.origin + '/pricing',
        },
        headers: { Authorization: `Bearer ${authSession?.access_token}` },
      })
      if (error) throw error
      if (data?.url) window.location.href = data.url
    } catch (err) {
      toast.error('Eroare la checkout: ' + err.message)
    }
  }

  return { profile, loading, canGenerate, recordUsage, docsUsed, docsLimit, credits, plan, planLabel, checkout, refetch: fetchProfile }
}
