const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { cui } = await req.json()
    if (!cui) throw new Error('CUI lipsă')

    const cuiNumber = parseInt(cui.toString().replace(/[^0-9]/g, ''))
    const today = new Date().toISOString().split('T')[0]

    console.log('Cauta CUI:', cuiNumber, 'data:', today)

    const resp = await fetch('https://webservicesp.anaf.ro/api/PlatitorTvaRest/v9/tva', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{ cui: cuiNumber, data: today }]),
    })

    console.log('ANAF status:', resp.status)

    if (!resp.ok) throw new Error(`ANAF API error: ${resp.status}`)

    const json = await resp.json()
    console.log('ANAF response:', JSON.stringify(json).substring(0, 200))

    const company = json?.found?.[0]

    if (!company) {
      return new Response(JSON.stringify({ error: 'CUI negăsit în ONRC' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const general = company.date_generale || {}
    return new Response(JSON.stringify({
      denumire:   general.denumire || '',
      adresa:     general.adresa || '',
      nrOrdineRC: general.nrRegCom || '',
      cui:        general.cui?.toString() || cui,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Eroare:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
