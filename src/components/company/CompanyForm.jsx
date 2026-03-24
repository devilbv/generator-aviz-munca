import { useState, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Loader2, Building2, User, Plus, Trash2, Camera, Upload } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

const CLEAR_FIELDS = ['companyName','cui','registryNumber','companyAddress','administratorName',
  'ajofmCertificateNumber1','ajofmCertificateNumber2','pfName','pfCNP','pfIdSeries',
  'pfIdNumber','pfIdIssueDate','pfIdExpiryDate','pfAddress',
  'representativeName','representativeCNP','representativeAddress',
  'representativeIdSeries','representativeIdNumber','representativeIdIssuedBy']

export default function CompanyForm({ company, updateField, savedCompanies, loadSavedCompany, lookupCUI, lookingUp, saveCompany, saving, deleteCompany, onContinue }) {
  const [saveChecked, setSaveChecked]               = useState(true)
  const [showRepresentative, setShowRepresentative] = useState(false)
  const [selectedCompanyId, setSelectedCompanyId]   = useState('')
  const [scanningId, setScanningId]                 = useState(false)
  const idScanRef = useRef()

  const employerType = company.employerType || 'juridica'

  const handleSaveAndContinue = async () => {
    if (saveChecked) await saveCompany()
    if (onContinue) onContinue()
  }

  const handleIdScan = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setScanningId(true)
    const id = toast.loading('Se scanează buletinul...')
    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result.split(',')[1]
        const { data: { session } } = await supabase.auth.getSession()
        const { data, error } = await supabase.functions.invoke('parse-passport', {
          body: { image: base64, filename: file.name, mimeType: file.type },
          headers: { Authorization: `Bearer ${session?.access_token}` },
        })
        if (error) throw error
        if (data.employeeName)       updateField('pfName', data.employeeName)
        if (data.passportNumber)     updateField('pfIdNumber', data.passportNumber)
        if (data.passportIssueDate)  updateField('pfIdIssueDate', data.passportIssueDate)
        if (data.passportExpiryDate) updateField('pfIdExpiryDate', data.passportExpiryDate)
        if (data.birthPlace)         updateField('pfAddress', data.birthPlace)
        toast.dismiss(id)
        toast.success('Date extrase din buletin!')
        setScanningId(false)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      toast.dismiss(id)
      toast.error('Eroare la scanare: ' + err.message)
      setScanningId(false)
    }
    e.target.value = ''
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div className="text-center py-4">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Building2 className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Date Firmă și Reprezentant Legal</h2>
        <p className="mt-1 text-sm text-gray-500">Completați informațiile angajatorului. Aceste date vor fi folosite pentru toți angajații.</p>
      </div>

      {/* Toggle tip angajator */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <Label className="text-sm font-medium text-gray-700 mb-3 block">Tip Angajator</Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => updateField('employerType', 'juridica')}
            className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium border transition-all ${
              employerType === 'juridica'
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-primary/50'
            }`}
          >
            <Building2 className="h-4 w-4" /> Persoană Juridică
          </button>
          <button
            onClick={() => updateField('employerType', 'fizica')}
            className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium border transition-all ${
              employerType === 'fizica'
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-primary/50'
            }`}
          >
            <User className="h-4 w-4" /> Persoană Fizică
          </button>
        </div>
      </div>

      {/* Firmă salvată */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <Label className="text-sm font-medium text-gray-700 mb-2 block">Selectează firmă salvată</Label>
        <div className="flex gap-2">
          <Select value={selectedCompanyId} onValueChange={(val) => { setSelectedCompanyId(val); loadSavedCompany(val) }}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={savedCompanies.length ? 'Alege o firmă...' : 'Nicio firmă salvată'} />
            </SelectTrigger>
            <SelectContent>
              {savedCompanies.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.company_name} — {c.cui}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedCompanyId && (
            <Button variant="outline" size="sm"
              className="gap-1 shrink-0 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive"
              onClick={() => { deleteCompany(selectedCompanyId); setSelectedCompanyId('') }}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" size="sm" className="gap-1 shrink-0" onClick={() => {
            setSelectedCompanyId('')
            CLEAR_FIELDS.forEach(f => updateField(f, ''))
          }}>
            <Plus className="h-4 w-4" /> Firmă Nouă
          </Button>
        </div>
      </div>

      {/* Persoană Juridică */}
      {employerType === 'juridica' && (
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
      )}

      {/* Persoană Fizică */}
      {employerType === 'fizica' && (
        <div className="rounded-xl border bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold text-gray-800">
              <User className="h-4 w-4 text-primary" /> Date Persoană Fizică
            </h3>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => idScanRef.current.click()} disabled={scanningId}>
              {scanningId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              Scanează Buletin
            </Button>
            <input ref={idScanRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" onChange={handleIdScan} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <Label>Nume Complet <span className="text-destructive">*</span></Label>
              <Input value={company.pfName} onChange={e => updateField('pfName', e.target.value)} placeholder="Popescu Ion" />
            </div>
            <div className="space-y-1">
              <Label>CNP <span className="text-destructive">*</span></Label>
              <Input value={company.pfCNP} onChange={e => updateField('pfCNP', e.target.value)} placeholder="1900101123456" />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>Adresă domiciliu</Label>
              <Input value={company.pfAddress} onChange={e => updateField('pfAddress', e.target.value)} placeholder="Str. Exemplu Nr. 1, București, Sector 1" />
            </div>
            <div className="space-y-1">
              <Label>Serie Buletin</Label>
              <Input value={company.pfIdSeries} onChange={e => updateField('pfIdSeries', e.target.value)} placeholder="RT" />
            </div>
            <div className="space-y-1">
              <Label>Nr. Buletin</Label>
              <Input value={company.pfIdNumber} onChange={e => updateField('pfIdNumber', e.target.value)} placeholder="123456" />
            </div>
            <div className="space-y-1">
              <Label>Data Emiterii</Label>
              <Input value={company.pfIdIssueDate} onChange={e => updateField('pfIdIssueDate', e.target.value)} placeholder="01.01.2020" />
            </div>
            <div className="space-y-1">
              <Label>Data Expirării</Label>
              <Input value={company.pfIdExpiryDate} onChange={e => updateField('pfIdExpiryDate', e.target.value)} placeholder="01.01.2030" />
            </div>
            <div className="space-y-1">
              <Label>Nr. Adeverință AJOFM 1</Label>
              <Input value={company.ajofmCertificateNumber1} onChange={e => updateField('ajofmCertificateNumber1', e.target.value)} placeholder="12366/AMOFMB/13.08.2025" />
            </div>
            <div className="space-y-1">
              <Label>Nr. Adeverință AJOFM 2</Label>
              <Input value={company.ajofmCertificateNumber2} onChange={e => updateField('ajofmCertificateNumber2', e.target.value)} placeholder="nr. 5700/SAPMFPES-IGI/13.08.2025" />
            </div>
          </div>
        </div>
      )}

      {/* Checkbox împuternicit — doar pentru juridica */}
      {employerType === 'juridica' && (
        <div
          className={`rounded-xl border p-4 cursor-pointer transition-colors ${showRepresentative ? 'border-primary bg-primary/5' : 'bg-white'} shadow-sm`}
          onClick={() => setShowRepresentative(v => !v)}
        >
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={showRepresentative}
              onChange={e => { e.stopPropagation(); setShowRepresentative(e.target.checked) }}
              className="mt-0.5 h-4 w-4 rounded accent-primary" />
            <div>
              <p className="text-sm font-medium flex items-center gap-2 text-gray-800">
                <User className="h-4 w-4 text-primary" /> Am împuternicit (persoană diferită de administrator)
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Bifează doar dacă o altă persoană semnează în locul administratorului</p>
            </div>
          </label>
        </div>
      )}

      {/* Date reprezentant */}
      {employerType === 'juridica' && showRepresentative && (
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

      {/* Salvează */}
      <div
        className={`rounded-xl border p-4 cursor-pointer transition-colors ${saveChecked ? 'border-primary bg-primary/5' : 'bg-white'} shadow-sm`}
        onClick={() => setSaveChecked(v => !v)}
      >
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={saveChecked}
            onChange={e => { e.stopPropagation(); setSaveChecked(e.target.checked) }}
            className="mt-0.5 h-4 w-4 rounded accent-primary" />
          <div>
            <p className="text-sm font-medium flex items-center gap-2 text-gray-800">
              <Building2 className="h-4 w-4 text-primary" /> Salvează aceste date pentru utilizări viitoare
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Datele vor fi încărcate automat data viitoare</p>
          </div>
        </label>
      </div>

      <Button className="w-full h-12 text-base font-semibold" onClick={handleSaveAndContinue} disabled={saving}>
        {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
        Continuă la Import CSV →
      </Button>
    </div>
  )
}
