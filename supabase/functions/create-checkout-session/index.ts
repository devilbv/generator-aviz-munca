import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PLANS: Record<string, { price: number; name: string; period: string }> = {
  basic_monthly:   { price: 4900,   name: 'Basic Lunar',    period: 'month' },
  basic_yearly:    { price: 49000,  name: 'Basic Anual',    period: 'year'  },
  pro_monthly:     { price: 9900,   name: 'Pro Lunar',      period: 'month' },
  pro_yearly:      { price: 99000,  name: 'Pro Anual',      period: 'year'  },
  business_monthly:{ price: 19900,  name: 'Business Lunar', period: 'month' },
  business_yearly: { price: 199000, name: 'Business Anual', period: 'year'  },
}

const CREDIT_PACKAGES: Record<string, { price: number; credits: number; name: string }> = {
  credits_10:  { price: 1500,  credits: 10,  name: '10 Dosare' },
  credits_50:  { price: 6000,  credits: 50,  name: '50 Dosare' },
  credits_100: { price: 10000, credits: 100, name: '100 Dosare' },
}

async function stripePost(path: string, body: Record<string, unknown>, secretKey: string) {
  const params = new URLSearchParams()
  const flatten = (obj: Record<string, unknown>, prefix = '') => {
    for (const [k, v] of Object.entries(obj)) {
      const key = prefix ? `${prefix}[${k}]` : k
      if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
        flatten(v as Record<string, unknown>, key)
      } else if (Array.isArray(v)) {
        v.forEach((item, i) => {
          if (typeof item === 'object') flatten(item as Record<string, unknown>, `${key}[${i}]`)
          else params.append(`${key}[${i}]`, String(item))
        })
      } else if (v !== undefined) {
        params.append(key, String(v))
      }
    }
  }
  flatten(body)

  const resp = await fetch(`https://api.stripe.com/v1${path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })
  const data = await resp.json()
  if (!resp.ok) throw new Error(data?.error?.message || 'Stripe error')
  return data
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Neautentificat')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) throw new Error('Utilizator negăsit')

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')!
    const { type, priceKey, successUrl, cancelUrl } = await req.json()

    // Obtine sau creeaza customer Stripe
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id, billing_company, billing_cif, billing_address')
      .eq('id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id
    if (!customerId) {
      const customer = await stripePost('/customers', {
        email: user.email,
        name: profile?.billing_company || user.email,
        'metadata[supabase_user_id]': user.id,
      }, stripeKey)
      customerId = customer.id
      await supabase.from('user_profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
    }

    if (type === 'subscription') {
      const plan = PLANS[priceKey]
      if (!plan) throw new Error('Plan invalid')

      const product = await stripePost('/products', { name: plan.name }, stripeKey)
      const price = await stripePost('/prices', {
        product: product.id,
        unit_amount: plan.price,
        currency: 'ron',
        'recurring[interval]': plan.period,
      }, stripeKey)

      const session = await stripePost('/checkout/sessions', {
        customer: customerId,
        mode: 'subscription',
        'payment_method_types[0]': 'card',
        'line_items[0][price]': price.id,
        'line_items[0][quantity]': 1,
        success_url: successUrl + '?session_id={CHECKOUT_SESSION_ID}&type=subscription&plan=' + priceKey.split('_')[0],
        cancel_url: cancelUrl,
        'metadata[user_id]': user.id,
        'metadata[plan_key]': priceKey,
      }, stripeKey)

      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (type === 'credits') {
      const pkg = CREDIT_PACKAGES[priceKey]
      if (!pkg) throw new Error('Pachet invalid')

      const product = await stripePost('/products', { name: pkg.name }, stripeKey)
      const price = await stripePost('/prices', {
        product: product.id,
        unit_amount: pkg.price,
        currency: 'ron',
      }, stripeKey)

      const session = await stripePost('/checkout/sessions', {
        customer: customerId,
        mode: 'payment',
        'payment_method_types[0]': 'card',
        'line_items[0][price]': price.id,
        'line_items[0][quantity]': 1,
        success_url: successUrl + '?session_id={CHECKOUT_SESSION_ID}&type=credits&credits=' + pkg.credits,
        cancel_url: cancelUrl,
        'metadata[user_id]': user.id,
        'metadata[credits]': pkg.credits.toString(),
      }, stripeKey)

      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    throw new Error('Tip invalid')
  } catch (err) {
    console.error('checkout error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
