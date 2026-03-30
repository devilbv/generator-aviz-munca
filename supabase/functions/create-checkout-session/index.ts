import Stripe from 'npm:stripe@14.21.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PLANS = {
  basic_monthly:  { price: 4900,  name: 'Basic Lunar',   docs: 50,        period: 'monthly'  },
  basic_yearly:   { price: 49000, name: 'Basic Anual',   docs: 50,        period: 'yearly'   },
  pro_monthly:    { price: 9900,  name: 'Pro Lunar',     docs: 200,       period: 'monthly'  },
  pro_yearly:     { price: 99000, name: 'Pro Anual',     docs: 200,       period: 'yearly'   },
  business_monthly:{ price: 19900, name: 'Business Lunar', docs: -1,      period: 'monthly'  },
  business_yearly: { price: 199000,name: 'Business Anual', docs: -1,      period: 'yearly'   },
}

const CREDIT_PACKAGES = {
  credits_10:  { price: 1500,  credits: 10,  name: '10 Credite'  },
  credits_50:  { price: 6000,  credits: 50,  name: '50 Credite'  },
  credits_100: { price: 10000, credits: 100, name: '100 Credite' },
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

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2023-10-16' })

    const { type, priceKey, successUrl, cancelUrl } = await req.json()

    // Obtine sau creeaza customer Stripe
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id
      await supabase.from('user_profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
    }

    if (type === 'subscription') {
      const plan = PLANS[priceKey]
      if (!plan) throw new Error('Plan invalid')

      // Creeaza produs + pret Stripe on-the-fly (test mode)
      const product = await stripe.products.create({ name: plan.name })
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.price,
        currency: 'ron',
        recurring: { interval: plan.period === 'yearly' ? 'year' : 'month' },
      })

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: price.id, quantity: 1 }],
        success_url: successUrl + '?session_id={CHECKOUT_SESSION_ID}&type=subscription&plan=' + priceKey.split('_')[0],
        cancel_url: cancelUrl,
        metadata: { user_id: user.id, plan_key: priceKey },
      })

      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (type === 'credits') {
      const pkg = CREDIT_PACKAGES[priceKey]
      if (!pkg) throw new Error('Pachet invalid')

      const product = await stripe.products.create({ name: pkg.name })
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: pkg.price,
        currency: 'ron',
      })

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{ price: price.id, quantity: 1 }],
        success_url: successUrl + '?session_id={CHECKOUT_SESSION_ID}&type=credits&credits=' + pkg.credits,
        cancel_url: cancelUrl,
        metadata: { user_id: user.id, credits: pkg.credits.toString() },
      })

      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    throw new Error('Tip invalid')
  } catch (err) {
    console.error(err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
