import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const body      = await req.text()
  const signature = req.headers.get('stripe-signature')!
  const stripe    = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2023-10-16' })
  const supabase  = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, Deno.env.get('STRIPE_WEBHOOK_SECRET')!)
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  const getUserId = async (customerId: string) => {
    const { data } = await supabase.from('user_profiles').select('id').eq('stripe_customer_id', customerId).single()
    return data?.id
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId  = session.metadata?.user_id || await getUserId(session.customer as string)
    if (!userId) return new Response('OK')

    if (session.mode === 'payment') {
      // Credite
      const credits = parseInt(session.metadata?.credits || '0')
      if (credits > 0) {
        await supabase.from('user_profiles').update({ credits: supabase.rpc('increment_credits', { x: credits }) }).eq('id', userId)
        // Simplu: incrementam direct
        const { data: p } = await supabase.from('user_profiles').select('credits').eq('id', userId).single()
        await supabase.from('user_profiles').update({ credits: (p?.credits || 0) + credits }).eq('id', userId)
        await supabase.from('credit_transactions').insert({
          user_id: userId, amount: credits, type: 'purchase',
          description: `Cumpărare ${credits} credite`,
          stripe_payment_intent_id: session.payment_intent as string,
        })
      }
    }
  }

  if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
    const sub    = event.data.object as Stripe.Subscription
    const userId = await getUserId(sub.customer as string)
    if (!userId) return new Response('OK')

    const planKey = sub.metadata?.plan_key || ''
    const plan    = planKey.split('_')[0] || 'basic'
    const period  = planKey.includes('yearly') ? 'yearly' : 'monthly'

    await supabase.from('user_profiles').update({ plan, updated_at: new Date().toISOString() }).eq('id', userId)

    await supabase.from('subscriptions').upsert({
      user_id:               userId,
      stripe_subscription_id: sub.id,
      stripe_price_id:       sub.items.data[0]?.price.id,
      plan,
      billing_period:        period,
      status:                sub.status,
      current_period_start:  new Date(sub.current_period_start * 1000).toISOString(),
      current_period_end:    new Date(sub.current_period_end   * 1000).toISOString(),
    }, { onConflict: 'stripe_subscription_id' })
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub    = event.data.object as Stripe.Subscription
    const userId = await getUserId(sub.customer as string)
    if (userId) {
      await supabase.from('user_profiles').update({ plan: 'free' }).eq('id', userId)
      await supabase.from('subscriptions').update({ status: 'canceled' }).eq('stripe_subscription_id', sub.id)
    }
  }

  return new Response('OK')
})
