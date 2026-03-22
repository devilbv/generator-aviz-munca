import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { cui } = await req.json()
    if (!cui) throw new Error('CUI lipsă')

    const cuiNumber = parseInt(cui.toString().replace(/[^0-9]/g, ''))
    const today = new Date().toISOString().split('T')[0]

    const resp = await fetch('https://webservicesp.anaf.ro/PlatitorTvaRest/api/v8/ws/tva', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{ cui: cuiNumber, data: today }]),
    })

    if (!resp.ok) throw new Error('ANAF API unavailable')

    const json = await resp.json()
    const company = json?.found?.[0]

    if (!company) {
      return new Response(JSON.stringify({ error: 'CUI negăsit în ONRC' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const general = company.date_generale || {}
    return new Response(JSON.stringify({
      denumire:    general.denumire || '',
      adresa:      general.adresa || '',
      nrOrdineRC:  general.nrRegCom || '',
      cui:         general.cui?.toString() || cui,
      stare:       company.inregistrare_scop_Tva?.dataAnulareInregistrare ? 'Inactiv' : 'Activ',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
