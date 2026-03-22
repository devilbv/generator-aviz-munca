import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Replaces {{FIELD}} placeholders in DOCX XML
async function fillTemplate(templateBytes: Uint8Array, replacements: Record<string, string>): Promise<Uint8Array> {
  // Decode the DOCX (ZIP) to find word/document.xml and replace placeholders
  // This is a simplified approach — for production use a proper DOCX templating library
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

    const { company, employee, documentType } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Download template from Storage
    const { data: templateData, error: dlError } = await supabase.storage
      .from('document-templates')
      .download(`${documentType}.docx`)

    if (dlError) throw new Error(`Template '${documentType}' negăsit în Storage`)

    const templateBytes = new Uint8Array(await templateData.arrayBuffer())

    // Build replacements map
    const replacements: Record<string, string> = {
      COMPANY_NAME:        company.companyName || '',
      CUI:                 company.cui || '',
      REGISTRY_NUMBER:     company.registryNumber || '',
      COMPANY_ADDRESS:     company.companyAddress || '',
      ADMINISTRATOR_NAME:  company.administratorName || '',
      AJOFM1:              company.ajofmCertificateNumber1 || '',
      AJOFM2:              company.ajofmCertificateNumber2 || '',
      REP_NAME:            company.representativeName || '',
      REP_CNP:             company.representativeCNP || '',
      REP_ADDRESS:         company.representativeAddress || '',
      REP_ID_SERIES:       company.representativeIdSeries || '',
      REP_ID_NUMBER:       company.representativeIdNumber || '',
      REP_ID_ISSUED_BY:    company.representativeIdIssuedBy || '',
      EMPLOYEE_NAME:       employee.employeeName || '',
      PASSPORT_NUMBER:     employee.passportNumber || '',
      PASSPORT_COUNTRY:    employee.passportCountryCode || '',
      BIRTH_DATE:          employee.birthDate || '',
      BIRTH_PLACE:         employee.birthPlace || '',
      CITIZENSHIP:         employee.citizenship || '',
      PASSPORT_ISSUE_DATE: employee.passportIssueDate || '',
      PASSPORT_EXPIRY_DATE: employee.passportExpiryDate || '',
      POSITION:            employee.position || 'Curier',
      COR_CODE:            employee.corCode || '9621',
      MONTHLY_SALARY:      employee.monthlySalary || '4050',
      WORK_LOCATION:       employee.workLocation || 'București',
      VACATION_DAYS:       employee.vacationDays || '21',
      CURRENT_DATE:        new Date().toLocaleDateString('ro-RO'),
      CURRENT_YEAR:        new Date().getFullYear().toString(),
    }

    const filledBytes = await fillTemplate(templateBytes, replacements)

    return new Response(filledBytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${documentType}_${employee.employeeName}.docx"`,
      },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
