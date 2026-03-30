export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border p-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Politică de Confidențialitate</h1>
        <p className="text-sm text-gray-400">Ultima actualizare: 30 martie 2026</p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">1. Operator de date</h2>
          <p className="text-sm text-gray-600">
            <strong>Web Digital Venture SRL</strong>, CUI 46880060, Baba Novac nr. 18, București.
            Contact GDPR: <a href="mailto:contact@web-digital.eu" className="text-primary underline">contact@web-digital.eu</a>
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">2. Date colectate</h2>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li><strong>Date cont:</strong> adresă email, parolă (criptată)</li>
            <li><strong>Date facturare:</strong> denumire firmă, CIF, adresă sediu</li>
            <li><strong>Date angajați:</strong> nume, nr. pașaport, cetățenie, dată naștere — introduse de utilizator pentru generarea documentelor</li>
            <li><strong>Date utilizare:</strong> număr documente generate, plan activ</li>
            <li><strong>Date plată:</strong> procesate exclusiv prin Stripe — nu stocăm date de card</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">3. Scopul prelucrării</h2>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Furnizarea serviciului de generare documente</li>
            <li>Gestionarea contului și a abonamentului</li>
            <li>Emiterea facturilor (prin SmartBill)</li>
            <li>Comunicări legate de serviciu (nu spam)</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">4. Temeiul legal</h2>
          <p className="text-sm text-gray-600">
            Prelucrarea se bazează pe executarea contractului (art. 6(1)(b) GDPR) și pe interesul
            legitim al furnizorului (art. 6(1)(f) GDPR). Datele angajaților sunt prelucrate în
            temeiul obligației legale a utilizatorului (angajatorul) față de autoritățile române.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">5. Destinatari</h2>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li><strong>Supabase</strong> — infrastructură cloud (date stocate în UE)</li>
            <li><strong>Stripe</strong> — procesare plăți</li>
            <li><strong>SmartBill</strong> — facturare</li>
            <li><strong>Anthropic</strong> — procesare OCR pașapoarte (date nu sunt stocate de Anthropic)</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">6. Perioada de stocare</h2>
          <p className="text-sm text-gray-600">
            Datele contului se păstrează pe durata contractului și 3 ani după închidere (obligații fiscale).
            Datele angajaților din istoricul dosarelor se pot șterge oricând din aplicație.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">7. Drepturile tale</h2>
          <p className="text-sm text-gray-600">
            Conform GDPR, ai dreptul la: acces, rectificare, ștergere ("dreptul de a fi uitat"),
            portabilitate, restricționarea prelucrării și opoziție. Pentru exercitarea acestor drepturi,
            contactează-ne la <a href="mailto:contact@web-digital.eu" className="text-primary underline">contact@web-digital.eu</a>.
            Ai dreptul să depui plângere la <strong>ANSPDCP</strong> (anspdcp.eu).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">8. Cookie-uri</h2>
          <p className="text-sm text-gray-600">
            Folosim cookie-uri tehnice strict necesare pentru autentificare și funcționarea aplicației.
            Nu folosim cookie-uri de tracking sau publicitate.
          </p>
        </section>
      </div>
    </div>
  )
}
