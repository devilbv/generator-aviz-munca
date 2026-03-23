import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserPlus, Trash2, Upload, Camera, Download } from 'lucide-react'
import { toast } from 'sonner'
import Papa from 'papaparse'
import { CSV_TEMPLATE_ROWS, CSV_COLUMN_MAP } from '@/lib/constants'
import { supabase } from '@/lib/supabase'

const COLUMNS = [
  { key: 'employeeName',       label: 'Nume Complet',   required: true,  width: '160px' },
  { key: 'passportNumber',     label: 'Nr. Pașaport',   required: true,  width: '120px' },
  { key: 'passportCountryCode',label: 'Cod Țară',       required: false, width: '80px'  },
  { key: 'birthDate',          label: 'Data Nașterii',  required: false, width: '120px' },
  { key: 'birthPlace',         label: 'Loc Naștere',    required: false, width: '120px' },
  { key: 'citizenship',        label: 'Cetățenie',      required: false, width: '100px' },
  { key: 'passportIssueDate',  label: 'Data Emiterii',  required: false, width: '120px' },
  { key: 'passportExpiryDate', label: 'Data Expirării', required: false, width: '120px' },
  { key: 'position',           label: 'Funcția',        required: false, width: '100px' },
  { key: 'corCode',            label: 'Cod COR',        required: false, width: '80px'  },
  { key: 'monthlySalary',      label: 'Salariu (RON)',  required: false, width: '100px' },
  { key: 'workLocation',       label: 'Loc Activitate', required: false, width: '120px' },
  { key: 'vacationDays',       label: 'Zile CO',        required: false, width: '80px'  },
]

export default function EmployeeTable({ employees, addRow, deleteRow, updateRow, importFromCSV, importFromOCR }) {
  const csvRef = useRef()
  const ocrRef = useRef()

  const downloadTemplate = () => {
    const csv = Papa.unparse(CSV_TEMPLATE_ROWS)
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'angajati_template.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const handleCSV = (e) => {
    const file = e.target.files[0]
    if (file) importFromCSV(file)
    e.target.value = ''
  }

  const handleOCR = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    if (files.length > 100) { toast.error('Maximum 100 fișiere simultan'); return }

    const id = toast.loading(`Se scanează ${files.length} fișier(e)...`)
    let success = 0

    for (const file of files) {
      try {
        const base64 = await fileToBase64(file)
        const { data: { session } } = await supabase.auth.getSession()
        const { data, error } = await supabase.functions.invoke('parse-passport', {
          body: { image: base64, filename: file.name, mimeType: file.type },
          headers: { Authorization: `Bearer ${session?.access_token}` },
        })
        if (error) throw error
        importFromOCR(data)
        success++
      } catch {
        toast.error(`Eroare la scanarea: ${file.name}`)
      }
    }

    toast.dismiss(id)
    if (success) toast.success(`${success}/${files.length} pașapoarte scanate cu succes`)
    e.target.value = ''
  }

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  return (
    <div className="space-y-4">
      {/* Import toolbar */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => csvRef.current.click()} className="gap-2">
          <Upload className="h-4 w-4" /> Import CSV
        </Button>
        <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-2">
          <Download className="h-4 w-4" /> Template CSV
        </Button>
        <Button variant="outline" size="sm" onClick={() => ocrRef.current.click()} className="gap-2">
          <Camera className="h-4 w-4" /> Scanare Pașapoarte (OCR)
        </Button>
        <Button size="sm" onClick={addRow} className="gap-2 ml-auto">
          <UserPlus className="h-4 w-4" /> Adaugă Angajat
        </Button>
        <input ref={csvRef} type="file" accept=".csv" className="hidden" onChange={handleCSV} />
        <input ref={ocrRef} type="file" accept="image/*,.pdf" multiple className="hidden" onChange={handleOCR} />
      </div>

      <p className="text-xs text-muted-foreground">Puteți edita datele înainte de import. Câmpurile marcate cu * sunt obligatorii.</p>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-2 py-2 text-left font-medium text-muted-foreground w-8">#</th>
              {COLUMNS.map(c => (
                <th key={c.key} className="px-2 py-2 text-left font-medium text-muted-foreground whitespace-nowrap" style={{ minWidth: c.width }}>
                  {c.label}{c.required && <span className="text-destructive ml-0.5">*</span>}
                </th>
              ))}
              <th className="px-2 py-2 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, idx) => (
              <tr key={emp.id} className="border-t hover:bg-muted/30">
                <td className="px-2 py-1 text-muted-foreground">{idx + 1}</td>
                {COLUMNS.map(c => (
                  <td key={c.key} className="px-1 py-1">
                    <Input
                      value={emp[c.key] || ''}
                      onChange={e => updateRow(emp.id, c.key, e.target.value)}
                      className={`h-8 text-xs ${c.required && !emp[c.key] ? 'border-destructive/50' : ''}`}
                      placeholder={c.required ? 'obligatoriu' : ''}
                    />
                  </td>
                ))}
                <td className="px-1 py-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteRow(emp.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">{employees.length} angajat(ți) în tabel</p>
    </div>
  )
}
