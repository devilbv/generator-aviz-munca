import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { DOCUMENT_TYPES } from '@/lib/constants'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useBilling } from '@/hooks/useBilling'
import { toast } from 'sonner'
import { Download, FileDown, Loader2, FileText, Package, AlertTriangle } from 'lucide-react'

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function safeName(name) {
  return (name || 'Angajat').replace(/[^a-zA-Z0-9\-_\u00C0-\u024F]/g, '_')
}

export default function DocumentGenerator({ company, employees }) {
  const { session } = useAuth()
  const { canGenerate, recordUsage, docsUsed, docsLimit, credits, loading: billingLoading } = useBilling()
  const [selectedDocType, setSelectedDocType] = useState('')
  const [generating, setGenerating] = useState({}) // { employeeId_docType: true }
  const [generatingAll, setGeneratingAll] = useState({}) // { employeeId: true }

  const limitReached = !billingLoading && !canGenerate()

  const validateRequired = () => {
    if (company.employerType === 'fizica') {
      if (!company.pfName || !company.pfCNP) {
        toast.error('Vă rugăm să completați câmpurile obligatorii (Nume, CNP).')
        return false
      }
    } else {
      if (!company.companyName || !company.cui) {
        toast.error('Vă rugăm să completați câmpurile obligatorii (Denumire firmă, CUI).')
        return false
      }
    }
    const invalid = employees.filter(e => !e.employeeName || !e.passportNumber)
    if (invalid.length) {
      toast.error(`${invalid.length} angajat(ți) cu câmpuri obligatorii lipsă`)
      return false
    }
    return true
  }

  const generateSingle = async (employee, docType) => {
    if (!validateRequired()) return
    if (!canGenerate()) {
      toast.error('Ai atins limita de documente. Upgradează planul sau cumpără credite.')
      return
    }
    const key = `${employee.id}_${docType}`
    setGenerating(g => ({ ...g, [key]: true }))

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-single-document`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ company, employee, documentType: docType }),
        }
      )
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: resp.statusText }))
        throw new Error(err.error || resp.statusText)
      }
      const blob = await resp.blob()
      const docLabel = DOCUMENT_TYPES.find(d => d.slug === docType)?.label || docType
      downloadBlob(blob, `${docLabel}_${safeName(employee.employeeName)}.docx`)
      await recordUsage()
      toast.success(`Document generat: ${docLabel}`)
    } catch (err) {
      toast.error('Eroare la generare: ' + (err.message || 'necunoscută'))
    } finally {
      setGenerating(g => { const n = { ...g }; delete n[key]; return n })
    }
  }

  const generateAll = async (employee) => {
    if (!validateRequired()) return
    if (!canGenerate()) {
      toast.error('Ai atins limita de documente. Upgradează planul sau cumpără credite.')
      return
    }
    setGeneratingAll(g => ({ ...g, [employee.id]: true }))

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-work-permit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ company, employee }),
        }
      )
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: resp.statusText }))
        throw new Error(err.error || resp.statusText)
      }
      const blob = await resp.blob()
      downloadBlob(blob, `Documente_${safeName(employee.employeeName)}.zip`)

      // Salvează în istoric
      await supabase.from('work_permits').insert({
        user_id:          session.user.id,
        company_snapshot: company,
        employees:        [employee],
        document_types:   DOCUMENT_TYPES.map(d => d.slug),
        status:           'generated',
      })

      await recordUsage()
      toast.success(`Dosar complet generat pentru ${employee.employeeName}`)
    } catch (err) {
      toast.error('Eroare la generare: ' + (err.message || 'necunoscută'))
    } finally {
      setGeneratingAll(g => { const n = { ...g }; delete n[employee.id]; return n })
    }
  }

  const validEmployees = employees.filter(e => e.employeeName && e.passportNumber)

  return (
    <div className="space-y-6">
      {limitReached && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-medium text-red-700">Ai atins limita de documente</p>
            <p className="text-red-600 mt-0.5">
              {docsLimit !== -1 && `Ai folosit ${docsUsed}/${docsLimit} documente luna aceasta.`}{' '}
              <Link to="/pricing" className="underline font-semibold">Upgradează planul</Link> sau cumpără credite pentru a continua.
            </p>
          </div>
        </div>
      )}
      <div className="flex items-center gap-3">
        <div className="space-y-1 flex-1">
          <p className="text-sm font-medium">Document individual</p>
          <Select value={selectedDocType} onValueChange={setSelectedDocType}>
            <SelectTrigger>
              <SelectValue placeholder="Alege tipul documentului..." />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_TYPES.map(d => (
                <SelectItem key={d.slug} value={d.slug}>
                  <span className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    {d.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {validEmployees.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Adăugați cel puțin un angajat cu Nume și Nr. Pașaport pentru a genera documente.
        </p>
      ) : (
        <div className="space-y-3">
          {validEmployees.map(emp => {
            const isGenAll = !!generatingAll[emp.id]
            return (
              <Card key={emp.id} className="border-dashed">
                <CardContent className="py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{emp.employeeName}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">{emp.passportNumber}</Badge>
                        {emp.position && <Badge variant="secondary" className="text-xs">{emp.position}</Badge>}
                        {emp.citizenship && <Badge variant="outline" className="text-xs">{emp.citizenship}</Badge>}
                        {emp.monthlySalary && (
                          <Badge variant="outline" className="text-xs">
                            {Number(emp.monthlySalary).toLocaleString('ro-RO')} RON
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      {selectedDocType && (
                        <Button
                          variant="outline" size="sm"
                          disabled={!!generating[`${emp.id}_${selectedDocType}`] || limitReached}
                          onClick={() => generateSingle(emp, selectedDocType)}
                          className="gap-1"
                        >
                          {generating[`${emp.id}_${selectedDocType}`]
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <FileDown className="h-3.5 w-3.5" />}
                          <span className="hidden sm:inline">
                            {DOCUMENT_TYPES.find(d => d.slug === selectedDocType)?.label}
                          </span>
                          <span className="sm:hidden">DOCX</span>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        disabled={isGenAll || limitReached}
                        onClick={() => generateAll(emp)}
                        className="gap-1"
                      >
                        {isGenAll ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Package className="h-3.5 w-3.5" />}
                        <span className="hidden sm:inline">Toate documentele (ZIP)</span>
                        <span className="sm:hidden">ZIP</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <div className="rounded-lg bg-muted/50 p-4">
        <p className="text-xs font-medium mb-2">Documente disponibile ({DOCUMENT_TYPES.length}):</p>
        <div className="flex flex-wrap gap-1">
          {DOCUMENT_TYPES.map(d => (
            <Badge key={d.slug} variant="outline" className="text-xs">{d.label}</Badge>
          ))}
        </div>
      </div>
    </div>
  )
}
