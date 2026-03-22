import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Uses Claude AI via Anthropic API to extract passport data from image
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { image, filename, mimeType } = await req.json()
    if (!image) throw new Error('Image data missing')

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
    if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set')

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
              source: { type: 'base64', media_type: mimeType || 'image/jpeg', data: image },
            },
            {
              type: 'text',
              text: `Extract passport data from this image and return ONLY a JSON object with these fields (use empty string if not found):
{
  "employeeName": "full name as on passport",
  "birthDate": "YYYY-MM-DD",
  "birthPlace": "city/country",
  "citizenship": "nationality",
  "passportNumber": "passport number",
  "passportCountryCode": "3-letter country code",
  "passportIssueDate": "YYYY-MM-DD",
  "passportExpiryDate": "YYYY-MM-DD"
}
Return ONLY valid JSON, no markdown.`,
            },
          ],
        }],
      }),
    })

    if (!resp.ok) throw new Error('AI API error: ' + resp.statusText)
    const ai = await resp.json()
    const text = ai.content?.[0]?.text || '{}'
    const data = JSON.parse(text)

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
