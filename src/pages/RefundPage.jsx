export default function RefundPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border p-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Politică de Rambursare</h1>
        <p className="text-sm text-gray-400">Ultima actualizare: 30 martie 2026</p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">1. Abonamente</h2>
          <p className="text-sm text-gray-600">
            Poți solicita rambursarea integrală în termen de <strong>14 zile</strong> de la prima
            plată a abonamentului, dacă nu ai generat niciun document în această perioadă.
            După 14 zile sau după utilizarea serviciului, nu se acordă rambursări pentru perioada curentă.
          </p>
          <p className="text-sm text-gray-600">
            Anularea abonamentului se poate face oricând din cont. Accesul rămâne activ până la
            finalul perioadei plătite.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">2. Credite prepaid</h2>
          <p className="text-sm text-gray-600">
            Creditele prepaid achiziționate nu sunt rambursabile, cu excepția situațiilor în care
            o eroare tehnică din partea platformei a dus la consumarea incorectă a creditelor.
            În astfel de cazuri, creditele vor fi restaurate în cont.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">3. Cum soliciți o rambursare</h2>
          <p className="text-sm text-gray-600">
            Trimite un email la <a href="mailto:contact@web-digital.eu" className="text-primary underline">contact@web-digital.eu</a> cu
            subiectul <strong>"Rambursare"</strong>, incluzând adresa de email a contului și motivul solicitării.
            Vom răspunde în maxim 3 zile lucrătoare. Rambursarea se procesează în 5-10 zile lucrătoare
            prin același mijloc de plată folosit la achiziție.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">4. Dreptul de retragere (consumatori)</h2>
          <p className="text-sm text-gray-600">
            Conform OUG 34/2014, consumatorii persoane fizice au dreptul de retragere din contract
            în 14 zile de la achiziție, fără penalități, dacă serviciul digital nu a fost utilizat.
            Prin începerea utilizării platformei, consimți la executarea imediată a contractului și
            recunoști că dreptul de retragere nu se mai aplică odată ce documentele au fost generate.
          </p>
        </section>
      </div>
    </div>
  )
}
