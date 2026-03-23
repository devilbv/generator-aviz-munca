import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Loader2, Building2, User, Plus } from 'lucide-react'

export default function CompanyForm({ company, updateField, savedCompanies, loadSavedCompany, lookupCUI, lookingUp, saveCompany, saving, onContinue }) {
  const [saveChecked, setSaveChecked]           = useState(true)
  const [showRepresentative, setShowRepresentative] = useState(false)

  const handleSaveAndContinue = async () => {
    if (saveChecked) await saveCompany()
    if (onContinue) onContinue()
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div className="text-center py-4">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Building2 className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Date Firmă și Reprezentant Legal</h2>
        <p className="mt-1 text-sm text-gray-500">Completați informațiile firmei și reprezentantului legal. Aceste date vor fi folosite pentru toți angajații.</p>
      </div>

      {/* Firmă salvată */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <Label className="text-sm font-medium text-gray-700 mb-2 block">Selectează firmă salvată</Label>
        <div className="flex gap-2">
          <Select onValueChange={loadSavedCompany}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={savedCompanies.length ? 'Alege o firmă...' : 'Nicio firmă salvată'} />
            </SelectTrigger>
            <SelectContent>
              {savedCompanies.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.company_name} — {c.cui}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-1 shrink-0" onClick={() => {
            ['companyName','cui','registryNumber','companyAddress','administratorName',
             'ajofmCertificateNumber1','ajofmCertificateNumber2','representativeName',
             'representativeCNP','representativeAddress','representativeIdSeries',
             'representativeIdNumber','representativeIdIssuedBy'].forEach(f => updateField(f, ''))
          }}>
            <Plus className="h-4 w-4" /> Firmă Nouă
          </Button>
        </div>
      </div>

      {/* Date firmă */}
      <div className="rounded-xl border bg-white p-5 shadow-sm space-y-4">
        <h3 className="flex items-center gap-2 font-semibold text-gray-800">
          <Building2 className="h-4 w-4 text-primary" /> Date Firmă
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1 sm:col-span-2">
            <Label>Denumire Firmă <span className="text-destructive">*</span></Label>
            <Input value={company.companyName} onChange={e => updateField('companyName', e.target.value)} placeholder="SC EXEMPLU SRL" />
          </div>

          <div className="space-y-1">
            <Label>CUI <span className="text-destructive">*</span></Label>
            <div className="flex gap-2">
              <Input value={company.cui} onChange={e => updateField('cui', e.target.value)} placeholder="RO12345678" />
              <Button variant="outline" size="sm" onClick={lookupCUI} disabled={lookingUp} className="shrink-0 gap-1">
                {lookingUp ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Search className="h-4 w-4" /><span className="hidden sm:inline">Caută ONRC</span></>}
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Nr. Registrul Comerțului</Label>
            <Input value={company.registryNumber} onChange={e => updateField('registryNumber', e.target.value)} placeholder="J40/1234/2020" />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <Label>Adresa Firmă</Label>
            <Input value={company.companyAddress} onChange={e => updateField('companyAddress', e.target.value)} placeholder="Str. Exemplu Nr. 1, București, Sector 1" />
          </div>

          <div className="space-y-1">
            <Label>Nume Administrator</Label>
            <Input value={company.administratorName} onChange={e => updateField('administratorName', e.target.value)} placeholder="Popescu Ion" />
          </div>

          <div className="space-y-1">
            <Label>Nr. Adeverință AJOFM 1</Label>
            <Input value={company.ajofmCertificateNumber1} onChange={e => updateField('ajofmCertificateNumber1', e.target.value)} placeholder="12366/AMOFMB/13.08.2025" />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <Label>Nr. Adeverință AJOFM 2</Label>
            <Input value={company.ajofmCertificateNumber2} onChange={e => updateField('ajofmCertificateNumber2', e.target.value)} placeholder="nr. 5700/SAPMFPES-IGI/13.08.2025" />
          </div>
        </div>
      </div>

      {/* Checkbox împuternicit */}
      <div
        className={`rounded-xl border p-4 cursor-pointer transition-colors ${showRepresentative ? 'border-primary bg-primary/5' : 'bg-white'} shadow-sm`}
        onClick={() => setShowRepresentative(v => !v)}
      >
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={showRepresentative}
            onChange={e => { e.stopPropagation(); setShowRepresentative(e.target.checked) }}
            className="mt-0.5 h-4 w-4 rounded accent-primary"
          />
          <div>
            <p className="text-sm font-medium flex items-center gap-2 text-gray-800">
              <User className="h-4 w-4 text-primary" /> Am împuternicit (persoană diferită de administrator)
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Bifează doar dacă o altă persoană (împuternicit) semnează documentele în locul administratorului</p>
          </div>
        </label>
      </div>

      {/* Date reprezentant — colapsibil */}
      {showRepresentative && (
        <div className="rounded-xl border bg-white p-5 shadow-sm space-y-4">
          <h3 className="flex items-center gap-2 font-semibold text-gray-800">
            <User className="h-4 w-4 text-primary" /> Date Reprezentant / Împuternicit
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Nume Împuternicit</Label>
              <Input value={company.representativeName} onChange={e => updateField('representativeName', e.target.value)} placeholder="Popescu Maria" />
            </div>
            <div className="space-y-1">
              <Label>CNP</Label>
              <Input value={company.representativeCNP} onChange={e => updateField('representativeCNP', e.target.value)} placeholder="2900101123456" />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>Domiciliu</Label>
              <Input value={company.representativeAddress} onChange={e => updateField('representativeAddress', e.target.value)} placeholder="Str. Exemplu Nr. 2, București" />
            </div>
            <div className="space-y-1">
              <Label>Serie CI</Label>
              <Input value={company.representativeIdSeries} onChange={e => updateField('representativeIdSeries', e.target.value)} placeholder="RT" />
            </div>
            <div className="space-y-1">
              <Label>Număr CI</Label>
              <Input value={company.representativeIdNumber} onChange={e => updateField('representativeIdNumber', e.target.value)} placeholder="123456" />
            </div>
            <div className="space-y-1">
              <Label>Eliberat de</Label>
              <Input value={company.representativeIdIssuedBy} onChange={e => updateField('representativeIdIssuedBy', e.target.value)} placeholder="SPCLEP București" />
            </div>
          </div>
        </div>
      )}

      {/* Salvează checkbox */}
      <div
        className={`rounded-xl border p-4 cursor-pointer transition-colors ${saveChecked ? 'border-primary bg-primary/5' : 'bg-white'} shadow-sm`}
        onClick={() => setSaveChecked(v => !v)}
      >
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={saveChecked}
            onChange={e => { e.stopPropagation(); setSaveChecked(e.target.checked) }}
            className="mt-0.5 h-4 w-4 rounded accent-primary"
          />
          <div>
            <p className="text-sm font-medium flex items-center gap-2 text-gray-800">
              <Building2 className="h-4 w-4 text-primary" /> Salvează aceste date pentru utilizări viitoare
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Datele vor fi încărcate automat următoarea dată când accesați platforma</p>
          </div>
        </label>
      </div>

      {/* Buton continuă */}
      <Button className="w-full h-12 text-base font-semibold" onClick={handleSaveAndContinue} disabled={saving}>
        {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
        Continuă la Import CSV →
      </Button>
    </div>
  )
}
