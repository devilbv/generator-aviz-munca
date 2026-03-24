import JSZip from 'https://esm.sh/jszip@3.10.1'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { generateDocx, ro } from '../_shared/docx.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Genereaza un fisier DOCX valid minimal cu continut text
function makeDocx(paragraphs: string[]): Uint8Array {
  const bodyXml = paragraphs.map(p => {
    if (p === '') return '<w:p/>'
    const isBold = p.startsWith('**') && p.endsWith('**')
    const text = isBold ? p.slice(2, -2) : p
    const runProps = isBold ? '<w:rPr><w:b/></w:rPr>' : ''
    return `<w:p><w:r>${runProps}<w:t xml:space="preserve">${escXml(text)}</w:t></w:r></w:p>`
  }).join('\n')

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    ${bodyXml}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1701" w:header="709" w:footer="709" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`

  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`

  const wordRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`

  const zip = new JSZip()
  zip.file('[Content_Types].xml', contentTypes)
  zip.file('_rels/.rels', rels)
  zip.file('word/document.xml', documentXml)
  zip.file('word/_rels/document.xml.rels', wordRels)

  // Returnam sincron - vom folosi generateAsync mai jos
  return zip as any
}

function escXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

function ro(d: string): string {
  if (!d) return ''
  // Deja in format DD.MM.YYYY
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(d)) return d
  // YYYY-MM-DD → DD.MM.YYYY
  if (/^\d{4}-\d{2}-\d{2}/.test(d)) {
    const [y, m, day] = d.split('-')
    return `${day}.${m}.${y}`
  }
  return d
}

