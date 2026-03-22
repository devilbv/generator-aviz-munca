import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Search, Save, Loader2, Building2, User } from 'lucide-react'

export default function CompanyForm({ company, updateField, savedCompanies, loadSavedCompany, lookupCUI, lookingUp, saveCompany, saving }) {
  const [saveChecked, setSaveChecked] = useState(false)

  const Field = ({ id, label, required, placeholder }) => (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}{required && <span className="text-destructive ml-1">*</span>}</Label>
      <Input id={id} value={company[id] || ''} onChange={e => updateField(id, e.target.value)} placeholder={placeholder} />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Firmă salvată */}
      {savedCompanies.length > 0 && (
        <div className="space-y-1">
          <Label>Firmă salvată</Label>
          <Select onValueChange={loadSavedCompany}>
            <SelectTrigger>
              <SelectValue placeholder="Alege o firmă..." />
            </SelectTrigger>
            <SelectContent>
              {savedCompanies.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.company_name} ({c.cui})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4" /> Date Firmă
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="companyName">Denumire Firmă <span className="text-destructive">*</span></Label>
            <Input id="companyName" value={company.companyName} onChange={e => updateField('companyName', e.target.value)} placeholder="SC EXEMPLU SRL" />
          </div>

          <div className="space-y-1">
            <Label htmlFor="cui">CUI <span className="text-destructive">*</span></Label>
            <div className="flex gap-2">
              <Input id="cui" value={company.cui} onChange={e => updateField('cui', e.target.value)} placeholder="RO12345678" />
              <Button variant="outline" size="sm" onClick={lookupCUI} disabled={lookingUp} className="shrink-0">
                {lookingUp ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Search className="h-4 w-4" /><span className="hidden sm:inline ml-1">Caută ONRC</span></>}
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="registryNumber">Nr. Registrul Comerțului</Label>
            <Input id="registryNumber" value={company.registryNumber} onChange={e => updateField('registryNumber', e.target.value)} placeholder="J40/1234/2020" />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="companyAddress">Adresa Firmă</Label>
            <Input id="companyAddress" value={company.companyAddress} onChange={e => updateField('companyAddress', e.target.value)} placeholder="Str. Exemplu Nr. 1, București, Sector 1" />
          </div>

          <div className="space-y-1">
            <Label htmlFor="administratorName">Nume Administrator</Label>
            <Input id="administratorName" value={company.administratorName} onChange={e => updateField('administratorName', e.target.value)} placeholder="Popescu Ion" />
          </div>

          <div className="space-y-1">
            <Label htmlFor="ajofmCertificateNumber1">Nr. Adeverință AJOFM 1</Label>
            <Input id="ajofmCertificateNumber1" value={company.ajofmCertificateNumber1} onChange={e => updateField('ajofmCertificateNumber1', e.target.value)} placeholder="12366/AMOFMB/13.08.2025" />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="ajofmCertificateNumber2">Nr. Adeverință AJOFM 2</Label>
            <Input id="ajofmCertificateNumber2" value={company.ajofmCertificateNumber2} onChange={e => updateField('ajofmCertificateNumber2', e.target.value)} placeholder="nr. 5700/SAPMFPES-IGI/13.08.2025" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" /> Date Reprezentant / Împuternicit
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={saveChecked} onChange={e => setSaveChecked(e.target.checked)} className="rounded" />
          Salvează aceste date pentru utilizări viitoare
        </label>
        {saveChecked && (
          <Button variant="outline" size="sm" onClick={saveCompany} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Salvează
          </Button>
        )}
      </div>
    </div>
  )
}
