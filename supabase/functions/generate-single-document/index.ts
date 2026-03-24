import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { generateDocx, ro } from '../_shared/docx.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function buildDoc(docType: string, c: any, e: any, today: string): string[] {
  const emp  = e.employeeName        || ''
  const pass = e.passportNumber      || ''
  const bd   = ro(e.birthDate)       || ''
  const bp   = e.birthPlace          || ''
  const cit  = e.citizenship         || ''
  const iss  = ro(e.passportIssueDate)   || ''
  const exp  = ro(e.passportExpiryDate)  || ''
  const pos  = e.position            || 'Curier'
  const cor  = e.corCode             || '9621'
  const sal  = e.monthlySalary       || '4050'
  const wl   = e.workLocation        || 'București'
  const vac  = e.vacationDays        || '21'
  const cn   = c.companyName         || ''
  const cui  = c.cui                 || ''
  const reg  = c.registryNumber      || ''
  const ca   = c.companyAddress      || ''
  const adm  = c.administratorName   || c.pfName || ''
  const aj1  = c.ajofmCertificateNumber1 || ''
  const aj2  = c.ajofmCertificateNumber2 || ''
  const rep  = c.representativeName  || adm
  const repCNP = c.representativeCNP || c.pfCNP || ''

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
      `${cn} | CUI: ${cui} | Reg. Com.: ${reg}`,
      `Adresă: ${ca}`,
      `Data: ${today}`,
      ``,
      `Către: ${emp}`,
      `Cetățenie: ${cit} | Pașaport: ${pass}`,
      ``,
      `Vă oferim un post de **${pos}** (Cod COR: ${cor}) cu următoarele condiții:`,
      `- Salariu brut lunar: ${sal} RON`,
      `- Loc de muncă: ${wl}`,
      `- Concediu anual: ${vac} zile lucrătoare`,
      ``,
      `Data: ${today}`,
      `Director General: ${adm}`,
    ],
    proces: [
      `**PROCES VERBAL DE SELECȚIE**`, ``,
      `Încheiat astăzi, ${today}, la sediul ${cn}`,
      ``,
      `Candidat: ${emp}`,
      `Data nașterii: ${bd} | Locul nașterii: ${bp}`,
      `Cetățenie: ${cit} | Pașaport: ${pass} (${iss} - ${exp})`,
      ``,
      `Post: ${pos} (Cod COR: ${cor}) | Salariu: ${sal} RON`,
      ``,
      `**Comisia a hotărât: ADMIS**`,
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
      `1.  Cerere motivată angajator`,
      `2.  Fișa postului`,
      `3.  Ofertă de angajare`,
      `4.  Proces verbal selecție`,
      `5.  Contract individual de muncă`,
      `6.  Contract de comodat`,
      `7.  Scrisoare de garanție`,
      `8.  CV angajat`,
      `9.  Copie pașaport`,
      `10. Adeverință AJOFM nr. ${aj1}`,
      `11. Adeverință AJOFM nr. ${aj2}`,
      ``,
      `Semnătura: ${adm}`,
    ],
    contract_munca: [
      `**CONTRACT INDIVIDUAL DE MUNCĂ**`, ``,
      `Angajator: ${cn}, CUI ${cui}, sediul în ${ca}, reprezentată prin ${rep},`,
      ``,
      `și Salariat: ${emp}, cetățean ${cit}, pașaport ${pass} valabil până la ${exp},`,
      `născut la data de ${bd} în ${bp},`,
      ``,
      `Art. 1 – Funcția: ${pos} (Cod COR: ${cor})`,
      `Art. 2 – Locul de muncă: ${wl}`,
      `Art. 3 – Salariu brut lunar: ${sal} RON`,
      `Art. 4 – Concediu anual: ${vac} zile lucrătoare`,
      `Art. 5 – Durata contractului: determinată/nedeterminată`,
      ``,
      `Data: ${today}`,
      `Angajator: ${adm}            Salariat: ${emp}`,
    ],
    contract_comodat: [
      `**CONTRACT DE COMODAT**`, ``,
      `Încheiat astăzi ${today} între:`,
      `Comodant: ${cn}, CUI ${cui}, cu sediul în ${ca}, reprezentată prin ${adm},`,
      `și Comodatar: ${emp}, pașaport ${pass},`,
      ``,
      `Art. 1 – Obiectul: spațiu de locuit/echipament necesar activității.`,
      `Art. 2 – Durata: pe perioada contractului de muncă.`,
      `Art. 3 – Comodatarul se obligă să folosească bunul conform destinației.`,
      ``,
      `Data: ${today}`,
      `Comodant: ${adm}         Comodatar: ${emp}`,
    ],
    scrisoare_garantie: [
      `**SCRISOARE DE GARANȚIE**`, ``,
      `${cn} | CUI: ${cui} | ${ca}`,
      `Data: ${today}`,
      ``,
      `Către: Inspectoratul General pentru Imigrări`,
      ``,
      `Prin prezenta, ${cn}, reprezentată prin ${adm}, garantăm că:`,
      `Cetățeanul străin ${emp}, pașaport ${pass}, cetățenie ${cit}`,
      ``,
      `- Va respecta condițiile din avizul de muncă`,
      `- Va presta activitate ca ${pos} (COR ${cor})`,
      `- Îi asigurăm cazare și salariu de ${sal} RON/lună`,
      `- Va fi repatriat pe cheltuiala noastră în caz de necesitate`,
      ``,
      `Asumat de: ${adm} | ${cn}`,
    ],
    cv: [
      `**CURRICULUM VITAE**`, ``,
      `Nume: ${emp}`,
      `Data nașterii: ${bd} | Locul nașterii: ${bp}`,
      `Cetățenie: ${cit}`,
      `Pașaport: ${pass} (${iss} – ${exp})`,
      ``,
      `**Obiectiv profesional:**`,
      `Obținerea postului de ${pos} în cadrul companiei ${cn}.`,
      ``,
      `**Experiență profesională:**`,
      `Curier / operator logistică – experiență în domeniu`,
      ``,
      `**Educație:** Studii medii / echivalent`,
      ``,
      `Data: ${today}     Semnătură: ${emp}`,
    ],
    offer_letter: [
      `**OFFER LETTER**`, ``,
      `${cn} | CUI: ${cui} | ${ca}`,
      `Date: ${today}`,
      ``,
      `Dear ${emp},`,
      ``,
      `We are pleased to offer you the position of **${pos}** (COR Code: ${cor}).`,
      ``,
      `- Monthly Gross Salary: ${sal} RON`,
      `- Work Location: ${wl}`,
      `- Annual Leave: ${vac} working days`,
      ``,
      `Subject to obtaining a valid work permit from Romanian authorities.`,
      ``,
      `Sincerely, ${adm} | ${cn}`,
    ],
    invitation_letter: [
      `**INVITATION LETTER**`, ``,
      `${cn} | CUI: ${cui} | ${ca}`,
      `Date: ${today}`,
      ``,
      `To Whom It May Concern,`,
      ``,
      `We, ${cn}, hereby invite ${emp} (Passport: ${pass}, ${cit} citizen,`,
      `born on ${bd} in ${bp}) to Romania for employment as ${pos} (COR: ${cor}),`,
      `with a monthly salary of ${sal} RON in ${wl}.`,
      ``,
      `We guarantee full compliance with Romanian immigration laws.`,
      ``,
      `Sincerely, ${adm} | ${cn}`,
    ],
    delegatie_igi: [
      `**DELEGAȚIE LA IGI**`, ``,
      `${cn} | CUI: ${cui} | ${ca}`,
      `Data: ${today}`,
      ``,
      `Prin prezenta, ${cn} deleagă pe ${rep} (CNP: ${repCNP})`,
      `să reprezinte societatea la Inspectoratul General pentru Imigrări,`,
      `în vederea dosarului de aviz de muncă pentru ${emp}, pașaport ${pass}.`,
      ``,
      `Data: ${today}`,
      `Director General: ${adm} | ${cn}`,
    ],
    organigrama: [
      `**ORGANIGRAMĂ ${cn.toUpperCase()}**`, ``,
      `CUI: ${cui} | Reg. Com.: ${reg} | ${ca}`,
      `Data: ${today}`,
      ``,
      `DIRECTOR GENERAL: ${adm}`,
      `  └── DEPARTAMENT OPERAȚIONAL`,
      `        └── ${pos.toUpperCase()}: ${emp} (COR: ${cor})`,
      ``,
      `Salariu: ${sal} RON/lună | Loc activitate: ${wl}`,
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

    const { company, employee, documentType } = await req.json()
    if (!documentType) throw new Error('documentType lipsă')

    const today = new Date().toLocaleDateString('ro-RO')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    let docBytes: Uint8Array

    // Incearca template din Storage
    const { data: tmpl, error: tmplErr } = await supabase.storage
      .from('document-templates')
      .download(`${documentType}.docx`)

    if (!tmplErr && tmpl) {
      docBytes = new Uint8Array(await tmpl.arrayBuffer())
    } else {
      // Genereaza din date
      const paragraphs = buildDoc(documentType, company, employee, today)
      docBytes = await generateDocx(paragraphs)
    }

    return new Response(docBytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${documentType}_${employee.employeeName || 'angajat'}.docx"`,
      },
    })
  } catch (err) {
    console.error('generate-single-document error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