function buildDoc(docType: string, c: any, e: any, today: string): string[][] {
  const emp  = e.employeeName       || ''
  const pass = e.passportNumber     || ''
  const ctr  = e.passportCountryCode|| ''
  const bd   = ro(e.birthDate)      || ''
  const bp   = e.birthPlace         || ''
  const cit  = e.citizenship        || ''
  const iss  = ro(e.passportIssueDate)  || ''
  const exp  = ro(e.passportExpiryDate) || ''
  const pos  = e.position           || 'Curier'
  const cor  = e.corCode            || '9621'
  const sal  = e.monthlySalary      || '4050'
  const wl   = e.workLocation       || 'București'
  const vac  = e.vacationDays       || '21'

  const cn   = c.companyName        || ''
  const cui  = c.cui                || ''
  const reg  = c.registryNumber     || ''
  const ca   = c.companyAddress     || ''
  const adm  = c.administratorName  || c.pfName || ''
  const aj1  = c.ajofmCertificateNumber1 || ''
  const aj2  = c.ajofmCertificateNumber2 || ''
  const rep  = c.representativeName || adm
  const repCNP = c.representativeCNP|| c.pfCNP || ''

  const docs: Record<string, string[]> = {
    cerere: [
      `**CERERE MOTIVATĂ**`, ``,
      `Subscrisa ${cn}, cu sediul în ${ca}, CUI ${cui}, înregistrată la Registrul Comerțului sub nr. ${reg},`,
      `reprezentată prin ${adm},`,
      ``,
      `**solicită** acordarea avizului de muncă pentru cetățeanul străin:`,
      ``,
      `Nume și prenume: ${emp}`,
      `Data nașterii: ${bd}`,
      `Locul nașterii: ${bp}`,
      `Cetățenia: ${cit}`,
      `Nr. pașaport: ${pass} (valabil până la ${exp})`,
      ``,
      `Angajatul va ocupa funcția de ${pos} (cod COR ${cor}),`,
      `cu un salariu brut lunar de ${sal} RON, în ${wl}.`,
      ``,
      `Nr. Adeverință AJOFM: ${aj1}`,
      ``,
      `Data: ${today}`,
      ``,
      `Semnătura și ștampila angajatorului`,
      `${adm}`,
    ],
    fisa: [
      `**FIȘA POSTULUI**`, ``,
      `Angajator: ${cn} | CUI: ${cui}`,
      `Adresă: ${ca}`,
      ``,
      `**Date angajat:**`,
      `Nume: ${emp} | Pașaport: ${pass}`,
      `Cetățenie: ${cit} | Data nașterii: ${bd}`,
      ``,
      `**Funcția:** ${pos} (Cod COR: ${cor})`,
      `**Loc de muncă:** ${wl}`,
      `**Salariu brut lunar:** ${sal} RON`,
      `**Zile concediu anual:** ${vac} zile`,
      ``,
      `**Atribuții principale:**`,
      `1. Preluarea și livrarea coletelor în termenul stabilit`,
      `2. Respectarea rutelor de livrare stabilite`,
      `3. Gestionarea documentelor de transport`,
      `4. Menținerea în bune condiții a mijlocului de transport`,
      `5. Respectarea normelor de securitate și sănătate în muncă`,
      ``,
      `Data: ${today}`,
      `Angajator: ${adm}`,
    ],
    oferta: [
      `**OFERTĂ DE ANGAJARE**`, ``,
      `${cn}`,
      `CUI: ${cui} | Reg. Com.: ${reg}`,
      `Adresă: ${ca}`,
      ``,
      `Către: ${emp}`,
      `Cetățenie: ${cit} | Pașaport: ${pass}`,
      ``,
      `Vă oferim un post de **${pos}** (Cod COR: ${cor}) cu următoarele condiții:`,
      ``,
      `- Salariu brut lunar: ${sal} RON`,
      `- Loc de muncă: ${wl}`,
      `- Concediu anual: ${vac} zile lucrătoare`,
      `- Tip contract: perioadă determinată / nedeterminată`,
      ``,
      `Această ofertă este valabilă 30 de zile de la data emiterii.`,
      ``,
      `Data: ${today}`,
      ``,
      `Director General: ${adm}`,
      `${cn}`,
    ],
    proces: [
      `**PROCES VERBAL DE SELECȚIE**`, ``,
      `Încheiat astăzi, ${today}, la sediul ${cn}`,
      ``,
      `Comisia de selecție a analizat dosarul candidatului:`,
      ``,
      `Nume: ${emp}`,
      `Data nașterii: ${bd} | Locul nașterii: ${bp}`,
      `Cetățenie: ${cit} | Pașaport: ${pass} (${iss} - ${exp})`,
      ``,
      `Post: ${pos} (Cod COR: ${cor})`,
      `Salariu: ${sal} RON brut/lună`,
      ``,
      `**Comisia a hotărât: ADMIS**`,
      ``,
      `Candidatul îndeplinește condițiile pentru ocuparea postului.`,
      ``,
      `Președinte comisie: ${adm}`,
      `Data: ${today}`,
    ],
    opis_aviz: [
      `**OPIS DOSAR AVIZ DE MUNCĂ**`, ``,
      `Angajator: ${cn} | CUI: ${cui}`,
      `Angajat: ${emp} | Pașaport: ${pass}`,
      `Data: ${today}`,
      ``,
      `Nr.  Document`,
      `1.   Cerere motivată angajator`,
      `2.   Fișa postului`,
      `3.   Ofertă de angajare`,
      `4.   Proces verbal selecție`,
      `5.   Contract individual de muncă`,
      `6.   Contract de comodat`,
      `7.   Scrisoare de garanție`,
      `8.   CV angajat`,
      `9.   Copie pașaport`,
      `10.  Adeverință AJOFM nr. ${aj1}`,
      `11.  Adeverință AJOFM nr. ${aj2}`,
      ``,
      `Semnătura: ${adm}`,
    ],
    contract_munca: [
      `**CONTRACT INDIVIDUAL DE MUNCĂ**`, ``,
      `Angajator: ${cn}, CUI ${cui}, cu sediul în ${ca}, reprezentată prin ${rep},`,
      ``,
      `și`,
      ``,
      `Salariat: ${emp}, cetățean ${cit}, pașaport ${pass} valabil până la ${exp},`,
      `născut la data de ${bd} în ${bp},`,
      ``,
      `au convenit la încheierea prezentului contract cu următoarele clauze:`,
      ``,
      `Art. 1 – Funcția: ${pos} (Cod COR: ${cor})`,
      `Art. 2 – Locul de muncă: ${wl}`,
      `Art. 3 – Salariu brut lunar: ${sal} RON`,
      `Art. 4 – Concediu anual: ${vac} zile lucrătoare`,
      `Art. 5 – Durata contractului: determinată/nedeterminată`,
      ``,
      `Data: ${today}`,
      ``,
      `Angajator: ${adm}            Salariat: ${emp}`,
    ],
    contract_comodat: [
      `**CONTRACT DE COMODAT**`, ``,
      `Încheiat astăzi ${today} între:`,
      ``,
      `Comodant: ${cn}, CUI ${cui}, cu sediul în ${ca},`,
      `reprezentată prin ${adm},`,
      ``,
      `și`,
      ``,
      `Comodatar: ${emp}, pașaport ${pass},`,
      ``,
      `Art. 1 – Obiectul contractului: Comodantul pune la dispoziția comodatarului,`,
      `cu titlu gratuit, spațiu de locuit/echipament necesar desfășurării activității.`,
      ``,
      `Art. 2 – Durata: pe perioada contractului de muncă.`,
      ``,
      `Art. 3 – Obligații: Comodatarul se obligă să folosească bunul conform destinației.`,
      ``,
      `Data: ${today}`,
      `Comodant: ${adm}         Comodatar: ${emp}`,
    ],
    scrisoare_garantie: [
      `**SCRISOARE DE GARANȚIE**`, ``,
      `${cn}`,
      `CUI: ${cui} | ${ca}`,
      `Data: ${today}`,
      ``,
      `Către: Inspectoratul General pentru Imigrări`,
      ``,
      `Prin prezenta, ${cn}, reprezentată prin ${adm},`,
      `garantăm că cetățeanul străin ${emp},`,
      `pașaport ${pass}, cetățenie ${cit},`,
      ``,
      `- Va respecta condițiile din avizul de muncă`,
      `- Va presta activitate în calitate de ${pos} (COR ${cor})`,
      `- Va fi repatriat pe cheltuiala noastră în caz de necesitate`,
      `- Îi asigurăm cazare și salariu de ${sal} RON/lună`,
      ``,
      `Asumat de: ${adm}`,
      `${cn}`,
    ],
    cv: [
      `**CURRICULUM VITAE**`, ``,
      `**Informații personale:**`,
      `Nume: ${emp}`,
      `Data nașterii: ${bd}`,
      `Locul nașterii: ${bp}`,
      `Cetățenie: ${cit}`,
      `Pașaport: ${pass} (valabil: ${iss} – ${exp})`,
      ``,
      `**Obiectiv profesional:**`,
      `Obținerea postului de ${pos} în cadrul companiei ${cn}.`,
      ``,
      `**Experiență profesională:**`,
      `Curier / operator logistică – experiență în domeniu`,
      ``,
      `**Educație:**`,
      `Studii medii / echivalent`,
      ``,
      `**Limbi străine:**`,
      `Conform cunoștințelor proprii`,
      ``,
      `Data: ${today}`,
      `Semnătură: ${emp}`,
    ],
    offer_letter: [
      `**OFFER LETTER**`, ``,
      `${cn} | CUI: ${cui}`,
      `${ca}`,
      `Date: ${today}`,
      ``,
      `Dear ${emp},`,
      ``,
      `We are pleased to offer you the position of **${pos}** (COR Code: ${cor})`,
      `at our company ${cn}.`,
      ``,
      `Employment Details:`,
      `- Position: ${pos}`,
      `- Monthly Gross Salary: ${sal} RON`,
      `- Work Location: ${wl}`,
      `- Annual Leave: ${vac} working days`,
      ``,
      `Your passport (${pass}) is valid until ${exp}.`,
      ``,
      `This offer is subject to obtaining a valid work permit from Romanian authorities.`,
      ``,
      `Sincerely,`,
      `${adm}`,
      `${cn}`,
    ],
    invitation_letter: [
      `**INVITATION LETTER**`, ``,
      `${cn}`,
      `CUI: ${cui} | ${ca}`,
      `Date: ${today}`,
      ``,
      `To Whom It May Concern,`,
      ``,
      `We, ${cn}, hereby invite ${emp} (Passport: ${pass}, ${cit} citizen,`,
      `born on ${bd} in ${bp}) to Romania for the purpose of employment.`,
      ``,
      `The applicant will work as ${pos} (COR: ${cor}) at our company,`,
      `with a monthly salary of ${sal} RON, located in ${wl}.`,
      ``,
      `We guarantee full compliance with Romanian immigration laws and`,
      `undertake full responsibility for the invited person.`,
      ``,
      `Sincerely,`,
      `${adm}`,
      `${cn}`,
    ],
    delegatie_igi: [
      `**DELEGAȚIE LA IGI**`, ``,
      `${cn}`,
      `CUI: ${cui} | ${ca}`,
      `Data: ${today}`,
      ``,
      `Prin prezenta, ${cn} deleagă pe ${rep}`,
      `CNP: ${repCNP}`,
      ``,
      `să reprezinte societatea la Inspectoratul General pentru Imigrări,`,
      `în vederea depunerii / ridicării dosarului de aviz de muncă`,
      `pentru angajatul ${emp}, pașaport ${pass}.`,
      ``,
      `Delegatul este împuternicit să semneze orice acte necesare procedurii.`,
      ``,
      `Data: ${today}`,
      `Director General: ${adm}`,
      `${cn}`,
    ],
    organigrama: [
      `**ORGANIGRAMĂ ${cn.toUpperCase()}**`, ``,
      `CUI: ${cui} | Reg. Com.: ${reg}`,
      `Adresă: ${ca}`,
      `Data: ${today}`,
      ``,
      `┌─────────────────────────────┐`,
      `│   DIRECTOR GENERAL          │`,
      `│   ${adm.padEnd(27)}│`,
      `└──────────────┬──────────────┘`,
      `               │`,
      `┌──────────────▼──────────────┐`,
      `│   DEPARTAMENT OPERAȚIONAL   │`,
      `└──────────────┬──────────────┘`,
      `               │`,
      `┌──────────────▼──────────────┐`,
      `│   ${pos.toUpperCase().padEnd(27)}│`,
      `│   ${emp.padEnd(27)}│`,
      `│   COR: ${cor.padEnd(23)}│`,
      `└─────────────────────────────┘`,
    ],
  }

  return docs[docType] || [`Document: ${docType}`, `Angajat: ${emp}`, `Data: ${today}`]
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Utilizator neautentificat')

    const { company, employee } = await req.json()
    if (!employee?.employeeName) throw new Error('Date angajat lipsă')

    const today = new Date().toLocaleDateString('ro-RO')

    const DOCUMENT_TYPES = [
      'cerere', 'fisa', 'oferta', 'proces', 'opis_aviz',
      'contract_munca', 'contract_comodat', 'scrisoare_garantie',
      'cv', 'offer_letter', 'invitation_letter', 'delegatie_igi', 'organigrama',
    ]

    const DOC_LABELS: Record<string, string> = {
      cerere: 'Cerere motivata', fisa: 'Fisa postului', oferta: 'Oferta angajare',
      proces: 'Proces verbal', opis_aviz: 'Opis aviz',
      contract_munca: 'Contract de munca', contract_comodat: 'Contract comodat',
      scrisoare_garantie: 'Scrisoare garantie', cv: 'CV',
      offer_letter: 'Offer Letter', invitation_letter: 'Invitation Letter',
      delegatie_igi: 'Delegatie IGI', organigrama: 'Organigrama',
    }

    const outerZip = new JSZip()
    const generated: string[] = []

    // Incearca sa descarce template-uri din Storage, altfel genereaza automat
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    for (const docType of DOCUMENT_TYPES) {
      try {
        // Incearca template din Storage
        const { data: tmpl, error: tmplErr } = await supabase.storage
          .from('document-templates')
          .download(`${docType}.docx`)

        if (!tmplErr && tmpl) {
          // Foloseste template din storage
          const bytes = new Uint8Array(await tmpl.arrayBuffer())
          outerZip.file(`${DOC_LABELS[docType]}_${employee.employeeName}.docx`, bytes)
        } else {
          // Genereaza DOCX din date
          const paragraphs = buildDoc(docType, company, employee, today)
          const innerDocx = new JSZip()

          const bodyXml = paragraphs.map(p => {
            if (p === '') return '<w:p/>'
            const isBold = p.startsWith('**') && p.endsWith('**')
            const text = isBold ? p.slice(2, -2) : p
            const runProps = isBold ? '<w:rPr><w:b/><w:sz w:val="28"/></w:rPr>' : '<w:rPr><w:sz w:val="22"/></w:rPr>'
            const escaped = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
            return `<w:p><w:r>${runProps}<w:t xml:space="preserve">${escaped}</w:t></w:r></w:p>`
          }).join('\n')

          innerDocx.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`)
          innerDocx.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`)
          innerDocx.file('word/_rels/document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`)
          innerDocx.file('word/document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${bodyXml}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1701" w:header="709" w:footer="709" w:gutter="0"/></w:sectPr></w:body></w:document>`)

          const docBytes = await innerDocx.generateAsync({ type: 'uint8array' })
          outerZip.file(`${DOC_LABELS[docType]}_${employee.employeeName}.docx`, docBytes)
        }
        generated.push(docType)
      } catch (e) {
        console.warn(`Failed ${docType}:`, e)
      }
    }

    // Salveaza in work_permits
    try {
      const userResp = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
      if (userResp.data?.user) {
        await supabase.from('work_permits').insert({
          user_id:          userResp.data.user.id,
          company_snapshot: company,
          employees:        [employee],
          document_types:   generated,
          status:           generated.length > 0 ? 'generated' : 'failed',
          generated_at:     new Date().toISOString(),
        })
      }
    } catch (e) {
      console.warn('Could not save work_permit:', e)
    }

    const zipBytes = await outerZip.generateAsync({ type: 'uint8array' })

    return new Response(zipBytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="Documente_${employee.employeeName}.zip"`,
      },
    })
  } catch (err) {
    console.error('generate-work-permit error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
