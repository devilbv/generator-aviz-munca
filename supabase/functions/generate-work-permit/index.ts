import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import JSZip from 'https://esm.sh/jszip@3.10.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DOCUMENT_TYPES = [
  'cerere', 'fisa', 'oferta', 'proces', 'opis_aviz',
  'contract_munca', 'contract_comodat', 'scrisoare_garantie',
  'cv', 'offer_letter', 'invitation_letter', 'delegatie_igi', 'organigrama',
]

async function fillTemplate(templateBytes: Uint8Array, replacements: Record<string, string>): Promise<Uint8Array> {
  let xml = new TextDecoder().decode(templateBytes)
  for (const [key, value] of Object.entries(replacements)) {
    xml = xml.replaceAll(`{{${key}}}`, value || '')
  }
  return new TextEncoder().encode(xml)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Utilizator neautentificat')

    const { company, employee } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const zip = new JSZip()

    const replacements: Record<string, string> = {
      COMPANY_NAME:         company.companyName || '',
      CUI:                  company.cui || '',
      REGISTRY_NUMBER:      company.registryNumber || '',
      COMPANY_ADDRESS:      company.companyAddress || '',
      ADMINISTRATOR_NAME:   company.administratorName || '',
      AJOFM1:               company.ajofmCertificateNumber1 || '',
      AJOFM2:               company.ajofmCertificateNumber2 || '',
      REP_NAME:             company.representativeName || '',
      REP_CNP:              company.representativeCNP || '',
      REP_ADDRESS:          company.representativeAddress || '',
      REP_ID_SERIES:        company.representativeIdSeries || '',
      REP_ID_NUMBER:        company.representativeIdNumber || '',
      REP_ID_ISSUED_BY:     company.representativeIdIssuedBy || '',
      EMPLOYEE_NAME:        employee.employeeName || '',
      PASSPORT_NUMBER:      employee.passportNumber || '',
      PASSPORT_COUNTRY:     employee.passportCountryCode || '',
      BIRTH_DATE:           employee.birthDate || '',
      BIRTH_PLACE:          employee.birthPlace || '',
      CITIZENSHIP:          employee.citizenship || '',
      PASSPORT_ISSUE_DATE:  employee.passportIssueDate || '',
      PASSPORT_EXPIRY_DATE: employee.passportExpiryDate || '',
      POSITION:             employee.position || 'Curier',
      COR_CODE:             employee.corCode || '9621',
      MONTHLY_SALARY:       employee.monthlySalary || '4050',
      WORK_LOCATION:        employee.workLocation || 'București',
      VACATION_DAYS:        employee.vacationDays || '21',
      CURRENT_DATE:         new Date().toLocaleDateString('ro-RO'),
      CURRENT_YEAR:         new Date().getFullYear().toString(),
    }

    const generated: string[] = []

    for (const docType of DOCUMENT_TYPES) {
      try {
        const { data, error } = await supabase.storage
          .from('document-templates')
          .download(`${docType}.docx`)

        if (error) { console.warn(`Template missing: ${docType}`); continue }

        const templateBytes = new Uint8Array(await data.arrayBuffer())
        const filled = await fillTemplate(templateBytes, replacements)
        zip.file(`${docType}_${employee.employeeName}.docx`, filled)
        generated.push(docType)
      } catch (e) {
        console.warn(`Failed to generate ${docType}:`, e)
      }
    }

    // Save record to work_permits
    const userResp = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (userResp.data?.user) {
      await supabase.from('work_permits').insert({
        user_id:           userResp.data.user.id,
        company_snapshot:  company,
        employees:         [employee],
        document_types:    generated,
        status:            generated.length > 0 ? 'generated' : 'failed',
        generated_at:      new Date().toISOString(),
      })
    }

    const zipBytes = await zip.generateAsync({ type: 'uint8array' })

    return new Response(zipBytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="Documente_${employee.employeeName}.zip"`,
      },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
