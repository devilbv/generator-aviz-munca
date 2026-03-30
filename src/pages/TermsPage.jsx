export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border p-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Termeni și Condiții</h1>
        <p className="text-sm text-gray-400">Ultima actualizare: 30 martie 2026</p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">1. Informații despre furnizor</h2>
          <p className="text-sm text-gray-600">
            Platforma <strong>Generator Dosare Aviz de Muncă</strong> (AvizPro) este operată de
            <strong> Web Digital Venture SRL</strong>, CUI 46880060, cu sediul în Baba Novac nr. 18,
            București, România. Contact: <a href="mailto:contact@web-digital.eu" className="text-primary underline">contact@web-digital.eu</a>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">2. Descrierea serviciului</h2>
          <p className="text-sm text-gray-600">
            AvizPro este o platformă software care automatizează generarea documentelor necesare
            pentru dosarele de Aviz de Muncă pentru cetățeni străini, conform legislației române în vigoare.
            Documentele generate au caracter informativ și trebuie verificate de utilizator înainte de depunere.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">3. Contul de utilizator</h2>
          <p className="text-sm text-gray-600">
            Utilizatorul este responsabil pentru securitatea contului și a parolei sale.
            Este interzisă partajarea contului cu terți. Web Digital Venture SRL își rezervă dreptul
            de a suspenda conturile care încalcă prezentele termene.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">4. Planuri și plăți</h2>
          <p className="text-sm text-gray-600">
            Serviciul se oferă în baza unor planuri de abonament lunar/anual sau credite prepaid.
            Prețurile sunt afișate în RON și includ TVA. Plățile sunt procesate securizat prin Stripe.
            Abonamentele se reînnoiesc automat la finalul perioadei dacă nu sunt anulate.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">5. Limitarea răspunderii</h2>
          <p className="text-sm text-gray-600">
            Web Digital Venture SRL nu garantează acceptarea dosarelor generate cu ajutorul platformei
            de către autoritățile competente. Utilizatorul este responsabil pentru corectitudinea datelor
            introduse și pentru conformitatea documentelor cu cerințele legale în vigoare la momentul depunerii.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">6. Proprietate intelectuală</h2>
          <p className="text-sm text-gray-600">
            Platforma, inclusiv codul sursă, designul și conținutul, sunt proprietatea exclusivă a
            Web Digital Venture SRL și sunt protejate de legile privind drepturile de autor.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">7. Modificarea termenilor</h2>
          <p className="text-sm text-gray-600">
            Ne rezervăm dreptul de a modifica prezentele Termeni și Condiții. Utilizatorii vor fi
            notificați prin email cu cel puțin 15 zile înainte de intrarea în vigoare a modificărilor.
            Continuarea utilizării platformei după această dată constituie acceptul noilor termeni.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">8. Legea aplicabilă</h2>
          <p className="text-sm text-gray-600">
            Prezentele Termeni și Condiții sunt guvernate de legislația română. Orice litigiu va fi
            soluționat pe cale amiabilă sau, în caz contrar, de instanțele competente din România.
          </p>
        </section>
      </div>
    </div>
  )
}
