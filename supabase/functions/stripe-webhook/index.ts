import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Verifica semnatura Stripe manual
async function verifyStripeSignature(body: string, signature: string, secret: string): Promise<boolean> {
  const parts = Object.fromEntries(signature.split(',').map(p => p.split('=')))
  const timestamp = parts['t']
  const v1 = parts['v1']
  if (!timestamp || !v1) return false

  const payload = `${timestamp}.${body}`
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  const hex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
  return hex === v1
}

Deno.serve(async (req) => {
  const body      = await req.text()
  const signature = req.headers.get('stripe-signature') || ''
  const secret    = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

  const valid = await verifyStripeSignature(body, signature, secret)
  if (!valid) return new Response('Invalid signature', { status: 400 })

  const event = JSON.parse(body)
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  const getUserId = async (customerId: string) => {
    const { data } = await supabase.from('user_profiles').select('id').eq('stripe_customer_id', customerId).single()
    return data?.id
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const userId  = session.metadata?.user_id || await getUserId(session.customer)
    if (!userId) return new Response('OK')

    if (session.mode === 'payment') {
      const credits = parseInt(session.metadata?.credits || '0')
      if (credits > 0) {
        const { data: p } = await supabase.from('user_profiles').select('credits').eq('id', userId).single()
        await supabase.from('user_profiles').update({ credits: (p?.credits || 0) + credits }).eq('id', userId)
        await supabase.from('credit_transactions').insert({
          user_id: userId, amount: credits, type: 'purchase',
          description: `Cumpărare ${credits} credite`,
          stripe_payment_intent_id: session.payment_intent,
        })
      }
    }
  }

  if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
    const sub    = event.data.object
    const userId = await getUserId(sub.customer)
    if (!userId) return new Response('OK')

    const planKey = sub.metadata?.plan_key || ''
    const plan    = planKey.split('_')[0] || 'basic'
    const period  = planKey.includes('yearly') ? 'yearly' : 'monthly'

    await supabase.from('user_profiles').update({ plan, updated_at: new Date().toISOString() }).eq('id', userId)
    await supabase.from('subscriptions').upsert({
      user_id:                userId,
      stripe_subscription_id: sub.id,
      stripe_price_id:        sub.items?.data[0]?.price?.id,
      plan,
      billing_period:         period,
      status:                 sub.status,
      current_period_start:   new Date(sub.current_period_start * 1000).toISOString(),
      current_period_end:     new Date(sub.current_period_end   * 1000).toISOString(),
    }, { onConflict: 'stripe_subscription_id' })
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub    = event.data.object
    const userId = await getUserId(sub.customer)
    if (userId) {
      await supabase.from('user_profiles').update({ plan: 'free' }).eq('id', userId)
      await supabase.from('subscriptions').update({ status: 'canceled' }).eq('stripe_subscription_id', sub.id)
    }
  }

  return new Response('OK')
})
