const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { image, filename, mimeType } = await req.json()
    if (!image) throw new Error('Image data missing')

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
    if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set')

    // Claude accepta doar imagini, nu PDF
    const mediaType = mimeType?.startsWith('image/') ? mimeType : 'image/jpeg'

    console.log('Scanning passport:', filename, 'mimeType:', mediaType)

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: image },
            },
            {
              type: 'text',
              text: `Extract passport data from this image and return ONLY a JSON object with these exact fields (use empty string if not found):
{
  "employeeName": "full name in UPPERCASE as on passport",
  "birthDate": "DD.MM.YYYY format",
  "birthPlace": "city or country of birth",
  "citizenship": "nationality/country name",
  "passportNumber": "passport number",
  "passportCountryCode": "3-letter ISO country code e.g. ETH, ROU",
  "passportIssueDate": "DD.MM.YYYY format",
  "passportExpiryDate": "DD.MM.YYYY format"
}
Return ONLY valid JSON, no markdown, no explanation.`,
            },
          ],
        }],
      }),
    })

    console.log('Anthropic status:', resp.status)

    if (!resp.ok) {
      const errText = await resp.text()
      throw new Error(`Anthropic API error ${resp.status}: ${errText}`)
    }

    const ai = await resp.json()
    let text = ai.content?.[0]?.text?.trim() || '{}'
    console.log('AI raw response:', text)

    // Curata markdown code blocks daca exista
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()

    // Extrage primul JSON object din text
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found in AI response: ' + text.substring(0, 200))

    const data = JSON.parse(jsonMatch[0])

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('parse-passport error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
